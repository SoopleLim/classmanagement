import React, { useState } from 'react';
import { Writing } from '../../types';
import { Heart, Send, CheckCircle2, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReflectionViewProps {
  writing: Writing;
  onSubmitReflection: (content: string) => void;
  onCancel: () => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  writing,
  onSubmitReflection,
  onCancel
}) => {
  const [reflection, setReflection] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const finalContent = writing.versions.find(v => v.versionType === 'REVISED')?.content ||
                       writing.versions.find(v => v.versionType === 'DRAFT')?.content || '';

  const handleSubmit = () => {
    if (!reflection.trim() || reflection.trim().length < 10) {
      setErrorMsg('글쓰기 과정을 마친 소감을 10자 이상 솔직하게 적어주세요.');
      return;
    }

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 }
    });

    onSubmitReflection(reflection);
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#059669', marginBottom: 10 }}>
          <Heart size={26} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>7단계: 글쓰기 여정 완성 & 성찰하기</h2>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
          초안 작성부터 고쳐쓰기까지 멋진 글쓰기 과정을 해냈습니다! 이번 글쓰기를 통해 내가 성장했다고 느낀 점이나 느낀 소감을 기록해 보세요.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={16} /> 내가 완성한 최종 글
          </h4>
          <p style={{ fontSize: '0.92rem', color: '#1e293b', whiteSpace: 'pre-wrap', maxHeight: 180, overflowY: 'auto' }}>
            {finalContent}
          </p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'block', marginBottom: 8 }}>
            💭 이번 글쓰기를 마치며 (성찰글)
          </label>
          <textarea
            className="textarea-field"
            placeholder="예: 처음에는 13문장을 채우는 것이 힘들 줄 알았는데, 피드백을 받고 고쳐 쓰면서 제 생각이 훨씬 명확해진 것을 느껴서 뿌듯했습니다!"
            style={{ minHeight: 160 }}
            value={reflection}
            onChange={e => setReflection(e.target.value)}
          />
        </div>

        {errorMsg && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 8, fontSize: '0.85rem', marginBottom: 14, fontWeight: 700 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-outline" onClick={onCancel}>← 돌아가기</button>
          <button className="btn btn-success" onClick={handleSubmit}>
            <CheckCircle2 size={18} /> 최종 성찰 완료 및 글쓰기 마침 (+10톡/XP)
          </button>
        </div>
      </div>
    </div>
  );
};
