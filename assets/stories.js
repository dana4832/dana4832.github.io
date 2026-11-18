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
   - { view: 'park', road: true, access: true, social: true, gaps: true, improve: true, program: true }
                                                   → 단지 사이 선형공원 개념 애니메이션 (road: 공원이 되기 전의 도로)
   - { view: 'bars', max: 100, unit: '%', title: {…}, rows: [{ label: {…}, value: 87.2, hi: true }], note: {…} }
                                                   → 막대그래프 (hi: true 인 줄만 강조)
   어느 scene 이든 caption: { en, ko } 를 넣으면 그림 아래에 설명이 붙습니다.
   disclaimer: {…} 를 넣으면 맨 아래 안내문이 그 글로 바뀝니다.
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
  },

  /* 고령자의 공원 이용 (GRI연구논총 2025). 수치와 인용은 모두 논문 본문에서 가져왔습니다. */
  'park-aging': {
    topic: 'aging',
    title: { en: 'A park five minutes from home', ko: '집에서 5분 거리에 공원이 생기면' },
    dek: {
      en: 'An expressway between apartment blocks became a park. A survey and in-depth interviews with 92 older residents show how they use and experience the new park and the older parks nearby.',
      ko: '아파트 단지 사이의 도로가 공원이 되었습니다. 그 주변에 사는 어르신 92명에게 설문과 심층 인터뷰로, 새 공원과 기존 공원을 어떻게 이용하고 경험하는지 물었습니다.'
    },
    paper: {
      title: '고령자의 공원 이용 행태 및 경험 분석을 위한 혼합 방법 연구 — 성남시 판교(분당)의 신설 및 기존 공원을 중심으로',
      authors: { en: 'Kitae Park, Yesong Shin, Daeun Lee, Jeongwoo Lee', ko: '박기태, 신예송, 이다은, 이정우' },
      venue: { en: 'GRI Review 27(2), 2025 · in Korean', ko: 'GRI연구논총 27(2), 2025' },
      url: 'https://doi.org/10.23286/gri.2025.27.2.007'
    },
    disclaimer: {
      en: 'The park drawings are schematic illustrations made for this page, not a map of the actual site. The numbers and quotes come from the paper. The study is a case study of 92 voluntary respondents in one district, so the results should be generalised with care.',
      ko: '공원 그림은 이해를 돕기 위해 만든 개념도이며 실제 대상지의 지도가 아닙니다. 수치와 인용은 논문에서 가져왔습니다. 한 지역에서 자발적으로 참여한 92명을 대상으로 한 사례 연구이므로 결과를 일반화할 때는 주의가 필요합니다.'
    },
    steps: [
      {
        kicker: { en: 'The question', ko: '질문' },
        title: { en: 'What is a park to an older resident?', ko: '어르신에게 공원은 어떤 곳일까' },
        text: {
          en: 'Korea is ageing faster than any other country. Parks are often studied as places that provide mobility or exercise space, but much less is known about how older adults actually use and feel about them in everyday life. This study asks that question.',
          ko: '우리나라는 세계에서 가장 빠르게 늙어 가고 있습니다. 그동안 공원은 주로 이동이나 운동 공간이라는 기능으로 연구되었고, 어르신이 일상에서 공원을 실제로 어떻게 쓰고 어떻게 느끼는지는 덜 다뤄졌습니다. 이 연구는 그 질문에서 출발합니다.'
        },
        scene: {
          view: 'stat', value: '19.2%',
          label: { en: 'of Koreans are aged 65 or older', ko: '우리나라 인구 중 65세 이상' },
          note: { en: 'Statistics Korea, 2024 · projected to pass 20% in 2025', ko: '통계청 2024 고령자 통계 · 2025년 20% 예측' }
        }
      },
      {
        kicker: { en: 'The site, before', ko: '대상지, 그 전' },
        title: { en: 'An expressway between the apartments', ko: '아파트 단지 사이를 지나던 도로' },
        text: {
          en: 'In Pangyo, Seongnam, an urban expressway ran between dense apartment complexes. Residents who walked along it remember the traffic noise and dust.',
          ko: '성남시 판교의 고밀 아파트 단지 사이로 도시고속화도로가 지나고 있었습니다. 그 길을 따라 걷던 주민들은 차량 소음과 먼지를 기억합니다.'
        },
        scene: {
          view: 'park', road: true,
          caption: { en: 'Apartment blocks on both sides of the expressway', ko: '도로 양쪽의 아파트 단지' }
        }
      },
      {
        kicker: { en: 'The site, after', ko: '대상지, 그 후' },
        title: { en: 'The road became a park', ko: '도로 위에 공원이 생겼습니다' },
        text: {
          en: 'In November 2023 the road was covered and Good Morning Park opened on top: a linear park 1.6 km long and 34–45 m wide. The study compares it with the older parks nearby: Tancheon stream, Hwarang Park and Bundang Central Park.',
          ko: '2023년 11월, 도로를 덮고 그 위에 굿모닝파크가 문을 열었습니다. 길이 1.6km, 폭 34~45m의 선형 공원입니다. 연구는 이 새 공원을 인근의 기존 공원인 탄천, 화랑공원, 분당중앙공원과 비교했습니다.'
        },
        scene: {
          view: 'park',
          caption: { en: 'Good Morning Park · dots are people walking', ko: '굿모닝파크 · 점은 걷는 사람들' }
        }
      },
      {
        kicker: { en: 'Method', ko: '방법' },
        title: { en: 'A survey, then a conversation', ko: '설문으로 묻고, 인터뷰로 듣기' },
        text: {
          en: 'In October 2024 we met residents aged 60 or older living within 1 km of the park. Each person answered a survey and then sat for a semi-structured interview of about 30 minutes. The transcripts were analysed with word clouds and TF-IDF, and the three sources were checked against each other.',
          ko: '2024년 10월, 굿모닝파크 반경 1km 안의 아파트에 사는 60세 이상 주민을 만났습니다. 모두 설문에 답한 뒤 한 사람당 약 30분씩 반구조화 심층 인터뷰를 했습니다. 인터뷰 기록은 워드클라우드와 TF-IDF로 분석하고, 세 가지 자료를 서로 대조했습니다.'
        },
        scene: {
          view: 'stat', value: '92',
          label: { en: 'residents aged 60 or older', ko: '60세 이상 주민 92명' },
          note: { en: 'survey + in-depth interview + text mining', ko: '설문조사 + 심층 인터뷰 + 텍스트 분석' }
        }
      },
      {
        kicker: { en: 'Finding 1', ko: '결과 1' },
        title: { en: 'Walking stays, even as other exercise fades', ko: '나이가 들어도 걷기는 남습니다' },
        text: {
          en: 'Respondents aged 75 or older did much less moderate and vigorous activity, but walked almost as long as those in their 60s and early 70s. And the place both groups walked to most often was a park or green space.',
          ko: '75세 이상 응답자는 중강도·고강도 활동이 크게 줄었지만, 걷는 시간은 그보다 젊은 응답자와 거의 같았습니다. 그리고 두 집단 모두 걸어서 가장 자주 가는 곳은 공원녹지였습니다.'
        },
        scene: {
          view: 'bars', max: 70, unit: { en: ' min', ko: '분' },
          title: { en: 'Average walking time per day', ko: '하루 평균 걷는 시간' },
          rows: [
            { label: { en: 'Aged 60–74', ko: '60~74세' }, value: 57.8, hi: true },
            { label: { en: 'Aged 75+', ko: '75세 이상' }, value: 55.1, hi: true }
          ],
          note: { en: 'Survey responses (self-reported)', ko: '설문 응답 (자기 보고)' },
          caption: { en: 'Walking time by age group', ko: '연령 집단별 걷는 시간' }
        }
      },
      {
        kicker: { en: 'Finding 2', ko: '결과 2' },
        title: { en: 'Close enough to go often', ko: '가까우면 자주 갑니다' },
        text: {
          en: 'Everyone who used Good Morning Park walked there, and 87.2% arrived within 10 minutes. 92.3% visited at least two or three times a week. The neighbourhood parks further away were places for planned visits, often at weekends.',
          ko: '굿모닝파크 이용자는 모두 걸어서 갔고, 87.2%가 10분 안에 도착했습니다. 92.3%는 일주일에 두세 번 이상 찾았습니다. 반면 더 멀리 있는 근린공원은 주말처럼 시간을 내어 계획하고 가는 곳이었습니다.'
        },
        scene: {
          view: 'bars', max: 100, unit: '%',
          title: { en: 'Users who reach the park within 10 minutes', ko: '10분 안에 공원에 도착하는 이용자' },
          rows: [
            { label: { en: 'Good Morning Park', ko: '굿모닝파크' }, value: 87.2, hi: true },
            { label: { en: 'Tancheon stream', ko: '탄천' }, value: 57.1 },
            { label: { en: 'Hwarang · Bundang Central', ko: '화랑 · 분당중앙공원' }, value: 11.1 }
          ],
          note: { en: 'Survey responses by the park each person mainly uses', ko: '주로 이용하는 공원별 설문 응답' },
          caption: { en: 'Travel time to the park', ko: '공원까지 걸리는 시간' }
        }
      },
      {
        kicker: { en: 'Finding 3 · interviews', ko: '결과 3 · 인터뷰' },
        title: { en: 'The new park changed daily routes', ko: '새 공원이 일상의 동선을 바꿨습니다' },
        text: {
          en: 'Interviewees said they now pass through the park on the way to shops and the community centre, walk on days they would not have before, and run into neighbours more often. “Everyone can get here from home in five minutes,” said a 78-year-old who now meets her friends there in the evening.',
          ko: '인터뷰에서 어르신들은 상가나 복지관에 가는 길에 공원을 지나게 되었고, 전에는 하지 않던 산책을 하게 되었으며, 이웃과 마주치는 일이 늘었다고 말했습니다. 저녁마다 친구들과 이곳에서 모인다는 78세 응답자는 “모두가 5분이면 집에서 올 수 있으니까요”라고 했습니다.'
        },
        scene: {
          view: 'park', access: true, social: true,
          caption: { en: 'Walking routes from home · neighbours meeting at the benches', ko: '집에서 공원까지 걷는 길 · 벤치에서 만나는 이웃' }
        }
      },
      {
        kicker: { en: 'Finding 4', ko: '결과 4' },
        title: { en: 'Close, but hard to stay', ko: '가깝지만 머물기는 어렵습니다' },
        text: {
          en: 'The new park has few large trees. Satisfaction with shade was the lowest of the three, and people said they could not stay at midday in summer and came in the morning or evening instead. Some kept going to the older parks, further away, for their trees and scenery.',
          ko: '새 공원에는 큰 나무가 적습니다. 그늘 만족도는 세 곳 중 가장 낮았고, 여름 한낮에는 머물 수 없어 아침이나 저녁에 찾는다는 응답이 많았습니다. 더 멀더라도 나무와 풍경이 좋은 기존 공원을 계속 찾는 어르신도 있었습니다.'
        },
        scene: {
          view: 'bars', max: 5, unit: { en: ' pts', ko: '점' },
          title: { en: 'Satisfaction with shade', ko: '그늘에 대한 만족도' },
          rows: [
            { label: { en: 'Good Morning Park', ko: '굿모닝파크' }, value: 2.2, hi: true },
            { label: { en: 'Tancheon stream', ko: '탄천' }, value: 2.8 },
            { label: { en: 'Hwarang · Bundang Central', ko: '화랑 · 분당중앙공원' }, value: 4.3 }
          ],
          note: { en: 'Survey satisfaction scores', ko: '설문 만족도 점수' },
          caption: { en: 'Shade satisfaction by park', ko: '공원별 그늘 만족도' }
        }
      },
      {
        kicker: { en: 'Finding 5 · interviews', ko: '결과 5 · 인터뷰' },
        title: { en: 'Where the park falls short', ko: '불편은 어디에서 생길까' },
        text: {
          en: 'Entrances were hard to find and did not line up with the paths inside the apartment complexes; one complex had no direct way in. Because the park sits on a deck, stairs or a distant lift were a burden. The path was cut short, and benches and toilets were too few for a long stay. On the other hand, the park was praised for being bright and safe at night and for less noise and dust than before.',
          ko: '출입구는 찾기 어렵고 단지 안의 보행 동선과 이어지지 않았으며, 바로 들어갈 길이 없는 단지도 있었습니다. 도로 위에 얹힌 공원이라 계단이나 멀리 있는 엘리베이터가 부담이 되었습니다. 산책로는 중간에 끊겨 짧았고, 오래 머물기에는 벤치와 화장실이 부족했습니다. 한편 밤에도 밝아 안전하고, 예전보다 소음과 먼지가 줄었다는 점은 좋은 평가를 받았습니다.'
        },
        scene: {
          view: 'park', gaps: true,
          caption: { en: 'What interviewees pointed out', ko: '인터뷰에서 지적된 곳' }
        }
      },
      {
        kicker: { en: 'So what?', ko: '제안' },
        title: { en: 'Beyond being close', ko: '가까운 것, 그 다음' },
        text: {
          en: 'Access decides whether older adults come; shade, seating and a continuous path decide whether they stay. The study proposes three directions: continuous access routes with clear entrances and lifts, better environmental quality through shade and safety, and programmes suited to each type of park, such as the performances interviewees hoped for.',
          ko: '접근성은 어르신이 공원에 올지를 정하고, 그늘과 앉을 곳, 이어진 산책로는 머물지를 정합니다. 연구는 세 가지 방향을 제안합니다. 분명한 출입구와 엘리베이터로 접근 동선을 이어 주고, 그늘과 안전 요소로 환경의 질을 높이고, 어르신들이 기대한 공연처럼 공원 유형에 맞는 프로그램을 들이는 것입니다.'
        },
        scene: {
          view: 'park', improve: true, program: true, access: true, social: true,
          caption: { en: 'More entrances · a joined path · shade trees and benches · a programme', ko: '출입구 추가 · 이어진 산책로 · 그늘과 벤치 · 프로그램' }
        }
      }
    ],
    takeaways: [
      { en: 'Nearness drives use: 87.2% of Good Morning Park users arrive on foot within 10 minutes, and 92.3% visit at least two or three times a week.', ko: '가까워야 갑니다. 굿모닝파크 이용자의 87.2%가 걸어서 10분 안에 도착하고, 92.3%가 일주일에 두세 번 이상 찾습니다.' },
      { en: 'Nearness is not enough to stay: shade scored 2.2 in the new park against 4.3 in the older neighbourhood parks, and broken paths, few benches and unclear entrances limited use.', ko: '가깝다고 머무는 것은 아닙니다. 그늘 만족도는 새 공원 2.2점, 기존 근린공원 4.3점이었고, 끊긴 산책로와 부족한 벤치, 불분명한 출입구가 이용을 막았습니다.' },
      { en: 'Age-friendly parks need continuous access routes, shade and safety, and programmes suited to each type of park.', ko: '고령친화 공원에는 이어진 접근 동선, 그늘과 안전, 공원 유형에 맞는 프로그램이 함께 필요합니다.' }
    ]
  }
};
