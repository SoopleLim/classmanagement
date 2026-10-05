import React, { useState } from 'react';
import { Student } from '../types';
import { User, Lock, CheckCircle2 } from 'lucide-react';

interface StudentSelectModalProps {
  students: Student[];
  currentStudent?: Student;
  onSelectStudent: (student: Student) => void;
  onClose: () => void;
}

export const StudentSelectModal: React.FC<StudentSelectModalProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onClose
}) => {
  const [selectedId, setSelectedId] = useState<string>(currentStudent?.id || students[0]?.id || '');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const targetStudent = students.find(s => s.id === selectedId);

  const handleConfirm = () => {
    if (!targetStudent) return;
    // PIN 검증 (기본 1001, 1002... 또는 비밀번호 비워져있으면 바로 로그인)
    if (targetStudent.pinCode && pinInput !== targetStudent.pinCode) {
      setErrorMsg(`비밀번호가 올바르지 않습니다. (기본 PIN: ${targetStudent.pinCode})`);
      return;
    }
    onSelectStudent(targetStudent);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 560, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#eeeffe', padding: 10, borderRadius: 12, color: '#4f46e5' }}>
            <User size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>학생 계정 선택</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>내 이름과 번호를 선택하여 글쓰기 공간에 진입하세요.</p>
          </div>
        </div>

        {/* 25명 학생 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: 10,
          maxHeight: 280,
          overflowY: 'auto',
          padding: 4,
          marginBottom: 20
        }}>
          {students.map(s => {
            const isSelected = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  setPinInput('');
                  setErrorMsg('');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 6px',
                  borderRadius: 12,
                  border: isSelected ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  background: isSelected ? '#eeeffe' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: isSelected ? '#4f46e5' : '#475569',
                  marginBottom: 6
                }}>
                  {s.studentNumber}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#4f46e5' : '#1e293b' }}>
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN Entry */}
        {targetStudent && (
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Lock size={16} color="#64748b" />
              {targetStudent.name} 학생 4자리 비밀번호 (PIN)
            </label>
            <input
              type="password"
              className="input-field"
              placeholder={`비밀번호 입력 (기본: ${targetStudent.pinCode})`}
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            />
            {errorMsg && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 6, fontWeight: 600 }}>
                {errorMsg}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            <CheckCircle2 size={18} /> 접속하기
          </button>
        </div>
      </div>
    </div>
  );
};
