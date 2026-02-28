/**
 * 極限棒球陣容大師 - 主程式入口 (完整更新版)
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
import { CardPage } from './pages/CardPage.js';  // 🆕 加入這行

// Modals
import { PositionSelectModal } from './modals/PositionSelectModal.js';
import { PlayerEditModal } from './modals/PlayerEditModal.js';
import { PlayerDetailCard } from './modals/PlayerDetailCard.js'; // 🆕 新增
import { LineupHistoryModal } from './modals/LineupHistoryModal.js';
import { RotationEditModal } from './modals/RotationEditModal.js';
import { AutoRotationModal } from './modals/AutoRotationModal.js'; // 🆕 
import { calculateAutoRotation } from './services/auto-rotation-service.js'; // 🆕

// 🆕 加入 Google Sheets 服務
import {
  fetchPlayerPointsFromGoogleSheets,
  updatePlayersPoints
} from './services/google-sheets-service.js';

import { ExportImageModal } from './modals/ExportImageModal.js'; // 🆕

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
  const [detailedPlayer, setDetailedPlayer] = useState(null); // 🆕 檢視模式
  const [editingSlot, setEditingSlot] = useState(null);
  const [autoRotationConfig, setAutoRotationConfig] = useState(null); // 🆕 自動輪替設定
  const [isLoading, setIsLoading] = useState(true);
  const [cloudPlayers, setCloudPlayers] = useState(null);
  const [notification, setNotification] = useState('');
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [lineupHistory, setLineupHistory] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false); // 🆕

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
      primaryPosition: playerData.primaryPosition || 'P',
      secondaryPositions: playerData.secondaryPositions || [],
      grades: playerData.grades || STAT_NAMES.reduce((obj, stat) => {
        obj[stat] = 'C';
        return obj;
      }, {}),
      willAttend: playerData.willAttend !== false,
      points: playerData.points ?? 0  // 🆕 修改：只有 undefined/null 才用 0
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

  const handleToggleAttendance = (playerId) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId ? { ...p, willAttend: !p.willAttend } : p
    ));
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
    const name = window.prompt('請輸入陣容名稱：', '1/4(日）冬盟G3 VS卡吐司');
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
  const handleAutoOptimize = (mode, pitcherId, dhCount) => {
    let newLineup = {};
    switch (mode) {
      case '積分優先':
        newLineup = autoOptimizeByPoints(players, pitcherId, dhCount);
        break;
      case '守備最佳化':
        newLineup = autoOptimizeDefense(players, pitcherId, dhCount);
        break;
      case '打擊最大化':
        newLineup = autoOptimizeOffense(players, pitcherId, dhCount);
        break;
      case '平衡模式':
        newLineup = autoOptimizeBalanced(players, pitcherId, dhCount);
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
  // 輔助函數：重新命名陣容
  const reindexRotations = (rotArr) => {
    return rotArr.map((rot, idx) => ({
      ...rot,
      name: idx === 0 ? '先發陣容' : `陣容${idx + 1}`
    }));
  };

  const handleAddRotation = () => {
    if (battingOrder.length === 0) {
      alert('請先設定打線');
      return;
    }

    const newRot = {
      id: generateId(),
      name: '', // 將由 reindexRotations 設定
      lineup: { ...lineup },
      battingOrder: [...battingOrder]
    };

    setRotations(prev => reindexRotations([...prev, newRot]));
    showNotification('✅ 已新增陣容');
  };

  const handleDuplicateRotation = (rot) => {
    const newRot = {
      id: generateId(),
      name: '', // 將由 reindexRotations 設定
      lineup: { ...rot.lineup },
      battingOrder: [...rot.battingOrder]
    };

    setRotations(prev => {
      const idx = prev.findIndex(r => r.id === rot.id);
      if (idx === -1) return reindexRotations([...prev, newRot]);

      const newRotations = [...prev];
      newRotations.splice(idx + 1, 0, newRot);
      return reindexRotations(newRotations);
    });
    showNotification('✅ 已複製陣容');
  };

  const handleDeleteRotation = (id) => {
    if (!window.confirm('確定刪除此陣容？')) return;
    setRotations(prev => reindexRotations(prev.filter(r => r.id !== id)));
    showNotification('✅ 已刪除陣容');
  };

  const handleUpdateRotationName = (id, name) => {
    setRotations(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  const handleSwapPositions = (rotId, slotIdx, targetPlayerId) => {
    setRotations(prev => prev.map(rot => {
      if (rot.id !== rotId) return rot;

      // Case 1: Source is Pitcher (slotIdx is undefined/null)
      if (slotIdx === undefined || slotIdx === null) {
        const pitcherId = rot.lineup.P;
        const targetIdx = rot.battingOrder.findIndex(item => item.playerId === targetPlayerId);

        if (targetIdx !== -1) {
          // Swap Pitcher <-> Fielder
          const targetItem = rot.battingOrder[targetIdx];
          const newOrder = [...rot.battingOrder];

          // Target slot in batting order:
          // Player becomes the original Pitcher (pitcherId)
          // Position stays as the Fielder's position (targetItem.position)
          newOrder[targetIdx] = {
            ...targetItem,
            playerId: pitcherId,
            position: targetItem.position
          };

          const newLineup = { ...rot.lineup };
          newLineup.P = targetItem.playerId; // Fielder -> P
          newLineup[targetItem.position] = pitcherId; // Pitcher -> Fielder Position

          return { ...rot, battingOrder: newOrder, lineup: newLineup };
        }
        return rot;
      }

      // Case 2: Source is Fielder (Standard Logic)
      const currentItem = rot.battingOrder[slotIdx];
      const targetIdx = rot.battingOrder.findIndex(item => item.playerId === targetPlayerId);

      // 2a. Target is NOT in Batting Order (i.e., Target is Pitcher)
      if (targetIdx === -1) {
        const newOrder = [...rot.battingOrder];
        // Slot becomes the original Pitcher (targetPlayerId)
        // Position stays as current Fielder's position
        newOrder[slotIdx] = {
          ...currentItem,
          playerId: targetPlayerId,
          position: currentItem.position
        };

        const newLineup = { ...rot.lineup };
        newLineup.P = currentItem.playerId; // Fielder -> P
        newLineup[currentItem.position] = targetPlayerId; // Pitcher -> Fielder Position

        return { ...rot, battingOrder: newOrder, lineup: newLineup };
      }

      // 2b. Target IS in Batting Order (Fielder <-> Fielder)
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

  // 🆕 執行自動輪替
  const handleAutoRotation = (config) => {
    const { substituteCount, newPitcherId } = config;

    // 取得最後一局作為參考
    const lastRotation = rotations[rotations.length - 1];
    if (!lastRotation) {
      alert('請先建立至少一個陣容');
      return;
    }

    const result = calculateAutoRotation(lastRotation, players, config);

    if (result.error) {
      alert(result.error);
      return;
    }

    const newRot = {
      id: generateId(),
      name: '', // reindex 會處理
      lineup: result.lineup,
      battingOrder: result.battingOrder,
      substitutionCounts: result.substitutionCounts, // 🆕 儲存換人計數
      tiredPlayers: result.tiredPlayers, // 🆕 儲存疲勞名單 (場上/10)
      fieldingTenure: result.fieldingTenure // 🆕 儲存守備局數 (用於判定資深程度)
    };

    setRotations(prev => reindexRotations([...prev, newRot]));
    showNotification(`✅ 已自動產生輪替陣容 (替換 ${substituteCount} 人)`);
    setAutoRotationConfig(null);
  };

  // 🆕 在 App 元件中加入處理函數
  const handleUpdatePoints = async () => {
    if (!window.confirm('確定要從 Google Sheets 更新球員積分？\n⚠️ 這將覆蓋現有積分資料')) return;

    try {
      showNotification('📊 正在從 Google Sheets 載入積分...');

      // 1. 從 Google Sheets 讀取積分
      const pointsMap = await fetchPlayerPointsFromGoogleSheets();

      // 2. 更新球員積分
      const updatedPlayers = updatePlayersPoints(players, pointsMap);

      // 3. 更新 state
      setPlayers(updatedPlayers);

      // 4. 顯示成功訊息
      const updatedCount = Object.keys(pointsMap).length;
      showNotification(`✅ 已更新 ${updatedCount} 位球員積分`, 5000);

    } catch (error) {
      console.error('更新積分失敗:', error);
      showNotification('❌ 更新失敗：' + error.message);
    }
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
        onLoadLineupHistory: handleLoadLineupHistory,
        onExportImage: () => setShowExportModal(true), // 🆕
        onPlayerClick: setDetailedPlayer // 🆕 FieldPage 改為檢視模式
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
        onAutoOptimizeBatting: handleAutoOptimizeBatting,
        onPlayerClick: setDetailedPlayer // 🆕 BattingPage 改為檢視模式
      }),

      activeTab === 'rotation' && React.createElement(RotationPage, {
        rotations,
        players,
        pitcherBats,
        onAddRotation: handleAddRotation,
        onDuplicateRotation: handleDuplicateRotation,
        onDeleteRotation: handleDeleteRotation,
        onUpdateRotationName: handleUpdateRotationName,
        onEditSlot: setEditingSlot,
        onEditSlot: setEditingSlot,
        onPlayerClick: setDetailedPlayer,
        onAutoRotation: () => {
          if (rotations.length === 0) {
            alert('請先建立至少一個陣容');
            return;
          }
          setAutoRotationConfig({});
        }
      }),

      activeTab === 'roster' && React.createElement(RosterPage, {
        players,
        onAddPlayer: () => setEditingPlayer({
          primaryPosition: 'P',
          secondaryPositions: [],
          grades: STAT_NAMES.reduce((obj, stat) => {
            obj[stat] = 'C';
            return obj;
          }, {}),
          willAttend: true,
          points: 0
        }),
        onEditPlayer: setEditingPlayer,
        onDeletePlayer: handleDeletePlayer,
        onUploadPlayers: handleUploadPlayers,
        onExportExcel: handleExportExcel,
        onImportExcel: handleImportExcel,
        onToggleAllAttendance: handleToggleAllAttendance,
        onDeleteAll: handleDeleteAll,
        onUpdatePoints: handleUpdatePoints,
        onToggleAttendance: handleToggleAttendance
      }),

      // 🆕 新增這段
      activeTab === 'card' && React.createElement(CardPage, {
        players
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

    // 🆕 詳細資料卡片
    React.createElement(PlayerDetailCard, {
      player: detailedPlayer,
      onClose: () => setDetailedPlayer(null),
      onEdit: () => {
        setEditingPlayer(detailedPlayer);
        setDetailedPlayer(null);
      }
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
    }),

    // 🆕 自動輪替 Modal
    autoRotationConfig && React.createElement(AutoRotationModal, {
      players,
      currentRotation: rotations[rotations.length - 1], // 傳入最後一局作為參考
      onConfirm: handleAutoRotation,
      onClose: () => setAutoRotationConfig(null)
    }),

    // 🆕 匯出圖片 Modal
    showExportModal && React.createElement(ExportImageModal, {
      lineup,
      players,
      bench,
      onClose: () => setShowExportModal(false)
    })
  );
};

// ==================== 渲染應用 ====================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
