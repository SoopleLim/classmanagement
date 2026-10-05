import { 
  Student, Topic, Writing, WritingStatus, RewardEvent, 
  ShopItem, CouponPurchase, RewardConfig, SelfCheck, TeacherFeedback, Reflection 
} from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'writing_app_students',
  TOPICS: 'writing_app_topics',
  WRITINGS: 'writing_app_writings',
  REWARD_EVENTS: 'writing_app_reward_events',
  SHOP_ITEMS: 'writing_app_shop_items',
  COUPONS: 'writing_app_coupons',
  REWARD_CONFIG: 'writing_app_reward_config',
  TEACHER_PIN: 'writing_app_teacher_pin',
};

// 25명 초등 6학년 학생 이름 생성 데이터
const INITIAL_STUDENT_NAMES = [
  '강하늘', '고은비', '김도윤', '김민준', '김서연', 
  '김아린', '김주원', '박서준', '박소율', '박지호', 
  '배수아', '백현우', '송지후', '신유나', '안지민', 
  '양은우', '오하은', '유찬', '윤서진', '이준우', 
  '이지은', '임하율', '정예준', '조아인', '최한결'
];

const INITIAL_REWARD_CONFIG: RewardConfig = {
  draftReward: { tok: 20, xp: 20 },
  selfCheckReward: { tok: 10, xp: 10 },
  revisedReward: { tok: 20, xp: 20 },
  finalReward: { tok: 30, xp: 30 },
  reflectionReward: { tok: 10, xp: 10 }
};

const INITIAL_TOPIC: Topic = {
  id: 'topic-1',
  title: '우리 마을의 자랑스러운 명소 소개하기',
  description: '우리가 살고 있는 마을이나 동네에서 가장 소개하고 싶은 장소를 하나 정해 봅시다. 그 장소의 위치, 특징, 그리고 그곳에 담긴 나만의 추억을 13문장 이상으로 생생하게 소개해 보세요!',
  minSentences: 13,
  checklistItems: [
    '소개하려는 장소의 위치와 모습이 눈에 그려지듯 구체적으로 표현되었나요?',
    '장소에 대한 나의 느낌이나 추억이 담겨 있나요?',
    '글의 순서(시작-전개-끝)가 자연스럽게 이어지나요?',
    '맞춤법과 띄어쓰기를 스스로 확인해 보았나요?'
  ],
  createdAt: new Date().toISOString()
};

const INITIAL_SHOP_ITEMS: ShopItem[] = [
  { id: 'item-1', title: '하루 자리 선택권', description: '내일 하루 원하는 자리를 지정하여 앉을 수 있어요.', priceTok: 50, icon: '🪑', stock: 10, isActive: true },
  { id: 'item-2', title: '15분 자유 시간권', description: '창의적 체험활동 시간 중 15분 자유 보너스!', priceTok: 80, icon: '⏰', stock: 5, isActive: true },
  { id: 'item-3', title: '과제 1회 면제권', description: '일일 일기/단어 과제 중 1회를 면제받습니다.', priceTok: 120, icon: '🎟️', stock: 3, isActive: true },
  { id: 'item-4', title: '학급 모둠장 지정권', description: '다음주 모둠 활동 때 모둠장을 먼저 선택해요.', priceTok: 60, icon: '👑', stock: 5, isActive: true }
];

export const calculateLevel = (xp: number): { level: number; title: string; currentLevelXP: number; nextLevelXP: number } => {
  // Level N 필요 누적 XP = 100 * N * (N + 1) / 2
  // Lv.1: 0~100, Lv.2: 100~300, Lv.3: 300~600 ...
  let lvl = 1;
  let req = 100 * lvl;
  let accumulated = 0;
  
  while (xp >= accumulated + req) {
    accumulated += req;
    lvl++;
    req = 100 * lvl;
  }

  const currentLevelXP = xp - accumulated;
  const nextLevelXP = req;

  const titles = [
    '새싹 작성자', '생각을 터뜨리는 중', '문장 탐험가', '이야기 연출가', 
    '생각 깊은 글재주꾼', '학급 문장가', '지혜로운 성찰가', '빛나는 대문호'
  ];

  const title = titles[Math.min(lvl - 1, titles.length - 1)];
  return { level: lvl, title, currentLevelXP, nextLevelXP };
};

export const countSentences = (text: string): number => {
  if (!text || !text.trim()) return 0;
  // 마침표(.), 물음표(?), 느낌표(!), 줄바꿈 기준으로 문장 카운트
  const matches = text.match(/[^.!?\n]+[.!?\n]*/g);
  if (!matches) return 0;
  return matches.filter(m => m.trim().length > 0).length;
};

export const getStorageData = () => {
  // Initialize if empty
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const students: Student[] = INITIAL_STUDENT_NAMES.map((name, idx) => ({
      id: `student-${idx + 1}`,
      name,
      studentNumber: idx + 1,
      pinCode: String(1000 + idx + 1), // 1001, 1002...
      currentTok: 30 + (idx % 4) * 10,
      currentXP: 30 + (idx % 4) * 10,
      level: 1,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    }));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify([INITIAL_TOPIC]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(INITIAL_SHOP_ITEMS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REWARD_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.REWARD_CONFIG, JSON.stringify(INITIAL_REWARD_CONFIG));
  }

  if (!localStorage.getItem(STORAGE_KEYS.WRITINGS)) {
    // 샘플 데모 작성글 몇 개 시딩 (교사가 바로 둘러볼 수 있게)
    const students: Student[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
    const sampleWritings: Writing[] = [
      {
        id: 'writing-1',
        studentId: students[0]?.id || 'student-1',
        topicId: INITIAL_TOPIC.id,
        currentStatus: 'FEEDBACK_DONE',
        grantedStages: ['DRAFT_SUBMITTED', 'SELF_CHECKED'],
        versions: [{
          id: 'v1',
          writingId: 'writing-1',
          versionType: 'DRAFT',
          content: '우리 동네에서 가장 자랑스러운 곳은 바로 마을 도서관입니다. 이 도서관은 우리 집에서 걸어서 5분 거리에 있어서 아주 가깝습니다. 도서관 건물은 3층으로 되어 있고 예쁜 파란색 지붕을 가지고 있습니다. 1층에는 어린이 자료실이 있어서 재미있는 동화책과 만화책이 가득합니다. 저는 주말마다 이곳에 와서 책을 읽는 것을 정말 좋아합니다. 여름에는 에어컨이 시원하게 틀어져 있어서 책 읽기 딱 좋습니다. 도서관 사서 선생님도 매우 친절하셔서 좋은 책을 자주 추천해 주십니다. 도서관 앞 마당에는 커다란 단풍나무가 한 그루 서 있습니다. 가을이 되면 단풍잎이 빨갛게 물들어서 풍경이 참 아름답습니다. 저는 여기서 친구들과 만나서 숙제를 같이 하기도 합니다. 도서관 휴게실에서는 맛있는 간식도 먹을 수 있습니다. 마을 도서관은 우리 동네 주민 모두가 사랑하는 따뜻한 공간입니다. 모두에게 우리 동네 도서관을 꼭 방문해 보라고 추천하고 싶습니다.',
          sentenceCount: 13,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }],
        selfCheck: {
          id: 'sc1',
          writingId: 'writing-1',
          checklistAnswers: { '0': true, '1': true, '2': true, '3': false },
          freeTextOpinion: '맞춤법이 약간 헷갈리는 문장이 있어서 고쳐쓰기 할 때 다시 읽어봐야겠습니다.',
          createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
        },
        feedback: {
          id: 'fb1',
          writingId: 'writing-1',
          content: '하늘 학생! 도서관의 층별 모습과 단풍나무 풍경을 눈에 선하게 참 잘 묘사해 주었어요. 맞춤법 헷갈렸던 부분과 단풍나무 밑에서 친구들과 나눈 추억을 조금 더 보완해서 고쳐 써보면 최고의 글이 될 것 같아요!',
          createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
        },
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 10).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.WRITINGS, JSON.stringify(sampleWritings));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REWARD_EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.REWARD_EVENTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify([]));
  }
};

export const StorageService = {
  getStudents: (): Student[] => {
    getStorageData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  },

  updateStudent: (student: Student) => {
    const students = StorageService.getStudents();
    const idx = students.findIndex(s => s.id === student.id);
    if (idx !== -1) {
      students[idx] = student;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  },

  getTopics: (): Topic[] => {
    getStorageData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS) || '[]');
  },

  saveTopic: (topic: Topic) => {
    const topics = StorageService.getTopics();
    const idx = topics.findIndex(t => t.id === topic.id);
    if (idx !== -1) {
      topics[idx] = topic;
    } else {
      topics.unshift(topic);
    }
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
  },

  getWritings: (): Writing[] => {
    getStorageData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.WRITINGS) || '[]');
  },

  getWritingByStudentAndTopic: (studentId: string, topicId: string): Writing | undefined => {
    const writings = StorageService.getWritings();
    return writings.find(w => w.studentId === studentId && w.topicId === topicId);
  },

  saveWriting: (writing: Writing): Writing => {
    const writings = StorageService.getWritings();
    const idx = writings.findIndex(w => w.id === writing.id);
    writing.updatedAt = new Date().toISOString();
    if (idx !== -1) {
      writings[idx] = writing;
    } else {
      writings.push(writing);
    }
    localStorage.setItem(STORAGE_KEYS.WRITINGS, JSON.stringify(writings));
    return writing;
  },

  getRewardConfig: (): RewardConfig => {
    getStorageData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARD_CONFIG) || JSON.stringify(INITIAL_REWARD_CONFIG));
  },

  saveRewardConfig: (config: RewardConfig) => {
    localStorage.setItem(STORAGE_KEYS.REWARD_CONFIG, JSON.stringify(config));
  },

  getRewardEvents: (studentId?: string): RewardEvent[] => {
    getStorageData();
    const events: RewardEvent[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REWARD_EVENTS) || '[]');
    if (studentId) return events.filter(e => e.studentId === studentId);
    return events;
  },

  // 엄격한 보상 중복 방지 로직 (Grant Reward once per writing stage)
  grantStageReward: (studentId: string, writingId: string, stage: WritingStatus, customDesc?: string) => {
    const writings = StorageService.getWritings();
    const writing = writings.find(w => w.id === writingId);
    if (!writing) return false;

    // 이미 지급되었는지 체크
    if (writing.grantedStages && writing.grantedStages.includes(stage)) {
      console.warn(`Stage ${stage} reward already granted for writing ${writingId}`);
      return false;
    }

    const config = StorageService.getRewardConfig();
    let tok = 0;
    let xp = 0;
    let stageTitle = '';

    switch (stage) {
      case 'DRAFT_SUBMITTED':
        tok = config.draftReward.tok;
        xp = config.draftReward.xp;
        stageTitle = '초안 완성 제출';
        break;
      case 'SELF_CHECKED':
        tok = config.selfCheckReward.tok;
        xp = config.selfCheckReward.xp;
        stageTitle = '자기 점검 완료';
        break;
      case 'REREVISED':
        tok = config.revisedReward.tok;
        xp = config.revisedReward.xp;
        stageTitle = '고쳐쓰기 완료';
        break;
      case 'FINAL_SUBMITTED':
        tok = config.finalReward.tok;
        xp = config.finalReward.xp;
        stageTitle = '최종본 제출';
        break;
      case 'REFLECTED':
        tok = config.reflectionReward.tok;
        xp = config.reflectionReward.xp;
        stageTitle = '성찰글 작성 완료';
        break;
      default:
        return false;
    }

    // 학생 정보 가져오기 및 잔액 갱신
    const students = StorageService.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    student.currentTok += tok;
    student.currentXP += xp;
    const { level } = calculateLevel(student.currentXP);
    student.level = level;
    StorageService.updateStudent(student);

    // 중복 방지 태그 등록
    if (!writing.grantedStages) writing.grantedStages = [];
    writing.grantedStages.push(stage);
    StorageService.saveWriting(writing);

    // 이벤트 로그 생성
    const events = StorageService.getRewardEvents();
    const newEvent: RewardEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      studentId,
      writingId,
      eventType: 'EARN',
      stageName: stageTitle,
      amountTok: tok,
      amountXP: xp,
      description: customDesc || `[${stageTitle}] 활동 참여 보상`,
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.REWARD_EVENTS, JSON.stringify(events));

    return { tok, xp, newLevel: level };
  },

  // 수동 톡/XP 지급 또는 차감 (교사 전용)
  adjustStudentReward: (studentId: string, tok: number, xp: number, reason: string) => {
    const students = StorageService.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    student.currentTok = Math.max(0, student.currentTok + tok);
    student.currentXP = Math.max(0, student.currentXP + xp);
    const { level } = calculateLevel(student.currentXP);
    student.level = level;
    StorageService.updateStudent(student);

    const events = StorageService.getRewardEvents();
    const newEvent: RewardEvent = {
      id: `evt-${Date.now()}`,
      studentId,
      eventType: tok >= 0 ? 'EARN' : 'ADJUST',
      amountTok: tok,
      amountXP: xp,
      description: reason || '교사 직접 지정 보상',
      createdAt: new Date().toISOString()
    };
    events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.REWARD_EVENTS, JSON.stringify(events));
    return true;
  },

  // 상점 상품 및 쿠폰
  getShopItems: (): ShopItem[] => {
    getStorageData();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS) || '[]');
  },

  saveShopItems: (items: ShopItem[]) => {
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(items));
  },

  getCoupons: (studentId?: string): CouponPurchase[] => {
    getStorageData();
    const coupons: CouponPurchase[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.COUPONS) || '[]');
    if (studentId) return coupons.filter(c => c.studentId === studentId);
    return coupons;
  },

  buyShopItem: (studentId: string, itemId: string) => {
    const items = StorageService.getShopItems();
    const item = items.find(i => i.id === itemId);
    if (!item || item.stock <= 0) return { success: false, message: '재고가 부족하거나 존재하지 않는 상품입니다.' };

    const students = StorageService.getStudents();
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: '학생 정보를 찾을 수 없습니다.' };

    if (student.currentTok < item.priceTok) {
      return { success: false, message: `'톡' 화폐가 부족합니다! (필요: ${item.priceTok} 톡 / 보유: ${student.currentTok} 톡)` };
    }

    // 톡 즉시 차감
    student.currentTok -= item.priceTok;
    StorageService.updateStudent(student);

    // 재고 차감
    item.stock -= 1;
    StorageService.saveShopItems(items);

    // 쿠폰 발급
    const coupons = StorageService.getCoupons();
    const newCoupon: CouponPurchase = {
      id: `cpn-${Date.now()}`,
      studentId,
      shopItemId: item.id,
      itemTitle: item.title,
      itemIcon: item.icon,
      priceTok: item.priceTok,
      status: 'UNUSED',
      purchasedAt: new Date().toISOString()
    };
    coupons.unshift(newCoupon);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));

    // 이벤트 작성
    const events = StorageService.getRewardEvents();
    events.unshift({
      id: `evt-buy-${Date.now()}`,
      studentId,
      eventType: 'SPEND',
      amountTok: -item.priceTok,
      amountXP: 0,
      description: `상점 상품 구매: [${item.title}]`,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.REWARD_EVENTS, JSON.stringify(events));

    return { success: true, coupon: newCoupon };
  },

  useCoupon: (couponId: string) => {
    const coupons = StorageService.getCoupons();
    const coupon = coupons.find(c => c.id === couponId);
    if (coupon) {
      coupon.status = 'USED';
      coupon.usedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
      return true;
    }
    return false;
  },

  // 백업 및 데이터 초기화
  exportAllDataJSON: (): string => {
    getStorageData();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students: StorageService.getStudents(),
      topics: StorageService.getTopics(),
      writings: StorageService.getWritings(),
      rewardEvents: StorageService.getRewardEvents(),
      shopItems: StorageService.getShopItems(),
      coupons: StorageService.getCoupons(),
      rewardConfig: StorageService.getRewardConfig()
    };
    return JSON.stringify(exportData, null, 2);
  },

  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.TOPICS);
    localStorage.removeItem(STORAGE_KEYS.WRITINGS);
    localStorage.removeItem(STORAGE_KEYS.REWARD_EVENTS);
    localStorage.removeItem(STORAGE_KEYS.SHOP_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.REWARD_CONFIG);
    getStorageData();
  }
};
