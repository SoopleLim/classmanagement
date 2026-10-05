import React from 'react';
import { StorageService } from '../../services/storage';
import { Download, RefreshCw, AlertTriangle, X } from 'lucide-react';

interface DataBackupModalProps {
  onClose: () => void;
  onRefresh: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({ onClose, onRefresh }) => {
  const handleExport = () => {
    const jsonStr = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing_app_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('정말로 학기 데이터를 초기화하시겠습니까? 모든 글과 보상 기록이 백업 시점 상태로 초기화됩니다.')) {
      StorageService.resetAllData();
      onRefresh();
      alert('학기 데이터가 초기화되었습니다.');
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 540, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#dbeafe', color: '#1e40af', padding: 8, borderRadius: 10 }}>
              <Download size={22} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>학기 데이터 백업 및 관리</h2>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ height: 36, minHeight: 36, padding: '0 10px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
            📥 학기 데이터 JSON 백업 파일 다운로드
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 12 }}>
            학생들의 모든 글(초안, 수정본, 성찰), 보상 이력, 상점 거래 이력을 안전하게 컴퓨터에 저장합니다.
          </p>
          <button className="btn btn-primary" style={{ height: 40, minHeight: 40 }} onClick={handleExport}>
            <Download size={18} /> 백업 파일 (.json) 다운로드
          </button>
        </div>

        <div style={{ background: '#fef2f2', padding: 18, borderRadius: 14, marginBottom: 20, border: '1px solid #fecaca' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#991b1b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={18} color="#dc2626" /> 학기 데이터 초기화
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: 12 }}>
            새 학기를 맞이하거나 샘플 데이터를 리셋할 때 사용합니다. (다운로드 백업 후 진행하세요)
          </p>
          <button className="btn btn-outline" style={{ height: 40, minHeight: 40, color: '#dc2626', borderColor: '#fecaca' }} onClick={handleReset}>
            <RefreshCw size={18} /> 학기 데이터 전체 초기화
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};
