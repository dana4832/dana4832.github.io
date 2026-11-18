/* 두 페이지가 함께 쓰는 기능: 언어 전환, 밝게/어둡게, 스크롤 진행 막대, 등장 애니메이션 */
(function () {
  var root = document.documentElement;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  // { en, ko } → 두 언어 span, 문자열 → 그대로
  function t(v) {
    if (v == null) return '';
    if (typeof v === 'string') return esc(v);
    return '<span data-l="en">' + esc(v.en) + '</span><span data-l="ko">' + esc(v.ko) + '</span>';
  }

  function lang() { return root.getAttribute('data-lang') === 'ko' ? 'ko' : 'en'; }

  function applyTitle() {
    var title = root.getAttribute('data-title-' + lang());
    if (title) document.title = title;
  }

  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.lang = l;
    try { localStorage.setItem('cv-lang', l); } catch (e) {}
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === l));
    });
    applyTitle();
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  function isDark() {
    var th = root.getAttribute('data-theme');
    if (th) return th === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('cv-theme', next); } catch (e) {}
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  // 화면에 들어올 때 살짝 떠오르는 효과 (.reveal)
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;

  function reveal(scope) {
    (scope || document).querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  function init() {
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang()));
    });
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', toggleTheme);
    });
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
    applyTitle();

    var bar = document.querySelector('.progress i');
    if (bar) {
      var queued = false;
      var update = function () {
        queued = false;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      };
      window.addEventListener('scroll', function () {
        if (!queued) { queued = true; requestAnimationFrame(update); }
      }, { passive: true });
      update();
    }
    reveal();
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    document.dispatchEvent(new CustomEvent('themechange'));
  });

  window.Site = { esc: esc, t: t, lang: lang, setLang: setLang, applyTitle: applyTitle, reveal: reveal, init: init };
})();
