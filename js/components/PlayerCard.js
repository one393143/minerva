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
  selected = false, 
  showGrades = true, 
  compact = false, 
  showSecondary = true 
}) => {
  if (!player) return null;
  
  const rarity = getCardRarity(player.grades);

  // 刪除按鈕點擊處理
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // 阻止事件冒泡到卡片
    if (onDelete) {
      onDelete(player.id);
    }
  };

  if (compact) {
    return React.createElement('div', {
      onClick,
      className: `p-3 rounded-xl border-2 flex items-center gap-3 ${onClick ? 'cursor-pointer' : ''} transition-all active:scale-95 bg-gradient-to-br ${rarity} shadow-md border-white/10 ${!player.willAttend ? 'opacity-40' : ''}`
    },
      React.createElement('span', { className: 'text-[10px] font-black opacity-60' }, `#${player.number}`),
      React.createElement('span', { className: 'text-sm font-black truncate flex-1 text-slate-900' }, player.name),
      React.createElement('span', { className: 'text-[9px] font-black bg-black/30 px-2 py-0.5 rounded uppercase text-white' }, player.primaryPosition)
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
        React.createElement('h3', { className: 'text-lg font-black drop-shadow-md leading-tight text-slate-900' }, player.name)
      ),
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'bg-black/30 px-2 py-1 rounded-lg font-black text-[11px] text-white' }, player.primaryPosition)
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
