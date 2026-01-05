/**
 * 底部導航元件
 */

const NAV_ITEMS = [
  { id: 'field', icon: '🏟️', label: 'Field' },
  { id: 'batting', icon: '⚡', label: 'Lineup' },
  { id: 'rotation', icon: '🔄', label: 'Rotation' },
  { id: 'roster', icon: '📇', label: 'Roster' }
];

export const Navigation = ({ activeTab, onTabChange }) => {
  return React.createElement('nav', {
    className: 'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-24 px-4 pb-6 pt-2 z-40'
  },
    NAV_ITEMS.map(item =>
      React.createElement('button', {
        key: item.id,
        onClick: () => onTabChange(item.id),
        className: `flex-1 flex flex-col items-center gap-2 transition-all ${activeTab === item.id ? 'text-cyan-400 scale-110 font-black' : 'text-slate-500 opacity-60'}`
      },
        React.createElement('span', { className: 'text-2xl' }, item.icon),
        React.createElement('span', { className: 'text-[10px] font-black uppercase tracking-widest' }, item.label)
      )
    )
  );
};
