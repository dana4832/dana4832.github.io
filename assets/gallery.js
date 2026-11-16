// 사진을 누르면 크게 보여 줍니다. (.shots 안의 사진에 적용)
(function () {
  var root = document.documentElement;
  var shots = [].slice.call(document.querySelectorAll('.shots a'));
  if (!shots.length) return;

  function lang() { return root.getAttribute('data-lang') === 'ko' ? 'ko' : 'en'; }

  // 사진 설명: "2026.10.31 · 시상식" (현재 언어 기준)
  function label(link) {
    var fig = link.closest('figure');
    var cap = fig && fig.querySelector('figcaption');
    var talk = link.closest('.talk');
    var when = talk && talk.querySelector('.when');
    var text = '';
    if (cap) {
      var span = cap.querySelector('[data-l="' + lang() + '"]');
      text = (span || cap).textContent.trim();
    }
    return [when ? when.textContent.trim() : '', text].filter(Boolean).join(' · ');
  }

  // 대체 텍스트를 화면 언어에 맞춤
  function setAlts() {
    shots.forEach(function (a) {
      var img = a.querySelector('img');
      if (img) img.alt = label(a);
    });
  }
  setAlts();
  new MutationObserver(setAlts).observe(root, { attributes: true, attributeFilter: ['data-lang'] });

  if (!window.HTMLDialogElement) return; // 오래된 브라우저에서는 사진 파일이 그대로 열립니다.

  var dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML =
    '<button type="button" class="lb-btn lb-close" aria-label="Close / 닫기">×</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Previous / 이전 사진">‹</button>' +
    '<figure><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="lb-btn lb-next" aria-label="Next / 다음 사진">›</button>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('img');
  var cap = dlg.querySelector('figcaption');
  var at = 0;

  function show(i) {
    at = (i + shots.length) % shots.length;
    var text = label(shots[at]);
    img.src = shots[at].href;
    img.alt = text;
    cap.textContent = text + '  (' + (at + 1) + ' / ' + shots.length + ')';
  }

  shots.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return; // 새 탭으로 열기는 그대로 둠
      e.preventDefault();
      show(i);
      dlg.showModal();
    });
  });

  dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.lb-prev').addEventListener('click', function () { show(at - 1); });
  dlg.querySelector('.lb-next').addEventListener('click', function () { show(at + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); }); // 바깥을 누르면 닫힘
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  dlg.addEventListener('close', function () { img.removeAttribute('src'); shots[at].focus(); });
})();
