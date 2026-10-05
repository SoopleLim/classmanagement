import React, { useState, useEffect } from 'react';
import { Topic, Writing, WritingStatus } from '../../types';
import { countSentences } from '../../services/storage';
import { Save, Send, HelpCircle, CheckCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WritingEditorProps {
  topic: Topic;
  writing?: Writing;
  isRevision?: boolean; // 고쳐쓰기 모드 여부
  onSaveDraft: (content: string) => void;
  onSubmitDraft: (content: string) => void;
  onSubmitRevision: (content: string) => void;
  onCancel: () => void;
}

export const WritingEditor: React.FC<WritingEditorProps> = ({
  topic,
  writing,
  isRevision = false,
  onSaveDraft,
  onSubmitDraft,
  onSubmitRevision,
  onCancel
}) => {
  // 이전 작성 내용 가져오기
  const latestDraft = writing?.versions.find(v => v.versionType === 'DRAFT')?.content || '';
  const latestRevision = writing?.versions.find(v => v.versionType === 'REVISED')?.content || '';

  const initialContent = isRevision 
    ? (latestRevision || latestDraft) 
    : latestDraft;

  const [content, setContent] = useState<string>(initialContent);
  const [autoSaveMsg, setAutoSaveMsg] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const sentenceCount = countSentences(content);
  const minSentences = topic.minSentences || 13;
  const progressPercent = Math.min(100, Math.round((sentenceCount / minSentences) * 100));
  const isMinSentenceMet = sentenceCount >= minSentences;

  // 30초 단위 자동 임시 저장
  useEffect(() => {
    const timer = setInterval(() => {
      if (content.trim()) {
        onSaveDraft(content);
        setAutoSaveMsg(`자동 저장됨 (${new Date().toLocaleTimeString()})`);
        setTimeout(() => setAutoSaveMsg(''), 3000);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [content, onSaveDraft]);

  const handleSaveClick = () => {
    onSaveDraft(content);
    setAutoSaveMsg(`임시 저장되었습니다! (${new Date().toLocaleTimeString()})`);
    setTimeout(() => setAutoSaveMsg(''), 3000);
  };

  const handleSubmitClick = () => {
    setValidationError('');
    if (!isMinSentenceMet) {
      setValidationError(`글자 및 문장이 부족합니다. 최소 ${minSentences}문장 이상 작성해 주세요. (현재 ${sentenceCount}문장)`);
      return;
    }

    // Confetti 애니메이션
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (isRevision) {
      onSubmitRevision(content);
    } else {
      onSubmitDraft(content);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Banner & Mode indicator */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{
            background: isRevision ? '#ddd6fe' : '#e0f2fe',
            color: isRevision ? '#5b21b6' : '#0369a1',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Sparkles size={16} />
            {isRevision ? '5단계: 교사 피드백 반영 고쳐쓰기 작성' : '1~2단계: 초안 글쓰기 작성 중'}
          </span>

          {autoSaveMsg && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={14} /> {autoSaveMsg}
            </span>
          )}
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 8, color: '#1e293b' }}>
          📌 {topic.title}
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6 }}>
          {topic.description}
        </p>

        {/* 13문장 미션 진행 게이지 */}
        <div style={{ marginTop: 16, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 700 }}>
            <span>
              ✍️ 문장 수 체크: <strong style={{ color: isMinSentenceMet ? '#10b981' : '#f59e0b', fontSize: '1rem' }}>{sentenceCount}</strong> / 최소 {minSentences}문장
            </span>
            <span style={{ color: isMinSentenceMet ? '#10b981' : '#64748b' }}>
              {isMinSentenceMet ? '✅ 제출 가능 조건 충족!' : `${minSentences - sentenceCount}문장 더 쓰기`}
            </span>
          </div>
          <div className="gauge-container">
            <div className="gauge-bar" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Main Split-View Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isRevision ? '1fr 1fr' : '1fr',
        gap: 20,
        marginBottom: 20
      }}>
        {/* Left Column (Reference Box for Revision Mode) */}
        {isRevision && (
          <div className="glass-card" style={{ padding: 20, background: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 14, color: '#334155', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="#4f46e5" /> 이전 초안 & 교사 지도 피드백 참조
            </h3>

            {/* Teacher Feedback Box */}
            {writing?.feedback && (
              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16
              }}>
                <div style={{ fontWeight: 800, color: '#1e40af', fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  💬 교사 지도 의견 (피드백)
                </div>
                <p style={{ fontSize: '0.92rem', color: '#1e3a8a', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {writing.feedback.content}
                </p>
              </div>
            )}

            {/* Self check reference */}
            {writing?.selfCheck && (
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#7e22ce', fontSize: '0.85rem', marginBottom: 4 }}>
                  📋 내가 한 자기 점검 의견:
                </div>
                <p style={{ fontSize: '0.88rem', color: '#68d391' }}>
                  "{writing.selfCheck.freeTextOpinion || '작성된 의견 없음'}"
                </p>
              </div>
            )}

            {/* Original Draft view */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 12, padding: 16, maxHeight: 300, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>
                [내가 쓴 초안 원문]
              </div>
              <p style={{ fontSize: '0.92rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {latestDraft}
              </p>
            </div>
          </div>
        )}

        {/* Right / Main Editor Column */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12, color: '#1e293b' }}>
            {isRevision ? '✏️ 수정본 글쓰기 (고쳐쓰기 에디터)' : '✏️ 초안 글쓰기 에디터'}
          </h3>

          <textarea
            className="textarea-field"
            placeholder="이곳에 글을 작성해 주세요. 문장 마침표(.), 물음표(?), 느낌표(!)를 사용하여 13문장 이상 풍부하게 묘사해 보세요!"
            style={{ minHeight: 320, fontSize: '1.02rem' }}
            value={content}
            onChange={e => setContent(e.target.value)}
          />

          {validationError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, marginTop: 12, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
              <AlertCircle size={18} />
              {validationError}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <button className="btn btn-outline" onClick={onCancel}>
              ← 돌아가기
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={handleSaveClick}>
                <Save size={18} /> 임시 저장
              </button>
              
              <button 
                className={`btn btn-primary ${!isMinSentenceMet ? 'btn-disabled' : ''}`}
                onClick={handleSubmitClick}
              >
                <Send size={18} /> {isRevision ? '고쳐쓰기 제출하기 (+20톡/XP)' : '초안 제출하기 (+20톡/XP)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
