import React, { useState } from 'react';
import { useAppContext } from '../store';
import { audioService } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, Shield, Heart, Zap, Sparkles, Star, Coins, 
  ArrowLeft, Award, Crown, BookOpen, Download, User, 
  Users, MessageSquare, Plus, Trophy, Flag, HelpCircle, Flame, CheckCircle, RefreshCw
} from 'lucide-react';
import { Boss, ProgressState } from '../types';

interface Monster {
  id: string;
  name: string;
  maxHp: number;
  image: string;
  damage: number;
  xpReward: number;
  coinReward: number;
}

interface Land {
  id: string;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  bgGradient: string;
  isProOnly: boolean;
  monsters: Monster[];
  boss: Boss & { damage: number; xpReward: number; coinReward: number };
}

const playAttackSound = () => {
  audioService.playSwordClash();
};

const playHitSound = () => {
  audioService.playHurt();
};

export function BossBattle() {
  const { progress, setView, attackBoss, bosses, shopItems, updateProgress } = useAppContext();
  const [selectedLandIdx, setSelectedLandIdx] = useState(0);
  const [selectedEnemyId, setSelectedEnemyId] = useState<string>('boss'); // 'boss' or monster ID
  const [activeTab, setActiveTab] = useState<'adventure' | 'guild'>('adventure');
  const [attackEffect, setAttackEffect] = useState<{ id: number, damage: number, isCritical: boolean, msg: string } | null>(null);
  const [monsterDamageEffect, setMonsterDamageEffect] = useState<number | null>(null);
  
  // Guild states for simulation
  const [newGuildName, setNewGuildName] = useState('');
  const [newGuildMotto, setNewGuildMotto] = useState('');
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const [guildChats, setGuildChats] = useState<Array<{ sender: string, text: string, time: string, isPro: boolean }>>([
    { sender: 'Hùng Coder', text: 'Chào mọi người! Hôm nay có ai săn Boss Thượng Cổ không?', time: '11:20', isPro: true },
    { sender: 'Linh Vy', text: 'Hồi sáng mình vừa đốn ngã Rồng Mất Tập Trung xong, nhận được quá trời xu!', time: '11:22', isPro: true },
    { sender: 'Thầy Minh', text: 'Nhớ hoàn thành bài học Chương 5 nữa nhé mấy đứa, học đều tay mới khỏe người!', time: '11:25', isPro: false }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Define Lands of Python Adventure
  const lands: Land[] = [
    {
      id: 'land_1',
      name: 'Thung Lũng Cú Pháp',
      description: 'Nơi xuất phát của các tân thủ, tràn đầy bọ cú pháp và dơi gán biến.',
      color: 'from-emerald-400 to-green-600',
      accentColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
      bgGradient: 'bg-gradient-to-br from-emerald-50/50 to-teal-50/10 dark:from-slate-900 dark:to-emerald-950/20',
      isProOnly: false,
      monsters: [
        { id: 'm1_1', name: 'Bọ Hung Cú Pháp 🐞', maxHp: 80, image: '🐞', damage: 15, xpReward: 15, coinReward: 15 },
        { id: 'm1_2', name: 'Dơi Khai Báo Biến 🦇', maxHp: 120, image: '🦇', damage: 25, xpReward: 25, coinReward: 20 }
      ],
      boss: { id: 'boss_1', name: 'Quái Vật Lười Biếng', maxHp: 500, image: '👾', damage: 45, xpReward: 100, coinReward: 80 }
    },
    {
      id: 'land_2',
      name: 'Rừng Rậm Rẽ Nhánh',
      description: 'Hành trình vượt qua ma trận cấu trúc điều kiện rẽ nhánh If-Else.',
      color: 'from-blue-400 to-indigo-600',
      accentColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
      bgGradient: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/10 dark:from-slate-900 dark:to-indigo-950/20',
      isProOnly: false,
      monsters: [
        { id: 'm2_1', name: 'Sói Hoang Hoài Nghi 🐺', maxHp: 200, image: '🐺', damage: 35, xpReward: 40, coinReward: 35 },
        { id: 'm2_2', name: 'Trăn Ghi Nhớ Ngược 🐍', maxHp: 320, image: '🐍', damage: 50, xpReward: 60, coinReward: 50 }
      ],
      boss: { id: 'boss_2', name: 'Rồng Mất Tập Trung', maxHp: 1500, image: '🐉', damage: 90, xpReward: 300, coinReward: 250 }
    },
    {
      id: 'land_3',
      name: 'Vùng Đất Lặp Vô Tận',
      description: 'Vùng thử thách khắc khảo của vòng lặp While và For lặp đi lặp lại.',
      color: 'from-purple-400 to-pink-600',
      accentColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
      bgGradient: 'bg-gradient-to-br from-purple-50/50 to-pink-50/10 dark:from-slate-900 dark:to-pink-950/20',
      isProOnly: false,
      monsters: [
        { id: 'm3_1', name: 'Bánh Xe Lặp Vô Hạn 🎡', maxHp: 500, image: '🎡', damage: 70, xpReward: 90, coinReward: 80 },
        { id: 'm3_2', name: 'Bóng Ma Chạy Trốn 👻', maxHp: 750, image: '👻', damage: 110, xpReward: 140, coinReward: 120 }
      ],
      boss: { id: 'boss_3', name: 'Chúa Tể Bug', maxHp: 5000, image: '🐛', damage: 180, xpReward: 1000, coinReward: 600 }
    },
    {
      id: 'land_4',
      name: 'Đỉnh Núi Chương 5 Nâng Cao',
      description: 'Thánh địa kỹ thuật dành cho các Hiệp sĩ Hàm số & OOP siêu đẳng.',
      color: 'from-amber-400 to-orange-600',
      accentColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
      bgGradient: 'bg-gradient-to-br from-amber-50/50 to-orange-50/10 dark:from-slate-900 dark:to-orange-950/20',
      isProOnly: true,
      monsters: [
        { id: 'm4_1', name: 'Robot Module 🤖', maxHp: 1200, image: '🤖', damage: 180, xpReward: 300, coinReward: 200 },
        { id: 'm4_2', name: 'Phượng Hoàng Đệ Quy 🦅', maxHp: 1800, image: '🦅', damage: 260, xpReward: 500, coinReward: 350 }
      ],
      boss: { id: 'boss_pro', name: 'Trợ Lý AI Hắc Ám', maxHp: 10000, image: '🧙‍♂️', damage: 380, xpReward: 2500, coinReward: 1200 }
    }
  ];

  const dynamicLands: Land[] = bosses.map((boss, idx) => {
    const staticLand = lands.find(l => l.boss.id === boss.id) || lands[Math.min(idx, lands.length - 1)];
    return {
      ...staticLand,
      id: staticLand.boss.id === boss.id ? staticLand.id : `land_dynamic_${boss.id}`,
      name: staticLand.boss.id === boss.id ? staticLand.name : `Khu Vực: ${boss.name}`,
      boss: {
        ...staticLand.boss,
        id: boss.id,
        name: boss.name,
        maxHp: boss.maxHp,
        image: boss.image,
      }
    };
  });

  const currentLand = dynamicLands[selectedLandIdx] || dynamicLands[0];
  const isPro = progress.isPro || false;

  // Track Combat stats stored in progress, fallback if not initialized
  const playerHp = progress.playerHp ?? 500;
  const playerMaxHp = progress.playerMaxHp ?? 500;

  // Find selected target metrics
  let activeEnemyName = '';
  let activeEnemyImage = '👾';
  let activeEnemyMaxHp = 100;
  let activeEnemyHp = 100;
  let activeEnemyDmg = 10;
  let activeEnemyXp = 50;
  let activeEnemyCoins = 50;

  if (selectedEnemyId === 'boss') {
    activeEnemyName = currentLand.boss.name;
    activeEnemyImage = currentLand.boss.image;
    activeEnemyMaxHp = currentLand.boss.maxHp;
    activeEnemyHp = progress.bossHp?.[currentLand.boss.id] ?? currentLand.boss.maxHp;
    activeEnemyDmg = currentLand.boss.damage;
    activeEnemyXp = currentLand.boss.xpReward;
    activeEnemyCoins = currentLand.boss.coinReward;
  } else {
    const matchedMonster = currentLand.monsters.find(m => m.id === selectedEnemyId);
    if (matchedMonster) {
      activeEnemyName = matchedMonster.name;
      activeEnemyImage = matchedMonster.image;
      activeEnemyMaxHp = matchedMonster.maxHp;
      activeEnemyHp = progress.bossHp?.[matchedMonster.id] ?? matchedMonster.maxHp;
      activeEnemyDmg = matchedMonster.damage;
      activeEnemyXp = matchedMonster.xpReward;
      activeEnemyCoins = matchedMonster.coinReward;
    } else {
      // default
      const defaultM = currentLand.monsters[0];
      activeEnemyName = defaultM.name;
      activeEnemyImage = defaultM.image;
      activeEnemyMaxHp = defaultM.maxHp;
      activeEnemyHp = progress.bossHp?.[defaultM.id] ?? defaultM.maxHp;
      activeEnemyDmg = defaultM.damage;
      activeEnemyXp = defaultM.xpReward;
      activeEnemyCoins = defaultM.coinReward;
    }
  }

  const isEnemyDefeated = activeEnemyHp <= 0;

  // Detect equipped Armor
  let equippedArmorName = 'Chưa có giáp';
  let damageReduction = 0; // 0%
  const inventory = progress.inventory || {};

  if (inventory['armor_god'] && inventory['armor_god'] > 0) {
    equippedArmorName = 'Long Thần Hải Giáp [PRO] (Hấp thụ 80%)';
    damageReduction = 0.8;
  } else if (inventory['armor_iron'] && inventory['armor_iron'] > 0) {
    equippedArmorName = 'Giáp Thép Kiên Cố (Hấp thụ 40%)';
    damageReduction = 0.4;
  } else if (inventory['armor_cloth'] && inventory['armor_cloth'] > 0) {
    equippedArmorName = 'Giáp Vải Phổ Thông (Hấp thụ 15%)';
    damageReduction = 0.15;
  }

  // Handle active power up state
  const [isRageActive, setIsRageActive] = useState(false);

  // Toggle dynamic premium package right in the screen
  const togglePremium = () => {
    audioService.playClick();
    if (updateProgress) {
      updateProgress((prev: ProgressState) => ({
        ...prev,
        isPro: !prev.isPro
      }));
    }
  };

  // Combat Handlers
  const executeAttack = (itemId: string, itemDmg: number) => {
    if (isEnemyDefeated) return;
    if (playerHp <= 0) {
      alert("Bạn đã cạn máu! Hãy nhấp Uống Bình Máu để hồi phục sinh lực tiếp tục chiến đấu nhé!");
      return;
    }

    // Weapons are consumed per hit as defined by lms mechanics
    if (!inventory[itemId] || inventory[itemId] <= 0) return;

    // Check if weapon is PRO specific
    if (itemId === 'sword_dragon' && !isPro) {
      alert("Kiếm Thần Rồng là cổ vật thần sầu thuộc đặc quyền gói PRO! Hãy bấm nút Nâng cấp PRO phía trên để trải nghiệm món đồ khủng này!");
      return;
    }

    let finalDamage = itemDmg;
    let crit = false;
    let messageStr = "";

    // Apply Rage 2.0x boost
    if (isRageActive) {
      finalDamage = finalDamage * 2;
      crit = true;
      messageStr = "🔥 CUỒNG NỘ DOUBLE DMG! ";
      setIsRageActive(false);
    }

    // Critical Chance calculation based on Level
    const currentXp = progress.xp || 0;
    const currentLevel = Math.floor(currentXp / 100) + 1;
    const isCrit = Math.random() < 0.15 + (currentLevel * 0.01);
    if (isCrit && !crit) {
      finalDamage = Math.floor(finalDamage * 1.5);
      crit = true;
      messageStr = "⚡ SÁT THƯƠNG CHÍ CHÓC! ";
    }

    // 1. Reduce monster heath
    const targetEnemyId = selectedEnemyId === 'boss' ? currentLand.boss.id : selectedEnemyId;
    
    // Apply attack transition in state
    if (updateProgress) {
      playAttackSound();
      updateProgress((prev: ProgressState) => {
        const nextInv = { ...prev.inventory };
        nextInv[itemId] = Math.max(0, (nextInv[itemId] || 0) - 1);

        const nextBossHp = { ...prev.bossHp };
        const currentEnemyHp = nextBossHp[targetEnemyId] ?? activeEnemyMaxHp;
        const newHp = Math.max(0, currentEnemyHp - finalDamage);
        nextBossHp[targetEnemyId] = newHp;

        // Calculate boss retaliation damage to the player
        let retaliationDmg = 0;
        if (newHp > 0) {
          retaliationDmg = Math.floor(activeEnemyDmg * (1 - damageReduction));
          if (retaliationDmg < 2) retaliationDmg = 2; // minimum scratch
          if (retaliationDmg > 0) {
            setTimeout(() => playHitSound(), 300);
          }
        }

        const newPlayerHp = Math.max(0, (prev.playerHp ?? 500) - retaliationDmg);

        // If defeated, distribute reward
        let nextPoints = prev.points;
        let nextXp = prev.xp;
        if (newHp === 0 && currentEnemyHp > 0) {
          nextPoints += activeEnemyCoins;
          nextXp += activeEnemyXp;
          messageStr += `🏆 TIÊU DIỆT THÀNH CÔNG! Nhận +${activeEnemyCoins} xu & +${activeEnemyXp} EXP.`;
        }

        return {
          ...prev,
          inventory: nextInv,
          bossHp: nextBossHp,
          playerHp: newPlayerHp,
          playerMaxHp: prev.playerMaxHp ?? 500,
          points: nextPoints,
          xp: nextXp
        };
      });
    }

    // Configure effects
    const effId = Date.now();
    setAttackEffect({
      id: effId,
      damage: finalDamage,
      isCritical: crit,
      msg: messageStr || `Đã tung chiêu gây -${finalDamage} HP`
    });

    if (newHpValue(targetEnemyId) > 0) {
      const actualRetaliation = Math.floor(activeEnemyDmg * (1 - damageReduction));
      setMonsterDamageEffect(actualRetaliation);
      setTimeout(() => setMonsterDamageEffect(null), 700);
    }

    setTimeout(() => {
      setAttackEffect(prev => (prev?.id === effId ? null : prev));
    }, 1500);
  };

  const newHpValue = (id: string) => {
    return progress.bossHp?.[id] ?? 999; 
  };

  // Revive Player function
  const revivePlayer = () => {
    if (updateProgress) {
      updateProgress((prev: ProgressState) => {
        const canAfford = prev.points >= 20;
        return {
          ...prev,
          points: canAfford ? prev.points - 20 : prev.points,
          playerHp: 500
        };
      });
    }
  };

  // Use Consumables Helper
  const useConsumableItem = (itemId: string) => {
    const qty = inventory[itemId] || 0;
    if (qty <= 0) return;

    if (updateProgress) {
      updateProgress((prev: ProgressState) => {
        const nextInv = { ...prev.inventory };
        nextInv[itemId] = Math.max(0, (nextInv[itemId] || 0) - 1);

        let nextHp = prev.playerHp ?? 500;
        let nextXp = prev.xp || 0;
        let pPoints = prev.points;

        if (itemId === 'potion_health') {
          nextHp = Math.min(prev.playerMaxHp ?? 500, nextHp + 150);
        } else if (itemId === 'potion_exp') {
          nextXp += 120;
        } else if (itemId === 'potion_rage') {
          // handled below by triggering state
        }

        return {
          ...prev,
          inventory: nextInv,
          playerHp: nextHp,
          xp: nextXp
        };
      });
    }

    if (itemId === 'potion_rage') {
      setIsRageActive(true);
    }
  };

  // Render Adventure Screen
  const xp = progress.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);

  // Guild dynamic lists
  const availableGuilds = [
    { name: 'Liên minh Python Siêu Cấp 🐍', count: 14, lvl: 12, motto: 'Tập trung đoạn mã, vùi dập quái lỗi!' },
    { name: 'Học Viện Thần Thánh [GDPT] 🏫', count: 9, lvl: 8, motto: 'Cánh cổng kết nối tin học toàn quốc.' },
    { name: 'Dũng Sĩ Săn Bug Lớp 10 👿', count: 21, lvl: 18, motto: 'Sử dụng 100% phím tắt sấm sét không sợ Bug.' }
  ];

  const handleJoinGuildSimulated = (gName: string) => {
    if (!isPro) {
      alert("Hội quán Săn Boss Bang hội là tính năng dành riêng cho gói PRO! Hãy nâng cấp Pro để tụ họp đồng bọn lập tức!");
      return;
    }
    if (updateProgress) {
      updateProgress((prev: ProgressState) => ({
        ...prev,
        guildId: 'guild_' + Date.now(),
        guildName: gName
      }));
    }
  };

  const handleCreateGuildSimulated = () => {
    if (!isPro) {
      alert("Lập Hội để chiến Boss lớn là tính năng độc quyền của gói PRO! Hãy kích hoạt gói Pro phía trên để tự lập bang vinh hiển.");
      return;
    }
    if (!newGuildName.trim()) {
      alert("Vui lòng điền tên Hội của bạn!");
      return;
    }
    if (updateProgress) {
      updateProgress((prev: ProgressState) => ({
        ...prev,
        guildId: 'my_guild_' + Date.now(),
        guildName: newGuildName.trim()
      }));
    }
  };

  const handleQuitGuild = () => {
    if (updateProgress) {
      updateProgress((prev: ProgressState) => ({
        ...prev,
        guildId: undefined,
        guildName: undefined
      }));
    }
  };

  const handleSendChatSimulated = () => {
    if (!chatInput.trim()) return;
    setGuildChats(prev => [
      ...prev,
      { sender: progress.guildName ? 'Trưởng hội Bạn' : 'Bạn', text: chatInput, time: 'Bây giờ', isPro }
    ]);
    setChatInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      
      {/* Dynamic Premium Plan Toggle Bar */}
      <div className="mb-6 rounded-3xl p-4 bg-gradient-to-r from-indigo-900 via-slate-800 to-indigo-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-indigo-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
            <Crown className={`w-6 h-6 ${isPro ? 'text-yellow-400 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider uppercase">Cơ chế Tài khoản:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase ${isPro ? 'bg-yellow-400 text-slate-900 animate-pulse' : 'bg-slate-600 text-slate-200'}`}>
                {isPro ? 'Gói Toàn Diện ⭐ PRO' : 'Gói Tự Do 🍃 MIỄN PHÍ'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isPro 
                ? 'Đầy đủ mọi đỉnh cao: Mở khoá Guild đánh boss lớn, AI tức thì, certificated GDPT, và full Chương 5 nâng cao!' 
                : 'Đầy đủ Python căn bản, Đồ hoạ Boss 1-3, Roadmap chuẩn, AI hỗ trợ cơ bản. Nâng cấp PRO để đầy đủ hơn.'}
            </p>
          </div>
        </div>
        
        <button
          onClick={togglePremium}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition duration-150 active:scale-95 shadow-sm flex items-center gap-1.5 ${isPro ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600 border border-yellow-400/40' : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black hover:brightness-110'}`}
        >
          {isPro ? '🔄 Trở về gói Free' : '⭐ Kích hoạt PRO miễn phí [Test]'}
        </button>
      </div>

      {/* Nav & Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              audioService.playClick();
              setView('roadmap');
            }}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Khu Săn Boss & Quái</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Nâng tầm tư duy lập trình bằng những trận chiến Code dũng mãnh</p>
          </div>
        </div>

        {/* Character panel */}
        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-700 w-full md:w-auto shadow-sm">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center border-2 border-sky-400 shrink-0">
            <User className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <div className="flex justify-between text-xs font-black text-slate-700 dark:text-white leading-none">
              <span>CẤP ĐỘ {level}</span>
              <span className="text-[10px] text-sky-500">{xpProgress}/100 XP</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1.5">
              <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${xpProgress}%` }}></div>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-base">
            <Coins className="w-4 h-4 text-amber-500" />
            <span>{progress.points || 0} xu</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 max-w-sm">
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('adventure');
          }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'adventure' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          🗺️ Thám Hiểm Ải
        </button>
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab('guild');
          }}
          className="flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 relative text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          {activeTab !== 'guild' && !isPro && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white dark:border-slate-800 animate-pulse" />}
          <Users size={14} /> Guild Liên Minh
          {!isPro && <span className="bg-yellow-400/90 text-slate-900 font-extrabold px-1 py-0.2 rounded text-[8px] scale-90">PRO</span>}
        </button>
      </div>

      {/* TAB 1: ADVENTURES OR LANDS */}
      {activeTab === 'adventure' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Lands list & Bosses Map */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Lands selection carousel map */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-[32px] border border-slate-200/40 dark:border-slate-800">
              <span className="text-[10px] font-black text-indigo-500 tracking-wider uppercase px-2">Bản đồ Thám hiểm Ắi Viễn Chinh</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {dynamicLands.map((land, idx) => {
                  const active = selectedLandIdx === idx;
                  const locked = land.isProOnly && !isPro;
                  return (
                    <button
                      key={land.id}
                      onClick={() => {
                        setSelectedLandIdx(idx);
                        setSelectedEnemyId('boss'); // focus boss by default
                      }}
                      className={`relative overflow-hidden p-3.5 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between min-h-[90px] ${active ? 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-slate-900 border-indigo-400 shadow-sm' : 'bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 border-slate-200/60 dark:border-slate-800'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Ải {idx + 1}</span>
                          {locked && (
                            <span className="bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded text-[8px] tracking-tight uppercase leading-none">
                              PRO
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white mt-1 leading-tight">{land.name}</h4>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-full px-2 py-0.5 mt-2 self-start">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">HP {land.boss.maxHp}</span>
                      </div>
                      
                      {active && (
                        <div className="absolute right-0 bottom-0 top-0 w-1 bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Selected Land Screen */}
            <div className={`p-6 rounded-[36px] border border-slate-200/50 dark:border-slate-700 text-center relative overflow-hidden ${currentLand.bgGradient}`}>
              
              {/* Land description */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-left">
                <div>
                  <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Thế giới Đang đi qua:</h3>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{currentLand.name}</h2>
                </div>
                
                {/* Mode Selector within Land (Normal Boss vs. Quái Dọc Đường) */}
                <div className="flex bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => {
                      if (currentLand.isProOnly && !isPro) return;
                      setSelectedEnemyId('boss');
                    }}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition ${selectedEnemyId === 'boss' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white' : 'text-slate-500'}`}
                  >
                    👑 BOSS Vùng
                  </button>
                  
                  {currentLand.monsters.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (currentLand.isProOnly && !isPro) return;
                        setSelectedEnemyId(m.id);
                      }}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg transition ${selectedEnemyId === m.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white' : 'text-slate-500'}`}
                    >
                      {m.name.split(' ')[0]} {m.image} (Minion)
                    </button>
                  ))}
                </div>
              </div>

              {/* Pro Lock Screen for Land 4 */}
              {currentLand.isProOnly && !isPro && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-40 p-8 leading-relaxed">
                  <Crown className="w-16 h-16 text-yellow-400 mb-4 animate-bounce" />
                  <h3 className="text-xl font-black text-yellow-300">🔒 VÙNG ĐẤT THÁNH ĐỊA CHƯƠNG 5 PRO</h3>
                  <p className="text-sm text-slate-300 max-w-lg mt-2 font-medium">
                    "Đỉnh Núi Chương 5 Nâng Cao" chứa đựng Robo Module tối thượng và Boss Trợ Lý AI Hắc Ám đỉnh cấp. 
                    Bạn cần nâng cấp **tài khoản Học Viên Toàn Diện PRO** để mở khóa hành trình cao cấp này cùng nhiều đặc quyền tuyệt đỉnh!
                  </p>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={togglePremium}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition"
                    >
                      ⭐ Kích hoạt Trải Nghiệm PRO Miễn Phí
                    </button>
                    <button
                      onClick={() => setSelectedLandIdx(0)}
                      className="px-6 py-3 bg-slate-700 text-slate-200 font-bold rounded-2xl hover:bg-slate-600 active:scale-95 transition"
                    >
                      Quay lại Ải 1-3 Miễn Phí
                    </button>
                  </div>
                </div>
              )}

              {/* Combat Core Play Area */}
              <div className="mt-14 mb-2 flex flex-col items-center justify-center min-h-[280px]">
                {isEnemyDefeated ? (
                  <div className="text-center p-8 space-y-4">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-green-500 text-white font-extrabold text-2xl px-6 py-3 rounded-2xl shadow-md inline-block transform -rotate-2"
                    >
                      🎉 TIÊU DIỆT HOÀN TOÀN!
                    </motion.div>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">
                      Bạn đã chinh phục thành công **{activeEnemyName}**. Vượt qua thêm bài học và lý thuyết để tích lũy xu mua súng đạn xịn chiến đấu tiếp!
                    </p>
                    <button
                      onClick={() => {
                        if (updateProgress) {
                          const targetId = selectedEnemyId === 'boss' ? currentLand.boss.id : selectedEnemyId;
                          updateProgress((prev: ProgressState) => ({
                            ...prev,
                            bossHp: { ...prev.bossHp, [targetId]: activeEnemyMaxHp }
                          }));
                        }
                      }}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 mx-auto"
                    >
                      <RefreshCw size={12} /> Hồi sinh địch tái đấu
                    </button>
                  </div>
                ) : (
                  <div className="relative mt-8">
                    {/* Enemy Image and Anim */}
                    <motion.div
                      className="text-[110px] select-none cursor-pointer filter hover:brightness-110 flex justify-center items-center"
                      animate={{ y: [0, -12, 0] }}
                      transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    >
                      {activeEnemyImage.startsWith('data:') || activeEnemyImage.startsWith('http') ? (
                        <img src={activeEnemyImage} alt="boss image" className="max-w-[150px] max-h-[150px] object-contain drop-shadow-2xl rounded-2xl" />
                      ) : (
                        activeEnemyImage
                      )}
                    </motion.div>
                    
                    {/* Active target label */}
                    <div className="bg-slate-900/80 text-white rounded-full px-4 py-1 text-xs font-black tracking-tight inline-block shadow-sm">
                      {activeEnemyName} ⚔️ HP: {activeEnemyHp}/{activeEnemyMaxHp}
                    </div>

                    {/* Enemy Health bar */}
                    <div className="w-56 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-300 dark:border-slate-600 mt-2 mx-auto">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                        animate={{ width: `${(activeEnemyHp / activeEnemyMaxHp) * 100}%` }}
                        transition={{ type: "spring", stiffness: 100 }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Visual damages animation overlay */}
                <AnimatePresence>
                  {attackEffect && (
                    <motion.div
                      key={attackEffect.id}
                      initial={{ opacity: 1, scale: 0.5, y: 0 }}
                      animate={{ opacity: 0, scale: 1.5, y: -70 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-5xl font-black text-orange-500 drop-shadow-md pointer-events-none z-20 flex flex-col items-center"
                      style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="text-yellow-400 text-sm font-black tracking-widest">{attackEffect.msg}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Swords className="text-amber-500" /> -{attackEffect.damage} HP
                      </div>
                    </motion.div>
                  )}

                  {monsterDamageEffect && (
                    <motion.div
                      key="monster_hit"
                      initial={{ opacity: 1, scale: 0.8, y: 0 }}
                      animate={{ opacity: 0, scale: 1.6, y: 30 }}
                      exit={{ opacity: 0 }}
                      className="absolute text-xl font-bold text-red-500 py-1 px-3 bg-red-100 rounded-lg shadow pointer-events-none z-30"
                      style={{ left: '50%', top: '70%', transform: 'translate(-50%, -50%)' }}
                    >
                      🤕 Quái đánh trả: -{monsterDamageEffect} HP
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Consumable Potions Utility Chest */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-200/50 dark:border-slate-700">
               <h3 className="text-sm font-black uppercase text-indigo-500 tracking-wider mb-4 flex items-center gap-1.5">
                 <Sparkles className="w-4 h-4" /> Kệ Tiêu Thụ Dược Bình Thần Kỳ
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Potion health */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-black text-slate-800 dark:text-white">🧪 Bình Máu Tái Sinh</span>
                         <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                           Có: {inventory['potion_health'] || 0}
                         </span>
                       </div>
                       <p className="text-[11px] text-slate-500 mt-1 h-8">Hồi máu sinh mạng tức thì +150 HP để cầm cự.</p>
                     </div>
                     <button
                       onClick={() => useConsumableItem('potion_health')}
                       disabled={(inventory['potion_health'] || 0) <= 0}
                       className="w-full mt-3 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
                     >
                       Sử dụng Bình Máu
                     </button>
                  </div>

                  {/* Potion EXP */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-black text-slate-800 dark:text-white">🧪 Bình EXP Thần Tốc</span>
                         <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                           Có: {inventory['potion_exp'] || 0}
                         </span>
                       </div>
                       <p className="text-[11px] text-slate-500 mt-1 h-8">Uống nhận ngay +120 điểm EXP tăng cấp vù vù.</p>
                     </div>
                     <button
                       onClick={() => useConsumableItem('potion_exp')}
                       disabled={(inventory['potion_exp'] || 0) <= 0}
                       className="w-full mt-3 py-2 bg-cyan-550 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
                     >
                       Uống Tăng EXP
                     </button>
                  </div>

                  {/* Potion Rage */}
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-center">
                         <span className="text-xs font-black text-slate-800 dark:text-white">🧪 Nước Cuồng Nộ</span>
                         <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                           Có: {inventory['potion_rage'] || 0}
                         </span>
                       </div>
                       <p className="text-[11px] text-slate-500 mt-1 h-8">Hóa đỏ nhân dải sát thương phát chém vũ khí sau x2.0!</p>
                     </div>
                     <button
                       onClick={() => useConsumableItem('potion_rage')}
                       disabled={(inventory['potion_rage'] || 0) <= 0 || isRageActive}
                       className={`w-full mt-3 py-2 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95 ${isRageActive ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400'}`}
                     >
                       {isRageActive ? '🔥 Sẵn sàn cuồng nộ' : 'Kích Hoạt Cuồng Nộ'}
                     </button>
                  </div>

               </div>
            </div>

          </div>

          {/* Right panel: Player HP stats + Inventory weapons selection */}
          <div className="lg:col-span-4 space-y-6">

            {/* My Knight (Student) Stats HUD */}
            <div className="bg-slate-950 text-slate-200 p-6 rounded-[36px] shadow-lg border border-slate-800">
               <h4 className="text-[10px] uppercase tracking-widest text-indigo-400 font-extrabold">Thông tin Hiệp Sĩ Python</h4>
               
               <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Heart className="w-5 h-5 text-red-500 fill-current" />
                   <span className="font-extrabold text-sm">Sinh Lực (HP)</span>
                 </div>
                 <span className="font-mono text-xs font-black bg-red-950/45 text-red-400 px-2.5 py-0.5 rounded">
                   {playerHp} / {playerMaxHp}
                 </span>
               </div>

               {/* Health bars */}
               <div className="w-full h-3 bg-slate-800 rounded-full mt-2 overflow-hidden border border-slate-700">
                 <div 
                   className="h-full bg-gradient-to-r from-red-650 from-red-500 to-rose-400 transition-all duration-300"
                   style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                 />
               </div>

               {playerHp <= 0 ? (
                 <div className="bg-red-900/35 border border-red-550 text-red-200 rounded-lg p-3 mt-4 text-xs font-medium space-y-2">
                   <p>💀 **Bạn đã hết máu chiến đấu!** Lực phản công dữ dội quái vật đã đánh gục bạn.</p>
                   <button
                     onClick={revivePlayer}
                     className="w-full py-1.5 bg-yellow-450 bg-yellow-500 text-slate-950 text-xs font-extrabold rounded-lg hover:bg-yellow-400 active:scale-95 transition"
                   >
                     🚀 Chi 20 xu hồi sinh đầy HP ngay!
                   </button>
                 </div>
               ) : (
                 <div className="text-[11px] text-slate-400 font-medium mt-2">
                   💪 Hãy chủ động trang bị giáp khủng để giảm thiểu phản lực sát thương lớn!
                 </div>
               )}

               <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Bảo hộ đang trang bị:</span>
                    <span className="font-extrabold text-indigo-300">{equippedArmorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Lực chém cộng hưởng:</span>
                    <span className="font-extrabold text-amber-400">
                      {isRageActive ? '🔥 X2.0 Cuồng Nộ' : '100% Tiêu Chuẩn'}
                    </span>
                  </div>
               </div>
            </div>

            {/* Inventory weapon ammo */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[34px] shadow-sm border border-slate-200/50 dark:border-slate-700">
              <h3 className="text-sm font-black uppercase text-indigo-500 tracking-wider mb-5 flex items-center gap-1.5">
                <Swords size={16} /> Chọn Vũ Khí Tấn Công
              </h3>
              
              <div className="flex flex-col gap-3">
                {shopItems.filter(item => item.damage > 0).map(item => {
                  const qty = inventory[item.id] || 0;
                  const isPowerPro = item.id === 'sword_dragon';
                  return (
                    <button
                      key={item.id}
                      onClick={() => executeAttack(item.id, item.damage)}
                      disabled={qty <= 0 || isEnemyDefeated || playerHp <= 0 || (isPowerPro && !isPro)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition ${qty > 0 && playerHp > 0 && !isEnemyDefeated && !(isPowerPro && !isPro) ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 hover:border-indigo-400 cursor-pointer hover:shadow-xs' : 'bg-slate-50/50 dark:bg-slate-900/50 border-transparent opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold ${item.color}`}>
                          ⚔️
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">{item.name}</h4>
                            {isPowerPro && <span className="bg-yellow-400 text-slate-950 font-black px-1.5 rounded text-[8px]">PRO</span>}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">Sát thương: {item.damage} HP</span>
                        </div>
                      </div>
                      <div className="bg-slate-200/60 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg text-xs font-black text-slate-600 dark:text-slate-300">
                        x{qty}
                      </div>
                    </button>
                  );
                })}

                <button
                  onClick={() => setView('shop')}
                  className="w-full mt-2 py-3 bg-slate-150 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-black text-xs rounded-2xl transition text-center"
                >
                  🛒 Vào Cửa Hàng Trang Bị Mua Thêm Đồ
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: GUILD (PRO COOP PLAY FEATURE) */}
      {activeTab === 'guild' && (
        <div className="space-y-6">
          
          {/* Free Lock banner if not Pro */}
          {!isPro ? (
            <div className="rounded-[40px] p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 border border-violet-800/40 text-center max-w-2xl mx-auto shadow-xl space-y-6">
               <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto border-2 border-yellow-400">
                 <Users className="w-8 h-8 text-yellow-400" />
               </div>
               
               <div className="space-y-2">
                 <h2 className="text-2xl font-black text-white tracking-tight">👑 HỘI QUÁN LIÊN MINH SĂN BOSS LỚN</h2>
                 <p className="text-amber-300 font-semibold text-xs tracking-widest uppercase">Đặc quyền cấp cao học viên Toàn Diện (PRO)</p>
                 <p className="text-sm text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
                   Khi gia nhập Hội nhóm, bạn sẽ cùng các bạn học khác trong lớp hoặc liên trường phối hợp tạo dải công chém siêu Boss Thế Giới, tham gia bảng đóng góp bang hội, trò chuyện liên quân và cùng giật xu thưởng nhóm!
                 </p>
               </div>

               <div className="bg-slate-900/40 rounded-2xl p-4 text-xs font-medium text-slate-300 text-left max-w-md mx-auto border border-slate-800 space-y-2">
                  <div className="flex gap-2">
                    <CheckCircle className="text-yellow-400 w-4 h-4 shrink-0" />
                    <span>Lập Hội / Tạo Clan của riêng bạn</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="text-yellow-400 w-4 h-4 shrink-0" />
                    <span>Khiêu chiến Boss Thế Giới (HP: 50,000+) cùng đồng đội</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="text-yellow-400 w-4 h-4 shrink-0" />
                    <span>Rương báu xu thưởng miễn phí cho thành viên (+10 xu/ngày)</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="text-yellow-400 w-4 h-4 shrink-0" />
                    <span>Nhận Giấy chứng nhận hoàn thành khoá biểu đạt tin học</span>
                  </div>
               </div>

               <button
                 onClick={togglePremium}
                 className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition inline-block cursor-pointer"
               >
                 ⭐ Kích Hoạt Gói PRO Cấp Cao Tức Thì [Free Test]
               </button>
            </div>
          ) : (
            // Full Guild interface for PRO users
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* If player NOT in any guild yet: join or create panel */}
              {!progress.guildName ? (
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Option A: Join existing cool guilds */}
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[36px] shadow-sm border border-slate-200/50 dark:border-slate-700">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Trophy className="text-indigo-500" />
                      Gia Nhập Hội Quán Sẵn Có
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Chọn bang môn của lớp học để tụ họp chiến đấu</p>
                    
                    <div className="space-y-4 mt-6">
                      {availableGuilds.map((g) => (
                        <div 
                          key={g.name}
                          className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between hover:border-indigo-400 transition"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">{g.name}</h4>
                              <span className="bg-indigo-100 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                                Cấp {g.lvl}
                              </span>
                            </div>
                            <p className="text-xs italic text-slate-500">"{g.motto}"</p>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs font-bold text-slate-400">{g.count} thành viên hàng ngũ</span>
                            <button
                              onClick={() => handleJoinGuildSimulated(g.name)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition cursor-pointer"
                            >
                              Vào Hội
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Option B: Create custom guild */}
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[36px] shadow-sm border border-slate-200/50 dark:border-slate-700">
                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                      <Plus className="text-amber-500" />
                      Tự Sáng Lập Clan Mới
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 font-medium">Làm Hội trưởng, tập dải bạn bè chiến binh riêng tư</p>
                    
                    <div className="space-y-5 mt-6 text-left">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Tên Hội quán:</label>
                        <input
                          type="text"
                          value={newGuildName}
                          onChange={(e) => setNewGuildName(e.target.value)}
                          placeholder="Điền tên (VD: 10A5 Python Sát Thủ...)"
                          className="w-full bg-slate-50 dark:bg-slate-900 text-sm p-4 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Khẩu hiệu / Slogan:</label>
                        <input
                          type="text"
                          value={newGuildMotto}
                          onChange={(e) => setNewGuildMotto(e.target.value)}
                          placeholder="Điền phương châm (VD: Diệt bug lấy điểm số tuyệt đối...)"
                          className="w-full bg-slate-50 dark:bg-slate-900 text-sm p-4 rounded-xl text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 text-amber-800 dark:text-amber-200 p-4 rounded-2xl text-xs font-medium">
                        * Bạn với vai trò Hội Trưởng sẽ dẫn dắt hàng ngũ chinh chiến Boss bang, nhận Rương báu vật bang hội và chứng chỉ GDPT đại diện tập thể!
                      </div>

                      <button
                        onClick={handleCreateGuildSimulated}
                        className="w-full py-3 bg-gradient-to-r from-yellow-450 from-yellow-450 from-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow transition"
                      >
                        ⚡ Sáng Lập Bang Hội [Miễn Phí Cho Pro]
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                // If player ALREADY in a guild: show guild HQ
                <>
                  {/* Guild HQ Panel */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Hero Guild HQ Card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-[36px] shadow border border-indigo-900/40 relative overflow-hidden">
                      <div className="absolute right-4 top-4 bg-white/10 px-3 py-1 rounded-full border border-white/10 text-xs font-black">
                        🏫 Level Bang: {level}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center text-3xl font-extrabold animate-bounce">
                          ⛩️
                        </div>
                        <div>
                          <h2 className="text-2xl font-black">{progress.guildName}</h2>
                          <p className="text-xs text-slate-300 italic mt-0.5">"{newGuildMotto || 'Học hết lực, chiến hết mình, Python là chuyện lẻ tẻ!'}"</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/10 text-center">
                        <div>
                          <div className="text-lg font-black text-yellow-300">12,450</div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Tổng Lực Sát Thương</span>
                        </div>
                        <div>
                          <div className="text-lg font-black text-yellow-300">12 / 30</div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Đồng Chí Active</span>
                        </div>
                        <div>
                          <div className="text-lg font-black text-yellow-300">Hạng 4</div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Bảng Xếp Hạng</span>
                        </div>
                      </div>
                    </div>

                    {/* Guild Raid Boss: World Boss (coop combat) */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[36px] border border-slate-200/50 dark:border-slate-700 relative overflow-hidden text-center">
                      <div className="absolute top-4 left-4 text-left">
                        <span className="bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full">
                          ⚔️ BOSS LIÊN MINH THẾ GIỚI
                        </span>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">Nọc Độc Thượng Cổ Chân Kinh</h3>
                      </div>

                      <div className="mt-14 mb-4 flex flex-col items-center justify-center">
                        <motion.div
                          className="text-[90px]"
                          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                        >
                          🐉
                        </motion.div>
                        <div className="bg-red-500/10 text-red-600 text-xs font-bold px-3 py-1 rounded-full mt-2">
                          HP: 38,450 / 50,000
                        </div>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden max-w-sm mx-auto mb-4 border border-slate-200">
                        <div className="h-full bg-red-500" style={{ width: '76.9%' }} />
                      </div>

                      <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                        * Chiêu chém của bạn sẽ được cộng dồn trực tiếp vào phòng tuyến Boss Liên Minh cùng 12 đồng chí khác trong Guild!
                      </p>

                      <div className="flex gap-4 max-w-xs mx-auto mt-5">
                        <button
                          onClick={() => {
                            alert("Đã phái vũ khí mạnh nhất của bạn tiến công Boss thế giới thành công! Góp +250 sát thương vào Guild.");
                          }}
                          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow transition"
                        >
                          ⚔️ Phối Hợp Tấn Công
                        </button>
                      </div>
                    </div>

                    {/* Member lists & Leave guild options */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-700 flex justify-between items-center">
                       <div>
                         <span className="text-xs font-bold text-slate-400">Bạn đang ở bang môn: {progress.guildName}</span>
                       </div>
                       <button
                         onClick={handleQuitGuild}
                         className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black rounded-lg transition"
                       >
                         Rời Hội quán
                       </button>
                    </div>

                  </div>

                  {/* Guild Members Chat & Perks */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Guild Members List */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-700">
                      <h3 className="text-sm font-black uppercase text-slate-800 dark:text-white mb-4">Danh Sách Nhóm Đánh Cặp</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white">👑 Bạn (Hội Trưởng)</span>
                          <span className="bg-yellow-400 text-slate-950 text-[9px] font-black px-1.5 rounded">Pro</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Minh Hùng</span>
                          <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded">Cấp 14</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Thúy Vy</span>
                          <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded">Cấp 12</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded-xl">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Phương Linh</span>
                          <span className="bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-500 px-1.5 py-0.5 rounded">Cấp 9</span>
                        </div>
                      </div>
                    </div>

                    {/* Guild Coop Chat */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200/50 dark:border-slate-700 flex flex-col justify-between h-[300px]">
                      <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                        <MessageSquare size={16} className="text-indigo-500" />
                        <h3 className="text-xs font-black uppercase text-slate-800 dark:text-white">Kênh Đàm Thoại Liên Quân</h3>
                      </div>
                      
                      {/* Chat log list */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 text-xs text-left p-1">
                        {guildChats.map((c, i) => (
                          <div key={i} className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-dotted border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>{c.sender}</span>
                              <span>{c.time}</span>
                            </div>
                            <div className="mt-0.5 text-slate-700 dark:text-slate-200 font-medium">
                              {c.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChatSimulated()}
                          placeholder="Nhập chat liên liên quân..."
                          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-2.5 rounded-xl focus:outline-none"
                        />
                        <button
                          onClick={handleSendChatSimulated}
                          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
                        >
                          Gửi
                        </button>
                      </div>

                    </div>

                    {/* Daily group chests claim */}
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 p-4 rounded-3xl flex items-center justify-between shadow">
                      <div>
                        <h4 className="font-extrabold text-xs">🎁 Quà Thành Viên Hằng Ngày</h4>
                        <p className="text-[10px] font-bold opacity-80">Mỗi ngày nhận miễn phí +10 xu hỗ trợ bang!</p>
                      </div>
                      <button
                        onClick={() => {
                          if (updateProgress) {
                            updateProgress((prev: ProgressState) => ({
                              ...prev,
                              points: prev.points + 10
                            }));
                            alert("Đã mở rương bang báu vật thành công! Nhận miễn phí +10 xu.");
                          }
                        }}
                        className="px-3.5 py-2 bg-slate-950 text-white font-black text-[10px] rounded-xl hover:bg-slate-800 transition active:scale-95"
                      >
                        Nhận +10 xu
                      </button>
                    </div>

                  </div>

                </>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
