/* ============================================================
   사이트에 들어가는 내용은 전부 이 파일에 있습니다.
   { en: '영어', ko: '한국어' } 형태는 언어 전환에 따라 바뀌고,
   그냥 '문자열' 은 두 언어에서 똑같이 보입니다.
   ============================================================ */
window.CV = {
  // 발표의 "사진" 링크가 열리는 페이지 (talks.html#t-2026-1031 처럼 연결됩니다)
  photoBase: 'talks.html',

  // 연구 주제 (필터와 색상에 쓰입니다)
  topics: {
    heat: { en: 'Urban heat & green space', ko: '도시 열환경 · 녹지' },
    air: { en: 'Air quality', ko: '대기질 · 미세먼지' },
    aging: { en: 'Healthy city & aging', ko: '건강도시 · 고령친화' }
  },

  about: {
    en: [
      'My interest in plants has gradually led me to study cities — how urban environments interact with nature and how we can design greener, healthier cities for the future.',
      'I am a Ph.D. student at the Smart Urban Design Lab (SUDL) at Chung-Ang University in Seoul, advised by Prof. Jeongwoo Lee, with a background in both plant science and urban design. My master\'s thesis examined how urban green space patterns and neighborhood types interact to shape land surface temperature in Seoul. I have also used CFD simulation and machine learning to study how fine particulate matter disperses in high-density urban areas, and contributed to mixed-methods research on how older adults use and experience urban parks.'
    ],
    ko: [
      '식물에 대한 관심에서 출발해 자연스럽게 도시를 연구하게 되었습니다. 도시 환경과 자연이 어떻게 상호작용하는지, 그리고 더 푸르고 건강한 미래 도시를 어떻게 설계할 수 있는지에 관심이 있습니다.',
      '현재 중앙대학교 스마트도시설계연구실(SUDL)에서 이정우 교수님의 지도로 박사과정에 재학 중이며, 식물생명공학과 도시설계를 함께 전공했습니다. 석사 학위논문에서는 서울시를 대상으로 도시 녹지 공간 패턴과 근린 유형이 지표면온도에 미치는 상호작용 효과를 분석했습니다. 또한 CFD 시뮬레이션과 머신러닝으로 고밀 도시 지역의 미세먼지 확산 특성을 연구했고, 고령자의 도시공원 이용 행태와 경험에 관한 혼합 방법 연구에 참여했습니다.'
    ]
  },

  // 관심 분야 태그. topic 이 있으면 누를 때 해당 주제의 논문·발표로 이동합니다
  interests: [
    { en: 'Urban green space', ko: '도시 녹지', topic: 'heat' },
    { en: 'Urban heat · land surface temperature', ko: '도시 열환경 · 지표면온도', topic: 'heat' },
    { en: 'Urban air quality · PM', ko: '도시 대기질 · 미세먼지', topic: 'air' },
    { en: 'Healthy cities', ko: '건강도시', topic: 'aging' },
    { en: 'CFD simulation', ko: 'CFD 시뮬레이션', topic: 'air' },
    { en: 'Machine learning', ko: '머신러닝' },
    { en: 'GIS', ko: 'GIS' }
  ],

  // 연구 카드. story 에 assets/stories.js 의 스토리 id 를 넣으면 "스토리로 보기" 버튼이 생깁니다
  research: [
    {
      topic: 'air',
      image: 'assets/research/air.jpg',
      title: { en: 'Where does fine dust linger in a dense city?', ko: '빽빽한 도심에서 미세먼지는 어디에 머무를까?' },
      summary: {
        en: 'CFD simulation and interpretable machine learning to see how road layout, building height and wind shape PM2.5 at the block level.',
        ko: '도로 구조, 건물 높이, 바람이 블록 단위의 PM2.5 확산을 어떻게 바꾸는지 CFD 시뮬레이션과 해석 가능한 머신러닝으로 살펴봅니다.'
      },
      story: 'pm-cfd'
    },
    {
      topic: 'heat',
      image: 'assets/research/heat.jpg',
      title: { en: 'Which green space patterns cool which neighborhoods?', ko: '어떤 녹지 패턴이 어떤 동네를 시원하게 할까?' },
      summary: {
        en: 'How urban green space patterns and neighborhood types interact to shape land surface temperature in Seoul.',
        ko: '서울시를 대상으로 도시 녹지 공간 패턴과 근린 유형이 지표면온도에 미치는 상호작용 효과를 분석합니다.'
      },
      story: null
    },
    {
      topic: 'aging',
      image: 'assets/research/aging.jpg',
      title: { en: 'How do older adults use and experience urban parks?', ko: '고령자는 도시공원을 어떻게 이용하고 경험할까?' },
      summary: {
        en: 'Mixed-methods research on park use and neighborhood environments that support active, healthy aging.',
        ko: '고령자의 공원 이용 행태와 경험, 활동적 노화를 돕는 근린환경에 관한 혼합 방법 연구입니다.'
      },
      story: 'park-aging'
    }
  ],

  // 논문(pub)과 학술대회 발표(talk). 날짜 순서는 자동으로 정렬됩니다
  works: [
    {
      type: 'pub', date: '2025.05', topic: 'aging', titleLang: 'ko',
      title: '고령자의 공원 이용 행태 및 경험 분석을 위한 혼합 방법 연구 — 성남시 판교(분당)의 신설 및 기존 공원을 중심으로',
      authors: { en: 'Kitae Park, Yesong Shin, Daeun Lee, Jeongwoo Lee', ko: '박기태, 신예송, 이다은, 이정우' },
      venue: { en: 'GRI Review (GRI연구논총) · in Korean', ko: 'GRI연구논총' },
      doi: 'https://doi.org/10.23286/gri.2025.27.2.007',
      story: 'park-aging'
    },
    {
      type: 'pub', date: '2025.03', topic: 'air',
      title: 'Analyzing Dispersion Characteristics of Fine Particulate Matter in High-Density Urban Areas: A Study Using CFD Simulation and Machine Learning',
      authors: { en: 'Daeun Lee, Caryl Anne M. Barquilla, Jeongwoo Lee', ko: '이다은, Caryl Anne M. Barquilla, 이정우' },
      venue: 'Land, 14(3), 632',
      doi: 'https://doi.org/10.3390/land14030632',
      story: 'pm-cfd'
    },
    {
      type: 'talk', date: '2026.10.31', topic: 'heat', titleLang: 'ko',
      title: '도시 물리적 특성과 주야간 지표면온도 차이의 다중 스케일 관계: 서울시 ECOSTRESS를 활용한 공간회귀분석',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: { en: 'Korea Planning Association Fall Industry–Academia Conference, Pusan National University · in Korean', ko: '대한국토·도시계획학회 추계산학학술대회, 부산대학교' },
      photos: 't-2026-1031',
      award: {
        name: { en: 'Outstanding Paper Award', ko: '우수논문상' },
        by: { en: 'Korea Planning Association, Fall Industry–Academia Conference', ko: '대한국토·도시계획학회 추계산학학술대회' }
      }
    },
    {
      type: 'talk', date: '2026.10.31', topic: 'aging', titleLang: 'ko',
      title: '고령자의 객관적 근린시설 접근성과 보행량의 구조적 관계: 생활환경 만족도의 매개효과 및 지역별 개선 우선순위 분석',
      authors: { en: 'Geunyoung Park (presenter), Daeun Lee, Jeongwoo Lee', ko: '박근영(발표), 이다은, 이정우' },
      venue: { en: 'Korea Planning Association Fall Industry–Academia Conference, Pusan National University · in Korean', ko: '대한국토·도시계획학회 추계산학학술대회, 부산대학교' }
    },
    {
      type: 'talk', date: '2026.08.20', topic: 'heat',
      title: 'Differentiated Cooling Effects of Urban Green Space Patterns Across Neighborhood Types: Evidence from Seoul',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)',
      photos: 't-2026-0820',
      award: {
        name: 'Young Planner Award',
        by: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)'
      }
    },
    {
      type: 'talk', date: '2026.05.22', topic: 'heat', titleLang: 'ko',
      title: '스트리트뷰이미지 기반 가시환경 지표와 도시형상이 도시열환경에 미치는 영향: 서울시 격자기반 분석',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: { en: 'Urban Health Society of Korea (도시건강학회) Conference, Seoul National University · in Korean', ko: '도시건강학회, 서울대학교 행정대학원' },
      photos: 't-2026-0522',
      award: {
        name: { en: 'Best Paper Award', ko: '최우수논문상' },
        by: { en: 'Urban Health Society of Korea (도시건강학회)', ko: '도시건강학회' }
      }
    },
    {
      type: 'talk', date: '2025.11.01', topic: 'aging', titleLang: 'ko',
      title: '건강도시 구현을 위한 도시 환경 평가지표 개발에 관한 연구: 초고령사회 노인 신체활동 활성화를 중심으로',
      authors: { en: 'Jaemin Jeong (presenter), Yesong Shin, Daeun Lee, Jeongwoo Lee', ko: '정재민(발표), 신예송, 이다은, 이정우' },
      venue: { en: 'Korea Planning Association Fall Industry–Academia Conference, Korea National University of Transportation (Chungju Campus) · in Korean', ko: '대한국토·도시계획학회 추계산학학술대회, 국립한국교통대학교 충주캠퍼스' },
      photos: 't-2025-1101'
    },
    {
      type: 'talk', date: '2025.08.21', topic: 'heat',
      title: 'The Influence of Green Space Landscape Patterns on Land Surface Temperatures – A Spatial Analysis of Seoul',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)',
      photos: 't-2025-0821',
      award: {
        name: 'Best Presentation Award',
        by: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)'
      }
    },
    {
      type: 'talk', date: '2025.04.25', topic: 'aging', titleLang: 'ko',
      title: '도시 내 공원의 고령친화적 기능과 개선 방향: 굿모닝파크 사례 연구',
      authors: { en: 'Kitae Park, Yesong Shin, Daeun Lee (presenter), Jeongwoo Lee', ko: '박기태, 신예송, 이다은(발표), 이정우' },
      venue: { en: 'Korea Planning Association Spring Industry–Academia Conference, Hanyang University · in Korean', ko: '대한국토·도시계획학회 춘계산학학술대회, 한양대학교' },
      photos: 't-2025-0425',
      award: {
        name: { en: 'Outstanding Paper Award', ko: '우수논문상' },
        by: { en: 'Korea Planning Association, Spring Industry–Academia Conference', ko: '대한국토·도시계획학회 춘계산학학술대회' }
      }
    },
    {
      type: 'talk', date: '2024.10.12', topic: 'air', titleLang: 'ko',
      title: '고밀도 도시공간구조에 따른 미세먼지 분산 특성 연구 — CFD 시뮬레이션과 머신러닝을 활용하여',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: { en: 'Urban Design Institute of Korea Fall Conference, Kangwon National University · in Korean', ko: '한국도시설계학회 추계학술대회, 강원대학교' },
      photos: 't-2024-1012',
      award: {
        name: { en: 'Outstanding Paper Award', ko: '우수논문상' },
        by: { en: 'Urban Design Institute of Korea, Fall Conference', ko: '한국도시설계학회 추계학술대회' }
      }
    },
    {
      type: 'talk', date: '2024.08.23', topic: 'air',
      title: 'Design Strategies for Minimizing Fine Particulate Matter in Urban Centers Using CFD Simulation',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)',
      photos: 't-2024-0823',
      award: {
        name: 'Best Paper Award',
        by: 'International Conference of Asia-Pacific Planning Societies (ICAPPS)'
      }
    },
    {
      type: 'talk', date: '2024.04.20', topic: 'air', titleLang: 'ko',
      title: 'CFD 시뮬레이션을 활용한 도로 및 건물 형상에 따른 미세먼지 분포 특성 연구',
      authors: { en: 'Daeun Lee (presenter), Jeongwoo Lee', ko: '이다은(발표), 이정우' },
      venue: { en: 'Urban Design Institute of Korea Spring Conference, Hanyang University · in Korean', ko: '한국도시설계학회 춘계학술대회, 한양대학교' },
      photos: 't-2024-0420',
      award: {
        name: { en: 'Outstanding Paper Award', ko: '우수논문상' },
        by: { en: 'Urban Design Institute of Korea, Spring Conference', ko: '한국도시설계학회 춘계학술대회' }
      }
    }
  ],

  // 걸어온 길: kind 는 edu(학력) / exp(경력) / project(연구과제), sort 는 정렬용 시작 연월
  timeline: [
    {
      kind: 'edu', sort: '2026.03', when: { en: '2026.03 – Present', ko: '2026.03 – 현재' },
      title: { en: 'Ph.D. Student', ko: '박사과정' },
      where: { en: 'Chung-Ang University · Smart Urban Design Lab (SUDL)', ko: '중앙대학교 · 스마트도시설계연구실(SUDL)' },
      desc: [
        { en: 'Advisor: Prof. Jeongwoo Lee', ko: '지도교수: 이정우 교수' },
        { en: 'Research area: Urban design strategy based on environmental performance', ko: '연구 분야: 환경 성능 기반 도시설계 전략' }
      ]
    },
    {
      kind: 'exp', sort: '2026.03', when: { en: '2026.03 – Present', ko: '2026.03 – 현재' },
      title: { en: 'Graduate Researcher (Ph.D. program)', ko: '박사과정 연구원' },
      where: { en: 'Smart Urban Design Lab (SUDL), Chung-Ang University · Seoul', ko: '중앙대학교 스마트도시설계연구실(SUDL) · 서울' }
    },
    {
      kind: 'project', sort: '2025.01', when: { en: '2025 – Present', ko: '2025 – 현재' },
      title: { en: 'Development of a Generative AI-Based Neighborhood Environment Diagnostic and Optimization Model for Healthy City Design', ko: '건강도시 설계를 위한 생성형 AI 기반 근린환경 진단 및 최적화 모형 개발' },
      where: { en: 'National Research Foundation of Korea · project period 2025–2030', ko: '한국연구재단 · 과제 기간 2025–2030' },
      desc: [{ en: 'Role: Participating Researcher', ko: '역할: 참여연구원' }]
    },
    {
      kind: 'project', sort: '2024.01', when: { en: '2024 – Present', ko: '2024 – 현재' },
      title: { en: 'Strategies for Developing and Implementing Evaluations of Neighborhood Infrastructure to Support the Elderly’s Active Aging through Integrated Spatial Data', ko: '융합공간데이터 기반의 고령자 건강인프라 평가지표 개발 및 활용전략 수립' },
      where: { en: 'National Research Foundation of Korea · project period 2024–2027', ko: '한국연구재단 · 과제 기간 2024–2027' },
      desc: [{ en: 'Role: Participating Researcher', ko: '역할: 참여연구원' }]
    },
    {
      kind: 'edu', sort: '2024.03', when: '2024.03 – 2026.02',
      title: { en: 'M.Eng. in Civil Engineering (Urban Engineering)', ko: '공학석사 · 토목공학 (도시공학 전공)' },
      where: { en: 'Chung-Ang University, Seoul', ko: '중앙대학교' },
      desc: [{ en: 'Thesis: Analyzing the Interaction Effects Between Urban Green Space Patterns and Neighborhood Types in Land Surface Temperature Change', ko: '학위논문: 도시 녹지 공간 패턴에 따른 지표면온도 변화와 근린 유형의 상호작용 효과 분석' }]
    },
    {
      kind: 'exp', sort: '2024.03', when: '2024.03 – 2026.02',
      title: { en: 'Graduate Researcher (Master\'s program)', ko: '석사과정 연구원' },
      where: { en: 'Smart Urban Design Lab (SUDL), Chung-Ang University · Seoul', ko: '중앙대학교 스마트도시설계연구실(SUDL) · 서울' }
    },
    {
      kind: 'exp', sort: '2023.05', when: '2023.05 – 2024.02',
      title: { en: 'Undergraduate Researcher', ko: '학부연구생' },
      where: { en: 'Smart Urban Design Lab (SUDL), Chung-Ang University · Seoul', ko: '중앙대학교 스마트도시설계연구실(SUDL) · 서울' }
    },
    {
      kind: 'project', sort: '2023.01', when: '2023 – 2025',
      title: { en: 'Development of Evaluation Model of Green Infrastructure: Measuring Public Health Effect Using Big-Data Simulators', ko: '그린인프라의 공중보건적 측면의 효용성 평가·예측 모델 개발: 빅데이터 융합 모델 기반 시뮬레이터 활용을 중심으로' },
      where: { en: 'National Research Foundation of Korea · project period 2022–2025', ko: '한국연구재단 · 과제 기간 2022–2025' },
      desc: [{ en: 'Role: Participating Researcher', ko: '역할: 참여연구원' }]
    },
    {
      kind: 'edu', sort: '2021.03', when: '2021.03 – 2024.02',
      title: { en: 'B.Eng. in Urban Design and Studies', ko: '공학사 · 도시시스템공학' },
      where: { en: 'Chung-Ang University, Seoul', ko: '중앙대학교' }
    },
    {
      kind: 'edu', sort: '2019.03', when: '2019.03 – 2024.02',
      title: { en: 'B.S. in Agriculture, Plant Science and Technology', ko: '농학사 · 식물생명공학' },
      where: { en: 'Chung-Ang University, Seoul', ko: '중앙대학교' }
    }
  ],

  skills: [
    { label: { en: 'Simulation', ko: '시뮬레이션' }, items: ['ANSYS Fluent (CFD)'] },
    { label: 'GIS', items: ['ArcGIS', 'QGIS'] }
  ],

  certs: [
    { label: { en: 'License', ko: '국가기술자격' }, name: { en: 'Engineer Urban Planning', ko: '도시계획기사' } }
  ]
};
