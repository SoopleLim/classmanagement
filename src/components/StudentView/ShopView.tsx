import React, { useState } from 'react';
import { Student, ShopItem, CouponPurchase } from '../../types';
import { StorageService } from '../../services/storage';
import { ShoppingBag, Coins, Ticket, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopViewProps {
  student: Student;
  onRefreshStudent: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ student, onRefreshStudent }) => {
  const [items, setItems] = useState<ShopItem[]>(StorageService.getShopItems());
  const [coupons, setCoupons] = useState<CouponPurchase[]>(StorageService.getCoupons(student.id));
  const [activeTab, setActiveTab] = useState<'SHOP' | 'MY_COUPONS'>('SHOP');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBuy = (item: ShopItem) => {
    const result = StorageService.buyShopItem(student.id, item.id);
    if (!result.success) {
      setNotification({ type: 'error', message: result.message || '구매에 실패했습니다.' });
      return;
    }

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    setNotification({ type: 'success', message: `🎉 [${item.title}] 상품 구매 완료! '내 쿠폰함'에서 확인해 보세요.` });
    setItems(StorageService.getShopItems());
    setCoupons(StorageService.getCoupons(student.id));
    onRefreshStudent();

    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 10 }}>
            🛒 학급 보상 상점
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: 4 }}>
            열심히 작성해서 모은 학급 화폐 <strong>'톡'</strong>으로 원하는 쿠폰을 구매하세요!
          </p>
        </div>

        <div style={{ background: '#fef3c7', padding: '10px 20px', borderRadius: 16, border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Coins size={24} color="#d97706" />
          <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#b45309' }}>
            {student.currentTok} <small style={{ fontSize: '0.85rem' }}>톡 보유 중</small>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('SHOP')}
          className="btn"
          style={{
            background: activeTab === 'SHOP' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'SHOP' ? '#ffffff' : '#475569',
            border: activeTab === 'SHOP' ? 'none' : '1px solid #cbd5e1'
          }}
        >
          <ShoppingBag size={18} /> 상품 목록 구경하기
        </button>
        <button
          onClick={() => setActiveTab('MY_COUPONS')}
          className="btn"
          style={{
            background: activeTab === 'MY_COUPONS' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'MY_COUPONS' ? '#ffffff' : '#475569',
            border: activeTab === 'MY_COUPONS' ? 'none' : '1px solid #cbd5e1'
          }}
        >
          <Ticket size={18} /> 내 보유 쿠폰함 ({coupons.length}개)
        </button>
      </div>

      {notification && (
        <div style={{
          background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#065f46' : '#991b1b',
          padding: '14px 18px',
          borderRadius: 14,
          marginBottom: 20,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {notification.message}
        </div>
      )}

      {/* SHOP Items Tab */}
      {activeTab === 'SHOP' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {items.map(item => {
            const canAfford = student.currentTok >= item.priceTok;
            const isOutOfStock = item.stock <= 0;

            return (
              <div key={item.id} className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: '2.5rem' }}>{item.icon}</span>
                    <span style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: '0.85rem',
                      fontWeight: 800
                    }}>
                      💰 {item.priceTok} 톡
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: 14 }}>
                    {item.description}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                    남은 재고: {item.stock}개
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || isOutOfStock}
                    className={`btn ${canAfford && !isOutOfStock ? 'btn-primary' : 'btn-disabled'}`}
                    style={{ width: '100%', height: 44, minHeight: 44 }}
                  >
                    {!canAfford ? '톡 화폐 부족' : isOutOfStock ? '품절됨' : '구매하기'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MY COUPONS Tab */}
      {activeTab === 'MY_COUPONS' && (
        <div>
          {coupons.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <Ticket size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600 }}>아직 보유한 쿠폰이 없습니다.</p>
              <p style={{ fontSize: '0.85rem' }}>글쓰기 활동에 참여하여 모은 '톡'으로 상점에서 쿠폰을 구매해 보세요!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {coupons.map(coupon => {
                const isUsed = coupon.status === 'USED';
                return (
                  <div key={coupon.id} className="glass-card" style={{
                    padding: 20,
                    background: isUsed ? '#f1f5f9' : '#ffffff',
                    border: isUsed ? '1px dashed #cbd5e1' : '1.5px solid #6366f1'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '1.8rem' }}>{coupon.itemIcon}</span>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        background: isUsed ? '#e2e8f0' : '#d1fae5',
                        color: isUsed ? '#64748b' : '#047857'
                      }}>
                        {isUsed ? '사용 완료' : '🎟️ 사용 가능 (대기)'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: isUsed ? '#64748b' : '#1e293b', marginBottom: 4 }}>
                      {coupon.itemTitle}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 12 }}>
                      구매일: {new Date(coupon.purchasedAt).toLocaleDateString()}
                    </p>

                    {!isUsed && (
                      <div style={{ background: '#f8fafc', padding: 8, borderRadius: 8, fontSize: '0.8rem', color: '#475569', textAlign: 'center', fontWeight: 600 }}>
                        💡 선생님께 이 화면을 보여드리고 쿠폰을 사용하세요!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
