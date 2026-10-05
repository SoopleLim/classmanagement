import React, { useState } from 'react';
import { Student, ShopItem, CouponPurchase } from '../../types';
import { StorageService } from '../../services/storage';
import { ShoppingBag, Plus, Trash2, CheckCircle2, Ticket, X } from 'lucide-react';

interface ShopManagerModalProps {
  students: Student[];
  onClose: () => void;
  onRefresh: () => void;
}

export const ShopManagerModal: React.FC<ShopManagerModalProps> = ({
  students,
  onClose,
  onRefresh
}) => {
  const [items, setItems] = useState<ShopItem[]>(StorageService.getShopItems());
  const [coupons, setCoupons] = useState<CouponPurchase[]>(StorageService.getCoupons());
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'COUPONS'>('ITEMS');

  // New Item form
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState(50);
  const [icon, setIcon] = useState('🎁');
  const [stock, setStock] = useState(5);

  const handleAddItem = () => {
    if (!title.trim()) return;
    const newItem: ShopItem = {
      id: `item-${Date.now()}`,
      title,
      description: desc,
      priceTok: price,
      icon,
      stock,
      isActive: true
    };
    const updated = [...items, newItem];
    setItems(updated);
    StorageService.saveShopItems(updated);
    setTitle('');
    setDesc('');
    onRefresh();
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    StorageService.saveShopItems(updated);
    onRefresh();
  };

  const handleUseCoupon = (couponId: string) => {
    StorageService.useCoupon(couponId);
    setCoupons(StorageService.getCoupons());
    onRefresh();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 840, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#e0e7ff', color: '#4338ca', padding: 8, borderRadius: 10 }}>
              <ShoppingBag size={22} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>학급 상점 및 학생 쿠폰 관리</h2>
          </div>
          <button className="btn btn-outline" onClick={onClose} style={{ height: 36, minHeight: 36, padding: '0 10px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            onClick={() => setActiveTab('ITEMS')}
            className="btn"
            style={{
              height: 38,
              minHeight: 38,
              fontSize: '0.85rem',
              background: activeTab === 'ITEMS' ? '#4f46e5' : '#ffffff',
              color: activeTab === 'ITEMS' ? '#ffffff' : '#475569',
              border: activeTab === 'ITEMS' ? 'none' : '1px solid #cbd5e1'
            }}
          >
            <ShoppingBag size={16} /> 상점 상품 등록/관리 ({items.length}개)
          </button>
          <button
            onClick={() => setActiveTab('COUPONS')}
            className="btn"
            style={{
              height: 38,
              minHeight: 38,
              fontSize: '0.85rem',
              background: activeTab === 'COUPONS' ? '#4f46e5' : '#ffffff',
              color: activeTab === 'COUPONS' ? '#ffffff' : '#475569',
              border: activeTab === 'COUPONS' ? 'none' : '1px solid #cbd5e1'
            }}
          >
            <Ticket size={16} /> 학생 쿠폰 사용 승인 요청 ({coupons.filter(c => c.status === 'UNUSED').length}건 미사용)
          </button>
        </div>

        {activeTab === 'ITEMS' && (
          <div>
            {/* Add Item Form */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, marginBottom: 20, border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', marginBottom: 10 }}>
                ➕ 새 상품 등록
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1.5fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input type="text" className="input-field" placeholder="아이콘" value={icon} onChange={e => setIcon(e.target.value)} />
                <input type="text" className="input-field" placeholder="상품명" value={title} onChange={e => setTitle(e.target.value)} />
                <input type="text" className="input-field" placeholder="설명" value={desc} onChange={e => setDesc(e.target.value)} />
                <input type="number" className="input-field" placeholder="가격(톡)" value={price} onChange={e => setPrice(Number(e.target.value))} />
                <input type="number" className="input-field" placeholder="재고" value={stock} onChange={e => setStock(Number(e.target.value))} />
              </div>
              <button className="btn btn-primary" style={{ height: 36, minHeight: 36, padding: '0 14px', fontSize: '0.82rem' }} onClick={handleAddItem}>
                <Plus size={16} /> 상품 등록하기
              </button>
            </div>

            {/* Item List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, maxHeight: 300, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{item.icon} {item.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>가격: {item.priceTok}톡 / 재고: {item.stock}개</div>
                  </div>
                  <button className="btn btn-outline" style={{ minHeight: 30, height: 30, padding: '0 8px', color: '#dc2626' }} onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'COUPONS' && (
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {coupons.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>구매된 쿠폰 내역이 없습니다.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {coupons.map(cpn => {
                  const student = students.find(s => s.id === cpn.studentId);
                  const isUsed = cpn.status === 'USED';
                  return (
                    <div key={cpn.id} style={{
                      background: isUsed ? '#f1f5f9' : '#ecfdf5',
                      border: `1px solid ${isUsed ? '#cbd5e1' : '#a7f3d0'}`,
                      padding: '12px 16px',
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                          👤 {student ? `${student.studentNumber}번 ${student.name}` : '학생'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#047857', marginLeft: 10 }}>
                          {cpn.itemIcon} {cpn.itemTitle} ({cpn.priceTok}톡)
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          구매 시각: {new Date(cpn.purchasedAt).toLocaleString()}
                        </div>
                      </div>

                      {!isUsed ? (
                        <button className="btn btn-success" style={{ height: 36, minHeight: 36, padding: '0 12px', fontSize: '0.82rem' }} onClick={() => handleUseCoupon(cpn.id)}>
                          <CheckCircle2 size={16} /> [사용 완료] 처리하기
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                          ✅ 사용 완료됨 ({new Date(cpn.usedAt || '').toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button className="btn btn-outline" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};
