/**
 * 匯出圖片 Modal
 */
import { PlayerCard } from '../components/PlayerCard.js';
import { FIELD_POSITIONS } from '../utils/constants.js';

export const ExportImageModal = ({ lineup, players, bench, onClose }) => {
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [imageUri, setImageUri] = React.useState(null);
    const printRef = React.useRef(null);

    const availablePlayers = players.filter(p => p.willAttend);

    // 產生圖片流程
    const generateImage = async () => {
        setIsGenerating(true);
        // 等待 React 渲染隱藏的列印區域
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current, {
                    useCORS: true,
                    scale: 3, // 提高到 3x
                    backgroundColor: '#020617' // slate-950
                });
                const uri = canvas.toDataURL('image/jpeg', 0.9);
                setImageUri(uri);
            } catch (err) {
                console.error('產生圖片失敗:', err);
                alert('產生圖片失敗，請重試');
            } finally {
                setIsGenerating(false);
            }
        }, 500);
    };

    React.useEffect(() => {
        generateImage();
    }, []);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.download = `baseball-lineup-${new Date().getTime()}.jpg`;
        link.href = imageUri;
        link.click();
    };

    const handleCopy = async () => {
        try {
            const response = await fetch(imageUri);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob }) // 雖然是 jpg 轉成 blob 複製通常用 png
            ]);
            alert('圖片已複製到剪貼簿');
        } catch (err) {
            console.error('複製失敗:', err);
            alert('您的瀏覽器不支援複製圖片，請直接點擊下載或長按圖片儲存');
        }
    };

    return React.createElement('div', {
        className: 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
    },
        // 主視窗
        React.createElement('div', {
            className: 'bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl border-2 border-white/20 shadow-2xl flex flex-col overflow-hidden animate-zoom-in'
        },
            // Header
            React.createElement('div', { className: 'p-6 border-b border-white/10 flex justify-between items-center' },
                React.createElement('h3', { className: 'text-xl font-black text-cyan-400 italic uppercase' }, 'Lineup Export'),
                React.createElement('button', {
                    onClick: onClose,
                    className: 'text-slate-400 hover:text-white transition-colors'
                }, '✕')
            ),

            // Scrollable Content
            React.createElement('div', { className: 'flex-1 overflow-y-auto p-6 flex flex-col items-center' },
                isGenerating ? React.createElement('div', { className: 'py-20 text-center' },
                    React.createElement('div', { className: 'spinner mx-auto mb-4' }),
                    React.createElement('p', { className: 'text-slate-400 font-bold' }, '陣容圖片生成中...')
                ) : (
                    imageUri && React.createElement('div', { className: 'w-full space-y-6' },
                        React.createElement('img', {
                            src: imageUri,
                            className: 'w-full rounded-2xl border-4 border-white/10 shadow-2xl'
                        }),
                        React.createElement('p', { className: 'text-center text-xs text-slate-500 font-bold' },
                            '💡 提示：您可以長按圖片儲存，或使用下方的按鈕。'
                        )
                    )
                )
            ),

            // Actions
            !isGenerating && imageUri && React.createElement('div', {
                className: 'p-6 bg-slate-950/50 border-t border-white/10 grid grid-cols-2 gap-4'
            },
                React.createElement('button', {
                    onClick: handleCopy,
                    className: 'py-4 rounded-2xl bg-slate-800 text-cyan-400 font-black text-sm uppercase tracking-widest border border-cyan-400/30'
                }, '📋 複製圖片'),
                React.createElement('button', {
                    onClick: handleDownload,
                    className: 'py-4 rounded-2xl bg-cyan-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-cyan-900/20'
                }, '📥 下載圖片')
            )
        ),

        // 🏆 隱藏的列印區域 (用於 html2canvas)
        React.createElement('div', {
            ref: printRef,
            style: {
                position: 'absolute',
                top: '-20000px', // 移得更遠一點
                left: '-20000px',
                width: '1200px', // 加寬一點
                padding: '60px',
                backgroundColor: '#020617', // slate-950
                fontFamily: "'Noto Sans TC', sans-serif"
            }
        },
            // Title in Image
            React.createElement('div', { className: 'text-center mb-10' },
                React.createElement('h1', { className: 'text-5xl font-black text-white italic mb-2' }, 'PRO MANAGER'),
                React.createElement('p', { className: 'text-cyan-400 text-xl font-bold uppercase tracking-widest' }, 'Official Lineup Card'),
                React.createElement('p', { className: 'text-slate-500 text-sm mt-2' }, new Date().toLocaleString())
            ),

            // Field Section
            React.createElement('div', {
                className: 'baseball-field relative overflow-hidden card-shadow mx-auto mb-16',
                style: { width: '800px', height: '800px' } // 加大球場
            },
                React.createElement('div', { className: 'diamond-inner' }),
                FIELD_POSITIONS.map(({ pos, top, left }) => {
                    const player = availablePlayers.find(x => x.id === lineup[pos]);
                    return React.createElement('div', {
                        key: pos,
                        className: 'absolute transform -translate-x-1/2 -translate-y-1/2 z-20',
                        style: { top, left }
                    },
                        React.createElement('div', {
                            className: `w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all bg-gradient-to-br ${player ? 'from-blue-600 to-blue-800 border-white/40 shadow-2xl scale-110' : 'from-black/40 to-black/60 border-white/20'} relative`
                        },
                            // 守備位置 (絕對定位在圓圈上半部)
                            React.createElement('span', {
                                className: `absolute top-5 text-sm font-black ${player ? 'text-white/80' : 'text-white/30'} uppercase`
                            }, pos),
                            // 名字 (垂直居中)
                            React.createElement('span', {
                                className: `text-2xl font-black px-2 text-center leading-tight mt-2 ${player ? 'text-white drop-shadow-md' : 'text-white/30'}`
                            },
                                player ? player.name : ''
                            )
                        )
                    );
                })
            ),

            // DH & Bench Section
            React.createElement('div', { className: 'grid grid-cols-2 gap-10' },
                // DH
                React.createElement('div', {},
                    React.createElement('h3', { className: 'text-xl font-black text-slate-500 mb-4 uppercase tracking-widest border-l-4 border-cyan-500 pl-3' }, 'Designated Hitters'),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        ['DH1', 'DH2', 'DH3'].map(dh => {
                            const player = availablePlayers.find(x => x.id === lineup[dh]);
                            return React.createElement('div', {
                                key: dh,
                                className: `rounded-2xl border-2 flex items-center justify-center bg-gradient-to-br ${player ? 'from-blue-600 to-blue-800 border-white/30 text-white' : 'bg-slate-900/50 border-slate-800 opacity-40'} relative h-24`
                            },
                                React.createElement('span', { className: 'absolute top-3 text-xs font-black opacity-70 uppercase' }, dh),
                                React.createElement('span', { className: 'text-2xl font-black' }, player?.name || '---')
                            );
                        })
                    )
                ),
                // Bench
                React.createElement('div', {},
                    React.createElement('h3', { className: 'text-xl font-black text-slate-500 mb-4 uppercase tracking-widest border-l-4 border-slate-500 pl-3' }, 'Bench Players'),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, // 放寬點
                        bench.length > 0 ? bench.map(p =>
                            React.createElement(PlayerCard, {
                                key: p.id,
                                player: p,
                                compact: true,
                                forceUniform: true
                            })
                        ) : React.createElement('p', { className: 'text-slate-700 italic' }, 'No substitutes')
                    )
                )
            ),

            // Footer
            React.createElement('div', { className: 'mt-16 pt-8 border-t border-white/10 text-center text-slate-600 font-bold' },
                'GENERATED BY Minerva PRO MANAGER'
            )
        )
    );
};
