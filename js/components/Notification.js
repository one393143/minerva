/**
 * 通知元件
 */

export const Notification = ({ message, onClose }) => {
  if (!message) return null;

  return React.createElement('div', {
    /* 修正：強制固定在視窗最上方，確保不管滾動到哪都能看到 */
    className: 'fixed top-4 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4'
  },
    React.createElement('div', {
      className: 'bg-emerald-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl animate-slide-up flex items-center gap-3 justify-center'
    },
      React.createElement('span', { className: 'text-2xl' }, '⚾'),
      React.createElement('p', { className: 'text-white font-black text-sm tracking-wide' }, message)
    )
  );
};
