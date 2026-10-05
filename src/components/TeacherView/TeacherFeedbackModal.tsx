import React, { useState } from 'react';
import { Student, Writing, WritingStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { MessageSquare, CheckCircle, Award, Sparkles, FileText, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeacherFeedbackModalProps {
  student: Student;
  writing?: Writing;
  onClose: () => void;
  onRefresh: () => void;
}

export const TeacherFeedbackModal: React.FC<TeacherFeedbackModalProps> = ({
  student,
  writing,
  onClose,
  onRefresh
}) => {
  const [feedbackContent, setFeedbackContent] = useState<string>(writing?.feedback?.content || '');
  const [successMsg, setSuccessMsg] = useState<string>('');

  const draft = writing?.versions.find(v => v.versionType === 'DRAFT')?.content || '';
  const revised = writing?.versions.find(v => v.versionType === 'REVISED')?.content || '';

  const handleSaveFeedbackAndApprove = (nextStatus: WritingStatus, stageName: WritingStatus) => {
    if (!writing) return;

    // 피드백 저장
    writing.feedback = {
      id: `fb-${Date.now()}`,
      writingId: writing.id,
      content: feedbackContent || '피드백이 승인되었습니다.',
      createdAt: new Date().toISOString()
    };
    writing.currentStatus = nextStatus;
    StorageService.saveWriting(writing);

    // 보상 획득 및 중복 지급 방지 검증
    const rewardResult = StorageService.grantStageReward(student.id, writing.id, stageName);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (rewardResult) {
      setSuccessMsg(`✅ 지도 의견 저장 완료! [${stageName}] 보상 (+${rewardResult.tok}톡, +${rewardResult.xp}XP)이 학생에게 자동 지급되었습니다.`);
    } else {
      setSuccessMsg(`✅ 지도 의견이 저장되었습니다. (해당 단계 보상은 이미 지급됨)`);
    }

    onRefresh();
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 960, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#dbeafe', color: '#1e40af', padding: 10, borderRadius: 12 }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {student.studentNumber}번 {student.name} 학생 글 지도 및 보상 승인
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                학생이 작성한 과정별 글을 확인하고 지도 피드백을 남겨주세요.
              </p>
            </div>
          </div>

          <button className="btn btn-outline" onClick={onClose} style={{ minHeight: 36, height: 36, padding: '0 10px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Versions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: revised ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
          {/* Draft Column */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} /> 1. 학생 초안 원문 (문장 수: {writing?.versions.find(v => v.versionType === 'DRAFT')?.sentenceCount || 0}문장)
            </div>
            <div style={{ background: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: 1.7, maxHeight: 240, overflowY: 'auto' }}>
              {draft || '아직 초안이 제출되지 않았습니다.'}
            </div>
          </div>

          {/* Revised Column if available */}
          {revised && (
            <div style={{ background: '#f5f3ff', padding: 16, borderRadius: 12, border: '1px solid #ddd6fe' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#5b21b6', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} /> 2. 수정 반영된 고쳐쓴 글
              </div>
              <div style={{ background: '#ffffff', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: 1.7, maxHeight: 240, overflowY: 'auto' }}>
                {revised}
              </div>
            </div>
          )}
        </div>

        {/* Student Self-Check Review */}
        {writing?.selfCheck && (
          <div style={{ background: '#fae8ff', border: '1px solid #f5d0fe', padding: 14, borderRadius: 12, marginBottom: 20 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#86198f', marginBottom: 4 }}>
              📋 학생 자기 점검 의견:
            </div>
            <p style={{ fontSize: '0.9rem', color: '#701a75' }}>
              "{writing.selfCheck.freeTextOpinion || '내용 없음'}"
            </p>
          </div>
        )}

        {/* Teacher Feedback Textarea */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: 6 }}>
            💬 교사 지도 의견 (피드백 작성)
          </label>
          <textarea
            className="textarea-field"
            placeholder="학생의 글에서 칭찬할 점과 고쳐 쓰면 좋을 점을 친절하게 작성해 주세요."
            style={{ minHeight: 120 }}
            value={feedbackContent}
            onChange={e => setFeedbackContent(e.target.value)}
          />
        </div>

        {successMsg && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: 12, borderRadius: 10, marginBottom: 16, fontWeight: 700, fontSize: '0.9rem' }}>
            {successMsg}
          </div>
        )}

        {/* Approval Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <button className="btn btn-outline" onClick={onClose}>닫기</button>

          <div style={{ display: 'flex', gap: 10 }}>
            {/* 3단계/4단계 피드백 승인 버튼 */}
            {writing?.currentStatus === 'SELF_CHECKED' && (
              <button
                className="btn btn-primary"
                onClick={() => handleSaveFeedbackAndApprove('FEEDBACK_DONE', 'SELF_CHECKED')}
              >
                <CheckCircle size={18} /> 피드백 저장 & 자기점검 승인 (+10톡/XP 지급)
              </button>
            )}

            {/* 고쳐쓰기 승인 버튼 */}
            {writing?.currentStatus === 'REREVISED' && (
              <button
                className="btn btn-primary"
                style={{ background: '#5b21b6' }}
                onClick={() => handleSaveFeedbackAndApprove('FINAL_SUBMITTED', 'REREVISED')}
              >
                <Award size={18} /> 고쳐쓰기 최종 승인 (+20톡/XP 지급)
              </button>
            )}

            {/* 기본 피드백 단순 저장 */}
            <button
              className="btn btn-outline"
              onClick={() => {
                if (writing) {
                  writing.feedback = {
                    id: `fb-${Date.now()}`,
                    writingId: writing.id,
                    content: feedbackContent,
                    createdAt: new Date().toISOString()
                  };
                  StorageService.saveWriting(writing);
                  onRefresh();
                  onClose();
                }
              }}
            >
              피드백 내용만 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
