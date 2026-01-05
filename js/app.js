/**
 * 極限棒球陣容大師 - 主程式入口
 * 整合所有模組
 */

// Services
import { getCurrentUser, clearCurrentUser } from './services/user-service.js';
import { loadPlayers, savePlayers, loadLineups, saveLineup, loadLineup } from './services/data-service.js';
import { 
  autoOptimizeByPoints, 
  autoOptimizeDefense, 
  autoOptimizeOffense, 
  autoOptimizeBalanced,
  autoOptimizeBatting 
} from './services/lineup-service.js';

// Utils
import { DEFAULT_PLAYERS, STAT_NAMES } from './utils/constants.js';
import { generateId } from './utils/helpers.js';
import { exportToExcel, importFromExcel } from './utils/excel-utils.js';

// Components
import { Header } from './components/Header.js';
import { Navigation } from './components/Navigation.js';
import { Notification } from './components/Notification.js';

// Pages
import { FieldPage } from './pages/FieldPage.js';
import { BattingPage } from './pages/BattingPage.js';
import { RotationPage } from './pages/RotationPage.js';
import { RosterPage } from './pages/RosterPage.js';

// Modals
import { PositionSelectModal } from './modals/PositionSelectModal.js';
import { PlayerEditModal } from './modals/PlayerEditModal.js';
import { LineupHistoryModal } from './modals/LineupHistoryModal.js';
import { RotationEditModal } from './modals/RotationEditModal.js';

const { useState, useEffect, useMemo } = React;

// ==================== 主應用元件 ====================
const App = () => {
  // 檢查使用者登入
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = 'index.html';
    return null;
  }

  // ==================== State 管理 ====================
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

  // ==================== 初始化 ====================
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

  // ==================== 自動更新打線 ====================
  useEffect(() => {
    const onField = Object.entries(lineup).filter(([pos, pid]) => pid);
    let currentOrder = battingOrder.filter(e => {
      const pos = Object.keys(lineup).find(k => lineup[k] === e.playerId);
      return pos && (pitcherBats || pos !== 'P');
    });
    
    const orderIds = new Set(currentOrder.map(e => e.playerId));
    const missing = onField
      .filter(([pos, pid]) => !orderIds.has(pid) && (pitcherBats || pos !== 'P'))
      .map(([pos, pid]) => ({ playerId: pid, position: pos }));
    
    if (missing.length > 0) {
      setBattingOrder(prev => [...currentOrder, ...missing]);
    } else if (currentOrder.length !== battingOrder.length) {
      setBattingOrder(currentOrder);
    }
  }, [lineup, pitcherBats]);

  // ==================== 計算衍生資料 ====================
  const availablePlayers = useMemo(() => 
    players.filter(p => p.willAttend), 
    [players]
  );

  const bench = useMemo(() => {
    const assigned = new Set(Object.values(lineup));
    return availablePlayers.filter(p => !assigned.has(p.id));
  }, [availablePlayers, lineup]);

  const battingSubstitutes = useMemo(() => {
    const inLineup = new Set(battingOrder.map(e => e.playerId));
    return availablePlayers.filter(p => !inLineup.has(p.id));
  }, [availablePlayers, battingOrder]);

  const sortedPlayersForSelection = useMemo(() => {
    if (!selectingPosition) return [];
    
    const onOtherPos = new Set(
      Object.entries(lineup)
        .filter(([pos, pid]) => pos !== selectingPosition && pid)
        .map(([pos, pid]) => pid)
    );
    
    return [...availablePlayers]
      .filter(p => !onOtherPos.has(p.id))
      .sort((a, b) => {
        const getPriority = (p) => {
          if (p.primaryPosition === selectingPosition) return 0;
          if (p.secondaryPositions?.includes(selectingPosition)) return 1;
          if (selectingPosition.match(/^DH/) && p.secondaryPositions?.includes('DH')) return 1;
          return 2;
        };
        
        const pA = getPriority(a), pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        if (b.points !== a.points) return b.points - a.points;
        
        const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
        const avgA = Object.values(a.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
        const avgB = Object.values(b.grades).reduce((sum, g) => sum + gradeValues[g], 0) / 8;
        return avgB - avgA;
      });
  }, [availablePlayers, lineup, selectingPosition]);

  // ==================== 通知函數 ====================
  const showNotification = (message, duration = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  };

  // ==================== 球員管理 ====================
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
          const cloudData = await loadPlayers();
          await savePlayers(players, currentUser, cloudData.version);
          showNotification('✅ 球員名單已強制上傳');
          const newCloudData = await loadPlayers();
          setCloudPlayers(newCloudData);
        }
      }
    } catch (error) {
      showNotification('❌ 上傳失敗：' + error.message);
    }
  };

  const handleReloadPlayers = async () => {
    if (!window.confirm('確定要重新載入雲端球員名單？\n⚠️ 本地未上傳的修改將遺失')) return;
    
    try {
      const cloudData = await loadPlayers();
      setCloudPlayers(cloudData);
      setPlayers(cloudData.data);
      showNotification('✅ 已重新載入球員名單');
    } catch (error) {
      showNotification('❌ 載入失敗：' + error.message);
    }
  };

  const handleSavePlayer = (playerData) => {
    const player = {
      ...playerData,
      id: playerData.id || generateId(),
      secondaryPositions: playerData.secondaryPositions || [],
      grades: playerData.grades || STAT_NAMES.reduce((obj, stat) => {
        obj[stat] = 'C';
        return obj;
      }, {}),
      willAttend: playerData.willAttend !== false,
      points: playerData.points || 50
    };

    if (playerData.id) {
      setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
    } else {
      setPlayers(prev => [...prev, player]);
    }
    
    setEditingPlayer(null);
    showNotification('✅ 球員已儲存');
  };

  const handleDeletePlayer = (id) => {
    if (!window.confirm('確定要刪除這位球員嗎？')) return;
    
    setPlayers(prev => prev.filter(p => p.id !== id));
    setLineup(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        if (next[key] === id) delete next[key];
      });
      return next;
    });
    setBattingOrder(prev => prev.filter(item => item.playerId !== id));
    showNotification('✅ 球員已刪除');
  };

  const handleDeleteAll = () => {
    if (!window.confirm('確定要刪除所有球員嗎？')) return;
    setPlayers([]);
    setLineup({});
    setBattingOrder([]);
    setRotations([]);
    showNotification('✅ 已清空所有球員');
  };

  const handleToggleAllAttendance = (attend) => {
    setPlayers(prev => prev.map(p => ({ ...p, willAttend: attend })));
    showNotification(attend ? '✅ 全部設為出席' : '❌ 全部設為不出席');
  };

  // ==================== Excel 處理 ====================
  const handleExportExcel = () => {
    exportToExcel(players);
    showNotification('✅ 已匯出 Excel');
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    importFromExcel(file, (importedPlayers) => {
      setPlayers(prev => [...prev, ...importedPlayers]);
      showNotification(`✅ 已匯入 ${importedPlayers.length} 位球員`);
    });
    
    e.target.value = '';
  };

  // ==================== 陣容管理 ====================
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

  const handleLoadLineupHistory = async () => {
    try {
      const history = await loadLineups(50);
      setLineupHistory(history);
      setShowLineupModal(true);
    } catch (error) {
      showNotification('❌ 載入失敗：' + error.message);
    }
  };

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

  // ==================== 守備位置 ====================
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

  const handleAssignPlayer = (playerId) => {
    const newLineup = { ...lineup };
    
    Object.keys(newLineup).forEach(k => {
      if (newLineup[k] === playerId) delete newLineup[k];
    });
    
    newLineup[selectingPosition] = playerId;
    setLineup(newLineup);
    setSelectingPosition(null);
  };

  const handleClearPosition = () => {
    const newLineup = { ...lineup };
    delete newLineup[selectingPosition];
    setLineup(newLineup);
    setSelectingPosition(null);
  };

  // ==================== 打線管理 ====================
  const handleAutoOptimizeBatting = () => {
    const newBattingOrder = autoOptimizeBatting(lineup, players, pitcherBats);
    setBattingOrder(newBattingOrder);
    showNotification('✅ 打序最佳化完成');
  };

  const handleCopyLineup = () => {
    let text = '';
    battingOrder.forEach((item, idx) => {
      const p = availablePlayers.find(x => x.id === item.playerId);
      const displayPos = item.position.match(/^DH/) ? 'DH' : item.position;
      text += `${idx + 1}. ${p?.name || '?'} ${displayPos}\n`;
    });
    
    const pitcher = Object.entries(lineup).find(([pos, pid]) => pos === 'P' && pid);
    if (pitcher && !pitcherBats) {
      const p = availablePlayers.find(x => x.id === pitcher[1]);
      text += `\nSP ${p?.name || '?'}`;
    }
    
    try {
      navigator.clipboard.writeText(text);
      showNotification('✅ 已複製到剪貼簿');
    } catch (err) {
      showNotification('❌ 複製失敗');
    }
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    const newOrder = [...battingOrder];
    [newOrder[idx], newOrder[idx - 1]] = [newOrder[idx - 1], newOrder[idx]];
    setBattingOrder(newOrder);
  };

  const handleMoveDown = (idx) => {
    if (idx === battingOrder.length - 1) return;
    const newOrder = [...battingOrder];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    setBattingOrder(newOrder);
  };

  // ==================== 輪替管理 ====================
  const handleAddRotation = () => {
    if (battingOrder.length === 0) {
      alert('請先設定打線');
      return;
    }
    
    const newRot = {
      id: generateId(),
      name: `第${rotations.length + 1}局`,
      lineup: { ...lineup },
      battingOrder: [...battingOrder]
    };
    
    setRotations(prev => [...prev, newRot]);
    showNotification('✅ 已新增陣容');
  };

  const handleDuplicateRotation = (rot) => {
    const newRot = {
      id: generateId(),
      name: `${rot.name}(複製)`,
      lineup: { ...rot.lineup },
      battingOrder: [...rot.battingOrder]
    };
    
    setRotations(prev => [...prev, newRot]);
    showNotification('✅ 已複製陣容');
  };

  const handleDeleteRotation = (id) => {
    if (!window.confirm('確定刪除此陣容？')) return;
    setRotations(prev => prev.filter(r => r.id !== id));
    showNotification('✅ 已刪除陣容');
  };

  const handleUpdateRotationName = (id, name) => {
    setRotations(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  const handleSwapPositions = (rotId, slotIdx, targetPlayerId) => {
    setRotations(prev => prev.map(rot => {
      if (rot.id !== rotId) return rot;
      
      const currentItem = rot.battingOrder[slotIdx];
      const targetIdx = rot.battingOrder.findIndex(item => item.playerId === targetPlayerId);
      
      if (targetIdx === -1) {
        const newOrder = [...rot.battingOrder];
        const pitcherPos = 'P';
        newOrder[slotIdx] = { ...currentItem, position: pitcherPos };
        
        const newLineup = { ...rot.lineup };
        newLineup[pitcherPos] = currentItem.playerId;
        newLineup[currentItem.position] = targetPlayerId;
        
        return { ...rot, battingOrder: newOrder, lineup: newLineup };
      }
      
      const newOrder = [...rot.battingOrder];
      const targetItem = newOrder[targetIdx];
      newOrder[slotIdx] = { ...currentItem, position: targetItem.position };
      newOrder[targetIdx] = { ...targetItem, position: currentItem.position };
      
      const newLineup = { ...rot.lineup };
      newLineup[targetItem.position] = currentItem.playerId;
      newLineup[currentItem.position] = targetPlayerId;
      
      return { ...rot, battingOrder: newOrder, lineup: newLineup };
    }));
    
    setEditingSlot(null);
    showNotification('✅ 已換位置');
  };

  const handleSubstitutePlayer = (rotId, slotIdx, newPlayerId) => {
    setRotations(prev => prev.map(rot => {
      if (rot.id !== rotId) return rot;
      
      const currentItem = rot.battingOrder[slotIdx];
      const newOrder = [...rot.battingOrder];
      newOrder[slotIdx] = { ...currentItem, playerId: newPlayerId };
      
      const newLineup = { ...rot.lineup };
      newLineup[currentItem.position] = newPlayerId;
      
      return { ...rot, battingOrder: newOrder, lineup: newLineup };
    }));
    
    setEditingSlot(null);
    showNotification('✅ 已換人');
  };

  const handleSubstitutePitcher = (rotId, newPitcherId) => {
    setRotations(prev => prev.map(rot => {
      if (rot.id !== rotId) return rot;
      
      const newLineup = { ...rot.lineup };
      newLineup.P = newPitcherId;
      
      return { ...rot, lineup: newLineup };
    }));
    
    setEditingSlot(null);
    showNotification('✅ 已換投手');
  };

  // ==================== 登出 ====================
  const handleLogout = () => {
    if (window.confirm('確定要登出嗎？')) {
      clearCurrentUser();
      window.location.href = 'index.html';
    }
  };

  // ==================== Loading ====================
  if (isLoading) {
    return React.createElement('div', {
      className: 'max-w-7xl mx-auto bg-slate-950 min-h-screen flex items-center justify-center'
    },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'spinner mx-auto mb-4' }),
        React.createElement('p', { className: 'text-slate-400 font-bold' }, '載入中...')
      )
    );
  }

  // ==================== Render ====================
  return React.createElement('div', {
    className: 'min-h-screen pb-32 max-w-7xl mx-auto bg-slate-950 shadow-2xl relative border-x border-white/5'
  },
    // Header
    React.createElement(Header, {
      currentUser,
      cloudPlayers,
      onLogout: handleLogout,
      onReload: handleReloadPlayers
    }),

    // Notification
    React.createElement(Notification, { message: notification }),

    // Main Content
    React.createElement('main', { className: 'p-4 sm:p-6' },
      activeTab === 'field' && React.createElement(FieldPage, {
        lineup,
        players,
        bench,
        onPositionClick: setSelectingPosition,
        onAutoOptimize: handleAutoOptimize,
        onUploadLineup: handleUploadLineup,
        onLoadLineupHistory: handleLoadLineupHistory
      }),

      activeTab === 'batting' && React.createElement(BattingPage, {
        battingOrder,
        players,
        pitcherBats,
        battingSubstitutes,
        onPitcherBatsChange: setPitcherBats,
        onMoveUp: handleMoveUp,
        onMoveDown: handleMoveDown,
        onCopyLineup: handleCopyLineup,
        onAutoOptimizeBatting: handleAutoOptimizeBatting
      }),

      activeTab === 'rotation' && React.createElement(RotationPage, {
        rotations,
        players,
        pitcherBats,
        onAddRotation: handleAddRotation,
        onDuplicateRotation: handleDuplicateRotation,
        onDeleteRotation: handleDeleteRotation,
        onUpdateRotationName: handleUpdateRotationName,
        onEditSlot: setEditingSlot
      }),

      activeTab === 'roster' && React.createElement(RosterPage, {
        players,
        onAddPlayer: () => setEditingPlayer({
          secondaryPositions: [],
          grades: STAT_NAMES.reduce((obj, stat) => {
            obj[stat] = 'C';
            return obj;
          }, {}),
          willAttend: true,
          points: 50
        }),
        onEditPlayer: setEditingPlayer,
        onDeletePlayer: handleDeletePlayer,
        onUploadPlayers: handleUploadPlayers,
        onExportExcel: handleExportExcel,
        onImportExcel: handleImportExcel,
        onToggleAllAttendance: handleToggleAllAttendance,
        onDeleteAll: handleDeleteAll
      })
    ),

    // Bottom Navigation
    React.createElement(Navigation, {
      activeTab,
      onTabChange: setActiveTab
    }),

    // Modals
    React.createElement(PositionSelectModal, {
      position: selectingPosition,
      lineup,
      sortedPlayers: sortedPlayersForSelection,
      onSelect: handleAssignPlayer,
      onClear: handleClearPosition,
      onClose: () => setSelectingPosition(null)
    }),

    React.createElement(PlayerEditModal, {
      player: editingPlayer,
      onSave: handleSavePlayer,
      onClose: () => setEditingPlayer(null)
    }),

    React.createElement(LineupHistoryModal, {
      lineupHistory: showLineupModal ? lineupHistory : null,
      onLoad: handleLoadLineup,
      onClose: () => setShowLineupModal(false)
    }),

    React.createElement(RotationEditModal, {
      editingSlot,
      players,
      onSwapPositions: handleSwapPositions,
      onSubstitutePlayer: handleSubstitutePlayer,
      onSubstitutePitcher: handleSubstitutePitcher,
      onClose: () => setEditingSlot(null)
    })
  );
};

// ==================== 渲染應用 ====================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
