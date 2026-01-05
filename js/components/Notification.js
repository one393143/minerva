/**
 * 通知元件
 */

export const Notification = ({ message, onClose }) => {
  if (!message) return null;

  return React.createElement('div', { className: 'notification' },
    React.createElement('div', {
      className: 'bg-emerald-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl'
    },
      React.createElement('p', { className: 'text-white font-bold text-sm' }, message)
    )
  );
};
