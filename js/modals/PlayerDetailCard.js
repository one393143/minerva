/**
 * 球員詳細資料卡片 Modal
 * 唯讀模式，顯示完整球員資訊
 */

import { STAT_LABELS } from '../utils/constants.js';
import { getCardRarity, getGradeColor } from '../utils/helpers.js';

export const PlayerDetailCard = ({ player, onClose, onEdit }) => {
    if (!player) return null;

    const rarityColor = getCardRarity(player.grades);

    return React.createElement('div', {
        className: 'fixed inset-0 z-50 flex justify-center p-4 modal-backdrop overflow-y-auto modal-enter'
    },
        React.createElement('div', {
            className: 'my-auto relative' // Container for centering
        },
            // Card Structure based on user request
            React.createElement('div', {
                className: `w-72 relative flex flex-col p-4 rounded-2xl border-2 transition-all cursor-pointer bg-gradient-to-br ${rarityColor} border-white/10 card-shadow`
            },
                // Close Button
                React.createElement('button', {
                    onClick: onClose,
                    className: 'absolute -top-3 -right-3 bg-red-600 w-8 h-8 rounded-full text-white font-black text-lg shadow-xl z-30 transition-all active:scale-90 flex items-center justify-center cursor-pointer border-2 border-white focus:outline-none'
                    // Using -top-3 -right-3 to match style roughly but ensuring clickability
                }, '×'),

                // Header: No + Name + Position
                React.createElement('div', { className: 'flex justify-between items-start mb-2 relative z-10' },
                    React.createElement('div', { className: 'flex flex-col' },
                        React.createElement('span', { className: 'text-[10px] font-black uppercase opacity-70 text-slate-900' },
                            `No.${player.number || '?'}`
                        ),
                        React.createElement('h3', { className: 'text-xl font-black drop-shadow-md leading-tight text-slate-900' },
                            player.name
                        )
                    ),
                    React.createElement('div', { className: 'flex items-center gap-2' },
                        React.createElement('div', { className: 'bg-black/30 px-2 py-1 rounded-lg font-black text-[11px] text-white' },
                            player.primaryPosition
                        )
                    )
                ),

                // Secondary Positions
                React.createElement('div', { className: 'flex flex-wrap gap-1 mb-3 relative z-10 min-h-[16px]' },
                    (player.secondaryPositions || []).map(pos =>
                        React.createElement('span', {
                            key: pos,
                            className: 'text-[8px] bg-white/30 px-2 py-0.5 rounded font-bold uppercase text-slate-900'
                        }, pos)
                    )
                ),

                // Stats Grid
                React.createElement('div', { className: 'grid grid-cols-2 gap-x-2 gap-y-1 mt-auto' },
                    Object.entries(player.grades).map(([key, grade]) =>
                        React.createElement('div', { key: key, className: 'flex items-center gap-2' },
                            React.createElement('span', { className: 'text-[10px] font-black text-white/70 w-8' }, // Slight font size bump
                                STAT_LABELS[key]
                            ),
                            React.createElement('div', {
                                className: `px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r text-slate-900 w-8 text-center ${getGradeColor(grade)}`
                            }, grade)
                        )
                    )
                ),

                // Edit Mode Button (Optional, discreet)
                onEdit && React.createElement('button', {
                    onClick: onEdit,
                    className: 'mt-4 w-full py-2 bg-black/20 hover:bg-black/30 rounded-lg text-white/50 text-[10px] font-black uppercase tracking-widest transition-colors'
                }, 'Edit Profile')
            )
        )
    );
};
