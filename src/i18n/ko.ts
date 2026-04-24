const ko = {
  hero: {
    tagline: "카페 · 베이커리",
    subtitle: "넉넉한 맛, 머물고 싶은 순간",
    ctaMenu: "메뉴 보기",
    ctaHistory: "우리 이야기",
  },

  historia: {
    label: "우리 이야기",
    heading: "이야기가 있는 집,\n항상 열려 있는 식탁",
    p1: "Little Claire Bakery는 가족의 프로젝트로 시작되었습니다. 정성과 노력, 그리고 함께 나누는 식탁의 즐거움으로 만들어졌습니다.",
    p2: "처음에는 팔레르모에서 시작해 우리의 정체성을 만들어갔고, 이후 이투사잉고에서 계속 성장했습니다.",
    p3: "지금은 매력적인 오래된 집에서 운영되며, 따뜻하고 우아한 공간을 제공합니다.",
    imgAlt: "리틀 클레어 베이커리",
  },

  experiencia: {
    label: "경험",
    heading: "Little Claire",
    intro: "모든 디테일은 특별한 시간을 위해.",
    cards: [
      {
        title: "역사 있는 공간",
        text: "개성과 이야기가 담긴 우아한 집.",
      },
      {
        title: "푸짐한 요리",
        text: "넉넉한 양과 정직한 맛.",
      },
      {
        title: "가족의 손길",
        text: "가족이 함께 만든 공간.",
      },
    ],
  },

  propuesta: {
    label: "우리의 제안",
    heading: "메뉴",
    intro: "정직한 맛과 함께 나누는 즐거움.",
    items: [
      { title: "커피", text: "정성스럽게 준비한 커피." },
      { title: "베이커리", text: "신선한 수제 디저트." },
      { title: "브런치", text: "여유로운 아침 메뉴." },
      { title: "공유 메뉴", text: "함께 즐기는 음식." },
    ],
  },

  menuDestacados: {
    label: "다시 오고 싶은 맛",
    heading: "인기 메뉴",
    intro: "정성스럽게 내린 커피부터 놀라운 양의 한 접시까지.",
    ctaMenu: "전체 메뉴 보기",
    items: [
      {
        name: "스페셜티 커피",
        desc: "정성껏 준비한, 언제든 즐기기 좋은 커피.",
      },
      {
        name: "하우스 브런치",
        desc: "여유롭게 즐길 수 있는 푸짐한 브런치.",
      },
      {
        name: "자체 제작 페이스트리",
        desc: "부드럽고 섬세하며 나눠 먹기에 완벽한.",
      },
    ],
  },

  espacio: {
    label: "공간",
    heading: "머물고 싶은 곳",
    intro: "따뜻하고 클래식한 분위기.",
    img1Alt: "인테리어",
    img2Alt: "커피",
    img3Alt: "음식",
  },

  ctaFinal: {
    location: "아르헨티나 이투사잉고",
    heading: "Little Claire Bakery에서\n기다립니다",
    subtext: "다시 오고 싶은 카페.",
    ctaMenu: "메뉴 보기",
    ctaContact: "문의하기",
  },

  reservas: {
    tabLabel: "이벤트 예약",
    label: "예약",
    heading: "이벤트 예약하기",
    intro: "양식을 작성하시면 세부 사항을 조율하기 위해 연락드리겠습니다.",
    fields: {
      name: "이름 *",
      email: "이메일 *",
      phone: "전화번호 *",
      event_date: "이벤트 날짜 *",
      event_date_placeholder: "날짜 선택",
      event_time: "시간 *",
      event_time_placeholder: "시간 선택",
      guests_count: "게스트 수 *",
      event_type: "이벤트 유형 *",
      typeOptions: {
        birthday: "생일",
        corporate: "기업 행사",
        meeting: "미팅",
        other: "기타",
      },
      notes: "비고",
    },
    submit: "신청서 보내기",
    submitting: "전송 중...",
    errorMsg: "오류가 발생했습니다. 다시 시도해 주세요.",
    successLabel: "신청 완료",
    successHeading: "감사합니다!",
    successText: "예약 확인을 위해 곧 연락드리겠습니다.",
    successReset: "다른 신청서 보내기",
  },

  contacto: {
    tabLabel: "메시지 보내기",
    label: "문의",
    heading: "연락하기",
    intro: "문의나 케이터링 요청.",
    fields: {
      name: "이름 *",
      email: "이메일 *",
      phone: "전화번호 *",
      message: "메시지",
    },
    submit: "보내기",
    submitting: "전송 중...",
    errorMsg: "오류 발생",
    successLabel: "전송 완료",
    successHeading: "감사합니다!",
    successText: "곧 연락드리겠습니다.",
    successReset: "다시 보내기",
  },

  footer: {
    codedBy: "coded by",
  },
};

export default ko;
