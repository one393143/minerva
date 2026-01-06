/**
 * 打線配置頁面
 */

import { PlayerCard } from '../components/PlayerCard.js';

export const BattingPage = ({
  battingOrder,
  players,
  pitcherBats,
  battingSubstitutes,
  onPitcherBatsChange,
  onMoveUp,
  onMoveDown,
  onCopyLineup,
  onAutoOptimizeBatting,
  onPlayerClick // 🆕 接收 onPlayerClick
}) => {
  const availablePlayers = players.filter(p => p.willAttend);

  return React.createElement('div', { className: 'animate-slide-up space-y-6' },
    // Control Panel
    React.createElement('div', {
      className: 'bg-slate-900 p-5 rounded-3xl border border-white/10 flex justify-between items-center shadow-xl'
    },
      React.createElement('h2', {
        className: 'font-black italic text-cyan-400 uppercase tracking-widest text-sm'
      }, 'Lineup Builder'),

      React.createElement('div', { className: 'flex gap-4 items-center' },
        React.createElement('button', {
          onClick: onCopyLineup,
          className: 'text-[10px] font-black bg-indigo-700/50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 btn-primary shadow-lg'
        }, '📋 複製打序'),

        React.createElement('button', {
          onClick: onAutoOptimizeBatting,
          className: 'text-[10px] font-black bg-cyan-700/50 text-cyan-400 px-4 py-2 rounded-full border border-cyan-500/30 btn-primary shadow-lg'
        }, '🪄 自動最佳化'),

        React.createElement('label', {
          className: 'flex items-center gap-2 text-[11px] text-slate-400 font-black uppercase cursor-pointer'
        },
          React.createElement('input', {
            type: 'checkbox',
            checked: pitcherBats,
            onChange: (e) => onPitcherBatsChange(e.target.checked),
            className: 'accent-cyan-500'
          }),
          'P Bats'
        )
      )
    ),

    // Main Content
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
      // Batting Order
      React.createElement('div', { className: 'space-y-2' },
        battingOrder.length > 0 ? battingOrder.map((item, idx) => {
          const player = availablePlayers.find(p => p.id === item.playerId);
          const displayPos = item.position.match(/^DH/) ? 'DH' : item.position;

          return React.createElement('div', {
            key: idx,
            className: 'flex items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-white/5 shadow-md'
          },
            React.createElement('div', {
              className: 'w-9 h-9 flex items-center justify-center bg-slate-950 rounded-xl font-black text-cyan-400 border border-cyan-900/30 text-lg'
            }, idx + 1),

            React.createElement('div', {
              className: 'flex-1 cursor-pointer hover:opacity-80 transition-opacity', // 🆕 增加點擊樣式
              onClick: () => player && onPlayerClick(player) // 🆕 點擊顯示詳細資料
            },
              React.createElement('span', { className: 'font-black text-base text-white' },
                player?.name || '?'
              ),
              React.createElement('span', { className: 'text-[10px] text-slate-500 ml-3 uppercase font-black' },
                displayPos
              )
            ),

            React.createElement('div', { className: 'flex gap-2' },
              React.createElement('button', {
                onClick: () => onMoveUp(idx),
                disabled: idx === 0,
                className: 'p-3 bg-slate-800 rounded-xl active:bg-slate-700 disabled:opacity-30'
              }, '▲'),

              React.createElement('button', {
                onClick: () => onMoveDown(idx),
                disabled: idx === battingOrder.length - 1,
                className: 'p-3 bg-slate-800 rounded-xl active:bg-slate-700 disabled:opacity-30'
              }, '▼')
            )
          );
        }) : React.createElement('p', {
          className: 'text-center text-sm text-slate-700 py-16 font-black border-2 border-dashed border-slate-900 rounded-[2rem] uppercase tracking-widest'
        }, 'Build Lineup First')
      ),

      // Substitute Pool
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('h3', {
          className: 'text-[11px] font-black text-slate-500 uppercase tracking-widest px-1'
        }, 'Substitute Pool'),

        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-3' },
          battingSubstitutes.map(p =>
            React.createElement(PlayerCard, {
              key: p.id,
              player: p,
              compact: true,
              onClick: () => onPlayerClick(p) // 🆕 點擊顯示詳細資料
            })
          )
        )
      )
    )
  );
};
