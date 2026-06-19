import React, { useState } from 'react';
import { useAppContext } from '../store';
import { ShopItem, Boss } from '../types';
import { 
  Sword, Shield, Heart, Zap, Star, Sparkles, FlaskConical, Crown, Target, Wand, Gem, Trophy, Flame, Anchor, Axe, Crosshair,
  Plus, Edit2, Trash2, Check, X, ShieldAlert, Award, ArrowLeft, ArrowRight
} from 'lucide-react';

const compressImage = (base64Str: string, maxWidth = 160, maxHeight = 160): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export function GameDeveloperPanel() {
  const { shopItems, bosses, updateGameData, role } = useAppContext();

  // Selected sub-tab
  const [editorTab, setEditorTab] = useState<'items' | 'maps'>('items');

  // Working States - Items
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ShopItem>>({
    name: '',
    description: '',
    price: 50,
    damage: 10,
    icon: 'Sword',
    color: 'bg-indigo-500'
  });

  // Working States - Maps/Bosses
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null);
  const [isAddingBoss, setIsAddingBoss] = useState(false);
  const [newBoss, setNewBoss] = useState<Partial<Boss>>({
    id: '',
    name: '',
    maxHp: 1000,
    image: '👾'
  });

  const availableIcons = ['Sword', 'Shield', 'Heart', 'Zap', 'Star', 'Sparkles', 'FlaskConical', 'Crown', 'Target', 'Wand', 'Gem', 'Trophy', 'Flame', 'Anchor', 'Gem', 'Axe', 'Crosshair'];
  const availableColors = [
    { class: 'bg-amber-500', label: 'Cam Amber' },
    { class: 'bg-red-500', label: 'Đỏ Ruby' },
    { class: 'bg-purple-500', label: 'Tím Thạch Anh' },
    { class: 'bg-indigo-500', label: 'Xanh Indigo' },
    { class: 'bg-rose-500', label: 'Hồng Rose' },
    { class: 'bg-cyan-500', label: 'Xanh Cyan' },
    { class: 'bg-emerald-500', label: 'Xanh Ngọc Lục Bảo' },
    { class: 'bg-slate-400', label: 'Xám Sắt' }
  ];

  const emojis = ['👾', '🐉', '🐛', '🧙‍♂️', '👹', '☠️', '🤖', '🦖', '🦁', '🦉'];

  // Actions for Items
  const handleSaveItem = async (updatedItem: ShopItem) => {
    const updated = shopItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    await updateGameData(updated, bosses);
    setEditingItem(null);
  };

  const handleAddItem = async () => {
    if (!newItem.name) {
      alert('Vui lòng điền Tên sản phẩm!');
      return;
    }
    const itemToAdd: ShopItem = {
      id: `item_${Date.now()}`,
      name: newItem.name,
      description: newItem.description || '',
      price: Number(newItem.price) || 0,
      damage: Number(newItem.damage) || 0,
      icon: newItem.icon || 'Sword',
      color: newItem.color || 'bg-indigo-500'
    };

    const updated = [...shopItems, itemToAdd];
    await updateGameData(updated, bosses);
    setIsAddingItem(false);
    // Add item success notification or soft reset
    setNewItem({
      name: '',
      description: '',
      price: 50,
      damage: 10,
      icon: 'Sword',
      color: 'bg-indigo-500'
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vật phẩm này khỏi cửa hàng không?')) return;
    const updated = shopItems.filter(item => item.id !== itemId);
    await updateGameData(updated, bosses);
  };

  // Actions for Maps/Bosses
  const handleSaveBoss = async (updatedBoss: Boss) => {
    const updated = bosses.map(boss => boss.id === updatedBoss.id ? updatedBoss : boss);
    try {
      await updateGameData(shopItems, updated);
      setEditingBoss(null);
      alert('Cập nhật thông tin Boss thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu Boss: Dung lượng ảnh có thể quá lớn (giới hạn Firestore). Hãy dùng ảnh khác nhỏ hơn hoặc dán Link ảnh trực tuyến!');
    }
  };

  const handleAddBoss = async () => {
    if (!newBoss.name) {
      alert('Vui lòng điền tên Boss!');
      return;
    }
    const bossToAdd: Boss = {
      id: `boss_${Date.now()}`,
      name: newBoss.name,
      maxHp: Number(newBoss.maxHp) || 1000,
      image: newBoss.image || '👾',
      level: 1,
      rewardStr: '100 EXP',
      bgColor: 'bg-slate-900',
    };

    const updated = [...bosses, bossToAdd];
    try {
      await updateGameData(shopItems, updated);
      setIsAddingBoss(false);
      setNewBoss({
        name: '',
        maxHp: 1000,
        image: '👾'
      });
      alert('Thêm Boss mới thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi Thêm Boss: Dung lượng ảnh tự chọn bị quá tải (Vượt mức Firestore). Bạn có thể đổi sang dán Link ảnh trực tuyến hoặc ảnh nhỏ hơn!');
    }
  };

  const handleDeleteBoss = async (bossId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Boss (Map đấu) này không? Học sinh sẽ không chơi được bản đồ này nữa.')) return;
    const updated = bosses.filter(b => b.id !== bossId);
    try {
      await updateGameData(shopItems, updated);
      alert('Đã xóa Boss thành công!');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi Xóa Boss: Không thể xóa (Hãy liên hệ quản trị viên)!');
    }
  };

  const handleMoveBoss = async (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= bosses.length) return;
    const updated = [...bosses];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    await updateGameData(shopItems, updated);
  };

  const renderIconComponent = (iconName: string, size = 18) => {
    if (iconName && iconName.startsWith('data:')) {
      return <img src={iconName} alt="icon" style={{ width: size, height: size }} className="object-contain" />;
    }
    switch (iconName) {
      case 'Sword': return <Sword size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Sparkles': return <Sparkles size={size} />;
      case 'FlaskConical': return <FlaskConical size={size} />;
      case 'Crown': return <Crown size={size} />;
      case 'Target': return <Target size={size} />;
      case 'Wand': return <Wand size={size} />;
      case 'Gem': return <Gem size={size} />;
      case 'Trophy': return <Trophy size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Anchor': return <Anchor size={size} />;
      case 'Axe': return <Axe size={size} />;
      case 'Crosshair': return <Crosshair size={size} />;
      default: return <Sword size={size} />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 p-4 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-dashed border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Award className="text-amber-500 animate-bounce" size={24} />
            <span>Phòng Nghiên Cứu & Phát Triển Trò Chơi</span>
            <span className="text-[10px] bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-2.5 py-0.5 rounded-full border border-red-200/50">
              GAME DEV PORTAL
            </span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Thiết kế vật phẩm chiến đấu và xây dựng boss quái vật cho học sinh rèn lập trình mở khóa.
          </p>
        </div>

        {/* Tab Selector buttons */}
        <div className="flex bg-slate-200/60 dark:bg-slate-800 p-1 rounded-2xl border border-gray-200/20 shadow-inner">
          <button 
            onClick={() => setEditorTab('items')} 
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${editorTab === 'items' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Quản Lý Vật Phẩm (Shop)
          </button>
          <button 
            onClick={() => setEditorTab('maps')} 
            className={`px-4 py-2 text-xs font-bold rounded-xl transition ${editorTab === 'maps' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
          >
            Quản Lý Map / Cột Mốc Boss
          </button>
        </div>
      </div>

      {/* SECTION A: SHOP ITEMS */}
      {editorTab === 'items' && (
        <div className="space-y-6">
          {/* Action trigger */}
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span>Danh Sách Vật Phẩm Cửa Hàng</span>
              <span className="text-xs font-medium text-slate-400">({shopItems.length} món đồ)</span>
            </h3>

            {!isAddingItem && (
              <button 
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-1 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs hover:scale-103 active:scale-97 transition"
              >
                <Plus size={14} />
                <span>Thêm vật phẩm mới</span>
              </button>
            )}
          </div>

          {/* Create modal/form */}
          {isAddingItem && (
            <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-md space-y-4 animate-in slide-in-from-top-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">Chế Tạo Vật Phẩm Mới</span>
                <button onClick={() => setIsAddingItem(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Tên Vũ Khí / Giáp / Potion</label>
                  <input 
                    type="text" 
                    value={newItem.name} 
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Thần Kiếm Python"
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Hình tượng (Icon hoặc Ảnh tải lên)</label>
                  <div className="flex gap-2">
                    <select 
                      value={availableIcons.includes(newItem.icon || '') ? newItem.icon : 'custom'} 
                      onChange={e => {
                        if (e.target.value !== 'custom') {
                          setNewItem(prev => ({ ...prev, icon: e.target.value }));
                        }
                      }}
                      className="flex-1 text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                    >
                      {availableIcons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      <option value="custom">Ảnh Custom (Tải lên)</option>
                    </select>
                    <input 
                      type="file" 
                      accept="image/*"
                      className="w-[110px] text-[10px] border rounded-xl pl-2"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewItem(prev => ({ ...prev, icon: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {newItem.icon && newItem.icon.startsWith('data:') && (
                    <img src={newItem.icon} alt="icon preview" className="mt-2 h-8 w-8 object-contain rounded bg-slate-100 dark:bg-slate-800 p-0.5 border shadow-sm" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Giá bán (Coins)</label>
                  <input 
                    type="number" 
                    value={newItem.price} 
                    onChange={e => setNewItem(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Kiếm sát thương (Damage)</label>
                  <input 
                    type="number" 
                    value={newItem.damage} 
                    onChange={e => setNewItem(prev => ({ ...prev, damage: Number(e.target.value) }))}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Màu nền khung đồ</label>
                  <select 
                    value={newItem.color} 
                    onChange={e => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  >
                    {availableColors.map(c => <option key={c.class} value={c.class}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">Mô tả sức mạnh & Hướng dẫn sử dụng</label>
                <textarea 
                  rows={2}
                  value={newItem.description} 
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Gây nổ lan sát thương 200 đơn vị máu, giảm thiểu hồi quái..."
                  className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  onClick={() => setIsAddingItem(false)} 
                  className="px-4 py-2 border text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAddItem} 
                  className="px-4 py-2 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>Sáng Tạo Món Đồ</span>
                </button>
              </div>
            </div>
          )}

          {/* Cards catalog list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.map(item => {
              const isEditing = editingItem?.id === item.id;
              
              return (
                <div 
                  key={item.id}
                  className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative group overflow-hidden"
                >
                  {/* Decorative glow background */}
                  <div className={`absolute -right-12 -top-12 w-24 h-24 rounded-full opacity-10 shrink-0 ${item.color}`}></div>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="border-b pb-2 flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                        <span className="font-extrabold text-blue-600 text-xs text-left">Chỉnh Sửa Vật Phẩm</span>
                        <span className="font-mono text-[9px] text-slate-400">{item.id}</span>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400">Tên vật phẩm</label>
                        <input 
                          type="text" 
                          value={editingItem.name} 
                          onChange={e => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full text-xs font-bold px-2 py-1 pr-1 border rounded dark:bg-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-400">Giá bán (Coin)</label>
                          <input 
                            type="number" 
                            value={editingItem.price} 
                            onChange={e => setEditingItem(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                            className="w-full text-xs font-mono font-bold px-2 py-1 border rounded dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400">Sát thương (HP)</label>
                          <input 
                            type="number" 
                            value={editingItem.damage} 
                            onChange={e => setEditingItem(prev => prev ? { ...prev, damage: Number(e.target.value) } : null)}
                            className="w-full text-xs font-mono font-bold px-2 py-1 border rounded dark:bg-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400">Mẫu mã biểu diễn (Icon & Nền)</label>
                        <div className="flex divide-x border rounded overflow-hidden">
                          <select 
                            value={availableIcons.includes(editingItem.icon || '') ? editingItem.icon : 'custom'} 
                            onChange={e => {
                              if (e.target.value !== 'custom') {
                                setEditingItem(prev => prev ? { ...prev, icon: e.target.value } : null)
                              }
                            }}
                            className="w-1/3 text-[10px] font-bold px-1 py-1 border-0 outline-none dark:bg-slate-800"
                          >
                            {availableIcons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                            <option value="custom">Ảnh Custom</option>
                          </select>
                          <input 
                            type="file" 
                            accept="image/*"
                            title="Tải ảnh"
                            className="w-1/3 text-[9px] py-1 pl-1"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setEditingItem(prev => prev ? { ...prev, icon: reader.result as string } : null);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <select 
                            value={editingItem.color} 
                            onChange={e => setEditingItem(prev => prev ? { ...prev, color: e.target.value } : null)}
                            className="w-1/3 text-[10px] font-bold px-1 py-1 border-0 outline-none dark:bg-slate-800"
                          >
                            {availableColors.map(c => <option key={c.class} value={c.class}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-gray-400 font-sans">Chi tiết năng lực</label>
                        <textarea 
                          rows={2}
                          value={editingItem.description} 
                          onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                          className="w-full text-[11px] font-medium px-2 py-1 border rounded dark:bg-slate-800"
                        />
                      </div>

                      <div className="flex justify-end gap-1.5 border-t pt-2">
                        <button 
                          onClick={() => setEditingItem(null)} 
                          className="px-2 py-1 text-[10px] font-bold border rounded-lg text-slate-500"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSaveItem(editingItem)} 
                          className="px-2 py-1 text-[10px] font-black bg-blue-600 rounded-lg text-white"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-2xl text-white shadow-xs shrink-0 ${item.color}`}>
                          {renderIconComponent(item.icon, 20)}
                        </div>
                        <div className="text-left">
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-gray-100">{item.name}</h4>
                          <span className="text-[9px] font-mono font-medium opacity-50 px-1 bg-slate-100 dark:bg-slate-800 rounded uppercase">ID: {item.id}</span>
                          <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="border-t border-dashed pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-left">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Giá bán</span>
                            <span className="font-black text-rose-500 text-xs">{item.price} Coins</span>
                          </div>

                          {item.damage > 0 && (
                            <div className="text-left border-l pl-3">
                              <span className="block text-[9px] text-slate-400 font-bold uppercase">Công lực</span>
                              <span className="font-black text-blue-500 text-xs">+{item.damage} HP</span>
                            </div>
                          )}
                        </div>

                        {/* Card controls */}
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500 rounded-xl"
                            title="Sửa vật phẩm"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 rounded-xl"
                            title="Xóa vật phẩm"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION B: MAPS AND BOSS FIGHT CHALLENGES */}
      {editorTab === 'maps' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              <span>Bản Đồ Cốt Truyện / Vùng Đất Thủ Lĩnh</span>
              <span className="text-xs font-medium text-slate-400">({bosses.length} Bản đồ Boss)</span>
            </h3>

            {!isAddingBoss && (
              <button 
                onClick={() => setIsAddingBoss(true)}
                className="flex items-center gap-1 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-xs hover:scale-103 active:scale-97 transition"
              >
                <Plus size={14} />
                <span>Xây dựng Map / Thêm Boss</span>
              </button>
            )}
          </div>

          {/* Add boss modal/form */}
          {isAddingBoss && (
            <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-md space-y-4 animate-in slide-in-from-top-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm">Xây Dựng Cửa Đấu Boss Mới</span>
                <button onClick={() => setIsAddingBoss(false)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Tên Trùm / Thủ lĩnh</label>
                  <input 
                    type="text" 
                    value={newBoss.name} 
                    onChange={e => setNewBoss(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Khủng Long Bug Lửa"
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Chỉ số máu tối đa (Max HP)</label>
                  <input 
                    type="number" 
                    value={newBoss.maxHp} 
                    onChange={e => setNewBoss(prev => ({ ...prev, maxHp: Number(e.target.value) }))}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-xl dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">Chân dung (Mascot / Emoji / Ảnh Tải Lên / URL)</label>
                  <div className="flex gap-2">
                    <select 
                      value={emojis.includes(newBoss.image || '') ? newBoss.image : 'custom'} 
                      onChange={e => {
                        if (e.target.value !== 'custom') {
                          setNewBoss(prev => ({ ...prev, image: e.target.value }))
                        }
                      }}
                      className="flex-1 text-xs font-bold px-2 py-2 border rounded-xl dark:bg-slate-800"
                    >
                      {emojis.map(emoji => <option key={emoji} value={emoji}>{emoji} - Avatar</option>)}
                      <option value="custom">Ảnh Custom (Tải lên / Link URL)</option>
                    </select>
                    <input 
                      type="file" 
                      accept="image/*"
                      title="Chọn ảnh"
                      className="w-[110px] text-[10px] border rounded-xl pl-1 text-slate-500"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const raw = reader.result as string;
                            const compressed = await compressImage(raw);
                            setNewBoss(prev => ({ ...prev, image: compressed }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  {/* Inline link input as secondary option */}
                  <div className="mt-2 text-left">
                    <span className="text-[9px] text-gray-400 font-bold block mb-1">Hoặc dán địa chỉ ảnh trực tuyến (URL web):</span>
                    <input 
                      type="text" 
                      placeholder="Ví dụ: https://picsum.photos/200"
                      value={newBoss.image && !newBoss.image.startsWith('data:') && !emojis.includes(newBoss.image) ? newBoss.image : ''}
                      onChange={e => setNewBoss(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full text-[10px] font-mono px-3 py-1.5 border rounded-lg dark:bg-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  {newBoss.image && (newBoss.image.startsWith('data:') || newBoss.image.startsWith('http')) && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={newBoss.image} alt="boss avatar" className="h-10 w-10 object-cover rounded shadow-sm border bg-slate-100" />
                      <span className="text-[9px] text-emerald-600 font-bold">✓ Đã áp dụng ảnh tự chọn {newBoss.image.startsWith('data:') ? '(đang nén nhẹ)' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button 
                  onClick={() => setIsAddingBoss(false)} 
                  className="px-4 py-2 border text-xs font-bold rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleAddBoss} 
                  className="px-4 py-2 text-xs font-black bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>Khai Sáng Bản Đồ Đấu</span>
                </button>
              </div>
            </div>
          )}

          {/* Catalog grid list - Maps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bosses.map((boss, idx) => {
              const isEditing = editingBoss?.id === boss.id;

              return (
                <div 
                  key={boss.id}
                  className="bg-white dark:bg-slate-850 p-5 rounded-3xl border border-slate-150 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:scale-[1.02] duration-300 transition-all text-center relative overflow-hidden group"
                >
                  {/* Decorative badge with levels order based on index */}
                  <span className="absolute top-4 left-4 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 px-2 py-0.5 rounded-full shadow-inner">
                    MAP CẤP {idx + 1}
                  </span>

                  {isEditing ? (
                    <div className="space-y-4 pt-6 text-left">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400">Tên Trùm Trận</label>
                        <input 
                          type="text" 
                          value={editingBoss.name} 
                          onChange={e => setEditingBoss(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full text-xs font-bold px-2 py-1 border rounded dark:bg-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-400">Máu Max HP</label>
                          <input 
                            type="number" 
                            value={editingBoss.maxHp} 
                            onChange={e => setEditingBoss(prev => prev ? { ...prev, maxHp: Number(e.target.value) } : null)}
                            className="w-full text-xs font-mono font-bold px-2 py-1 border rounded dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 font-sans">Avatar (Emoji/File/Link)</label>
                          <div className="flex gap-1 overflow-hidden border rounded dark:border-slate-700">
                            <select 
                              value={emojis.includes(editingBoss.image || '') ? editingBoss.image : 'custom'} 
                              onChange={e => {
                                if (e.target.value !== 'custom') {
                                  setEditingBoss(prev => prev ? { ...prev, image: e.target.value } : null)
                                }
                              }}
                              className="flex-1 text-xs px-1 py-1 border-0 outline-none w-16 dark:bg-slate-800"
                            >
                              {emojis.map(emoji => <option key={emoji} value={emoji}>{emoji}</option>)}
                              <option value="custom">Custom...</option>
                            </select>
                            <input 
                              type="file" 
                              accept="image/*"
                              title="Tải ảnh"
                              className="w-16 text-[8px] py-1 pl-1"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    const raw = reader.result as string;
                                    const compressed = await compressImage(raw);
                                    setEditingBoss(prev => prev ? { ...prev, image: compressed } : null);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </div>
                          {/* URL input field for edit */}
                          <div className="mt-1">
                            <input 
                              type="text" 
                              placeholder="Dán URL link..."
                              value={editingBoss.image && !editingBoss.image.startsWith('data:') && !emojis.includes(editingBoss.image) ? editingBoss.image : ''}
                              onChange={e => setEditingBoss(prev => prev ? { ...prev, image: e.target.value } : null)}
                              className="w-full text-[8px] font-mono px-1.5 py-0.5 border rounded dark:bg-slate-800"
                              title="Dán link ảnh trực tuyến"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 border-t pt-2">
                        <button 
                          onClick={() => setEditingBoss(null)} 
                          className="px-2 py-1 text-[10px] font-bold border rounded-lg text-slate-500"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSaveBoss(editingBoss)} 
                          className="px-2 py-1 text-[10px] font-black bg-blue-600 rounded-lg text-white"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-6 space-y-4 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-3xl shadow-sm border border-slate-200/40 relative group-hover:scale-110 duration-200 transition-transform select-none overflow-hidden">
                        {boss.image.startsWith('data:') || boss.image.startsWith('http') ? (
                          <img src={boss.image} alt={boss.name} className="w-full h-full object-cover" />
                        ) : (
                          boss.image
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-800 dark:text-gray-100 text-sm leading-tight">{boss.name}</h4>
                        <span className="text-[8px] font-mono opacity-50 px-1 bg-slate-100 dark:bg-slate-800 rounded uppercase">ID: {boss.id}</span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-250/20">
                        <div className="bg-red-500 h-full w-full"></div>
                      </div>

                      <div className="flex items-center justify-between w-full border-t border-dashed pt-3 text-left">
                        <div>
                          <span className="block text-[8px] text-slate-400 font-bold uppercase">MÁU TỔNG</span>
                          <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-200">{boss.maxHp.toLocaleString()} HP</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 pt-1 opacity-70 group-hover:opacity-100 transition duration-150">
                          {/* Move left */}
                          <button 
                            disabled={idx === 0}
                            onClick={() => handleMoveBoss(idx, 'left')}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg text-slate-400 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                            title="Dịch chuyển sang trái (Về cấp độ sớm hơn)"
                          >
                            <ArrowLeft size={12} />
                          </button>
                          {/* Move right */}
                          <button 
                            disabled={idx === bosses.length - 1}
                            onClick={() => handleMoveBoss(idx, 'right')}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 rounded-lg text-slate-400 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer"
                            title="Dịch chuyển sang phải (Về cấp độ muộn hơn)"
                          >
                            <ArrowRight size={12} />
                          </button>
                          
                          <button 
                            onClick={() => setEditingBoss(boss)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500 rounded-lg text-slate-400 cursor-pointer"
                            title="Sửa bản đồ"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBoss(boss.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 rounded-lg text-slate-400 cursor-pointer"
                            title="Xóa bản đồ/Boss"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
