/**
 * 球員卡片元件 - 修正版（參考 HTML 樣式）
 */

import { getCardRarity } from '../utils/helpers.js';
import { STAT_NAMES, STAT_LABELS } from '../utils/constants.js';
import { GradeBar } from './GradeBar.js';

export const PlayerCard = ({
  player,
  onClick,
  onDelete,
  onToggleAttendance,
  selected = false,
  showGrades = true,
  compact = false,
  showSecondary = true,
  showAttendanceToggle = false,
  forceUniform = false // 🆕 強制統一顏色 (用於圖片匯出)
}) => {
  if (!player) return null;

  // 🆕 如果強制統一，則使用藍白色系
  const rarity = forceUniform
    ? 'from-blue-600 to-blue-800 text-white border-white/40'
    : getCardRarity(player.grades);

  // 刪除按鈕點擊處理
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡到卡片
    if (onDelete) {
      onDelete(player.id);
    }
  };

  // 出席勾選處理
  const handleToggleClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡到卡片
    if (onToggleAttendance) {
      onToggleAttendance(player.id);
    }
  };

  if (compact) {
    return React.createElement('div', {
      onClick,
      className: `rounded-xl border-2 flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} transition-all active:scale-95 bg-gradient-to-br ${rarity} shadow-md border-white/10 ${!player.willAttend ? 'opacity-40' : ''} ${forceUniform ? 'p-6 relative h-24 justify-center' : 'p-3'}`
    },
      React.createElement('span', { className: `${forceUniform ? 'absolute top-3 left-4 text-xs' : 'text-[10px]'} font-black opacity-60` }, `#${player.number}`),
      React.createElement('span', { className: `${forceUniform ? 'text-2xl text-white' : 'text-sm text-slate-900'} font-black flex-1 text-center` },
        `${player.name}(積分${player.points || 0}分)`
      ),
      React.createElement('span', { className: `${forceUniform ? 'absolute top-3 right-4 text-sm' : 'text-[9px]'} font-black bg-black/30 px-2 py-0.5 rounded uppercase text-white` }, player.primaryPosition)
    );
  }

  return React.createElement('div', {
    onClick,
    className: `relative flex flex-col p-4 rounded-2xl border-2 transition-all ${onClick ? 'cursor-pointer' : ''} active:scale-95 bg-gradient-to-br ${rarity} border-white/10 card-shadow ${selected ? 'ring-4 ring-cyan-400 border-white' : ''} ${!player.willAttend ? 'opacity-40' : ''}`
  },
    // 🆕 刪除按鈕（參考 HTML 樣式）
    onDelete && React.createElement('button', {
      onClick: handleDeleteClick,
      className: 'absolute -top-1 -right-1 bg-red-600 w-8 h-8 rounded-full text-white font-black text-lg shadow-xl z-30 transition-all active:scale-90 flex items-center justify-center cursor-pointer border-2 border-white'
    }, '×'),

    React.createElement('div', { className: 'flex justify-between items-start mb-2 relative z-10' },
      React.createElement('div', { className: 'flex flex-col' },
        React.createElement('span', { className: 'text-[10px] font-black uppercase opacity-70 text-slate-900' }, `No.${player.number}`),
        React.createElement('h3', { className: 'text-lg font-black drop-shadow-md leading-tight text-slate-900' },
          `${player.name}(積分${player.points || 0}分)`
        )
      ),
      React.createElement('div', { className: 'flex items-center gap-2 flex-col' },
        React.createElement('div', { className: 'bg-black/30 px-2 py-1 rounded-lg font-black text-[11px] text-white' }, player.primaryPosition),
        // 🆕 出席勾選框
        showAttendanceToggle && React.createElement('div', {
          onClick: handleToggleClick,
          className: 'mt-1 flex items-center justify-center'
        },
          React.createElement('input', {
            type: 'checkbox',
            checked: player.willAttend,
            onChange: () => { }, // 由 parent div click 處理
            className: 'w-5 h-5 rounded border-2 border-black/30 text-cyan-600 focus:ring-cyan-500 cursor-pointer'
          })
        )
      )
    ),
    showSecondary && player.secondaryPositions && player.secondaryPositions.length > 0 &&
    React.createElement('div', { className: 'flex flex-wrap gap-1 mb-3 relative z-10' },
      player.secondaryPositions.map(pos =>
        React.createElement('span', {
          key: pos,
          className: 'text-[8px] bg-white/30 px-2 py-0.5 rounded font-bold uppercase text-slate-900'
        }, pos)
      )
    ),
    showGrades &&
    React.createElement('div', { className: 'grid grid-cols-2 gap-x-2 gap-y-1 mt-auto' },
      STAT_NAMES.map(stat =>
        React.createElement(GradeBar, {
          key: stat,
          label: STAT_LABELS[stat],
          grade: player.grades[stat]
        })
      )
    )
  );
};
