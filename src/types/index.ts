export type WritingStatus = 
  | 'DRAFTING'           // 작성 중 (1단계)
  | 'DRAFT_SUBMITTED'    // 초안 제출 (2단계)
  | 'SELF_CHECKED'       // 자기 점검 (3단계)
  | 'FEEDBACK_DONE'      // 교사 피드백 완료 (4단계)
  | 'REREVISED'          // 고쳐쓰기 완료 (5단계)
  | 'FINAL_SUBMITTED'    // 최종본 제출 (6단계)
  | 'REFLECTED'          // 성찰 완료 (7단계)
  | 'COMPLETED';         // 교사 최종 완료 승인 (8단계)

export interface Student {
  id: string;
  name: string;
  studentNumber: number;
  pinCode: string;
  currentTok: number;
  currentXP: number;
  level: number;
  avatar: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  minSentences: number; // default 13
  checklistItems: string[];
  createdAt: string;
}

export interface WritingVersion {
  id: string;
  writingId: string;
  versionType: 'DRAFT' | 'REVISED' | 'FINAL';
  content: string;
  sentenceCount: number;
  createdAt: string;
}

export interface SelfCheck {
  id: string;
  writingId: string;
  checklistAnswers: Record<string, boolean>; // checklist index -> boolean
  freeTextOpinion: string;
  createdAt: string;
}

export interface TeacherFeedback {
  id: string;
  writingId: string;
  content: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  writingId: string;
  content: string;
  createdAt: string;
}

export interface Writing {
  id: string;
  studentId: string;
  topicId: string;
  currentStatus: WritingStatus;
  versions: WritingVersion[];
  selfCheck?: SelfCheck;
  feedback?: TeacherFeedback;
  reflection?: Reflection;
  grantedStages: WritingStatus[]; // 보상이 이미 지급된 단계 목록 (중복 지급 방지)
  createdAt: string;
  updatedAt: string;
}

export interface RewardEvent {
  id: string;
  studentId: string;
  writingId?: string;
  eventType: 'EARN' | 'SPEND' | 'ADJUST';
  stageName?: string;
  amountTok: number;
  amountXP: number;
  description: string;
  createdAt: string;
}

export interface ShopItem {
  id: string;
  title: string;
  description: string;
  priceTok: number;
  icon: string;
  stock: number;
  isActive: boolean;
}

export interface CouponPurchase {
  id: string;
  studentId: string;
  shopItemId: string;
  itemTitle: string;
  itemIcon: string;
  priceTok: number;
  status: 'UNUSED' | 'USED';
  purchasedAt: string;
  usedAt?: string;
}

export interface RewardConfig {
  draftReward: { tok: number; xp: number };
  selfCheckReward: { tok: number; xp: number };
  revisedReward: { tok: number; xp: number };
  finalReward: { tok: number; xp: number };
  reflectionReward: { tok: number; xp: number };
}
