/**
 * 自動排陣設定 Modal
 */

export const AutoOptimizeModal = ({ mode, players, onConfirm, onClose }) => {
  if (!mode) return null;

  const availablePlayers = players.filter(p => p.willAttend);
  const pitchers = availablePlayers.filter(p => 
    p.primaryPosition === 'P' || p.secondaryPositions?.includes('P')
  );

  const [selectedPitcher, setSelectedPitcher] = React.useState(pitchers[0]?.id || '');
  const [dhCount, setDhCount] = React.useState(1);

  const handleConfirm = () => {
    if (!selectedPitcher) {
      alert('請選擇先發投手');
      return;
    }
    onConfirm(selectedPitcher, dhCount);
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop modal-enter'
  },
    React.createElement('div', {
      className: 'bg-slate-900 w-full max-w-md rounded-3xl border-2 border-white/10 p-6 shadow-2xl'
    },
      React.createElement('h3', {
        className: 'text-xl font-black mb-6 text-center text-cyan-400'
      }, `${mode} - 設定`),

      React.createElement('div', { className: 'space-y-6' },
        // 選擇先發投手
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

        // 選擇 DH 數量
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

        // 說明文字
        React.createElement('div', {
          className: 'bg-slate-800/50 rounded-xl p-3 text-xs text-slate-400'
        },
          React.createElement('p', { className: 'font-bold mb-1' }, '💡 提示：'),
          React.createElement('p', null, `• 先發投手將被排在 P 位置`),
          React.createElement('p', null, `• DH 數量決定 DH1~DH${dhCount || 0} 的配置`),
          React.createElement('p', null, `• 其他位置將依據「${mode}」規則自動排列`)
        )
      ),

      // Actions
      React.createElement('div', { className: 'flex gap-3 mt-6' },
        React.createElement('button', {
          onClick: onClose,
          className: 'flex-1 py-3 rounded-2xl bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest'
        }, 'Cancel'),
        
        React.createElement('button', {
          onClick: handleConfirm,
          className: 'flex-1 py-3 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg'
        }, 'Confirm')
      )
    )
  );
};
