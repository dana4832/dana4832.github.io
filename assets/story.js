/* 연구 스토리: 스크롤 위치에 따라 오른쪽 그림(stage)이 단계별로 바뀝니다.
   글과 장면은 assets/stories.js 에서 고칩니다. */
(function () {
  const S = window.Site, CV = window.CV, t = S.t, esc = S.esc;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const id = new URLSearchParams(location.search).get('id');
  const story = window.STORIES[id] || window.STORIES[Object.keys(window.STORIES)[0]];
  const boldMe = html => html.replace(/Daeun Lee|이다은/g, m => '<strong>' + m + '</strong>');

  root.setAttribute('data-title-en', 'Daeun Lee — ' + story.title.en);
  root.setAttribute('data-title-ko', 'Daeun Lee — ' + story.title.ko);

  /* ---------- 화면 그리기 ---------- */
  const el = document.getElementById('story');
  el.dataset.topic = story.topic;
  const pad = n => (n < 10 ? '0' : '') + n;
  el.innerHTML = `
    <header class="story-head">
      <span class="eyebrow">${t({ en: 'Research story', ko: '연구 스토리' })} · ${t(CV.topics[story.topic])}</span>
      <h1>${t(story.title)}</h1>
      <p class="dek">${t(story.dek)}</p>
      <p class="paper-ref"><b>${esc(story.paper.title)}</b>
        <span>${boldMe(t(story.paper.authors))} · ${t(story.paper.venue)}</span></p>
      <p class="scroll-hint"><i></i>${t({ en: 'Scroll to follow the study', ko: '스크롤하며 연구를 따라가 보세요' })}</p>
    </header>
    <div class="scrolly">
      <div class="stage">
        <div class="stage-inner">
          <div class="stage-view">
            <canvas role="img" aria-label="Schematic animation"></canvas>
            <div class="ov ov-stat"><b></b><span></span><small></small></div>
            <figure class="ov ov-image"><img alt=""></figure>
          </div>
          <div class="stage-foot">
            <p class="stage-cap"></p>
            <span class="stage-badge">${t({ en: 'Schematic', ko: '개념도' })}</span>
            <div class="dots">${story.steps.map((s, i) =>
              `<button type="button" data-go="${i}" aria-label="Step ${i + 1}"></button>`).join('')}</div>
          </div>
        </div>
      </div>
      <div class="steps">${story.steps.map((s, i) => `
        <section class="step" data-i="${i}">
          <div class="step-card">
            <p class="step-kicker"><b>${pad(i + 1)}</b>${t(s.kicker)}</p>
            <h2>${t(s.title)}</h2>
            <p>${t(s.text)}</p>
          </div>
        </section>`).join('')}
      </div>
    </div>
    <section class="story-end">
      <h2>${t({ en: 'Key takeaways', ko: '핵심 정리' })}</h2>
      <ol class="takeaways">${story.takeaways.map(k => `<li>${t(k)}</li>`).join('')}</ol>
      <div class="end-actions">
        <a class="btn primary" href="${esc(story.paper.url)}" target="_blank" rel="noopener">${t({ en: 'Read the paper →', ko: '논문 읽기 →' })}</a>
        <a class="btn" href="index.html#research">${t({ en: 'Back to portfolio', ko: '포트폴리오로 돌아가기' })}</a>
      </div>
      <p class="disclaimer">${t({
        en: 'The animations are schematic illustrations made for this page, not simulation output. See the paper for the actual results and figures.',
        ko: '이 페이지의 애니메이션은 이해를 돕기 위해 만든 개념도이며 실제 시뮬레이션 결과가 아닙니다. 실제 결과와 그림은 논문을 참고해 주세요.'
      })}</p>
    </section>`;

  const stageEl = el.querySelector('.stage');
  const canvas = el.querySelector('canvas');
  const ovStat = el.querySelector('.ov-stat'), ovImage = el.querySelector('.ov-image');
  const capEl = el.querySelector('.stage-cap'), badge = el.querySelector('.stage-badge');
  const steps = Array.from(el.querySelectorAll('.step'));
  const dots = Array.from(el.querySelectorAll('.dots button'));

  /* ============================================================
     개념 애니메이션 (canvas)
     block  : 위에서 본 블록. 건물 16동, 도로, 바람에 실려 가는 먼지 입자
     section: 거리 단면. 건물 높이 ÷ 도로 폭 (H/W)
     ============================================================ */
  const stage = (function () {
    const ctx = canvas.getContext('2d');
    const D = { layout: 0, hIn: 1, hRing: 1, mesh: 0, focus: 0, section: 0, ar: 1, wind: 0.3, art: 0, corridor: 0, lift: 0 };
    const cur = Object.assign({}, D), tgt = Object.assign({}, D);
    const parts = [], cparts = [];
    const lerp = (a, b, k) => a + (b - a) * k;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    let W = 0, H = 0, sc = 1, ox = 0, oy = 0, col = {}, tick = 0, running = false;
    const X = x => ox + x * sc, Y = y => oy + y * sc, U = v => v * sc;

    function colors() {
      const cs = getComputedStyle(el);
      const g = n => cs.getPropertyValue(n).trim();
      col = { surface: g('--surface'), ink: g('--ink'), muted: g('--muted'), line: g('--line'), leaf: g('--leaf'),
        deep: g('--leaf-deep'), mint: g('--mint'), dust: g('--dust'), tc: g('--tc') || g('--leaf') };
    }

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const head = 30, size = Math.max(60, Math.min(W - 16, H - head - 12));
      sc = size / 100; ox = (W - size) / 2; oy = head + (H - head - size) / 2;
      if (!running) draw();
    }

    /* ----- 블록: 건물 배치 ----- */
    function loopRect(i, j) {
      if (j === 0) return { x: 9 + i * 21, y: 9, w: 19, h: 14.5 };
      if (j === 3) return { x: [9, 28.5, 54, 73.5][i], y: 76.5, w: 17.5, h: 14.5 };
      const y = j === 1 ? 25.5 : 51;
      if (i === 0) return { x: 9, y: y, w: 14.5, h: 23.5 };
      if (i === 3) return { x: 76.5, y: y, w: 14.5, h: 23.5 };
      return { x: i === 1 ? 34.5 : 51, y: j === 1 ? 34.5 : 51, w: 14.5, h: 14.5 };
    }
    function rects() {
      const out = [], L = cur.layout, c = cur.corridor * 3.2 * (1 - L);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
        const gy = 9 + j * 22 + (j < 2 ? -c : c), l = loopRect(i, j);
        const inner = (i === 1 || i === 2) && (j === 1 || j === 2);
        out.push({ x: lerp(9 + i * 22, l.x, L), y: lerp(gy, l.y, L), w: lerp(16, l.w, L), h: lerp(16, l.h, L),
          inner: inner, z: inner ? cur.hIn : cur.hRing });
      }
      return out;
    }
    function hit(R, x, y) {
      for (let k = 0; k < R.length; k++) {
        const b = R[k];
        if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return k;
      }
      return -1;
    }

    /* ----- 블록: 먼지 입자 ----- */
    function spawn(p, anywhere) {
      let x, y;
      if (Math.random() < tgt.art) {
        const r = Math.random();
        if (r < 0.6) { x = 4.5; y = rnd(4.5, 95.5); }
        else if (r < 0.8) { x = rnd(4.5, 95.5); y = 4.5; }
        else { x = rnd(4.5, 95.5); y = 95.5; }
      } else if (tgt.layout > 0.5) {
        const r = Math.random();
        if (r < 0.22) { x = rnd(29, 71); y = 29; }
        else if (r < 0.44) { x = rnd(29, 71); y = 71; }
        else if (r < 0.66) { x = 29; y = rnd(29, 71); }
        else if (r < 0.88) { x = 71; y = rnd(29, 71); }
        else { x = 50; y = rnd(71, 95.5); }
      } else {
        const c = [28, 50, 72][Math.random() * 3 | 0];
        if (Math.random() < 0.5) { x = c; y = rnd(6, 94); } else { x = rnd(6, 94); y = c; }
      }
      p.x = x + rnd(-1, 1); p.y = y + rnd(-1, 1); p.vx = 0; p.vy = 0;
      p.max = rnd(180, 420); p.life = anywhere ? rnd(20, p.max) : p.max;
      p.dec = -1; p.pass = false; p.lift = 0; p.in = false;
    }
    function stepBlock(R) {
      const sp = 0.08 + cur.wind * 0.42;
      for (let n = 0; n < parts.length; n++) {
        const p = parts[n];
        p.vx += (sp - p.vx) * 0.06 + rnd(-0.05, 0.05);
        p.vy += (sp * 0.12 - p.vy) * 0.06 + rnd(-0.05, 0.05);
        let nx = p.x + p.vx, ny = p.y + p.vy;
        const k = hit(R, nx, ny);
        p.in = false;
        if (k >= 0) {
          const b = R[k];
          // 낮은 건물은 일부가 넘어가고, 높은 건물은 막습니다 (개념적 표현)
          if (p.dec !== k) { p.dec = k; p.pass = Math.random() < clamp(1.25 - b.z, 0, 0.8); }
          if (p.pass) p.in = true;
          else {
            const dir = p.y < b.y + b.h / 2 ? -1 : 1;
            p.vy = dir * Math.max(0.18, sp * 0.9); p.vx *= 0.3;
            nx = p.x; ny = p.y + p.vy;
            if (hit(R, nx, ny) >= 0) { ny = p.y; nx = p.x - 0.25; }
            if (cur.lift > 0.5 && b.inner && b.z > 1.2) { p.life -= 5; p.lift = Math.min(1, p.lift + 0.08); }
          }
        }
        p.x = nx; p.y = ny; p.life--;
        if (p.life <= 0 || p.x > 103 || p.x < -3 || p.y < -3 || p.y > 103) spawn(p);
      }
    }

    /* ----- 단면: 협곡 안의 입자 ----- */
    const SEC = { g: 84, wd: 16, x1: 42, x2: 58 };
    // 입자는 협곡 안에서 소용돌이(왼쪽으로 올라가 오른쪽으로 내려옴)를 그리며 돕니다.
    // t: 소용돌이 위의 위치(0 = 바닥, π = 지붕 높이), r: 소용돌이 크기
    function spawnC(p, anywhere) {
      p.t = anywhere ? rnd(0, 6.283) : rnd(-0.5, 0.5);
      p.r = rnd(0.3, 1); p.jx = rnd(-0.8, 0.8); p.jy = rnd(-0.8, 0.8);
      p.out = false; p.a = anywhere ? 1 : 0; p.wait = 0; p.x = 50; p.y = SEC.g;
    }
    function stepSection() {
      const hh = cur.ar * SEC.wd, top = SEC.g - hh, cy = top + hh / 2;
      const flush = cur.ar >= 2.45 && cur.wind > 0.7;
      for (let n = 0; n < cparts.length; n++) {
        const p = cparts[n];
        if (p.wait > 0) { p.wait--; p.a = 0; continue; }
        if (p.out) {
          p.x += 0.12 + cur.wind * 0.5; p.y -= 0.03; p.a -= 0.012;
          if (p.a <= 0 || p.x > 94) { spawnC(p); p.wait = flush ? rnd(0, 150) | 0 : 0; }
          continue;
        }
        const before = p.t % 6.283;
        p.t += (0.01 + cur.wind * 0.03) / Math.sqrt(p.r);
        p.a = Math.min(1, p.a + 0.04);
        p.x = 50 - Math.sin(p.t) * 6 * p.r + p.jx;
        p.y = cy + Math.cos(p.t) * (hh / 2 - 2) * p.r + p.jy;
        // 지붕 높이를 지날 때 일부가 바람에 실려 나갑니다 (H/W ≥ 2.5 이고 바람이 강하면 훨씬 많이)
        if (before < 3.1416 && p.t % 6.283 >= 3.1416 && Math.random() < (flush ? 0.6 : 0.04) * p.r) {
          p.out = true; p.y = top - rnd(0.8, 4);
        }
      }
    }

    /* ----- 그리기 ----- */
    function rr(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function arrow(x1, y, x2) {
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      ctx.moveTo(x2 - 6, y - 4); ctx.lineTo(x2, y); ctx.lineTo(x2 - 6, y + 4); ctx.stroke();
    }
    function drawWind() {
      const len = 26 + cur.wind * 46, y0 = oy - 16;
      ctx.save();
      ctx.strokeStyle = col.tc; ctx.fillStyle = col.muted; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.font = '500 12.5px ' + getComputedStyle(document.body).fontFamily;
      ctx.textBaseline = 'middle';
      const label = S.lang() === 'ko' ? '바람' : 'Wind';
      ctx.fillText(label, X(1), y0);
      const x0 = X(1) + ctx.measureText(label).width + 10;
      const drift = reduce ? 0 : (tick * (0.4 + cur.wind * 1.6)) % 14;
      ctx.globalAlpha = 0.9;
      arrow(x0 + drift * 0.3, y0 - 5, x0 + len + drift * 0.3);
      arrow(x0 + 8 - drift * 0.2, y0 + 5, x0 + 8 + len * 0.8);
      ctx.restore();
    }
    function buildingFill(z) { return clamp((z - 0.5) / 1.3, 0, 1) * 0.72 + 0.06; }

    function drawBlock(R, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      rr(X(1), Y(1), U(98), U(98), U(3));
      ctx.fillStyle = col.surface; ctx.fill();
      ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.stroke();

      // 도로
      const L = cur.layout;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col.line;
      ctx.lineWidth = U(4.2);
      rr(X(4.5), Y(4.5), U(91), U(91), U(2)); ctx.stroke();
      ctx.lineWidth = U(3.4);
      if (L < 0.98) {
        ctx.globalAlpha = alpha * (1 - L);
        ctx.beginPath();
        [28, 50, 72].forEach(c => { ctx.moveTo(X(c), Y(4.5)); ctx.lineTo(X(c), Y(95.5)); ctx.moveTo(X(4.5), Y(c)); ctx.lineTo(X(95.5), Y(c)); });
        ctx.stroke();
        if (cur.corridor > 0.02) {
          ctx.globalAlpha = alpha * (1 - L) * cur.corridor * 0.22;
          ctx.strokeStyle = col.tc; ctx.lineWidth = U(1 + cur.corridor * 7);
          ctx.beginPath(); ctx.moveTo(X(5), Y(50)); ctx.lineTo(X(95), Y(50)); ctx.stroke();
          ctx.globalAlpha = alpha * (1 - L) * cur.corridor * 0.9;
          ctx.lineWidth = 1.6; ctx.setLineDash([U(3), U(2.4)]);
          ctx.lineDashOffset = reduce ? 0 : -tick * 1.2;
          ctx.beginPath(); ctx.moveTo(X(5), Y(50)); ctx.lineTo(X(95), Y(50)); ctx.stroke();
          ctx.setLineDash([]);
          ctx.strokeStyle = col.line; ctx.lineWidth = U(3.4);
        }
      }
      if (L > 0.02) {
        ctx.globalAlpha = alpha * L;
        rr(X(29), Y(29), U(42), U(42), U(4)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(50), Y(71)); ctx.lineTo(X(50), Y(95.5)); ctx.stroke();
      }
      // 계산 격자 (mesh)
      if (cur.mesh > 0.02) {
        ctx.globalAlpha = alpha * cur.mesh * 0.5;
        ctx.strokeStyle = col.tc; ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let v = 4; v <= 96; v += 4) { ctx.moveTo(X(v), Y(2)); ctx.lineTo(X(v), Y(98)); ctx.moveTo(X(2), Y(v)); ctx.lineTo(X(98), Y(v)); }
        ctx.stroke();
      }
      // 건물 (지붕을 위로 살짝 올려 높이를 표현)
      R.slice().sort((a, b) => a.y - b.y).forEach(b => {
        const e = b.z * 2.6;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col.deep;
        ctx.fillRect(X(b.x), Y(b.y + b.h - e), U(b.w), U(e));
        ctx.fillStyle = col.mint;
        ctx.fillRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
        ctx.globalAlpha = alpha * buildingFill(b.z);
        ctx.fillStyle = col.leaf;
        ctx.fillRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = col.deep; ctx.lineWidth = 1;
        ctx.strokeRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
      });
      // 먼지 입자
      ctx.fillStyle = col.dust;
      for (let n = 0; n < parts.length; n++) {
        const p = parts[n];
        const a = clamp(Math.min(p.life / 40, (p.max - p.life) / 20), 0, 1) * (p.in ? 0.4 : 0.85) * (1 - p.lift * 0.6);
        ctx.globalAlpha = alpha * a;
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), U(0.62 + p.lift * 0.9), 0, 6.283); ctx.fill();
      }
      // 거리 하나만 강조
      if (cur.focus > 0.02) {
        ctx.globalAlpha = alpha * cur.focus * 0.84;
        ctx.fillStyle = col.surface;
        ctx.beginPath(); ctx.rect(X(0), Y(0), U(100), U(100)); ctx.rect(X(24), Y(6), U(8), U(88)); ctx.fill('evenodd');
        ctx.globalAlpha = alpha * cur.focus;
        ctx.strokeStyle = col.tc; ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
        ctx.strokeRect(X(24), Y(6), U(8), U(88)); ctx.setLineDash([]);
      }
      ctx.restore();
    }

    function drawSection(alpha) {
      const g = SEC.g, wd = SEC.wd, hh = cur.ar * wd, top = g - hh;
      const font = getComputedStyle(document.body).fontFamily;
      ctx.save();
      ctx.globalAlpha = alpha;
      rr(X(1), Y(1), U(98), U(98), U(3));
      ctx.fillStyle = col.surface; ctx.fill();
      ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.stroke();
      // 바람 흐름선
      ctx.strokeStyle = col.tc; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for (let n = 0; n < 4; n++) {
        const y = top - 5 - n * 5.5;
        if (y < 4) break;
        ctx.globalAlpha = alpha * (0.75 - n * 0.14);
        ctx.setLineDash([U(5), U(4)]);
        ctx.lineDashOffset = reduce ? 0 : -tick * (0.5 + cur.wind * 2) * (1 + n * 0.25);
        ctx.beginPath(); ctx.moveTo(X(6), Y(y)); ctx.lineTo(X(94), Y(y)); ctx.stroke();
      }
      ctx.setLineDash([]);
      // 건물 두 동
      ctx.globalAlpha = alpha;
      [[20, 22], [58, 22]].forEach(b => {
        ctx.fillStyle = col.mint; ctx.fillRect(X(b[0]), Y(top), U(b[1]), U(hh));
        ctx.globalAlpha = alpha * 0.45; ctx.fillStyle = col.leaf; ctx.fillRect(X(b[0]), Y(top), U(b[1]), U(hh));
        ctx.globalAlpha = alpha; ctx.strokeStyle = col.deep; ctx.lineWidth = 1; ctx.strokeRect(X(b[0]), Y(top), U(b[1]), U(hh));
      });
      ctx.strokeStyle = col.muted; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(X(6), Y(g)); ctx.lineTo(X(94), Y(g)); ctx.stroke();
      // 문턱 (H/W = 2.5)
      const ty = g - 2.5 * wd;
      ctx.strokeStyle = col.tc; ctx.lineWidth = 1.2; ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(X(14), Y(ty)); ctx.lineTo(X(86), Y(ty)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = col.tc; ctx.font = '600 ' + Math.max(11, U(3)) + 'px ' + font; ctx.textBaseline = 'bottom'; ctx.textAlign = 'left';
      ctx.fillText('H/W = 2.5', X(84), Y(ty) - 3);
      // 치수 표시
      ctx.strokeStyle = col.muted; ctx.fillStyle = col.muted; ctx.lineWidth = 1;
      ctx.font = '500 ' + Math.max(11, U(3)) + 'px ' + font;
      ctx.beginPath(); ctx.moveTo(X(42), Y(g + 4)); ctx.lineTo(X(58), Y(g + 4));
      ctx.moveTo(X(42), Y(g + 2.5)); ctx.lineTo(X(42), Y(g + 5.5)); ctx.moveTo(X(58), Y(g + 2.5)); ctx.lineTo(X(58), Y(g + 5.5));
      ctx.moveTo(X(15), Y(top)); ctx.lineTo(X(15), Y(g)); ctx.moveTo(X(13.5), Y(top)); ctx.lineTo(X(16.5), Y(top)); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('W', X(50), Y(g + 5.5));
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('H', X(13), Y(top + hh / 2));
      // 현재 값
      ctx.fillStyle = col.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '600 ' + Math.max(15, U(5)) + 'px ' + font;
      ctx.fillText('H/W = ' + cur.ar.toFixed(1), X(50), Y(g + 12));
      // 입자
      ctx.fillStyle = col.dust;
      for (let n = 0; n < cparts.length; n++) {
        const p = cparts[n];
        ctx.globalAlpha = alpha * 0.85 * p.a;
        ctx.beginPath(); ctx.arc(X(p.x), Y(p.y), U(0.7), 0, 6.283); ctx.fill();
      }
      ctx.restore();
    }

    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const R = rects();
      if (cur.section < 0.98) drawBlock(R, 1 - cur.section);
      if (cur.section > 0.02) drawSection(cur.section);
      drawWind();
    }

    function advance() {
      for (const k in cur) cur[k] += (tgt[k] - cur[k]) * 0.07;
      if (cur.section < 0.98) stepBlock(rects());
      if (cur.section > 0.02) stepSection();
      tick++;
    }
    function loop() {
      if (!running) return;
      advance(); draw();
      requestAnimationFrame(loop);
    }
    function start() { if (!running && !reduce) { running = true; requestAnimationFrame(loop); } }
    function stop() { running = false; }

    function set(scene) {
      const s = scene || {};
      Object.assign(tgt, D, {
        layout: s.layout === 'loop' ? 1 : 0,
        hIn: s.heights === 'center-high' ? 1.6 : s.heights === 'perimeter-high' ? 0.6 : 1,
        hRing: s.heights === 'perimeter-high' ? 1.6 : s.heights === 'center-high' ? 0.7 : 1,
        mesh: s.mesh ? 1 : 0,
        focus: s.focus ? 1 : 0,
        section: s.view === 'section' ? 1 : 0,
        ar: s.ar || 1,
        wind: s.wind === 'high' ? 1 : 0.3,
        art: s.emit === 'arterial' ? 1 : 0,
        corridor: s.corridor ? 1 : 0,
        lift: s.lift ? 1 : 0
      });
      if (reduce) {
        // 움직임 줄이기 설정: 바로 최종 상태를 한 장면으로 보여줍니다
        Object.assign(cur, tgt);
        parts.forEach(p => spawn(p, true)); cparts.forEach(p => spawnC(p, true));
        for (let n = 0; n < 160; n++) advance();
        draw();
      }
    }

    for (let n = 0; n < 240; n++) { const p = {}; spawn(p, true); parts.push(p); }
    for (let n = 0; n < 70; n++) { const p = {}; spawnC(p, true); cparts.push(p); }
    colors();
    new ResizeObserver(resize).observe(canvas.parentElement);
    document.addEventListener('themechange', () => { colors(); if (!running) draw(); });
    document.addEventListener('langchange', () => { if (!running) draw(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    // ff(n): n 프레임을 한 번에 진행 (장면 점검용)
    return { set: set, start: start, redraw: draw, ff: n => { for (let i = 0; i < n; i++) advance(); draw(); } };
  })();
  window.storyStage = stage;

  /* ---------- 단계 전환 ---------- */
  let active = -1;
  function setStep(i) {
    if (i === active) return;
    active = i;
    steps.forEach((s, n) => s.classList.toggle('active', n === i));
    dots.forEach((d, n) => { if (n === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
    const scene = story.steps[i].scene || {};
    const isStat = scene.view === 'stat', isImage = scene.view === 'image';
    stageEl.classList.toggle('overlay', isStat || isImage);
    ovStat.classList.toggle('show', isStat);
    ovImage.classList.toggle('show', isImage);
    badge.hidden = isStat || isImage;
    if (isStat) {
      ovStat.querySelector('b').textContent = scene.value;
      ovStat.querySelector('span').innerHTML = t(scene.label);
      ovStat.querySelector('small').innerHTML = t(scene.note);
    } else if (isImage) {
      const img = ovImage.querySelector('img');
      img.src = scene.src;
      img.alt = scene.alt ? scene.alt[S.lang()] || scene.alt.en || '' : '';
    } else {
      stage.set(scene);
    }
    capEl.innerHTML = t(scene.caption);
  }

  let queued = false;
  function onScroll() {
    queued = false;
    const narrow = window.matchMedia('(max-width: 860px)').matches;
    const line = window.innerHeight * (narrow ? 0.74 : 0.5);
    let best = 0, bestD = Infinity;
    steps.forEach((s, n) => {
      const r = s.getBoundingClientRect();
      const d = line < r.top ? r.top - line : line > r.bottom ? line - r.bottom : 0;
      if (d < bestD) { bestD = d; best = n; }
    });
    setStep(best);
  }
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  dots.forEach(d => d.addEventListener('click', () => {
    const card = steps[+d.dataset.go].querySelector('.step-card');
    card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }));

  S.init();
  onScroll();
  stage.start();
})();
