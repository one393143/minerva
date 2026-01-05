/**
 * 球員名冊頁面
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
  onDeleteAll
}) => {
  return React.createElement('div', { className: 'animate-slide-up space-y-6' },
    // Control Panel
    React.createElement('div', {
      className: 'bg-slate-900 p-6 rounded-3xl border border-white/10 grid grid-cols-2 gap-3 shadow-xl'
    },
      React.createElement('button', {
        onClick: onAddPlayer,
        className: 'col-span-2 bg-cyan-600 py-4 rounded-2xl text-sm font-black shadow-lg uppercase tracking-widest btn-primary'
      }, '＋ Add New Player'),
      
      React.createElement('button', {
        onClick: onUploadPlayers,
        className: 'col-span-2 bg-purple-600 py-4 rounded-2xl text-sm font-black shadow-lg uppercase tracking-widest btn-primary'
      }, '📤 上傳球員名單到雲端'),
      
      React.createElement('button', {
        onClick: onExportExcel,
        className: 'bg-slate-800 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md'
      }, '📥 Export'),
      
      React.createElement('label', {
        className: 'bg-slate-800 py-3.5 rounded-2xl text-[11px] font-black text-center cursor-pointer uppercase tracking-widest shadow-md'
      },
        '📤 Import',
        React.createElement('input', {
          type: 'file',
          className: 'hidden',
          accept: '.xlsx,.xls',
          onChange: onImportExcel
        })
      ),
      
      React.createElement('button', {
        onClick: () => onToggleAllAttendance(true),
        className: 'bg-emerald-800 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md'
      }, '✅ 全部出席'),
      
      React.createElement('button', {
        onClick: () => onToggleAllAttendance(false),
        className: 'bg-orange-800 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md'
      }, '❌ 全不出席'),
      
      React.createElement('button', {
        onClick: onDeleteAll,
        className: 'col-span-2 bg-red-900 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-md'
      }, '🗑️ 刪除全部')
    ),

    // Players Grid
    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' },
      players.map(p =>
        React.createElement('div', { key: p.id, className: 'relative group' },
          React.createElement('div', {
            onClick: () => onEditPlayer(p),
            className: 'cursor-pointer'
          },
            React.createElement(PlayerCard, { player: p })
          ),
          
          React.createElement('button', {
            onClick: (e) => {
              e.stopPropagation();
              onDeletePlayer(p.id);
            },
            className: 'absolute -top-1 -right-1 bg-red-600 w-8 h-8 rounded-full text-white font-black text-lg shadow-xl z-30 transition-all active:scale-90 flex items-center justify-center cursor-pointer border-2 border-white'
          }, '×')
        )
      )
    )
  );
};
