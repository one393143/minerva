/**
 * 球員名單頁面 - 完整修正版
 */

import { PlayerCard } from '../components/PlayerCard.js';
import { calculateAverageGrade } from '../utils/helpers.js';

export const RosterPage = ({
  players,
  onAddPlayer,
  onEditPlayer,
  onDeletePlayer,
  onUploadPlayers,
  onExportExcel,
  onImportExcel,
  onToggleAllAttendance,
  onDeleteAll,
  onUpdatePoints,
  onToggleAttendance,
  onOpenAttendanceChecklist
}) => {
  const [sortBy, setSortBy] = React.useState('number');
  const [filterPosition, setFilterPosition] = React.useState('ALL');

  const POSITIONS = ['ALL', 'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'];

  const processedPlayers = React.useMemo(() => {
    let result = [...players];

    // Filtering
    if (filterPosition !== 'ALL') {
      result = result.filter(p => 
        p.primaryPosition === filterPosition || 
        (p.secondaryPositions && p.secondaryPositions.includes(filterPosition))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'number') {
        return parseInt(a.number || 0) - parseInt(b.number || 0);
      } else if (sortBy === 'points') {
        return (b.points || 0) - (a.points || 0);
      } else if (sortBy === 'strokes') {
        return a.name.localeCompare(b.name, 'zh-TW', { collation: 'stroke' });
      } else if (sortBy === 'ability') {
        return calculateAverageGrade(b) - calculateAverageGrade(a);
      }
      return 0;
    });

    return result;
  }, [players, sortBy, filterPosition]);

  return React.createElement('div', { className: 'animate-slide-up space-y-6' },
    // Header
    React.createElement('div', { className: 'bg-slate-900 p-4 rounded-3xl border border-white/10 shadow-xl' },
      React.createElement('h2', {
        className: 'font-black italic text-cyan-400 uppercase tracking-widest text-sm mb-4'
      }, 'Player Roster'),

      // Action Buttons
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-2' },
        // 新增球員
        React.createElement('button', {
          onClick: onAddPlayer,
          className: 'text-xs font-black bg-emerald-700/50 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 btn-primary shadow-lg'
        }, '➕ 新增球員'),

        // 上傳到雲端
        React.createElement('button', {
          onClick: onUploadPlayers,
          className: 'text-xs font-black bg-cyan-700/50 text-cyan-400 px-4 py-2 rounded-full border border-cyan-500/30 btn-primary shadow-lg'
        }, '☁️ 上傳到雲端'),

        // 匯出 Excel
        React.createElement('button', {
          onClick: onExportExcel,
          className: 'text-xs font-black bg-purple-700/50 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30 btn-primary shadow-lg'
        }, '📥 匯出 Excel'),

        // 匯入 Excel
        React.createElement('label', {
          className: 'text-xs font-black bg-indigo-700/50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 btn-primary shadow-lg cursor-pointer text-center'
        },
          '📤 匯入 Excel',
          React.createElement('input', {
            type: 'file',
            accept: '.xlsx,.xls',
            onChange: onImportExcel,
            className: 'hidden'
          })
        ),

        // 更新積分按鈕
        React.createElement('button', {
          onClick: onUpdatePoints,
          className: 'text-xs font-black bg-yellow-700/50 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 btn-primary shadow-lg'
        }, '🔄 更新積分'),

        // 全部出席
        React.createElement('button', {
          onClick: () => onToggleAllAttendance(true),
          className: 'text-xs font-black bg-green-700/50 text-green-400 px-4 py-2 rounded-full border border-green-500/30 btn-primary shadow-lg'
        }, '✅ 全部出席'),

        // 全部不出席
        React.createElement('button', {
          onClick: () => onToggleAllAttendance(false),
          className: 'text-xs font-black bg-red-700/50 text-red-400 px-4 py-2 rounded-full border border-red-500/30 btn-primary shadow-lg'
        }, '❌ 全部不出席'),

        // 刪除全部
        React.createElement('button', {
          onClick: onDeleteAll,
          className: 'text-xs font-black bg-slate-700/50 text-slate-400 px-4 py-2 rounded-full border border-slate-500/30 btn-primary shadow-lg'
        }, '🗑️ 刪除全部'),

        // 快速勾選出席
        React.createElement('button', {
          onClick: onOpenAttendanceChecklist,
          className: 'col-span-2 text-xs font-black bg-cyan-600 text-white px-4 py-3 rounded-full border border-cyan-400 shadow-xl shadow-cyan-900/40 mt-2 btn-primary'
        }, '📋 快速勾選出席')
      ),

      // Sort and Filter Controls
      React.createElement('div', { className: 'mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between' },
        
        // Filter Settings
        React.createElement('div', { className: 'flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar' },
          React.createElement('span', { className: 'text-slate-400 font-bold text-xs shrink-0' }, '篩選位置：'),
          POSITIONS.map(pos => 
            React.createElement('button', {
              key: pos,
              onClick: () => setFilterPosition(pos),
              className: `px-3 py-1 rounded-full font-black text-xs transition-all shrink-0 ${filterPosition === pos ? 'bg-blue-600 text-white border border-blue-400' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`
            }, pos === 'ALL' ? '全部' : pos)
          )
        ),

        // Sort Settings
        React.createElement('div', { className: 'flex gap-2 w-full md:w-auto' },
          React.createElement('select', {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: 'flex-1 md:w-48 bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:border-cyan-500'
          },
            React.createElement('option', { value: 'number' }, '🔢 依背號排序'),
            React.createElement('option', { value: 'points' }, '🏆 依績分排序'),
            React.createElement('option', { value: 'strokes' }, '✍️ 依姓氏筆畫'),
            React.createElement('option', { value: 'ability' }, '⭐ 依綜合能力')
          )
        )
      )
    ),

    // Player Cards - Update to use processedPlayers
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
      processedPlayers.length > 0 ? processedPlayers.map(player =>
        React.createElement(PlayerCard, {
          key: player.id,
          player: player,
          onClick: () => onEditPlayer(player),
          onDelete: onDeletePlayer,
          onToggleAttendance: onToggleAttendance,
          showAttendanceToggle: true,
          showGrades: true,
          showSecondary: true
        })
      ) : React.createElement('div', {
        className: 'col-span-full text-center py-12'
      },
        React.createElement('p', {
          className: 'text-slate-600 text-lg font-black uppercase tracking-widest'
        }, 'No Players Yet'),
        React.createElement('p', {
          className: 'text-slate-700 text-sm mt-2'
        }, '點擊「新增球員」開始建立名單')
      )
    )
  );
};
