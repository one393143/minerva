/**
 * 守備配置頁面 - 整合自動排陣設定
 */

import { ALL_POSITIONS, FIELD_POSITIONS } from '../utils/constants.js';
import { PlayerCard } from '../components/PlayerCard.js';

export const FieldPage = ({ 
  lineup, 
  players, 
  bench,
  onPositionClick,
  onAutoOptimize,
  onUploadLineup,
  onLoadLineupHistory
}) => {
  const [showOptimizeModal, setShowOptimizeModal] = React.useState(null);
  const availablePlayers = players.filter(p => p.willAttend);

  const handleOptimizeClick = (mode) => {
    setShowOptimizeModal(mode);
  };

  const handleOptimizeConfirm = (pitcherId, dhCount) => {
    onAutoOptimize(showOptimizeModal, pitcherId, dhCount);
    setShowOptimizeModal(null);
  };

  const renderFieldSlot = (pos, top, left) => {
    const player = availablePlayers.find(x => x.id === lineup[pos]);
    
    return React.createElement('div', {
      key: pos,
      onClick: () => onPositionClick(pos),
      className: 'absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer',
      style: { top, left }
    },
      React.createElement('div', {
        className: `w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex flex-col items-center justify-center transition-all ${player ? 'bg-slate-900 border-yellow-400 scale-110 shadow-lg' : 'bg-black/30 border-white/20'}`
      },
        React.createElement('span', { className: 'text-[10px] font-black opacity-50' }, pos),
        React.createElement('span', { className: 'text-[11px] font-bold truncate px-1 text-white' }, 
          player ? player.name : '+'
        )
      )
    );
  };

  return React.createElement('div', { className: 'animate-slide-up space-y-8' },
    // Control Panel
    React.createElement('div', { className: 'bg-slate-900 p-4 rounded-3xl border border-white/10 shadow-xl' },
      React.createElement('h2', {
        className: 'font-black italic text-cyan-400 uppercase tracking-widest text-sm mb-3'
      }, 'Defense Setup'),
      
      React.createElement('div', { className: 'flex gap-2 flex-wrap mb-4' },
        ['積分優先', '守備最佳化', '打擊最大化', '平衡模式'].map(mode =>
          React.createElement('button', {
            key: mode,
            onClick: () => handleOptimizeClick(mode),
            className: 'text-[10px] font-black bg-purple-700/50 text-purple-400 px-4 py-2 rounded-full border border-purple-500/30 btn-primary shadow-lg'
          }, mode)
        )
      ),
      
      React.createElement('div', { className: 'flex gap-2' },
        React.createElement('button', {
          onClick: onUploadLineup,
          className: 'text-[10px] font-black bg-emerald-700/50 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 btn-primary shadow-lg'
        }, '📤 上傳陣容'),
        
        React.createElement('button', {
          onClick: onLoadLineupHistory,
          className: 'text-[10px] font-black bg-indigo-700/50 text-indigo-400 px-4 py-2 rounded-full border border-indigo-500/30 btn-primary shadow-lg'
        }, '📥 載入陣容')
      )
    ),

    // Baseball Field
    React.createElement('div', { className: 'baseball-field relative overflow-hidden card-shadow mx-auto max-w-[450px]' },
      React.createElement('div', { className: 'diamond-inner' }),
      FIELD_POSITIONS.map(({ pos, top, left }) => renderFieldSlot(pos, top, left))
    ),

    // DH Positions
    React.createElement('div', { className: 'grid grid-cols-3 gap-3' },
      ['DH1', 'DH2', 'DH3'].map(dh => {
        const player = availablePlayers.find(x => x.id === lineup[dh]);
        return React.createElement('div', {
          key: dh,
          onClick: () => onPositionClick(dh),
          className: `p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${lineup[dh] ? 'bg-indigo-900/80 border-indigo-400 shadow-md' : 'bg-slate-900 border-slate-800 opacity-60'}`
        },
          React.createElement('span', { className: 'text-[10px] text-white/40 font-black mb-1 uppercase' }, dh),
          React.createElement('span', { className: 'text-sm font-black truncate text-white' }, 
            player?.name || '---'
          )
        );
      })
    ),

    // Bench
    React.createElement('div', { className: 'pt-6 border-t border-white/5' },
      React.createElement('h3', {
        className: 'text-[10px] font-black text-slate-500 mb-4 uppercase tracking-widest px-1'
      }, '板凳球員 (Bench)'),
      
      React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-3' },
        bench.length > 0 ? bench.map(p =>
          React.createElement(PlayerCard, { key: p.id, player: p, compact: true })
        ) : React.createElement('p', {
          className: 'col-span-full text-center text-xs text-slate-700 py-6 font-bold uppercase tracking-widest'
        }, 'Empty Bench')
      )
    ),

    // AutoOptimize Modal
    showOptimizeModal && React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop modal-enter'
    },
      React.createElement('div', {
        className: 'bg-slate-900 w-full max-w-md rounded-3xl border-2 border-white/10 p-6 shadow-2xl'
      },
        React.createElement('h3', {
          className: 'text-xl font-black mb-6 text-center text-cyan-400'
        }, `${showOptimizeModal} - 設定`),

        React.createElement('div', { className: 'space-y-6' },
          // 選擇先發投手
          (() => {
            const pitchers = availablePlayers.filter(p => 
              p.primaryPosition === 'P' || p.secondaryPositions?.includes('P')
            );
            const [selectedPitcher, setSelectedPitcher] = React.useState(pitchers[0]?.id || '');
            const [dhCount, setDhCount] = React.useState(1);

            return React.createElement(React.Fragment, null,
              React.createElement('div', { className: 'space-y-2' },
                React.createElement('label', {
                  className: 'text-xs font-black text-slate-400 uppercase'
                }, '先發投手 (Starting Pitcher)'),
                React.createElement('select', {
                  value: selectedPitcher,
                  onChange: (e) => setSelectedPitcher(e.target.value),
                  className: 'w-full bg-slate-800 rounded-2xl px-4 py-3 font-black outline-none border border-white/5 text-white'
                },
                  pitchers.length === 0 && React.createElement('option', { value: '' }, '無可用投手'),
                  pitchers.map(p =>
                    React.createElement('option', { key: p.id, value: p.id }, 
                      `${p.name} (#${p.number})`
                    )
                  )
                )
              ),

              React.createElement('div', { className: 'space-y-2' },
                React.createElement('label', {
                  className: 'text-xs font-black text-slate-400 uppercase'
                }, 'DH 數量 (Designated Hitters)'),
                React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
                  [0, 1, 2, 3].map(count =>
                    React.createElement('button', {
                      key: count,
                      onClick: () => setDhCount(count),
                      className: `py-3 rounded-xl font-black text-lg transition-all ${dhCount === count ? 'bg-cyan-600 text-white border-2 border-cyan-400 shadow-lg' : 'bg-slate-800 text-slate-500 border-2 border-slate-700'}`
                    }, count)
                  )
                )
              ),

              React.createElement('div', {
                className: 'bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400'
              },
                React.createElement('p', { className: 'font-bold mb-1' }, '💡 提示：'),
                React.createElement('p', null, `• 先發投手將被排在 P 位置`),
                React.createElement('p', null, `• DH 數量決定 DH1~DH${dhCount} 的配置`),
                React.createElement('p', null, `• 其他位置將依據「${showOptimizeModal}」規則自動排列`)
              ),

              React.createElement('div', { className: 'flex gap-3 mt-6' },
                React.createElement('button', {
                  onClick: () => setShowOptimizeModal(null),
                  className: 'flex-1 py-3 rounded-2xl bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest'
                }, 'Cancel'),
                
                React.createElement('button', {
                  onClick: () => {
                    if (!selectedPitcher) {
                      alert('請選擇先發投手');
                      return;
                    }
                    handleOptimizeConfirm(selectedPitcher, dhCount);
                  },
                  className: 'flex-1 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg'
                }, 'Confirm')
              )
            );
          })()
        )
      )
    )
  );
};
