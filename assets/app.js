/* 첫 페이지: assets/data.js 의 내용을 화면에 그리고, 필터·검색·애니메이션을 붙입니다 */
(function () {
  const S = window.Site, CV = window.CV, t = S.t, esc = S.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TYPES = {
    all: { en: 'All', ko: '전체' },
    pub: { en: 'Publications', ko: '논문' },
    talk: { en: 'Talks', ko: '학술대회 발표' }
  };
  const TYPE_ONE = { pub: { en: 'Paper', ko: '논문' }, talk: { en: 'Talk', ko: '발표' } };
  const KINDS = {
    all: { en: 'All', ko: '전체' },
    edu: { en: 'Education', ko: '학력' },
    exp: { en: 'Experience', ko: '경력' },
    project: { en: 'Research projects', ko: '참여 연구과제' }
  };
  const ICON = {
    award: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.500l1.900 3.900 4.300.600-3.100 3 .700 4.300L8 11.300l-3.800 2 .700-4.300-3.100-3 4.300-.600z"/></svg>'
  };

  const state = { type: 'all', topic: 'all', q: '', kind: 'all' };
  const works = CV.works.slice().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const awards = works.filter(w => w.award);

  const boldMe = html => html.replace(/Daeun Lee|이다은/g, m => '<strong>' + m + '</strong>');
  const authors = v => boldMe(t(v));

  /* ---------- 숫자 요약 ---------- */
  function renderStats() {
    const items = [
      [works.filter(w => w.type === 'pub').length, { en: 'Publications', ko: '논문' }],
      [works.filter(w => w.type === 'talk').length, { en: 'Conference talks', ko: '학술대회 발표' }],
      [awards.length, { en: 'Awards', ko: '수상' }]
    ];
    $('#stats').innerHTML = items.map(([n, label]) =>
      `<li><b data-count="${n}">${reduce ? n : 0}</b><span>${t(label)}</span></li>`).join('');
    if (reduce) return;
    $$('#stats b').forEach((el, i) => {
      const end = +el.dataset.count, t0 = performance.now() + 250 + i * 120, dur = 900;
      const tick = now => {
        const k = Math.min(1, Math.max(0, (now - t0) / dur));
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- 소개 ---------- */
  function renderAbout() {
    const paras = ['en', 'ko'].map(l => CV.about[l].map(p => `<p data-l="${l}">${esc(p)}</p>`).join('')).join('');
    const tags = CV.interests.map(it => it.topic
      ? `<li><button type="button" class="tag" data-topic="${it.topic}" data-topic-set="${it.topic}">${t(it)}</button></li>`
      : `<li><span class="tag">${t(it)}</span></li>`).join('');
    $('#about-body').innerHTML = `<div class="reveal">${paras}</div>
      <p class="subhead reveal">${t({ en: 'Research interests', ko: '연구 관심 분야' })}
        <small>${t({ en: 'tap a coloured tag to see related work', ko: '색이 있는 태그를 누르면 관련 논문·발표로 이동합니다' })}</small></p>
      <ul class="tags reveal">${tags}</ul>`;
  }

  /* ---------- 연구 카드 ---------- */
  function renderResearch() {
    $('#research-cards').innerHTML = CV.research.map(r => {
      const n = works.filter(w => w.topic === r.topic).length;
      const story = r.story
        ? `<a class="btn primary" href="story.html?id=${encodeURIComponent(r.story)}">${t({ en: 'Read the story →', ko: '스토리로 보기 →' })}</a>`
        : `<span class="soon">${t({ en: 'Story coming soon', ko: '스토리 준비 중' })}</span>`;
      return `<article class="rcard reveal" data-topic="${r.topic}">
        ${r.image ? `<div class="rcard-art"><img src="${esc(r.image)}" alt="" width="1200" height="800" loading="lazy" decoding="async"></div>` : ''}
        <p class="eyebrow">${t(CV.topics[r.topic])}</p>
        <h3>${t(r.title)}</h3>
        <p class="rcard-sum">${t(r.summary)}</p>
        <div class="rcard-actions">${story}
          <button type="button" class="btn ghost" data-topic-set="${r.topic}">${t({ en: `${n} related papers & talks`, ko: `관련 논문·발표 ${n}건` })}</button>
        </div>
      </article>`;
    }).join('');

    if (reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.rcard').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
        // 사진은 카드와 반대로 조금 움직여 깊이감을 줍니다
        card.style.setProperty('--mx', x.toFixed(3));
        card.style.setProperty('--my', y.toFixed(3));
      });
      card.addEventListener('pointerleave', () => {
        ['--rx', '--ry'].forEach(v => card.style.setProperty(v, '0deg'));
        ['--mx', '--my'].forEach(v => card.style.setProperty(v, '0'));
      });
    });
  }

  /* ---------- 논문 · 발표 (필터 + 검색) ---------- */
  const haystack = w => [w.title, w.date, w.authors.en, w.authors.ko,
    typeof w.venue === 'string' ? w.venue : w.venue.en + ' ' + w.venue.ko,
    CV.topics[w.topic].en, CV.topics[w.topic].ko].join(' ').toLowerCase();
  works.forEach(w => { w._hay = haystack(w); });

  const match = (w, skip) =>
    (skip === 'type' || state.type === 'all' || w.type === state.type) &&
    (skip === 'topic' || state.topic === 'all' || w.topic === state.topic) &&
    (!state.q || w._hay.indexOf(state.q) !== -1);

  function chip(group, key, label, count) {
    return `<button type="button" class="chip" data-${group}="${key}"
      aria-pressed="${state[group] === key}">${t(label)}${count == null ? '' : `<i>${count}</i>`}</button>`;
  }

  function renderFilters() {
    $('#type-chips').innerHTML = Object.keys(TYPES).map(k =>
      chip('type', k, TYPES[k], works.filter(w => match(w, 'type') && (k === 'all' || w.type === k)).length)).join('');
    $('#topic-chips').innerHTML = chip('topic', 'all', { en: 'All topics', ko: '모든 주제' }, null) +
      Object.keys(CV.topics).map(k =>
        chip('topic', k, CV.topics[k], works.filter(w => match(w, 'topic') && w.topic === k).length)).join('');
  }

  function workHTML(w) {
    const links = [];
    if (w.story) links.push(`<a class="story-link" href="story.html?id=${encodeURIComponent(w.story)}">${t({ en: 'Read the story →', ko: '스토리로 보기 →' })}</a>`);
    if (w.doi) links.push(`<a href="${esc(w.doi)}" target="_blank" rel="noopener">DOI</a>`);
    if (w.photos) links.push(`<a href="${esc(CV.photoBase)}#${esc(w.photos)}">${t({ en: 'Photos', ko: '사진' })}</a>`);
    const award = w.award ? `<span class="pill award">${ICON.award}${t(w.award.name)}</span>` : '';
    return `<li class="work" data-topic="${w.topic}">
      <p class="when">${esc(w.date)}</p>
      <div>
        <p class="work-meta"><span class="pill">${t(TYPE_ONE[w.type])}</span><button type="button" class="pill topic" data-topic-set="${w.topic}">${t(CV.topics[w.topic])}</button>${award}</p>
        <h3${w.titleLang ? ` lang="${w.titleLang}"` : ''}>${esc(w.title)}</h3>
        <p class="authors">${authors(w.authors)}</p>
        <p class="venue">${t(w.venue)}</p>
        ${links.length ? `<p class="work-links">${links.join('')}</p>` : ''}
      </div>
    </li>`;
  }

  function renderWorks() {
    const list = works.filter(w => match(w));
    $('#works-list').innerHTML = list.length ? list.map(workHTML).join('')
      : `<li class="empty">${t({ en: 'Nothing matches these filters.', ko: '조건에 맞는 항목이 없습니다.' })}
         <button type="button" class="btn ghost" data-reset>${t({ en: 'Clear filters', ko: '필터 지우기' })}</button></li>`;
    $('#result-count').innerHTML = t({ en: `${list.length} of ${works.length} items`, ko: `${works.length}건 중 ${list.length}건` });
    renderFilters();
  }

  function setTopic(topic, scroll) {
    state.topic = topic;
    renderWorks();
    if (scroll) $('#works').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- 걸어온 길 ---------- */
  function renderTimeline() {
    $('#kind-chips').innerHTML = Object.keys(KINDS).map(k => chip('kind', k, KINDS[k],
      k === 'all' ? null : CV.timeline.filter(x => x.kind === k).length)).join('');
    const items = CV.timeline.slice().sort((a, b) => (a.sort < b.sort ? 1 : a.sort > b.sort ? -1 : 0));
    $('#timeline').innerHTML = items.map(x => `<li class="tl-item reveal" data-kind="${x.kind}">
      <p class="when">${t(x.when)}</p>
      <div class="tl-card">
        <span class="pill">${t(KINDS[x.kind])}</span>
        <h3>${t(x.title)}</h3>
        <p class="where">${t(x.where)}</p>
        ${(x.desc || []).map(d => `<p class="desc">${t(d)}</p>`).join('')}
      </div>
    </li>`).join('');
  }

  function applyKind() {
    $$('#kind-chips .chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind)));
    $$('#timeline .tl-item').forEach(li => {
      li.hidden = state.kind !== 'all' && li.dataset.kind !== state.kind;
      if (!li.hidden) li.classList.add('in');
    });
    updateTimelineFill();
  }

  function updateTimelineFill() {
    const tl = $('#timeline'), r = tl.getBoundingClientRect();
    const k = r.height ? Math.min(1, Math.max(0, (window.innerHeight * 0.62 - r.top) / r.height)) : 0;
    tl.style.setProperty('--fill', k.toFixed(4));
  }

  /* ---------- 수상 · 기술 ---------- */
  function renderAwards() {
    $('#awards-list').innerHTML = awards.map(w => `<li class="award-card reveal" data-topic="${w.topic}">
      <p class="when">${esc(w.date)}</p>
      <h3>${ICON.award}${t(w.award.name)}</h3>
      <p class="where">${t(w.award.by)}</p>
      <p class="for"${w.titleLang ? ` lang="${w.titleLang}"` : ''}>${esc(w.title)}</p>
    </li>`).join('');
  }

  function renderSkills() {
    $('#skills-body').innerHTML = `<dl class="skills reveal">${CV.skills.map(s =>
      `<dt>${t(s.label)}</dt><dd>${s.items.map(i => `<span class="tag">${esc(i)}</span>`).join('')}</dd>`).join('')}</dl>
      <p class="subhead reveal">${t({ en: 'Certifications', ko: '자격증' })}</p>
      <dl class="skills reveal">${CV.certs.map(c => `<dt>${t(c.label)}</dt><dd><span class="tag">${t(c.name)}</span></dd>`).join('')}</dl>`;
  }

  /* ---------- 이벤트 ---------- */
  function bind() {
    document.addEventListener('click', e => {
      const el = e.target.closest('button, a');
      if (!el) return;
      if (el.dataset.topicSet) { setTopic(el.dataset.topicSet, !el.closest('#works')); return; }
      if (el.dataset.type) { state.type = el.dataset.type; renderWorks(); return; }
      if (el.dataset.topic && el.classList.contains('chip')) { setTopic(el.dataset.topic, false); return; }
      if (el.dataset.kind) { state.kind = el.dataset.kind; applyKind(); return; }
      if (el.hasAttribute('data-reset')) {
        state.type = 'all'; state.topic = 'all'; state.q = ''; $('#q').value = '';
        renderWorks();
      }
    });
    $('#q').addEventListener('input', e => { state.q = e.target.value.trim().toLowerCase(); renderWorks(); });

    const setPlaceholder = () => { $('#q').placeholder = S.lang() === 'ko' ? '제목·저자·학회 검색…' : 'Search title, author, venue…'; };
    document.addEventListener('langchange', setPlaceholder);
    setPlaceholder();

    // 스크롤: 메뉴 강조, 타임라인 선 채우기, 첫 화면 사진 살짝 움직이기
    const secs = $$('main .sec'), links = $$('#nav-links a'), photo = $('.hero-photo img');
    let queued = false;
    const onScroll = () => {
      queued = false;
      const line = window.innerHeight * 0.35;
      let current = '';
      secs.forEach(s => { if (s.getBoundingClientRect().top <= line) current = s.id; });
      links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + current));
      updateTimelineFill();
      if (!reduce && window.scrollY < window.innerHeight * 1.2) {
        photo.style.transform = 'translate3d(0,' + (window.scrollY * 0.14).toFixed(1) + 'px,0)';
      }
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  renderStats();
  renderAbout();
  renderResearch();
  renderWorks();
  renderTimeline();
  renderAwards();
  renderSkills();
  S.init();
  bind();
})();
