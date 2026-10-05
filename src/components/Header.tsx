import React from 'react';
import { Student } from '../types';
import { calculateLevel } from '../services/storage';
import { Coins, Award, UserCheck, Shield, LogOut, ShoppingBag, BookOpen } from 'lucide-react';

interface HeaderProps {
  mode: 'STUDENT' | 'TEACHER';
  currentStudent?: Student;
  onSwitchMode: (newMode: 'STUDENT' | 'TEACHER') => void;
  onOpenStudentSelect: () => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  currentStudent,
  onSwitchMode,
  onOpenStudentSelect,
  currentTab,
  onChangeTab
}) => {
  const levelInfo = currentStudent ? calculateLevel(currentStudent.currentXP) : null;
  const progressPercent = levelInfo 
    ? Math.min(100, Math.round((levelInfo.currentLevelXP / levelInfo.nextLevelXP) * 100))
    : 0;

  return (
    <header style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      color: '#ffffff',
      padding: '14px 24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* App Title & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            padding: 10,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)'
          }}>
            <BookOpen size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
              글쓰기 성장 톡톡 ✨
            </h1>
            <span style={{ fontSize: '0.78rem', opacity: 0.8, fontWeight: 500 }}>
              초등 6학년 과정 중심 지도 & 학급 경제
            </span>
          </div>
        </div>

        {/* Student Level & Tok Info */}
        {mode === 'STUDENT' && currentStudent && levelInfo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '8px 18px',
            borderRadius: 16,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            {/* Tok Counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Coins size={22} color="#f59e0b" />
              <div>
                <span style={{ fontSize: '0.72rem', opacity: 0.8, display: 'block' }}>보유 학급 화폐</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fbbf24' }}>
                  {currentStudent.currentTok} <small style={{ fontSize: '0.8rem' }}>톡</small>
                </span>
              </div>
            </div>

            <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />

            {/* Level & XP Gauge */}
            <div style={{ minWidth: 160 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={14} /> Lv.{levelInfo.level} ({levelInfo.title})
                </span>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                  {levelInfo.currentLevelXP}/{levelInfo.nextLevelXP} XP
                </span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Mode Switch & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {mode === 'STUDENT' ? (
            <>
              {/* Navigation Tabs for Student */}
              <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.25)', padding: 4, borderRadius: 12 }}>
                <button
                  onClick={() => onChangeTab('DASHBOARD')}
                  className="btn"
                  style={{
                    height: 36,
                    minHeight: 36,
                    padding: '0 14px',
                    fontSize: '0.85rem',
                    background: currentTab === 'DASHBOARD' ? '#ffffff' : 'transparent',
                    color: currentTab === 'DASHBOARD' ? '#1e1b4b' : '#ffffff',
                    borderRadius: 8
                  }}
                >
                  📝 나의 글쓰기
                </button>
                <button
                  onClick={() => onChangeTab('SHOP')}
                  className="btn"
                  style={{
                    height: 36,
                    minHeight: 36,
                    padding: '0 14px',
                    fontSize: '0.85rem',
                    background: currentTab === 'SHOP' ? '#ffffff' : 'transparent',
                    color: currentTab === 'SHOP' ? '#1e1b4b' : '#ffffff',
                    borderRadius: 8
                  }}
                >
                  🛒 학급 상점
                </button>
              </div>

              {/* Student Switcher Button */}
              <button
                onClick={onOpenStudentSelect}
                className="btn btn-outline"
                style={{
                  height: 40,
                  minHeight: 40,
                  padding: '0 14px',
                  fontSize: '0.85rem',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <UserCheck size={16} />
                {currentStudent ? `${currentStudent.studentNumber}번 ${currentStudent.name}` : '학생 선택'}
              </button>

              <button
                onClick={() => onSwitchMode('TEACHER')}
                className="btn"
                style={{
                  height: 40,
                  minHeight: 40,
                  padding: '0 14px',
                  fontSize: '0.85rem',
                  background: '#f59e0b',
                  color: '#ffffff'
                }}
              >
                <Shield size={16} /> 교사 화면
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                background: '#10b981',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Shield size={14} /> 교사 지도 모드
              </span>

              <button
                onClick={() => onSwitchMode('STUDENT')}
                className="btn btn-outline"
                style={{
                  height: 40,
                  minHeight: 40,
                  padding: '0 14px',
                  fontSize: '0.85rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <LogOut size={16} /> 학생 화면으로
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
