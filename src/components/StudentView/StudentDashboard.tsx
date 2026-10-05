import React from 'react';
import { Student, Topic, Writing, WritingStatus, RewardEvent } from '../../types';
import { StorageService } from '../../services/storage';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Award, History, Edit3, MessageSquare, Heart } from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  topic: Topic;
  writing?: Writing;
  rewardEvents: RewardEvent[];
  onStartDraft: () => void;
  onStartSelfCheck: () => void;
  onStartRevision: () => void;
  onStartReflection: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  topic,
  writing,
  rewardEvents,
  onStartDraft,
  onStartSelfCheck,
  onStartRevision,
  onStartReflection
}) => {
  const currentStatus: WritingStatus = writing?.currentStatus || 'DRAFTING';

  // Pipeline steps
  const steps: { status: WritingStatus; label: string; number: number }[] = [
    { status: 'DRAFTING', label: '1. 초안작성', number: 1 },
    { status: 'DRAFT_SUBMITTED', label: '2. 초안제출', number: 2 },
    { status: 'SELF_CHECKED', label: '3. 자기점검', number: 3 },
    { status: 'FEEDBACK_DONE', label: '4. 교사피드백', number: 4 },
    { status: 'REREVISED', label: '5. 고쳐쓰기', number: 5 },
    { status: 'FINAL_SUBMITTED', label: '6. 최종제출', number: 6 },
    { status: 'REFLECTED', label: '7. 성찰하기', number: 7 }
  ];

  const getStepIndex = (status: WritingStatus): number => {
    switch (status) {
      case 'DRAFTING': return 0;
      case 'DRAFT_SUBMITTED': return 1;
      case 'SELF_CHECKED': return 2;
      case 'FEEDBACK_DONE': return 3;
      case 'REREVISED': return 4;
      case 'FINAL_SUBMITTED': return 5;
      case 'REFLECTED': return 6;
      case 'COMPLETED': return 7;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);

  // Status Action Rendering
  const renderActionButton = () => {
    switch (currentStatus) {
      case 'DRAFTING':
        return (
          <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={onStartDraft}>
            <Edit3 size={20} /> 초안 글쓰기 계속하기 ➔
          </button>
        );
      case 'DRAFT_SUBMITTED':
        return (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn btn-primary" style={{ background: '#86198f' }} onClick={onStartSelfCheck}>
              <CheckCircle2 size={20} /> 자기 점검 시작하기 (+10톡/XP) ➔
            </button>
          </div>
        );
      case 'SELF_CHECKED':
        return (
          <div style={{ background: '#fef3c7', padding: '12px 18px', borderRadius: 12, border: '1px solid #fde68a', color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Clock size={20} /> 선생님의 글 지도 의견(피드백)을 기다리고 있습니다!
          </div>
        );
      case 'FEEDBACK_DONE':
        return (
          <button className="btn btn-primary" style={{ background: '#5b21b6', padding: '14px 28px', fontSize: '1.05rem' }} onClick={onStartRevision}>
            <MessageSquare size={20} /> 교사 피드백 읽고 고쳐쓰기 진행 (+20톡/XP) ➔
          </button>
        );
      case 'REREVISED':
      case 'FINAL_SUBMITTED':
        return (
          <button className="btn btn-success" style={{ padding: '14px 28px', fontSize: '1.05rem' }} onClick={onStartReflection}>
            <Heart size={20} /> 글쓰기 여정 마침 & 성찰글 쓰기 (+10톡/XP) ➔
          </button>
        );
      case 'REFLECTED':
      case 'COMPLETED':
        return (
          <div style={{ background: '#d1fae5', padding: '14px 20px', borderRadius: 12, border: '1px solid #a7f3d0', color: '#065f46', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={22} /> 이번 글쓰기 미션을 완벽히 마쳤습니다! 🎉
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: 28,
        marginBottom: 24,
        background: 'linear-gradient(135deg, #ffffff 0%, #f4f4fe 100%)',
        borderLeft: '6px solid #4f46e5'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.05em' }}>
              TODAY'S MISSION
            </span>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#1e293b', marginTop: 2 }}>
              📌 {topic.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: 6, maxWidth: 800 }}>
              {topic.description}
            </p>
          </div>

          <div>{renderActionButton()}</div>
        </div>
      </div>

      {/* 7-Step Pipeline Visual */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} color="#4f46e5" /> 나의 글쓰기 성장 파이프라인 (과정 중심 7단계)
        </h3>

        <div className="pipeline-container">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isActive = idx === currentStepIdx;

            return (
              <div key={step.status} className={`pipeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                <div className="pipeline-circle">
                  {isCompleted ? '✓' : step.number}
                </div>
                <span className="pipeline-label">
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* History & Rewards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Recent Draft Preview */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            📝 내가 작성 중인 글 내용
          </h3>

          {writing && writing.versions.length > 0 ? (
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0', minHeight: 180 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: 8 }}>
                최종 수정시각: {new Date(writing.updatedAt).toLocaleString()}
              </div>
              <p style={{ fontSize: '0.93rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.7, maxHeight: 220, overflowY: 'auto' }}>
                {writing.versions[writing.versions.length - 1].content}
              </p>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', padding: 30, textAlign: 'center', color: '#94a3b8', borderRadius: 14 }}>
              아직 작성된 초안이 없습니다. 위의 [초안 글쓰기 시작] 버튼을 눌러보세요!
            </div>
          )}
        </div>

        {/* Recent Reward History */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} color="#f59e0b" /> 최근 획득 보상 내역 ('톡' & XP)
          </h3>

          {rewardEvents.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', color: '#94a3b8' }}>
              글쓰기 단계별 미션을 완료하면 이곳에 보상 기록이 차곡차곡 쌓입니다!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
              {rewardEvents.slice(0, 5).map(evt => (
                <div key={evt.id} style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: evt.amountTok >= 0 ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${evt.amountTok >= 0 ? '#a7f3d0' : '#fecaca'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: evt.amountTok >= 0 ? '#065f46' : '#991b1b' }}>
                      {evt.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(evt.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color: evt.amountTok >= 0 ? '#059669' : '#dc2626' }}>
                    {evt.amountTok >= 0 ? `+${evt.amountTok}` : evt.amountTok} 톡
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
