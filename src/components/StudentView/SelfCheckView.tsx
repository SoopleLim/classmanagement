import React, { useState } from 'react';
import { Topic, Writing } from '../../types';
import { CheckSquare, AlertCircle, Send, FileText } from 'lucide-react';

interface SelfCheckViewProps {
  topic: Topic;
  writing: Writing;
  onSubmitSelfCheck: (checklistAnswers: Record<string, boolean>, opinion: string) => void;
  onCancel: () => void;
}

export const SelfCheckView: React.FC<SelfCheckViewProps> = ({
  topic,
  writing,
  onSubmitSelfCheck,
  onCancel
}) => {
  const latestDraft = writing.versions.find(v => v.versionType === 'DRAFT')?.content || '';
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [opinion, setOpinion] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleCheckToggle = (idx: number) => {
    setAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSubmit = () => {
    // 최소 1개 이상 답변 체크 및 의견 입력 확인
    if (Object.keys(answers).length < topic.checklistItems.length) {
      setErrorMsg('모든 점검 항목에 체크(예/아니오)해 주세요.');
      return;
    }
    if (!opinion.trim()) {
      setErrorMsg('자기 점검 소감이나 고쳐 쓸 아이디어를 간단히 적어주세요.');
      return;
    }
    onSubmitSelfCheck(answers, opinion);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#86198f', marginBottom: 10 }}>
          <CheckSquare size={24} />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>3단계: 나의 글 스스로 점검하기</h2>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
          초안을 다 썼다면 이제 작가의 눈으로 내 글을 다시 읽어보며 점검해 봅시다.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 20 }}>
        {/* Left: Original Draft View */}
        <div className="glass-card" style={{ padding: 20, background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 10, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={18} color="#4f46e5" /> 내가 작성한 초안
          </h3>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, maxHeight: 380, overflowY: 'auto', fontSize: '0.92rem', lineHeight: 1.7 }}>
            {latestDraft}
          </div>
        </div>

        {/* Right: Checklist Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
            📋 점검 체크리스트
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {topic.checklistItems.map((item, idx) => {
              const isChecked = answers[idx] === true;
              return (
                <div 
                  key={idx}
                  onClick={() => handleCheckToggle(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: isChecked ? '1.5px solid #86198f' : '1px solid #cbd5e1',
                    background: isChecked ? '#fae8ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isChecked ? '#701a75' : '#334155' }}>
                    {idx + 1}. {item}
                  </span>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: isChecked ? '#86198f' : '#f1f5f9',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {isChecked ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
              ✏️ 스스로 점검하며 느낀 점 / 고쳐쓰기 계획
            </label>
            <textarea
              className="textarea-field"
              placeholder="예: 맞춤법을 다시 읽어봐야겠고, 3문장 정도 위치 설명을 더 보완해서 고쳐 쓰겠습니다."
              style={{ minHeight: 120, fontSize: '0.92rem' }}
              value={opinion}
              onChange={e => setOpinion(e.target.value)}
            />
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 8, fontSize: '0.85rem', marginBottom: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-outline" onClick={onCancel}>← 취소</button>
            <button className="btn btn-primary" style={{ background: '#86198f' }} onClick={handleSubmit}>
              <Send size={18} /> 점검 완료 제출 (+10톡/XP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
