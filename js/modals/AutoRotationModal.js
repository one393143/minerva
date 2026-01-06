/**
 * 自動輪替設定 Modal
 */

export const AutoRotationModal = ({
    players,
    currentRotation,
    onConfirm,
    onClose
}) => {
    const [substituteCount, setSubstituteCount] = React.useState(1);
    const [newPitcherId, setNewPitcherId] = React.useState(currentRotation.lineup.P);

    // 計算板凳人數 (最大可替換人數)
    // 不含投手
    const benchCount = players.filter(p =>
        p.willAttend &&
        !Object.values(currentRotation.lineup).includes(p.id)
    ).length;

    const handleConfirm = () => {
        onConfirm({
            substituteCount,
            newPitcherId: newPitcherId === currentRotation.lineup.P ? null : newPitcherId
        });
    };

    // 分組：場上野手 與 板凳球員 (供投手選擇)
    const fielders = players.filter(p =>
        Object.values(currentRotation.lineup).includes(p.id) &&
        p.id !== currentRotation.lineup.P
    );

    const bench = players.filter(p =>
        !Object.values(currentRotation.lineup).includes(p.id) &&
        p.willAttend
    );

    return React.createElement('div', {
        className: 'fixed inset-0 z-50 flex justify-center items-center modal-backdrop modal-enter p-4'
    },
        React.createElement('div', {
            className: 'bg-slate-900 w-full max-w-md rounded-3xl border-2 border-white/10 p-6 shadow-2xl space-y-6'
        },
            React.createElement('h3', {
                className: 'text-xl font-black text-cyan-400 uppercase tracking-widest text-center'
            }, '⚡ 自動輪替設定'),

            // 1. 選擇新投手
            React.createElement('div', { className: 'space-y-2' },
                React.createElement('label', { className: 'text-sm font-black text-slate-400' }, '指定新投手 (選填)'),
                React.createElement('select', {
                    value: newPitcherId,
                    onChange: (e) => setNewPitcherId(e.target.value),
                    className: 'w-full bg-slate-800 text-white rounded-xl p-3 border border-slate-600 outline-none focus:border-cyan-500'
                },
                    React.createElement('option', { value: currentRotation.lineup.P }, `不更換 (${players.find(p => p.id === currentRotation.lineup.P)?.name})`),

                    React.createElement('optgroup', { label: '場上野手' },
                        fielders.map(p =>
                            React.createElement('option', { key: p.id, value: p.id }, `${p.name} (${p.primaryPosition})`)
                        )
                    ),

                    React.createElement('optgroup', { label: '板凳球員' },
                        bench.map(p =>
                            React.createElement('option', { key: p.id, value: p.id }, `${p.name} (Pts: ${p.points})`)
                        )
                    )
                )
            ),

            // 2. 替換人數 Slider
            React.createElement('div', { className: 'space-y-4' },
                React.createElement('div', { className: 'flex justify-between items-end' },
                    React.createElement('label', { className: 'text-sm font-black text-slate-400' }, '替換人數'),
                    React.createElement('span', { className: 'text-2xl font-black text-cyan-400' }, `${substituteCount} 人`)
                ),
                React.createElement('input', {
                    type: 'range',
                    min: 1,
                    max: Math.max(1, benchCount),
                    value: substituteCount,
                    onChange: (e) => setSubstituteCount(parseInt(e.target.value)),
                    className: 'w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500'
                }),
                React.createElement('p', { className: 'text-xs text-slate-500 text-center' },
                    `將從板凳中挑選積分最高的 ${substituteCount} 人，替換場上積分最低者`
                )
            ),

            // Buttons
            React.createElement('div', { className: 'grid grid-cols-2 gap-3 mt-4' },
                React.createElement('button', {
                    onClick: onClose,
                    className: 'py-3 rounded-2xl bg-slate-800 text-slate-400 font-black text-sm hover:bg-slate-700'
                }, '取消'),
                React.createElement('button', {
                    onClick: handleConfirm,
                    className: 'py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-sm shadow-lg hover:brightness-110'
                }, '執行輪替')
            )
        )
    );
};
