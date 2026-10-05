import React, { useState } from 'react';
import { Student, RewardConfig } from '../../types';
import { StorageService } from '../../services/storage';
import { Coins, Settings, Award, PlusCircle, MinusCircle, X, Check } from 'lucide-react';

interface RewardConfigModalProps {
  students: Student[];
  onClose: () => void;
  onRefresh: () => void;
}

export const RewardConfigModal: React.FC<RewardConfigModalProps> = ({
  students,
  onClose,
  onRefresh
}) => {
  const [config, setConfig] = useState<RewardConfig>(StorageService.getRewardConfig());
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [adjustTok, setAdjustTok] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('글쓰기 모범 태도 보상');
  const [toastMsg, setToastMsg] = useState<string>('');

  const handleSaveConfig = () => {
    StorageService.saveRewardConfig(config);
    setToastMsg('보상 수치 설정이 저장되었습니다.');
    onRefresh();
    setTimeout(() => setToastMsg(''), 2000);
  };

  const handleManualAdjust = (isAdd: boolean) => {
    const amount = isAdd ? adjustTok : -adjustTok;
    const success = StorageService.adjustStudentReward(
      selectedStudentId,
      amount,
      amount, // XP동일
      adjustReason
    );

    if (success) {
      const student = students.find(s => s.id === selectedStudentId);
      setToastMsg(`✅ ${student?.name} 학생에게 ${amount > 0 ? `+${amount}` : amount}톡/XP 지급/차감 완료!`);
      onRefresh();
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 720, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: 8, borderRadius: 10 }}>
              <Coins size={22} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>보상 수치 및 수동 화폐 설정</h2>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ height: 36, minHeight: 36, padding: '0 10px' }}>
            <X size={18} />
          </button>
        </div>

        {/* 1. Stage Reward Customization */}
        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#334155', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Settings size={16} /> 활동 단계별 기본 보상 수치 설정 (톡 & XP 1:1)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>초안 완성</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={config.draftReward.tok}
                onChange={e => setConfig({ ...config, draftReward: { tok: Number(e.target.value), xp: Number(e.target.value) } })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>자기 점검</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={config.selfCheckReward.tok}
                onChange={e => setConfig({ ...config, selfCheckReward: { tok: Number(e.target.value), xp: Number(e.target.value) } })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>고쳐쓰기</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={config.revisedReward.tok}
                onChange={e => setConfig({ ...config, revisedReward: { tok: Number(e.target.value), xp: Number(e.target.value) } })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>최종 제출</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={config.finalReward.tok}
                onChange={e => setConfig({ ...config, finalReward: { tok: Number(e.target.value), xp: Number(e.target.value) } })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>성찰 완료</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={config.reflectionReward.tok}
                onChange={e => setConfig({ ...config, reflectionReward: { tok: Number(e.target.value), xp: Number(e.target.value) } })}
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, padding: '8px 16px', fontSize: '0.85rem', height: 38, minHeight: 38 }} onClick={handleSaveConfig}>
            <Check size={16} /> 설정 수치 저장
          </button>
        </div>

        {/* 2. Manual Reward Adjust */}
        <div style={{ background: '#f5f3ff', padding: 18, borderRadius: 14, marginBottom: 20, border: '1px solid #ddd6fe' }}>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#5b21b6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} /> 개별 학생 수동 화폐('톡'/XP) 지급 및 차감
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.5fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>학생 선택</label>
              <select
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.studentNumber}번 {s.name} (보유: {s.currentTok}톡)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>수량 ('톡'/XP)</label>
              <input
                type="number"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={adjustTok}
                onChange={e => setAdjustTok(Number(e.target.value))}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>지급/차감 사유</label>
              <input
                type="text"
                className="input-field"
                style={{ padding: '8px 10px', fontSize: '0.9rem' }}
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" style={{ height: 38, minHeight: 38, padding: '0 16px', fontSize: '0.85rem' }} onClick={() => handleManualAdjust(true)}>
              <PlusCircle size={16} /> +{adjustTok}톡 지급하기
            </button>
            <button className="btn btn-outline" style={{ height: 38, minHeight: 38, padding: '0 16px', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fecaca' }} onClick={() => handleManualAdjust(false)}>
              <MinusCircle size={16} /> -{adjustTok}톡 차감하기
            </button>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: '#d1fae5', color: '#065f46', padding: 10, borderRadius: 10, marginBottom: 14, fontWeight: 700, fontSize: '0.88rem' }}>
            {toastMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};
