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
            <div class="ov ov-bars"><p class="bars-title"></p><div class="bars-rows"></div><small></small></div>
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
      <p class="disclaimer">${t(story.disclaimer || {
        en: 'The animations are schematic illustrations made for this page, not simulation output. See the paper for the actual results and figures.',
        ko: '이 페이지의 애니메이션은 이해를 돕기 위해 만든 개념도이며 실제 시뮬레이션 결과가 아닙니다. 실제 결과와 그림은 논문을 참고해 주세요.'
      })}</p>
    </section>`;

  const stageEl = el.querySelector('.stage');
  const canvas = el.querySelector('canvas');
  const ovStat = el.querySelector('.ov-stat'), ovImage = el.querySelector('.ov-image'), ovBars = el.querySelector('.ov-bars');
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
    const D = { layout: 0, hIn: 1, hRing: 1, mesh: 0, focus: 0, section: 0, ar: 1, wind: 0.3, art: 0, corridor: 0, lift: 0,
      park: 0, cover: 1, pAccess: 0, pSocial: 0, pGaps: 0, pImprove: 0, pProgram: 0 };
    const cur = Object.assign({}, D), tgt = Object.assign({}, D);
    const parts = [], cparts = [];
    let inited = false;
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
      ctx.globalAlpha *= 0.9;
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

    /* ----- 공원: 아파트 단지 사이를 지나는 선형공원 개념도 (도로를 덮어 만든 공원) -----
       road: true = 공원이 생기기 전의 도로. access / social / gaps / improve / program 으로 장면을 바꿉니다.
       실제 지도가 아니라 논문의 내용을 설명하기 위한 그림입니다. */
    const PK = { top: 42, bot: 58, st: 36, sb: 64, lanes: [22.25, 40.75, 59.25, 77.75], gap: [58, 66], plaza: [62, 53.4] };
    const pathY = x => 47.6 + 1.2 * Math.sin(x / 9);
    const benchY = x => pathY(x) + 2.6;
    const pkSlabs = [];
    [10, 24, 68, 82].forEach(y => [7, 25.5, 44, 62.5, 81].forEach(x => pkSlabs.push({ x: x, y: y, w: 12, h: 6.5 })));
    // 출입구 (s: -1 위쪽 단지, 1 아래쪽 단지 · add: 개선안에서 새로 생기는 곳)
    const pkGates = [{ x: 14, s: -1 }, { x: 86, s: -1 }, { x: 44, s: 1 },
      { x: 38, s: -1, add: true }, { x: 62, s: -1, add: true }, { x: 20, s: 1, add: true }, { x: 80, s: 1, add: true }];
    const pkBenches = [{ x: 18 }, { x: 49 }, { x: 74 }, { x: 9, add: true }, { x: 30, add: true }, { x: 56, add: true }, { x: 90, add: true }];
    const pkTrees = [];
    [[10, 55], [27, 44.1], [36, 55.2], [52, 44], [70, 44.2], [90, 55]].forEach(q => pkTrees.push({ x: q[0], y: q[1], r: 1.25 }));
    for (let x = 5.5, n = 0; x < 95; x += 4.6, n++) {
      const up = n % 2 === 0, y = up ? 44.2 : 55.4;
      if (pkGates.some(g => (g.s < 0) === up && Math.abs(g.x - x) < 2.6)) continue;
      if (!up && Math.abs(x - PK.plaza[0]) < 5) continue;                 // 프로그램 마당 자리
      if (pkTrees.some(q => !q.add && Math.hypot(q.x - x, q.y - y) < 3.4)) continue;
      pkTrees.push({ x: x, y: y, r: 2.1 + (n % 3) * 0.25, add: true });
    }
    const pkHomers = [], pkWalkers = [], pkCars = [], pkDust = [], pkSit = [], pkRing = [];
    // 집에서 가장 가까운 출입구까지의 길
    function reroute(h) {
      const gates = pkGates.filter(g => g.s === h.s && (!g.add || tgt.pImprove > 0.5));
      const g = gates.reduce((a, b) => Math.abs(b.x - h.lx) < Math.abs(a.x - h.lx) ? b : a);
      const ys = h.s < 0 ? PK.st : PK.sb;
      h.pts = [[h.lx, h.hy], [h.lx, ys], [g.x, ys], [g.x, pathY(g.x)]];
      h.len = Math.abs(h.hy - ys) + Math.abs(g.x - h.lx) + Math.abs(pathY(g.x) - ys);
      h.d = Math.min(h.d, h.len);
    }
    function homerPos(h) {
      let d = h.d;
      for (let k = 0; k < 3; k++) {
        const a = h.pts[k], b = h.pts[k + 1], l = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
        if (d <= l || k === 2) { const q = l ? Math.min(1, d / l) : 0; return [a[0] + (b[0] - a[0]) * q, a[1] + (b[1] - a[1]) * q]; }
        d -= l;
      }
    }
    function spawnD(p, anywhere) {
      const up = Math.random() < 0.5;
      p.x = rnd(5, 95); p.y = up ? PK.top : PK.bot; p.vy = (up ? -1 : 1) * rnd(0.04, 0.11);
      p.max = rnd(120, 260); p.life = anywhere ? rnd(10, p.max) : p.max;
    }
    for (let i = 0; i < 10; i++) {
      const s = i % 2 ? 1 : -1, h = { s: s, lx: PK.lanes[(i >> 1) % 4], hy: s < 0 ? rnd(9, 30) : rnd(70, 91), d: rnd(0, 20), dir: Math.random() < 0.5 ? 1 : -1, sp: rnd(0.09, 0.14) };
      reroute(h); pkHomers.push(h);
    }
    for (let i = 0; i < 14; i++) {
      const seg = i < 9 ? [6, PK.gap[0]] : [PK.gap[1], 94];
      pkWalkers.push({ seg: seg, x: rnd(seg[0], seg[1]), dir: Math.random() < 0.5 ? 1 : -1, sp: rnd(0.07, 0.12), off: rnd(-0.5, 0.5) });
    }
    for (let i = 0; i < 12; i++) pkCars.push({ lane: i % 4, x: rnd(0, 100), sp: rnd(0.5, 0.8) });
    for (let i = 0; i < 30; i++) { const p = {}; spawnD(p, true); pkDust.push(p); }
    pkBenches.filter(b => !b.add).forEach((b, k) => {
      for (let n = 0; n < 2 + (k % 2); n++) pkSit.push({ x: b.x + (n - 0.5 - (k % 2) * 0.5) * 1.7, y: benchY(b.x) + (n % 2 ? 1.5 : -0.1), bx: b.x });
    });
    for (let n = 0; n < 7; n++) pkRing.push(n / 7 * 6.283);

    function stepPark() {
      pkCars.forEach(c => {
        c.x += (c.lane < 2 ? 1 : -1) * c.sp;
        if (c.x > 104) c.x = -4; else if (c.x < -4) c.x = 104;
      });
      pkDust.forEach(p => { p.y += p.vy; p.x += rnd(-0.08, 0.08); if (--p.life <= 0) spawnD(p); });
      const joined = cur.pImprove > 0.5;
      pkWalkers.forEach(w => {
        const lo = joined ? 6 : w.seg[0], hi = joined ? 94 : w.seg[1];
        w.x += w.dir * w.sp;
        if (w.x > hi) w.dir = -1; else if (w.x < lo) w.dir = 1;
      });
      pkHomers.forEach(h => {
        h.d += h.dir * h.sp;
        if (h.d >= h.len) { h.d = h.len; h.dir = -1; }
        else if (h.d <= 0) { h.d = 0; h.dir = 1; reroute(h); }
      });
    }

    function drawPark(alpha) {
      const font = getComputedStyle(document.body).fontFamily, ko = S.lang() === 'ko';
      const c = cur.cover, im = cur.pImprove, fs = Math.max(11, U(2.7));
      const dot = (x, y, r) => { ctx.beginPath(); ctx.arc(X(x), Y(y), U(r), 0, 6.283); ctx.fill(); };
      ctx.save();
      ctx.globalAlpha = alpha;
      rr(X(1), Y(1), U(98), U(98), U(3));
      ctx.fillStyle = col.surface; ctx.fill();
      ctx.strokeStyle = col.line; ctx.lineWidth = 1; ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // 단지 안 길
      ctx.strokeStyle = col.line; ctx.lineWidth = U(1.5);
      ctx.beginPath();
      [PK.st, PK.sb].forEach(y => { ctx.moveTo(X(4), Y(y)); ctx.lineTo(X(96), Y(y)); });
      PK.lanes.forEach(x => { ctx.moveTo(X(x), Y(7)); ctx.lineTo(X(x), Y(PK.st)); ctx.moveTo(X(x), Y(PK.sb)); ctx.lineTo(X(x), Y(93)); });
      ctx.stroke();
      // 아파트
      pkSlabs.forEach(b => {
        const e = 1.6;
        ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = col.muted; ctx.fillRect(X(b.x), Y(b.y + b.h - e), U(b.w), U(e));
        ctx.globalAlpha = alpha; ctx.fillStyle = col.surface; ctx.fillRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
        ctx.globalAlpha = alpha * 0.7; ctx.fillStyle = col.line; ctx.fillRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
        ctx.globalAlpha = alpha * 0.55; ctx.strokeStyle = col.muted; ctx.lineWidth = 1; ctx.strokeRect(X(b.x), Y(b.y - e), U(b.w), U(b.h));
      });
      const bx = 3, bw = 94, bh = PK.bot - PK.top;
      // 공원이 생기기 전: 도시고속화도로
      if (c < 0.98) {
        const a = alpha * (1 - c);
        ctx.globalAlpha = a * 0.85; ctx.fillStyle = col.muted;
        rr(X(bx), Y(PK.top), U(bw), U(bh), U(1)); ctx.fill();
        ctx.globalAlpha = a; ctx.strokeStyle = col.surface; ctx.lineWidth = U(0.35);
        ctx.beginPath(); ctx.moveTo(X(bx + 1), Y(50)); ctx.lineTo(X(bx + bw - 1), Y(50)); ctx.stroke();
        ctx.setLineDash([U(2.4), U(2.4)]);
        ctx.beginPath(); [46.4, 53.6].forEach(y => { ctx.moveTo(X(bx + 1), Y(y)); ctx.lineTo(X(bx + bw - 1), Y(y)); }); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = col.surface;
        pkCars.forEach(k => {
          if (k.x < bx + 1 || k.x > bx + bw - 4.4) return;
          rr(X(k.x), Y([43.7, 47.3, 50.9, 54.5][k.lane]), U(3.4), U(1.7), U(0.5)); ctx.fill();
        });
        ctx.fillStyle = col.dust;
        pkDust.forEach(p => {
          ctx.globalAlpha = a * clamp(Math.min(p.life / 40, (p.max - p.life) / 20), 0, 1) * 0.8;
          dot(p.x, p.y, 0.6);
        });
      }
      // 공원
      if (c > 0.02) {
        const a = alpha * c;
        ctx.globalAlpha = a; ctx.fillStyle = col.mint;
        rr(X(bx), Y(PK.top), U(bw), U(bh), U(2)); ctx.fill();
        ctx.globalAlpha = a * 0.24; ctx.fillStyle = col.leaf; ctx.fill();
        ctx.globalAlpha = a * 0.5; ctx.strokeStyle = col.leaf; ctx.lineWidth = 1; ctx.stroke();
        // 출입구와 산책로
        ctx.lineWidth = U(1.4);
        pkGates.forEach(g => {
          const v = g.add ? im : 1;
          if (v < 0.02) return;
          ctx.globalAlpha = a * (g.add ? v * 0.95 : 0.34); ctx.strokeStyle = g.add ? col.tc : col.ink;
          ctx.beginPath(); ctx.moveTo(X(g.x), Y(g.s < 0 ? PK.st : PK.sb)); ctx.lineTo(X(g.x), Y(pathY(g.x))); ctx.stroke();
        });
        const line = (x0, x1) => { ctx.beginPath(); for (let x = x0; x <= x1; x += 1) ctx.lineTo(X(x), Y(pathY(x))); ctx.stroke(); };
        ctx.globalAlpha = a * 0.34; ctx.strokeStyle = col.ink;
        line(6, PK.gap[0]); line(PK.gap[1], 94);
        if (im > 0.02) { ctx.globalAlpha = a * im * 0.95; ctx.strokeStyle = col.tc; line(PK.gap[0], PK.gap[1]); }
        // 프로그램 마당
        if (cur.pProgram > 0.02) {
          const pp = cur.pProgram, beat = reduce ? 0 : Math.sin(tick * 0.08) * 0.35;
          ctx.globalAlpha = a * pp * 0.7; ctx.fillStyle = col.surface; dot(PK.plaza[0], PK.plaza[1], 3.5);
          ctx.globalAlpha = a * pp; ctx.strokeStyle = col.tc; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = col.tc;
          pkRing.forEach(t => dot(PK.plaza[0] + Math.cos(t) * (2.5 + beat), PK.plaza[1] + Math.sin(t) * (2.5 + beat), 0.7));
          dot(PK.plaza[0], PK.plaza[1], 0.8);
        }
        // 나무 (add: 그늘을 만드는 큰 나무)
        pkTrees.forEach(q => {
          const v = q.add ? im : 1;
          if (v < 0.02) return;
          ctx.globalAlpha = a * (q.add ? 0.62 : 0.8); ctx.fillStyle = col.leaf; dot(q.x, q.y, q.r * v);
          if (q.add) { ctx.globalAlpha = a * v * 0.9; ctx.strokeStyle = col.tc; ctx.lineWidth = 1.1; ctx.stroke(); }
        });
        // 벤치
        pkBenches.forEach(b => {
          const v = b.add ? im : 1;
          if (v < 0.02) return;
          ctx.globalAlpha = a * v * (b.add ? 1 : 0.6); ctx.fillStyle = b.add ? col.tc : col.ink;
          rr(X(b.x - 1.3), Y(benchY(b.x) - 0.45), U(2.6), U(0.9), U(0.3)); ctx.fill();
        });
        // 집에서 공원까지 걷는 길
        if (cur.pAccess > 0.02) {
          ctx.globalAlpha = a * cur.pAccess * 0.5; ctx.strokeStyle = col.tc; ctx.lineWidth = 1.4;
          ctx.setLineDash([U(1.4), U(1.4)]); ctx.lineDashOffset = reduce ? 0 : -tick * 0.3;
          pkHomers.forEach(h => { ctx.beginPath(); h.pts.forEach(q => ctx.lineTo(X(q[0]), Y(q[1]))); ctx.stroke(); });
          ctx.setLineDash([]);
        }
        // 사람
        ctx.globalAlpha = a * 0.72; ctx.fillStyle = col.ink;
        pkWalkers.forEach(w => dot(w.x, pathY(w.x) + w.off, 0.8));
        pkHomers.forEach(h => {
          const q = homerPos(h), hi = cur.pAccess > 0.5;
          ctx.globalAlpha = a * (hi ? 1 : 0.72); ctx.fillStyle = hi ? col.tc : col.ink;
          dot(q[0], q[1], hi ? 1 : 0.8);
        });
        if (cur.pSocial > 0.02) {
          const ps = cur.pSocial, pulse = reduce ? 0 : Math.sin(tick * 0.05) * 0.3;
          ctx.fillStyle = col.tc;
          pkBenches.filter(b => !b.add).forEach(b => { ctx.globalAlpha = a * ps * 0.16; dot(b.x, benchY(b.x) + 0.7, 3.3 + pulse); });
          ctx.globalAlpha = a * ps;
          pkSit.forEach(q => dot(q.x, q.y, 0.85));
        }
        // 불편한 곳 표시
        const gp = cur.pGaps * (1 - im);
        if (gp > 0.02) {
          ctx.globalAlpha = a * gp; ctx.strokeStyle = col.tc; ctx.fillStyle = col.tc; ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          pkGates.filter(g => g.add).forEach(g => { ctx.beginPath(); ctx.arc(X(g.x), Y(g.s < 0 ? PK.top : PK.bot), U(2.2), 0, 6.283); ctx.stroke(); });
          const gx = (PK.gap[0] + PK.gap[1]) / 2;
          ctx.beginPath(); ctx.ellipse(X(gx), Y(pathY(gx)), U(5), U(2.4), 0, 0, 6.283); ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = '600 ' + fs + 'px ' + font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
          ctx.fillText(ko ? '출입구 없음' : 'No entrance', X(41), Y(39.6));
          ctx.textAlign = 'center';
          ctx.fillText(ko ? '끊긴 산책로' : 'Path breaks off', X(gx), Y(52.4));
          ctx.fillText(ko ? '그늘 · 벤치 부족' : 'Little shade, few benches', X(27), Y(52.6));
        }
      }
      // 이름표
      ctx.font = '600 ' + fs + 'px ' + font; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      [[ko ? '도시고속화도로' : 'Urban expressway', 1 - c], [ko ? '굿모닝파크' : 'Good Morning Park', c]].forEach(q => {
        if (q[1] < 0.02) return;
        const w = ctx.measureText(q[0]).width;
        ctx.globalAlpha = alpha * q[1] * 0.9; ctx.fillStyle = col.surface;
        rr(X(4.5) - 5, Y(60.9) - fs * 0.75, w + 10, fs * 1.5, 5); ctx.fill();
        ctx.globalAlpha = alpha * q[1]; ctx.fillStyle = col.muted;
        ctx.fillText(q[0], X(4.5), Y(60.9));
      });
      ctx.restore();
    }

    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      const air = 1 - cur.park;
      if (air > 0.02) {
        const R = rects();
        if (cur.section < 0.98) drawBlock(R, (1 - cur.section) * air);
        if (cur.section > 0.02) drawSection(cur.section * air);
        ctx.save(); ctx.globalAlpha = air; drawWind(); ctx.restore();
      }
      if (cur.park > 0.02) drawPark(cur.park);
    }

    function advance() {
      for (const k in cur) cur[k] += (tgt[k] - cur[k]) * 0.07;
      if (cur.park < 0.98) {
        if (cur.section < 0.98) stepBlock(rects());
        if (cur.section > 0.02) stepSection();
      }
      if (cur.park > 0.02) stepPark();
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
        lift: s.lift ? 1 : 0,
        park: s.view === 'park' ? 1 : 0,
        cover: s.road ? 0 : 1,
        pAccess: s.access ? 1 : 0,
        pSocial: s.social ? 1 : 0,
        pGaps: s.gaps ? 1 : 0,
        pImprove: s.improve ? 1 : 0,
        pProgram: s.program ? 1 : 0
      });
      // 첫 장면은 바로 그 상태에서 시작합니다 (다른 종류의 그림에서 넘어오는 것처럼 보이지 않게)
      if (!inited) { inited = true; Object.assign(cur, tgt); }
      if (reduce) {
        // 움직임 줄이기 설정: 바로 최종 상태를 한 장면으로 보여줍니다
        Object.assign(cur, tgt);
        parts.forEach(p => spawn(p, true)); cparts.forEach(p => spawnC(p, true));
        pkHomers.forEach(reroute);
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
    const isStat = scene.view === 'stat', isImage = scene.view === 'image', isBars = scene.view === 'bars';
    stageEl.classList.toggle('overlay', isStat || isImage || isBars);
    ovStat.classList.toggle('show', isStat);
    ovImage.classList.toggle('show', isImage);
    ovBars.classList.remove('show');
    badge.hidden = isStat || isImage;
    badge.innerHTML = isBars ? t({ en: 'Figures from the paper', ko: '논문의 수치' }) : t({ en: 'Schematic', ko: '개념도' });
    if (isBars) {
      // 막대그래프: rows 의 value 를 max 에 대한 비율로 그립니다. hi: true 인 줄만 주제 색으로 강조
      ovBars.querySelector('.bars-title').innerHTML = t(scene.title);
      ovBars.querySelector('.bars-rows').innerHTML = scene.rows.map(r =>
        `<div class="bar-row${r.hi ? ' hi' : ''}"><span class="bar-label">${t(r.label)}</span>` +
        `<span class="bar-track"><i style="--w:${(r.value / scene.max * 100).toFixed(1)}%"></i></span>` +
        `<b>${esc(String(r.value))}${t(scene.unit)}</b></div>`).join('');
      ovBars.querySelector('small').innerHTML = t(scene.note);
      void ovBars.offsetWidth;
      ovBars.classList.add('show');
    }
    if (isStat) {
      ovStat.querySelector('b').textContent = scene.value;
      ovStat.querySelector('span').innerHTML = t(scene.label);
      ovStat.querySelector('small').innerHTML = t(scene.note);
    } else if (isImage) {
      const img = ovImage.querySelector('img');
      img.src = scene.src;
      img.alt = scene.alt ? scene.alt[S.lang()] || scene.alt.en || '' : '';
    } else if (!isBars) {
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
  // 숫자·그래프 장면 뒤에 비치는 바탕 그림도 이 스토리의 그림으로 시작합니다
  const firstDrawn = story.steps.find(s => s.scene && !/^(stat|image|bars)$/.test(s.scene.view || ''));
  if (firstDrawn) stage.set(firstDrawn.scene);
  onScroll();
  stage.start();
})();
