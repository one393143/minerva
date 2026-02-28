/**
 * Header 元件
 */

import { getUserIcon } from '../services/user-service.js';
import { formatDateTime } from '../utils/helpers.js';

export const Header = ({ currentUser, cloudPlayers, onLogout, onReload }) => {
  return React.createElement('header', {
    className: 'sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-white/10 p-5 shadow-lg'
  },
    React.createElement('div', { className: 'flex justify-between items-center' },
      React.createElement('h1', {
        className: 'text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-600 uppercase'
      }, 'Pro Manager'),
      React.createElement('div', { className: 'flex items-center gap-3' },
        React.createElement('div', {
          className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-black user-badge-${currentUser}`
        },
          React.createElement('span', null, getUserIcon(currentUser)),
          React.createElement('span', null, currentUser)
        ),
        React.createElement('button', {
          onClick: onLogout,
          className: 'text-xs text-slate-500 hover:text-slate-300 font-bold'
        }, '登出')
      )
    ),
    cloudPlayers &&
    React.createElement('div', { className: 'mt-2 text-xs text-slate-500 flex items-center gap-2' },
      React.createElement('span', null,
        `最後更新：${cloudPlayers.lastUpdatedBy} (${formatDateTime(cloudPlayers.lastUpdatedAt)})`
      ),
      React.createElement('button', {
        onClick: onReload,
        className: 'text-cyan-400 hover:text-cyan-300 font-bold'
      }, '🔄 重新載入')
    )
  );
};
