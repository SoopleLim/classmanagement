import React, { useState } from 'react';
import { Student, Topic, Writing, WritingStatus } from '../../types';
import { StorageService, calculateLevel } from '../../services/storage';
import { Shield, MessageSquare, Settings, ShoppingBag, Download, PlusCircle, CheckCircle, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  topic: Topic;
  writings: Writing[];
  onOpenFeedbackModal: (student: Student, writing?: Writing) => void;
  onOpenRewardConfig: () => void;
  onOpenShopManager: () => void;
  onOpenBackupModal: () => void;
  onRefreshData: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  topic,
  writings,
  onOpenFeedbackModal,
  onOpenRewardConfig,
  onOpenShopManager,
  onOpenBackupModal,
  onRefreshData
}) => {
  const [showTopicEdit, setShowTopicEdit] = useState<boolean>(false);
  const [topicTitle, setTopicTitle] = useState<string>(topic.title);
  const [topicDesc, setTopicDesc] = useState<string>(topic.description);
  const [minSentences, setMinSentences] = useState<number>(topic.minSentences || 13);

  // Status Badge Helper
  const getStatusBadge = (status?: WritingStatus) => {
    switch (status) {
      case 'DRAFTING':
        return <span className="badge badge-drafting">✍️ 작성 중</span>;
      case 'DRAFT_SUBMITTED':
        return <span className="badge badge-draft-submitted">📄 초안 제출</span>;
      case 'SELF_CHECKED':
        return <span className="badge badge-self-checked">🟣 점검 완료 (승인 대기)</span>;
      case 'FEEDBACK_DONE':
        return <span className="badge badge-feedback-done">💬 피드백 발송됨</span>;
      case 'REREVISED':
        return <span className="badge badge-rerevised">✏️ 고쳐쓰기 완료 (승인 대기)</span>;
      case 'FINAL_SUBMITTED':
        return <span className="badge badge-final-submitted">🏁 최종 제출</span>;
      case 'REFLECTED':
      case 'COMPLETED':
        return <span className="badge badge-completed">✅ 성찰 완료</span>;
      default:
        return <span className="badge" style={{ background: '#f1f5f9', color: '#94a3b8' }}>미작성</span>;
    }
  };

  // Action Pending count
  const pendingCount = writings.filter(w => w.currentStatus === 'SELF_CHECKED' || w.currentStatus === 'REREVISED').length;

  const handleSaveTopic = () => {
    const updatedTopic: Topic = {
      ...topic,
      title: topicTitle,
      description: topicDesc,
      minSentences
    };
    StorageService.saveTopic(updatedTopic);
    setShowTopicEdit(false);
    onRefreshData();
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto' }}>
      {/* Top Banner Control Bar */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Shield size={24} color="#10b981" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b' }}>
                6학년 1반 글쓰기 지도 & 학급 경제 컨트롤 센터
              </h2>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              전체 25명 학생의 글쓰기 7단계 진행 현황을 파악하고 지도 피드백과 보상('톡', XP)을 관리합니다.
            </p>
          </div>

          {/* Teacher Tool Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={() => setShowTopicEdit(!showTopicEdit)}>
              <BookOpen size={18} /> 주제 등록/수정
            </button>
            <button className="btn btn-outline" onClick={onOpenRewardConfig}>
              <Settings size={18} /> 보상 수치 설정
            </button>
            <button className="btn btn-outline" onClick={onOpenShopManager}>
              <ShoppingBag size={18} /> 상점 관리
            </button>
            <button className="btn btn-outline" onClick={onOpenBackupModal}>
              <Download size={18} /> 데이터 백업
            </button>
          </div>
        </div>

        {/* Current Topic Indicator */}
        <div style={{ marginTop: 16, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4f46e5' }}>현재 진행 중인 글쓰기 주제</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b' }}>📌 {topic.title} (최소 {topic.minSentences}문장 이상)</h4>
          </div>
          {pendingCount > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> 교사 승인/피드백 대기: {pendingCount}건
            </div>
          )}
        </div>
      </div>

      {/* Edit Topic Drawer */}
      {showTopicEdit && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24, background: '#f4f4fe', border: '2px solid #6366f1' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
            ✍️ 새 글쓰기 주제(과제) 설정
          </h3>
          <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
            <input
              type="text"
              className="input-field"
              placeholder="주제 제목"
              value={topicTitle}
              onChange={e => setTopicTitle(e.target.value)}
            />
            <textarea
              className="textarea-field"
              placeholder="주제 상세 설명 및 지도 가이드"
              style={{ minHeight: 90 }}
              value={topicDesc}
              onChange={e => setTopicDesc(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700 }}>최소 분량 문장 수:</label>
              <input
                type="number"
                className="input-field"
                style={{ width: 100 }}
                value={minSentences}
                onChange={e => setMinSentences(Number(e.target.value))}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSaveTopic}>주제 저장하기</button>
            <button className="btn btn-outline" onClick={() => setShowTopicEdit(false)}>취소</button>
          </div>
        </div>
      )}

      {/* Main Student 25 Table */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          👥 25명 학급 학생 글쓰기 진행 그리드
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 14px' }}>번호/이름</th>
                <th style={{ padding: '12px 14px' }}>성장 레벨 & XP</th>
                <th style={{ padding: '12px 14px' }}>보유 '톡'</th>
                <th style={{ padding: '12px 14px' }}>현재 진행 단계</th>
                <th style={{ padding: '12px 14px' }}>최신 글 문장 수</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>지도 & 승인</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const writing = writings.find(w => w.studentId === student.id && w.topicId === topic.id);
                const levelInfo = calculateLevel(student.currentXP);
                const latestVersion = writing?.versions[writing.versions.length - 1];

                const isNeedsAction = writing?.currentStatus === 'SELF_CHECKED' || writing?.currentStatus === 'REREVISED';

                return (
                  <tr 
                    key={student.id} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      background: isNeedsAction ? '#fefce8' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {student.studentNumber}번 {student.name}
                    </td>

                    <td style={{ padding: '14px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b21a8' }}>
                        Lv.{levelInfo.level} ({levelInfo.title})
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {student.currentXP} XP
                      </div>
                    </td>

                    <td style={{ padding: '14px', fontWeight: 800, color: '#d97706' }}>
                      💰 {student.currentTok} 톡
                    </td>

                    <td style={{ padding: '14px' }}>
                      {getStatusBadge(writing?.currentStatus)}
                    </td>

                    <td style={{ padding: '14px', fontSize: '0.88rem', color: '#475569' }}>
                      {latestVersion ? `${latestVersion.sentenceCount}문장` : '-'}
                    </td>

                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        className={`btn ${isNeedsAction ? 'btn-primary' : 'btn-outline'}`}
                        style={{ height: 36, minHeight: 36, padding: '0 12px', fontSize: '0.82rem' }}
                        onClick={() => onOpenFeedbackModal(student, writing)}
                      >
                        <MessageSquare size={14} /> {isNeedsAction ? '⚡ 승인/피드백 작성' : '글 확인/피드백'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
