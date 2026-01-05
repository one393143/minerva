/**
 * 陣容歷史 Modal
 */

import { formatDateTime } from '../utils/helpers.js';

export const LineupHistoryModal = ({ lineupHistory, onLoad, onClose }) => {
  if (!lineupHistory) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop modal-enter'
  },
    React.createElement('div', {
      className: 'bg-slate-900 w-full max-w-2xl rounded-3xl border-2 border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]'
    },
      React.createElement('h3', {
        className: 'text-lg font-black mb-4 text-cyan-400'
      }, '載入雲端陣容'),

      React.createElement('div', { className: 'space-y-2 max-h-96 overflow-y-auto' },
        lineupHistory.length > 0 ? lineupHistory.map(item =>
          React.createElement('div', {
            key: item.id,
            onClick: () => onLoad(item.id),
            className: 'p-4 rounded-xl cursor-pointer border-2 bg-slate-800 border-slate-700 hover:bg-cyan-900/30 hover:border-cyan-500 transition-all'
          },
            React.createElement('div', {
              className: 'font-black text-base text-white'
            }, item.name),
            React.createElement('div', {
              className: 'text-xs text-slate-500 mt-1'
            }, `by ${item.createdBy} • ${formatDateTime(item.createdAt)}`)
          )
        ) : React.createElement('p', {
          className: 'text-center py-12 text-slate-600 font-bold'
        }, '尚無陣容記錄')
      ),

      React.createElement('button', {
        onClick: onClose,
        className: 'w-full mt-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-black text-xs'
      }, '取消')
    )
  );
};
