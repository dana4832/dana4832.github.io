(function () {
  var root = document.documentElement;
  var buttons = [].slice.call(document.querySelectorAll('[data-set-lang]'));

  // 언어 전환 (선택한 언어는 브라우저에 기억됩니다)
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang));
    });
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    try { localStorage.setItem('cv-lang', lang); } catch (e) {}
  }
  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-set-lang')); });
  });
  setLang(root.getAttribute('data-lang') === 'ko' ? 'ko' : 'en');

  // 인쇄 / PDF 저장
  [].slice.call(document.querySelectorAll('[data-print]')).forEach(function (b) {
    b.addEventListener('click', function () { window.print(); });
  });

  // 연도 자동 갱신
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // 스크롤 위치에 맞춰 메뉴 강조
  var links = [].slice.call(document.querySelectorAll('.links a'));
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    [].slice.call(document.querySelectorAll('main section[id]')).forEach(function (s) { observer.observe(s); });
  }
})();
