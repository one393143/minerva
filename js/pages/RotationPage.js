/**
 * 輪替管理頁面
 */

export const RotationPage = ({
  rotations,
  players,
  pitcherBats,
  onAddRotation,
  onDuplicateRotation,
  onDeleteRotation,
  onUpdateRotationName,
  onEditSlot
}) => {
  const availablePlayers = players.filter(p => p.willAttend);

  const getPrevRotation = (idx) => idx > 0 ? rotations[idx - 1] : null;

  return React.createElement('div', { className: 'animate-slide-up space-y-6' },
    // Control Panel
    React.createElement('div', {
      className: 'bg-slate-900 p-5 rounded-3xl border border-white/10 flex justify-between items-center shadow-xl'
    },
      React.createElement('h2', {
        className: 'font-black italic text-cyan-400 uppercase tracking-widest text-sm'
      }, 'Rotation Management'),
      
      React.createElement('button', {
        onClick: onAddRotation,
        className: 'text-[10px] font-black bg-emerald-700/50 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30 btn-primary shadow-lg'
      }, '＋ 新增陣容')
    ),

    // Rotations List
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('div', { className: 'flex gap-2 pb-4', style: { minWidth: 'max-content' } },
        rotations.map((rot, idx) => {
          const prevRot = getPrevRotation(idx);
          const rotBench = availablePlayers.filter(p => !Object.values(rot.lineup).includes(p.id));

          return React.createElement('div', {
            key: rot.id,
            className: 'bg-slate-900/60 rounded-2xl border border-white/10 p-2.5 w-32 flex-shrink-0'
          },
            // Header
            React.createElement('div', { className: 'flex justify-between items-center mb-2' },
              React.createElement('input', {
                value: rot.name,
                onChange: (e) => onUpdateRotationName(rot.id, e.target.value),
                className: 'bg-transparent font-black text-[10px] text-cyan-400 outline-none border-b border-cyan-800 px-1 w-16'
              }),
              
              React.createElement('div', { className: 'flex gap-0.5' },
                React.createElement('button', {
                  onClick: () => onDuplicateRotation(rot),
                  className: 'text-[9px] p-0.5 bg-slate-800 rounded'
                }, '📋'),
                
                React.createElement('button', {
                  onClick: () => onDeleteRotation(rot.id),
                  className: 'text-[9px] p-0.5 bg-red-900/50 rounded'
                }, '🗑️')
              )
            ),

            // Batting Order
            React.createElement('div', { className: 'space-y-0.5 mb-2' },
              rot.battingOrder.map((item, bidx) => {
                const player = availablePlayers.find(x => x.id === item.playerId);
                const prevItem = prevRot?.battingOrder[bidx];
                const playerChanged = prevItem && prevItem.playerId !== item.playerId;
                const posChanged = prevItem && prevItem.position !== item.position;
                const changed = playerChanged || posChanged;
                const displayPos = item.position.match(/^DH/) ? 'DH' : item.position;

                return React.createElement('div', {
                  key: bidx,
                  onClick: () => onEditSlot({
                    rotId: rot.id,
                    slotIdx: bidx,
                    currentPlayerId: item.playerId,
                    currentPosition: item.position,
                    rotation: rot,
                    isPitcher: false
                  }),
                  className: `text-[10px] p-1 rounded flex items-center cursor-pointer hover:bg-slate-700/50 ${changed ? 'bg-yellow-600/50 border border-yellow-500/70' : 'bg-slate-800/50'}`
                },
                  React.createElement('span', { className: 'font-bold text-slate-400 text-[9px] w-3' }, bidx + 1),
                  React.createElement('span', { className: 'font-black flex-1 ml-1 truncate text-[10px]' }, 
                    player?.name || '?'
                  ),
                  React.createElement('span', { className: 'text-[8px] font-bold text-slate-500' }, displayPos)
                );
              }),

              // Pitcher (if not batting)
              !pitcherBats && React.createElement(React.Fragment, null,
                React.createElement('div', { className: 'border-t border-slate-700 my-1' }),
                
                Object.entries(rot.lineup)
                  .filter(([pos, pid]) => pos === 'P' && pid)
                  .map(([pos, pid]) => {
                    const player = availablePlayers.find(x => x.id === pid);
                    const prevP = prevRot?.lineup?.P;
                    const changed = prevP && prevP !== pid;

                    return React.createElement('div', {
                      key: pos,
                      onClick: () => onEditSlot({
                        rotId: rot.id,
                        currentPlayerId: pid,
                        rotation: rot,
                        isPitcher: true
                      }),
                      className: `text-[10px] p-1 rounded flex items-center cursor-pointer hover:bg-slate-700/50 ${changed ? 'bg-yellow-600/50 border border-yellow-500/70' : 'bg-slate-800/50'}`
                    },
                      React.createElement('span', { className: 'font-black flex-1 truncate text-[10px]' }, 
                        player?.name || '?'
                      ),
                      React.createElement('span', { className: 'text-[8px] font-bold text-slate-500' }, pos)
                    );
                  })
              )
            ),

            // Bench
            React.createElement('div', { className: 'border-t border-slate-700 pt-1.5' },
              React.createElement('h4', { className: 'text-[7px] font-black text-slate-600 uppercase mb-1' }, 'Bench'),
              
              React.createElement('div', { className: 'space-y-0.5' },
                rotBench.slice(0, 3).map(p =>
                  React.createElement('div', {
                    key: p.id,
                    className: 'text-[8px] p-0.5 bg-slate-950/50 rounded text-slate-400 truncate'
                  }, p.name)
                ),
                rotBench.length > 3 && React.createElement('div', {
                  className: 'text-[7px] text-slate-600'
                }, `+${rotBench.length - 3}`)
              )
            )
          );
        })
      )
    )
  );
};
