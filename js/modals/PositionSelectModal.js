/**
 * 位置選擇 Modal
 */

import { PlayerCard } from '../components/PlayerCard.js';

export const PositionSelectModal = ({
  position,
  lineup,
  sortedPlayers,
  onSelect,
  onClear,
  onClose
}) => {
  if (!position) return null;

  return React.createElement('div', {
    /* 修正：統一改用 flex justify-center + my-auto 避免上方被切掉 */
    className: 'fixed inset-0 z-50 flex justify-center p-0 sm:p-4 modal-backdrop overflow-y-auto modal-enter'
  },
    React.createElement('div', {
      className: 'bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border-t-2 sm:border-2 border-white/10 p-8 shadow-2xl my-auto'
    },
      React.createElement('div', { className: 'flex justify-between items-center mb-8' },
        React.createElement('h3', {
          className: 'font-black text-2xl uppercase tracking-widest text-white'
        },
          'Select ',
          React.createElement('span', { className: 'text-cyan-400' }, position)
        ),

        React.createElement('button', {
          onClick: onClose,
          className: 'text-4xl font-black text-slate-600'
        }, '×')
      ),

      React.createElement('div', { className: 'space-y-4 pb-12' },
        sortedPlayers.length > 0 ? sortedPlayers.map(p =>
          React.createElement(PlayerCard, {
            key: p.id,
            player: p,
            selected: lineup[position] === p.id,
            onClick: () => onSelect(p.id)
          })
        ) : React.createElement('p', {
          className: 'text-center py-24 text-slate-700 font-black italic uppercase tracking-widest'
        }, 'No available players'),

        React.createElement('button', {
          onClick: onClear,
          className: 'w-full py-5 rounded-3xl bg-slate-800/80 text-red-500 font-black mt-6 uppercase tracking-widest shadow-lg'
        }, 'Clear Position')
      )
    )
  );
};
