/**
 * 球員編輯 Modal - 最終優化版
 */

import { POSITION_OPTIONS, GRADE_OPTIONS, STAT_NAMES, STAT_LABELS } from '../utils/constants.js';

export const PlayerEditModal = ({ player, onSave, onClose }) => {
  if (!player) return null;

  const [editData, setEditData] = React.useState({
    ...player,
    primaryPosition: player.primaryPosition || 'P'
  });

  const handleSave = () => {
    if (!editData.name || !editData.name.trim()) {
      alert('請輸入球員姓名');
      return;
    }
    onSave(editData);
  };

  const toggleSecondaryPosition = (pos) => {
    const current = editData.secondaryPositions || [];
    const updated = current.includes(pos)
      ? current.filter(x => x !== pos)
      : [...current, pos];
    setEditData({ ...editData, secondaryPositions: updated });
  };

  return React.createElement('div', {
    /* 
       修正：移除 items-center，改用 my-auto 來達成垂直置中且保留捲動功能 
       這樣當內容比螢幕長時，上方不會被切掉
    */
    className: 'fixed inset-0 z-50 flex justify-center p-4 modal-backdrop overflow-y-auto modal-enter'
  },
    React.createElement('div', {
      className: 'bg-slate-900 w-full max-w-md rounded-3xl border-2 border-white/10 p-6 shadow-2xl my-auto'
    },
      React.createElement('h3', {
        className: 'text-xl font-black mb-6 text-center italic uppercase tracking-tighter text-cyan-400'
      }, 'Player Profile'),

      React.createElement('div', { className: 'space-y-4' },
        // Name
        React.createElement('div', { className: 'space-y-1' },
          React.createElement('label', {
            className: 'text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1'
          }, 'Name'),
          React.createElement('input', {
            value: editData.name || '',
            onChange: (e) => setEditData({ ...editData, name: e.target.value }),
            className: 'w-full bg-slate-800 rounded-2xl px-4 py-2.5 text-white font-black outline-none border border-white/5 focus:border-cyan-500 transition-all shadow-inner',
            placeholder: 'Enter name'
          })
        ),

        // Number & Primary Position
        React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
          React.createElement('div', { className: 'space-y-1' },
            React.createElement('label', {
              className: 'text-[10px] font-black text-cyan-500 uppercase ml-1'
            }, '# Number'),
            React.createElement('input', {
              value: editData.number || '',
              onChange: (e) => setEditData({ ...editData, number: e.target.value }),
              className: 'w-full bg-slate-800 rounded-2xl px-4 py-2.5 font-black outline-none border border-white/5 shadow-inner'
            })
          ),
          React.createElement('div', { className: 'space-y-1' },
            React.createElement('label', {
              className: 'text-[10px] font-black text-cyan-500 uppercase ml-1'
            }, 'Primary Pos'),
            React.createElement('select', {
              value: editData.primaryPosition || 'P',
              onChange: (e) => setEditData({ ...editData, primaryPosition: e.target.value }),
              className: 'w-full bg-slate-800 rounded-2xl px-4 py-2.5 font-black outline-none border border-white/5 shadow-inner appearance-none'
            },
              POSITION_OPTIONS.map(p =>
                React.createElement('option', { key: p, value: p }, p)
              )
            )
          )
        ),

        // Attendance & Points
        React.createElement('div', { className: 'grid grid-cols-2 gap-3' },
          React.createElement('div', {
            onClick: () => setEditData({ ...editData, willAttend: !editData.willAttend }),
            className: `p-2.5 rounded-xl cursor-pointer border-2 flex items-center justify-center ${editData.willAttend ? 'bg-emerald-900/30 border-emerald-500' : 'bg-slate-800 border-slate-700'}`
          },
            React.createElement('span', { className: 'text-xs font-black' },
              editData.willAttend ? '✅ 會到場' : '❌ 不到場'
            )
          ),
          React.createElement('div', { className: 'space-y-1' },
            React.createElement('label', {
              className: 'text-[10px] font-black text-cyan-500 uppercase ml-1'
            }, '積分'),
            React.createElement('input', {
              type: 'number',
              value: editData.points ?? 0,
              onChange: (e) => setEditData({ ...editData, points: parseInt(e.target.value) || 0 }),
              className: 'w-full bg-slate-800 rounded-2xl px-4 py-2.5 font-black outline-none border border-white/5 shadow-inner'
            })
          )
        ),

        // Secondary Positions
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('label', {
            className: 'text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1'
          }, 'Secondary Position'),
          React.createElement('div', { className: 'grid grid-cols-5 gap-1.5' },
            POSITION_OPTIONS.map(pos => {
              const isSelected = editData.secondaryPositions?.includes(pos);
              return React.createElement('button', {
                key: pos,
                onClick: () => toggleSecondaryPosition(pos),
                className: `text-[9px] font-black py-1.5 rounded-lg border transition-all ${isSelected ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg' : 'bg-slate-800 border-slate-700 opacity-40 text-slate-500'}`
              }, pos);
            })
          )
        ),

        // Grades (2x4 grid)
        React.createElement('div', { className: 'space-y-2 border-t border-white/10 pt-4' },
          React.createElement('label', {
            className: 'text-[10px] font-black text-cyan-500 uppercase tracking-widest ml-1'
          }, 'Grades'),
          React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
            STAT_NAMES.map(stat =>
              React.createElement('div', { key: stat, className: 'flex items-center gap-2' },
                React.createElement('label', {
                  className: 'text-[9px] font-black text-slate-400 uppercase w-12 flex-shrink-0'
                }, STAT_LABELS[stat]),
                React.createElement('select', {
                  value: editData.grades?.[stat] || 'C',
                  onChange: (e) => setEditData({
                    ...editData,
                    grades: { ...(editData.grades || {}), [stat]: e.target.value }
                  }),
                  className: 'flex-1 bg-slate-800 rounded-lg px-2 py-1.5 font-black outline-none border border-white/5 text-xs'
                },
                  GRADE_OPTIONS.map(g =>
                    React.createElement('option', { key: g, value: g }, g)
                  )
                )
              )
            )
          )
        )
      ),

      // Actions
      React.createElement('div', { className: 'flex gap-3 mt-6' },
        React.createElement('button', {
          onClick: onClose,
          className: 'flex-1 py-3 rounded-2xl bg-slate-800 text-slate-500 font-black text-xs uppercase tracking-widest active:bg-slate-700 transition-all'
        }, 'Cancel'),

        React.createElement('button', {
          onClick: handleSave,
          className: 'flex-1 py-3 rounded-2xl bg-cyan-600 text-white font-black text-xs uppercase tracking-widest active:bg-cyan-700 transition-all shadow-lg'
        }, 'Save')
      )
    )
  );
};
