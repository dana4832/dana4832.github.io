# Daeun Lee — CV site

GitHub Pages로 공개하는 개인 CV 사이트입니다. 빌드나 설치 없이 `index.html` 하나로 동작합니다.

- 주소: https://dana4832.github.io/
- 언어: 영어 / 한국어 (오른쪽 위 버튼으로 전환)

## 파일

| 파일 | 내용 |
| --- | --- |
| `index.html` | CV 내용 전체 |
| `assets/style.css` | 디자인 (맨 위 `:root` 변수에서 색상 변경) |
| `assets/main.js` | 언어 전환, PDF 저장 버튼, 메뉴 강조 |
| `assets/favicon.svg` | 브라우저 탭 아이콘 |
| `talks.html` | 발표 사진 페이지 (CV 05번 "발표 사진 보기"에서 연결) |
| `assets/gallery.js` | 사진을 눌렀을 때 크게 보기 |
| `assets/talks-web/` | 사이트에 올라가는 발표 사진 (웹용 크기) |
| `tools/resize_photos.py` | 원본 사진을 웹용 크기로 줄이는 도구 |

## 발표 사진 추가

1. 원본 사진을 `assets/talks/<날짜 폴더>/` 에 넣습니다. (예: `assets/talks/2026 1031/`)
   이 폴더는 내 컴퓨터에만 있고 GitHub에는 올라가지 않습니다.
2. `python tools/resize_photos.py talks` 를 실행하면 `assets/talks-web/` 에 줄인 사진이 만들어집니다.
3. `talks.html` 에서 해당 발표의 `<div class="shots">` 안에 `<figure>` 를 추가합니다.

## 내용 수정

`index.html`에서 `EDIT` 주석을 검색하면 고칠 자리가 나옵니다.
모든 글은 두 번 씁니다. `data-l="en"`은 영어 화면, `data-l="ko"`는 한국어 화면에만 보입니다.

```html
<span data-l="en">Education</span><span data-l="ko">학력</span>
```

## 내 컴퓨터에서 확인

`index.html`을 브라우저로 열면 됩니다.

## 반영

수정한 뒤 commit · push 하면 1~2분 안에 사이트에 반영됩니다.
이전 화면이 보이면 Ctrl+F5로 새로고침하세요.
