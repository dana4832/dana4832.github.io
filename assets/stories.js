/* ============================================================
   연구 스토리 (스크롤 스토리텔링)
   story.html?id=<아이디> 로 열립니다. 새 스토리는 아래에 같은 모양으로 추가하세요.

   steps 의 scene (오른쪽 그림) 종류
   - { view: 'block', layout: 'grid'|'loop', heights: 'flat'|'center-high'|'perimeter-high',
       emit: 'roads'|'arterial', wind: 'low'|'high', mesh: true, focus: 'street',
       corridor: true, lift: true }                → 블록 평면 개념 애니메이션
   - { view: 'section', ar: 2.8, wind: 'high' }    → 거리 단면 개념 애니메이션 (H/W)
   - { view: 'stat', value: '91–95%', label: {…}, note: {…} } → 큰 숫자
   - { view: 'image', src: 'assets/stories/pm-cfd/fig1.png', alt: {…} } → 실제 그림·사진
   어느 scene 이든 caption: { en, ko } 를 넣으면 그림 아래에 설명이 붙습니다.
   ============================================================ */
window.STORIES = {
  'pm-cfd': {
    topic: 'air',
    title: { en: 'Where does fine dust linger in a dense city?', ko: '빽빽한 도심에서 미세먼지는 어디에 머무를까?' },
    dek: {
      en: 'A block-level look at how road layout, building height and wind shape PM2.5 — with CFD simulation and interpretable machine learning.',
      ko: '도로 구조, 건물 높이, 바람이 PM2.5 확산을 어떻게 바꾸는지 CFD 시뮬레이션과 해석 가능한 머신러닝으로 블록 단위에서 살펴본 연구입니다.'
    },
    paper: {
      title: 'Analyzing Dispersion Characteristics of Fine Particulate Matter in High-Density Urban Areas: A Study Using CFD Simulation and Machine Learning',
      authors: { en: 'Daeun Lee, Caryl Anne M. Barquilla, Jeongwoo Lee', ko: '이다은, Caryl Anne M. Barquilla, 이정우' },
      venue: 'Land, 14(3), 632 (2025)',
      url: 'https://doi.org/10.3390/land14030632'
    },
    steps: [
      {
        kicker: { en: 'The question', ko: '질문' },
        title: { en: 'Fine dust starts at street level', ko: '미세먼지는 길 위에서 시작됩니다' },
        text: {
          en: 'PM2.5 is a serious health risk in dense cities, and much of it is emitted by traffic right where people walk. Whether it is flushed away or lingers depends a great deal on the shape of the city around it.',
          ko: 'PM2.5는 고밀 도시에서 심각한 건강 위험 요인이고, 상당 부분이 사람들이 걷는 바로 그 길 위의 교통에서 나옵니다. 이 먼지가 씻겨 나갈지 머무를지는 주변 도시의 형태에 크게 좌우됩니다.'
        },
        scene: {
          view: 'block', layout: 'grid', heights: 'flat', emit: 'roads', wind: 'low',
          caption: { en: 'A dense block seen from above · dots are fine dust from roads', ko: '위에서 본 고밀 블록 · 점은 도로에서 나온 미세먼지' }
        }
      },
      {
        kicker: { en: 'The gap', ko: '기존 연구의 빈틈' },
        title: { en: 'From one street to a whole block', ko: '거리 하나에서 블록 전체로' },
        text: {
          en: 'Earlier studies mostly zoomed in on a single street canyon. This study widens the view to the block, asking how the arrangement and height of many buildings together change where PM2.5 goes.',
          ko: '기존 연구는 주로 거리 협곡 하나를 들여다봤습니다. 이 연구는 시야를 블록으로 넓혀, 여러 건물의 배치와 높이가 함께 PM2.5의 이동을 어떻게 바꾸는지 묻습니다.'
        },
        scene: {
          view: 'block', layout: 'grid', heights: 'flat', emit: 'roads', wind: 'low', focus: 'street',
          caption: { en: 'One street canyon — the usual unit of analysis', ko: '거리 협곡 하나 — 기존 연구의 분석 단위' }
        }
      },
      {
        kicker: { en: 'Method 1', ko: '방법 1' },
        title: { en: 'Building virtual blocks', ko: '가상의 블록 만들기' },
        text: {
          en: 'Using CFD simulation in ANSYS Fluent, we built many versions of a high-density block: different road layouts (loop and grid), different block height configurations, and different aspect ratios — then let the wind blow through each one.',
          ko: 'ANSYS Fluent로 CFD 시뮬레이션을 수행했습니다. 도로 구조(루프형·격자형), 블록 높이 구성, 종횡비(AR)를 바꿔가며 고밀 블록의 여러 버전을 만들고, 각 블록에 바람을 불어넣었습니다.'
        },
        scene: {
          view: 'block', layout: 'loop', heights: 'flat', emit: 'roads', wind: 'low', mesh: true,
          caption: { en: 'Loop-road layout · the space is divided into a mesh for simulation', ko: '루프형 도로 구조 · 공간을 격자(mesh)로 나누어 계산' }
        }
      },
      {
        kicker: { en: 'Method 2', ko: '방법 2' },
        title: { en: 'Letting a model explain the results', ko: '결과를 모델에게 설명하게 하기' },
        text: {
          en: 'The simulation results became a dataset for training five machine learning models. XGBoost was the most accurate, and interpretable ML made it possible to see which urban form and weather factors drive PM2.5 concentration.',
          ko: '시뮬레이션 결과를 데이터셋으로 만들어 다섯 가지 머신러닝 모델을 학습시켰습니다. XGBoost의 정확도가 가장 높았고, 해석 가능한 머신러닝으로 어떤 도시 형태·기상 요인이 PM2.5 농도를 좌우하는지 볼 수 있었습니다.'
        },
        scene: {
          view: 'stat', value: '91–95%',
          label: { en: 'accuracy of the XGBoost model', ko: 'XGBoost 모델의 정확도' },
          note: { en: 'the best of five ML models trained on CFD results', ko: 'CFD 결과로 학습한 다섯 모델 중 최고' }
        }
      },
      {
        kicker: { en: 'Finding 1', ko: '결과 1' },
        title: { en: 'Loop roads: raise the centre', ko: '루프형 도로: 가운데를 높게' },
        text: {
          en: 'In loop-road networks, centrally elevated buildings enhance ventilation, helping the block clear its air.',
          ko: '루프형 도로망에서는 블록 가운데 건물을 높이면 환기가 좋아져 블록 안의 공기가 더 잘 빠져나갑니다.'
        },
        scene: {
          view: 'block', layout: 'loop', heights: 'center-high', emit: 'roads', wind: 'high', lift: true,
          caption: { en: 'Loop roads · taller buildings in the centre', ko: '루프형 도로 · 가운데가 높은 건물 배치' }
        }
      },
      {
        kicker: { en: 'Finding 2', ko: '결과 2' },
        title: { en: 'Grid roads: raise the edge', ko: '격자형 도로: 가장자리를 높게' },
        text: {
          en: 'In grid-road networks the answer flips. Taller buildings on the perimeter shield the inner blocks from emissions on the surrounding arterial roads.',
          ko: '격자형 도로망에서는 답이 반대입니다. 가장자리 건물을 높이면 주변 간선도로에서 나오는 배출이 블록 안쪽으로 들어오는 것을 막아줍니다.'
        },
        scene: {
          view: 'block', layout: 'grid', heights: 'perimeter-high', emit: 'arterial', wind: 'low',
          caption: { en: 'Grid roads · taller perimeter · dust from arterial roads', ko: '격자형 도로 · 가장자리가 높은 배치 · 간선도로의 먼지' }
        }
      },
      {
        kicker: { en: 'Finding 3', ko: '결과 3' },
        title: { en: 'A threshold at AR 2.5', ko: '종횡비 2.5라는 문턱' },
        text: {
          en: 'The aspect ratio (building height ÷ street width) shows a threshold effect: when it exceeds 2.5, PM2.5 disperses better under high wind velocity.',
          ko: '종횡비(건물 높이 ÷ 도로 폭)에는 문턱 효과가 있었습니다. 종횡비가 2.5를 넘으면 풍속이 높을 때 PM2.5가 더 잘 확산됩니다.'
        },
        scene: {
          view: 'section', ar: 2.8, wind: 'high',
          caption: { en: 'Street cross-section · strong wind', ko: '거리 단면 · 강한 바람' }
        }
      },
      {
        kicker: { en: 'So what?', ko: '설계에 주는 의미' },
        title: { en: 'Design with the wind in mind', ko: '바람을 생각하는 설계' },
        text: {
          en: 'There is no one-size-fits-all fix: mitigation has to be tailored to the road layout. The results point to wind-sensitive design — wind corridors and building alignments — and show how CFD plus ML can support data-driven planning.',
          ko: '모든 곳에 통하는 해법은 없고, 도로 구조에 맞춘 저감 전략이 필요합니다. 결과는 바람길과 건물 정렬 같은 바람을 고려한 설계의 필요성을 보여주며, CFD와 머신러닝의 결합이 데이터 기반 도시계획을 뒷받침할 수 있음을 시사합니다.'
        },
        scene: {
          view: 'block', layout: 'grid', heights: 'flat', emit: 'roads', wind: 'high', corridor: true,
          caption: { en: 'A wind corridor through the block', ko: '블록을 가로지르는 바람길' }
        }
      }
    ],
    takeaways: [
      { en: 'Loop-road blocks: centrally elevated buildings enhance ventilation.', ko: '루프형 도로 블록: 가운데가 높은 건물 배치가 환기를 돕습니다.' },
      { en: 'Grid-road blocks: taller perimeter buildings shield inner blocks from arterial emissions.', ko: '격자형 도로 블록: 가장자리의 높은 건물이 간선도로 배출로부터 안쪽을 보호합니다.' },
      { en: 'Aspect ratio above 2.5 improves PM2.5 dispersion under high wind velocity.', ko: '종횡비가 2.5를 넘으면 강한 바람에서 PM2.5 확산이 좋아집니다.' }
    ]
  }
};
