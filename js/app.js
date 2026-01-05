/**
 * 極限棒球陣容大師 - 主程式
 */

import { getCurrentUser, clearCurrentUser, getUserIcon } from './user-service.js';
import { loadPlayers, savePlayers, loadLineups, saveLineup, loadLineup } from './data-service.js';
import { 
  autoOptimizeByPoints, 
  autoOptimizeDefense, 
  autoOptimizeOffense, 
  autoOptimizeBalanced,
  autoOptimizeBatting 
} from './lineup-service.js';

const { useState, useEffect, useMemo, useRef } = React;

// 常數定義
const ALL_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE', 'DH1', 'DH2', 'DH3'];
const POSITION_OPTIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE', 'DH'];
const GRADE_OPTIONS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const STAT_NAMES = ['hitting', 'power', 'discipline', 'speed', 'defense', 'accuracy', 'armStrength', 'iq'];
const STAT_LABELS = {
  hitting: '打擊',
  power: '力量',
  discipline: '選球',
  speed: '速度',
  defense: '守備',
  accuracy: '傳準',
  armStrength: '臂力',
  iq: '球商'
};

// 預設球員資料
const DEFAULT_PLAYERS = [
  {
    id: '1',
    name: '王大強',
    number: '1',
    primaryPosition: 'P',
    secondaryPositions: ['DH'],
    grades: { hitting: 'C', power: 'C', discipline: 'C', speed: 'C', defense: 'A', accuracy: 'A', armStrength: 'B', iq: 'A' },
    willAttend: true,
    points: 80
  },
  {
    id: '2',
    name: '李重砲',
    number: '24',
    primaryPosition: 'RF',
    secondaryPositions: ['1B', 'DH'],
    grades: { hitting: 'A', power: 'S', discipline: 'B', speed: 'D', defense: 'C', accuracy: 'B', armStrength: 'A', iq: 'B' },
    willAttend: true,
    points: 90
  }
];

// 工具函數
const getGradeColor = (grade) => {
  const colors = {
    S: 'from-purple-400 to-purple-600',
    A: 'from-yellow-300 to-yellow-500',
    B: 'from-sky-300 to-blue-400',
    C: 'from-orange-300 to-orange-500',
    D: 'from-green-300 to-green-500',
    E: 'from-white to-slate-100',
    F: 'from-white to-slate-100'
  };
  return colors[grade] || colors.F;
};

const getCardRarity = (grades) => {
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  const values = Object.values(grades).map(g => gradeValues[g] || 1);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg >= 6) return 'from-purple-400 to-purple-600';
  if (avg >= 5) return 'from-yellow-300 to-amber-500';
  if (avg >= 4) return 'from-sky-300 to-blue-400';
  if (avg >= 3) return 'from-gray-300 to-slate-400';
  if (avg >= 2) return 'from-white to-slate-100';
  return 'from-white to-slate-100';
};

// 元件：等級條
const GradeBar = ({ label, grade }) => (
  <div className="flex items-center gap-2">
    <span className="text-[8px] font-black text-white/70 w-8">{label}</span>
    <div className={`px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r text-slate-900 ${getGradeColor(grade)}`}>
      {grade}
    </div>
  </div>
);

// 元件：球員卡片
const PlayerCard = ({ player, onClick, selected, showGrades = true, compact = false, showSecondary = true }) => {
  if (!player) return null;
  const rarity = getCardRarity(player.grades);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={`p-3 rounded-xl border-2 flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} transition-all active:scale-95 bg-gradient-to-br ${rarity} shadow-md border-white/10 ${!player.willAttend ? 'opacity-40' : ''}`}
      >
        <span className="text-[10px] font-black opacity-60">#{player.number}</span>
        <span className="text-sm font-black truncate flex-1 text-slate-900">{player.name}</span>
        <span className="text-[9px] font-black bg-black/30 px-2 py-0.5 rounded uppercase text-white">
          {player.primaryPosition}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all ${onClick ? 'cursor-pointer' : ''} active:scale-95 bg-gradient-to-br ${rarity} border-white/10 card-shadow ${selected ? 'ring-4 ring-cyan-400 border-white' : ''} ${!player.willAttend ? 'opacity-40' : ''}`}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase opacity-70 text-slate-900">No.{player.number}</span>
          <h3 className="text-lg font-black drop-shadow-md leading-tight text-slate-900">{player.name}</h3>
        </div>
        <div className="bg-black/30 px-2 py-1 rounded-lg font-black text-[11px] text-white">
          {player.primaryPosition}
        </div>
      </div>
      {showSecondary && player.secondaryPositions && player.secondaryPositions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 relative z-10">
          {player.secondaryPositions.map(pos => (
            <span key={pos} className="text-[8px] bg-white/30 px-2 py-0.5 rounded font-bold uppercase text-slate-900">
              {pos}
            </span>
          ))}
        </div>
      )}
      {showGrades && (
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-auto">
          {STAT_NAMES.map(stat => (
            <GradeBar key={stat} label={STAT_LABELS[stat]} grade={player.grades[stat]} />
          ))}
        </div>
      )}
    </div>
  );
};

// 主應用元件
const App = () => {
  // 檢查使用者登入
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return null;
  }

  // State 管理
  const [activeTab, setActiveTab] = useState('field');
  const [players, setPlayers] = useState([]);
  const [lineup, setLineup] = useState({});
  const [battingOrder, setBattingOrder] = useState([]);
  const [pitcherBats, setPitcherBats] = useState(false);
  const [rotations, setRotations] = useState([]);
  const [selectingPosition, setSelectingPosition] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cloudPlayers, setCloudPlayers] = useState(null);
  const [notification, setNotification] = useState('');
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [lineupHistory, setLineupHistory] = useState([]);

  // 初始化：載入雲端球員資料
  useEffect(() => {
    const init = async () => {
      try {
        const cloudData = await loadPlayers();
        setCloudPlayers(cloudData);
        setPlayers(cloudData.data.length > 0 ? cloudData.data : DEFAULT_PLAYERS);
      } catch (error) {
        console.error('載入失敗', error);
        setPlayers(DEFAULT_PLAYERS);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // 通知函數
  const showNotification = (message, duration = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  };

  // 上傳球員名單
  const handleUploadPlayers = async () => {
    if (!window.confirm('確定要上傳球員名單到雲端？\n⚠️ 這將覆蓋雲端資料')) return;
    
    try {
      const success = await savePlayers(players, currentUser, cloudPlayers?.version || 0);
      if (success) {
        showNotification('✅ 球員名單已上傳');
        const newCloudData = await loadPlayers();
        setCloudPlayers(newCloudData);
      } else {
        if (window.confirm('⚠️ 雲端資料已更新，是否強制覆蓋？')) {
          await savePlayers(players, currentUser, cloudPlayers?.version || 0);
          showNotification('✅ 球員名單已強制上傳');
        }
      }
    } catch (error) {
      showNotification('❌ 上傳失敗：' + error.message);
    }
  };

  // 上傳陣容
  const handleUploadLineup = async () => {
    const name = window.prompt('請輸入陣容名稱：\n範例：1/4(日）冬盟G3 VS卡吐司');
    if (!name || name.trim() === '') return;

    try {
      await saveLineup(
        { lineup, battingOrder, rotations, pitcherBats },
        currentUser,
        name.trim()
      );
      showNotification('✅ 陣容已上傳');
    } catch (error) {
      showNotification('❌ 上傳失敗：' + error.message);
    }
  };

  // 載入陣容歷史
  const handleLoadLineupHistory = async () => {
    try {
      const history = await loadLineups(50);
      setLineupHistory(history);
      setShowLineupModal(true);
    } catch (error) {
      showNotification('❌ 載入失敗：' + error.message);
    }
  };

  // 載入特定陣容
  const handleLoadLineup = async (lineupId) => {
    try {
      const data = await loadLineup(lineupId);
      setLineup(data.lineup);
      setBattingOrder(data.battingOrder);
      setRotations(data.rotations);
      setPitcherBats(data.pitcherBats);
      setShowLineupModal(false);
      showNotification(`✅ 已載入「${data.name}」`);
    } catch (error) {
      showNotification('❌ 載入失敗：' + error.message);
    }
  };

  // 登出
  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      clearCurrentUser();
      window.location.href = 'index.html';
    }
  };

  // 自動排陣
  const handleAutoOptimize = (mode) => {
    if (!window.confirm(`使用「${mode}」模式自動最佳化守備位置？`)) return;
    
    let newLineup = {};
    switch (mode) {
      case '積分優先':
        newLineup = autoOptimizeByPoints(players);
        break;
      case '守備最佳化':
        newLineup = autoOptimizeDefense(players);
        break;
      case '打擊最大化':
        newLineup = autoOptimizeOffense(players);
        break;
      case '平衡模式':
        newLineup = autoOptimizeBalanced(players);
        break;
    }
    setLineup(newLineup);
    showNotification(`✅ ${mode}完成`);
  };

  // 自動最佳化打序
  const handleAutoOptimizeBatting = () => {
    const newBattingOrder = autoOptimizeBatting(lineup, players, pitcherBats);
    setBattingOrder(newBattingOrder);
    showNotification('✅ 打序最佳化完成');
  };

  // 複製打序
  const handleCopyLineup = () => {
    let text = '';
    battingOrder.forEach((item, idx) => {
      const p = players.find(x => x.id === item.playerId);
      const displayPos = item.position.match(/^DH/) ? 'DH' : item.position;
      text += `${idx + 1}. ${p?.name || '?'} ${displayPos}\n`;
    });
    const pitcher = Object.entries(lineup).find(([pos, pid]) => pos === 'P' && pid);
    if (pitcher && !pitcherBats) {
      const p = players.find(x => x.id === pitcher[1]);
      text += `\nSP ${p?.name || '?'}`;
    }
    try {
      navigator.clipboard.writeText(text);
      showNotification('✅ 已複製到剪貼簿');
    } catch (err) {
      showNotification('❌ 複製失敗');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto bg-slate-950 shadow-2xl relative border-x border-white/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-5 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-600 uppercase">
            Pro Manager
          </h1>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-black user-badge-${currentUser}`}>
              <span>{getUserIcon(currentUser)}</span>
              <span>{currentUser}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-300 font-bold"
            >
              登出
            </button>
          </div>
        </div>
        {cloudPlayers && (
          <div className="mt-2 text-xs text-slate-500">
            最後更新：{cloudPlayers.lastUpdatedBy} ({cloudPlayers.lastUpdatedAt.toLocaleString('zh-TW')})
          </div>
        )}
      </header>

      {/* 通知訊息 */}
      {notification && (
        <div className="notification">
          <div className="bg-emerald-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl">
            <p className="text-white font-bold text-sm">{notification}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {activeTab === 'roster' && (
          <div className="animate-slide-up space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 grid grid-cols-2 gap-3 shadow-xl">
              <button
                onClick={() => setEditingPlayer({ secondaryPositions: [], grades: STAT_NAMES.reduce((obj, stat) => { obj[stat] = 'C'; return obj; }, {}), willAttend: true, points: 50 })}
                className="col-span-2 bg-cyan-600 py-4 rounded-2xl text-sm font-black shadow-lg uppercase tracking-widest btn-primary"
              >
                ＋ Add New Player
              </button>
              <button
                onClick={handleUploadPlayers}
                className="col-span-2 bg-purple-600 py-4 rounded-2xl text-sm font-black shadow-lg uppercase tracking-widest btn-primary"
              >
                📤 上傳球員名單到雲端
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.map(p => (
                <div key={p.id} className="relative group">
                  <div onClick={() => setEditingPlayer(p)} className="cursor-pointer">
                    <PlayerCard player={p} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('確定刪除？')) {
                        setPlayers(prev => prev.filter(x => x.id !== p.id));
                      }
                    }}
                    className="absolute -top-1 -right-1 bg-red-600 w-8 h-8 rounded-full text-white font-black text-lg shadow-xl z-30 transition-all active:scale-90 flex items-center justify-center cursor-pointer border-2 border-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'field' && (
          <div className="animate-slide-up space-y-8">
            <div className="bg-slate-900 p-4 rounded-3xl border border-white/10 shadow-xl">
              <h2 className="font-black italic text-cyan-400 uppercase tracking-widest text-sm mb-3">
                Defense Setup
              </h2>
              <div className="flex gap-2 flex-wrap mb-4">
                {['積分優先', '守備最佳化', '打擊最大化', '平衡模式'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleAutoOptimize(mode)}
                    className="text-[10px] font-black bg-purple-700/50 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30 btn-primary shadow-lg"
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUploadLineup}
                  className="text-[10px] font-black bg-emerald-700/50 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 btn-primary shadow-lg"
                >
                  📤 上傳陣容
                </button>
                <button
                  onClick={handleLoadLineupHistory}
                  className="text-[10px] font-black bg-indigo-700/50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 btn-primary shadow-lg"
                >
                  📥 載入陣容
                </button>
              </div>
            </div>
            <p className="text-center text-slate-500 text-sm">守備位置配置區域（簡化版）</p>
          </div>
        )}

        {activeTab === 'batting' && (
          <div className="animate-slide-up space-y-6">
            <div className="bg-slate-900 p-5 rounded-3xl border border-white/10 flex justify-between items-center shadow-xl">
              <h2 className="font-black italic text-cyan-400 uppercase tracking-widest text-sm">
                Lineup Builder
              </h2>
              <div className="flex gap-4 items-center">
                <button
                  onClick={handleCopyLineup}
                  className="text-[10px] font-black bg-indigo-700/50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 btn-primary shadow-lg"
                >
                  📋 複製打序
                </button>
                <button
                  onClick={handleAutoOptimizeBatting}
                  className="text-[10px] font-black bg-cyan-700/50 text-cyan-400 px-4 py-2 rounded-full border border-cyan-500/30 btn-primary shadow-lg"
                >
                  🪄 自動最佳化
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-24 px-4 pb-6 pt-2 z-40">
        {[
          { id: 'field', icon: '🏟️', label: 'Field' },
          { id: 'batting', icon: '⚡', label: 'Lineup' },
          { id: 'rotation', icon: '🔄', label: 'Rotation' },
          { id: 'roster', icon: '📇', label: 'Roster' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-2 transition-all ${activeTab === t.id ? 'text-cyan-400 scale-110 font-black' : 'text-slate-500 opacity-60'}`}
          >
            <span className="text-2xl">{t.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* 陣容歷史 Modal */}
      {showLineupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop modal-enter">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border-2 border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-black mb-4 text-cyan-400">載入雲端陣容</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {lineupHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleLoadLineup(item.id)}
                  className="p-4 rounded-xl cursor-pointer border-2 bg-slate-800 border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-500 transition-all"
                >
                  <div className="font-black text-base text-white">{item.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    by {item.createdBy} • {item.createdAt?.toLocaleString('zh-TW')}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLineupModal(false)}
              className="w-full mt-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-black text-xs"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// 渲染應用
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
