# Daeun Lee — CV · 포트폴리오 사이트

GitHub Pages로 공개하는 개인 사이트입니다. 빌드나 설치 없이 폴더를 그대로 올리면 동작합니다.

- 주소: https://dana4832.github.io/
- 언어: 영어 / 한국어, 화면: 밝게 / 어둡게 (오른쪽 위 버튼으로 전환)
- 2026-11-17 이전의 한 페이지짜리 CV는 git 태그 `backup-2026-11-17` 과
  `C:\Users\user\cv-site-backups\2026-11-17\` 에 보관되어 있습니다.

## 파일 구성

| 파일 | 내용 |
| --- | --- |
| `index.html` | 첫 페이지 틀 (이름·소개 문구·연락처 버튼은 여기서 직접 수정) |
| `story.html` | 연구 스토리 페이지 틀 (`story.html?id=pm-cfd`) |
| `talks.html` | 발표 사진 페이지 (논문·발표 목록의 "사진" 링크에서 연결) |
| `assets/data.js` | **CV 내용 전부** — 소개, 연구 카드, 논문·발표, 걸어온 길, 기술 |
| `assets/stories.js` | **연구 스토리 원고와 장면** |
| `assets/style.css` | 디자인. 맨 위 변수에서 색상을 바꿉니다 |
| `assets/app.js` | 첫 페이지 동작 (필터·검색·타임라인·애니메이션) |
| `assets/story.js` | 스크롤 스토리텔링 동작과 개념 애니메이션 |
| `assets/common.js` | 언어 전환, 밝게/어둡게 전환 |
| `assets/gallery.js` | 발표 사진 페이지 동작 (사진 크게 보기) |
| `assets/research/` | 연구 카드 사진 (`air.jpg` · `heat.jpg` · `aging.jpg`, 가로 1200px) |
| `assets/talks-web/` | 사이트에 올라가는 발표 사진 (웹용 크기) |
| `tools/resize_photos.py` | 원본 사진을 웹용 크기로 줄이는 도구 |

## 내용 고치기

- 글은 `{ en: '영어', ko: '한국어' }` 형태로 두 언어를 함께 적습니다. 그냥 `'문자열'` 로 적으면 두 언어에서 똑같이 보입니다.
- **논문·발표 추가**: `assets/data.js` 의 `works` 에 항목을 하나 추가합니다. 날짜순 정렬, 숫자 요약, 필터 개수, 수상 목록은 자동으로 바뀝니다.
  - `type`: `'pub'`(논문) 또는 `'talk'`(발표)
  - `topic`: `'heat'` · `'air'` · `'aging'` (맨 위 `topics` 에서 주제를 추가·수정)
  - `award`: 수상한 발표에만 넣습니다 → 목록의 배지와 "수상" 섹션에 함께 나타납니다
  - `photos`: 발표 사진이 있으면 `talks.html` 안의 해당 발표 id(예: `'t-2026-1031'`)를 적습니다
  - `story`: 스토리 id 를 넣으면 "스토리로 보기" 링크가 생깁니다
- **연구 카드 사진**: `research` 의 각 카드에 `image: 'assets/research/파일.jpg'` 로 적습니다. 같은 이름으로 파일만 바꿔도 됩니다(가로로 긴 사진, 가로 1200px 정도). `image` 를 지우면 사진 없이 글만 나옵니다.
- **걸어온 길**: `timeline` 에 추가합니다. `kind` 는 `'edu'` · `'exp'` · `'project'`.

## 발표 사진 추가

1. 원본 사진을 `assets/talks/<날짜 폴더>/` 에 넣습니다. (예: `assets/talks/2026 1031/`)
   이 폴더는 내 컴퓨터에만 있고 GitHub에는 올라가지 않습니다.
2. `python tools/resize_photos.py talks` 를 실행하면 `assets/talks-web/` 에 줄인 사진이 만들어집니다.
3. `talks.html` 에서 해당 발표의 `<div class="shots">` 안에 `<figure>` 를 추가합니다.
   새 발표라면 `<article class="talk" id="t-날짜">` 를 하나 복사해 고치고, `assets/data.js` 의 그 발표에 `photos: 't-날짜'` 를 적습니다.

## 연구 스토리 새로 만들기

1. `assets/stories.js` 에 `'pm-cfd'` 항목을 복사해 새 id(예: `'green-lst'`)로 붙여넣고 내용을 고칩니다.
2. `assets/data.js` 의 `research` 카드(또는 `works` 항목)에 `story: 'green-lst'` 를 적습니다.

각 단계(`steps`)는 왼쪽 글(`kicker`, `title`, `text`)과 오른쪽 그림(`scene`)으로 이루어집니다.

| scene | 쓰임 |
| --- | --- |
| `{ view: 'image', src: 'assets/stories/green-lst/fig1.png', alt: {…}, caption: {…} }` | **실제 그림·지도·사진** (가장 자주 쓰게 될 형태) |
| `{ view: 'stat', value: '91–95%', label: {…}, note: {…} }` | 큰 숫자 하나 |
| `{ view: 'block', layout, heights, emit, wind, mesh, focus, corridor, lift }` | 블록 평면 개념 애니메이션 |
| `{ view: 'section', ar: 2.8, wind: 'high' }` | 거리 단면 개념 애니메이션 |

그림 파일은 `assets/stories/<스토리 id>/` 폴더에 넣습니다.

> `block` · `section` 애니메이션은 미세먼지 연구를 설명하려고 만든 **개념도**이며 실제 시뮬레이션 결과가 아닙니다.
> 논문의 실제 그림을 쓰려면 해당 단계의 scene 을 `view: 'image'` 로 바꾸면 됩니다.

## 확인해 둘 것

- 수상 배지는 예전 CV의 수상 목록을 **같은 날짜의 발표**에 연결해 둔 것입니다. 실제와 다른 항목이 있으면 `works` 에서 `award` 를 옮겨 주세요.
- 논문·발표의 주제 분류(`topic`)는 제목을 보고 나눈 것입니다.
- `pm-cfd` 스토리의 글은 논문 초록(Land, 14(3), 632)을 바탕으로 쓴 초안입니다.

## 내 컴퓨터에서 확인

```bash
python -m http.server 4173
```

브라우저에서 http://localhost:4173 을 엽니다. (파일을 더블클릭해 열어도 동작합니다.)

## 반영

수정한 뒤 commit · push 하면 1~2분 안에 사이트에 반영됩니다.
이전 화면이 보이면 Ctrl+F5로 새로고침하세요.
