/**
 * 快速出席勾選清單 Modal
 */
export const AttendanceChecklistModal = ({ players, onToggleAttendance, onToggleAll, onClose }) => {
    return React.createElement('div', {
        className: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
    },
        // 主視窗
        React.createElement('div', {
            className: 'bg-slate-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border-2 border-white/20 shadow-2xl flex flex-col overflow-hidden animate-zoom-in'
        },
            // Header
            React.createElement('div', { className: 'px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-800/80' },
                React.createElement('div', null,
                    React.createElement('h3', { className: 'text-lg font-black text-cyan-400 italic uppercase' }, 'Quick Attendance Checklist'),
                    React.createElement('p', { className: 'text-slate-500 text-[10px] font-bold' }, `共 ${players.length} 位球員`)
                ),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all'
                }, '✕')
            ),

            // Quick Actions
            React.createElement('div', { className: 'p-3 bg-slate-950/30 border-b border-white/10 flex gap-2' },
                React.createElement('button', {
                    onClick: () => onToggleAll(true),
                    className: 'flex-1 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 hover:bg-emerald-600/30 transition-all'
                }, '✅ 全部出席'),
                React.createElement('button', {
                    onClick: () => onToggleAll(false),
                    className: 'flex-1 py-2 rounded-lg bg-red-600/20 text-red-400 text-[10px] font-black border border-red-500/30 hover:bg-red-600/30 transition-all'
                }, '❌ 全部缺席')
            ),

            // Player List
            React.createElement('div', { className: 'flex-1 overflow-y-auto p-3' },
                React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5' },
                    players.map(player =>
                        React.createElement('div', {
                            key: player.id,
                            className: `flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer active:scale-[0.95] ${player.willAttend ? 'bg-blue-600/40 border-blue-400/50 text-white' : 'bg-slate-800/30 border-white/5 text-slate-500'}`,
                            onClick: () => onToggleAttendance(player.id)
                        },
                            // Number
                            React.createElement('div', { className: 'w-6 h-6 shrink-0 rounded bg-black/40 flex items-center justify-center text-[9px] font-black' },
                                player.number
                            ),
                            // Name
                            React.createElement('div', { className: 'flex-1 font-bold text-xs truncate' }, player.name),
                            // Tiny Checkbox
                            React.createElement('div', {
                                className: `w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-all ${player.willAttend ? 'bg-blue-500 border-white shadow-sm' : 'bg-transparent border-white/20'}`
                            },
                                player.willAttend && React.createElement('span', { className: 'text-[8px] text-white font-black' }, '✓')
                            )
                        )
                    )
                )
            ),

            // Footer
            React.createElement('div', { className: 'p-6 bg-slate-950/50 border-t border-white/10' },
                React.createElement('button', {
                    onClick: onClose,
                    className: 'w-full py-4 rounded-2xl bg-slate-800 text-white font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-slate-700 transition-all'
                }, '完成設定')
            )
        )
    );
};
