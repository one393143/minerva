/**
 * 球員名單頁面 - 加入積分更新功能
 */

import { PlayerCard } from '../components/PlayerCard.js';

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
  onUpdatePoints  // 新增
}) => {
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

        // 🆕 更新積分按鈕
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
        }, '🗑️ 刪除全部')
      )
    ),

    // Player Cards
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
      players.length > 0 ? players.map(player =>
        React.createElement(PlayerCard, {
          key: player.id,
          player,
          onEdit: () => onEditPlayer(player),
          onDelete: () => onDeletePlayer(player.id)
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
