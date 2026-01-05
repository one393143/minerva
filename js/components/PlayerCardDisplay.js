/**
 * 球員卡顯示組件 - 字母評級版
 * 檔案位置: js/components/PlayerCardDisplay.js
 */

const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

/**
 * 計算球員的平均能力值
 */
function calculateAverageGrade(player) {
  const grades = player.grades;
  const total = 
    GRADE_VALUES[grades.hitting] +
    GRADE_VALUES[grades.power] +
    GRADE_VALUES[grades.discipline] +
    GRADE_VALUES[grades.speed] +
    GRADE_VALUES[grades.defense] +
    GRADE_VALUES[grades.accuracy] +
    GRADE_VALUES[grades.armStrength] +
    GRADE_VALUES[grades.iq];
  
  return total / 8; // 返回 1.0-7.0 的平均值
}

/**
 * 將平均值轉換成字母評級 (A+, B-, C 等)
 */
function getLetterGrade(average) {
  if (average >= 7.0) return 'S';
  
  if (average >= 6.7) return 'A+';
  if (average >= 6.3) return 'A';
  if (average >= 6.0) return 'A-';
  
  if (average >= 5.7) return 'B+';
  if (average >= 5.3) return 'B';
  if (average >= 5.0) return 'B-';
  
  if (average >= 4.7) return 'C+';
  if (average >= 4.3) return 'C';
  if (average >= 4.0) return 'C-';
  
  if (average >= 3.7) return 'D+';
  if (average >= 3.3) return 'D';
  if (average >= 3.0) return 'D-';
  
  if (average >= 2.7) return 'E+';
  if (average >= 2.3) return 'E';
  if (average >= 2.0) return 'E-';
  
  return 'F';
}

/**
 * 根據字母評級決定卡片等級
 */
function getCardTier(letterGrade) {
  const grade = letterGrade.replace(/[+-]/g, ''); // 移除 +/-
  
  if (grade === 'S' || letterGrade === 'A+') return 'diamond';
  if (grade === 'A') return 'gold';
  if (grade === 'B') return 'silver';
  if (grade === 'C') return 'bronze';
  return 'normal';
}

/**
 * 根據字母評級決定顏色
 */
function getGradeColor(letterGrade) {
  const grade = letterGrade.replace(/[+-]/g, '');
  
  const colors = {
    'S': 'text-purple-400',
    'A': 'text-yellow-400',
    'B': 'text-orange-400',
    'C': 'text-blue-400',
    'D': 'text-green-400',
    'E': 'text-slate-400',
    'F': 'text-red-400'
  };
  
  return colors[grade] || 'text-slate-400';
}

/**
 * 球員卡顯示組件
 */
export const PlayerCardDisplay = ({ player, compact = false }) => {
  const average = calculateAverageGrade(player);
  const letterGrade = getLetterGrade(average);
  const tier = getCardTier(letterGrade);
  const gradeColor = getGradeColor(letterGrade);
  
  const cardBgImage = `photos/card/${tier}.jpg`;
  const playerImage = `photos/player/${player.name}.png`;

  if (compact) {
    // 簡化版（用於列表）
    return React.createElement('div', {
      className: 'relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-xl cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl'
    },
      // 背景圖
      React.createElement('img', {
        src: cardBgImage,
        alt: tier,
        className: 'absolute inset-0 w-full h-full object-cover'
      }),
      
      // 球隊 Logo（左上角）
      React.createElement('div', {
        className: 'absolute top-3 left-3 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/20'
      },
        React.createElement('img', {
          src: 'photos/team-logo.png',
          alt: 'Team Logo',
          className: 'w-8 h-8 object-contain',
          onError: (e) => {
            e.target.style.display = 'none';
          }
        })
      ),
      
      // 背號（Logo 下方，半透明）
      React.createElement('div', {
        className: 'absolute top-16 left-3 text-white/30 font-black text-4xl leading-none'
      }, player.number || '?'),
      
      // 球員照片
      React.createElement('img', {
        src: playerImage,
        alt: player.name,
        className: 'absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[70%] h-[70%] object-contain drop-shadow-2xl',
        onError: (e) => {
          e.target.style.display = 'none';
        }
      }),
      
      // 右上角評級
      React.createElement('div', {
        className: 'absolute top-3 right-3 bg-black/80 backdrop-blur-md rounded-xl px-3 py-1.5 border-2 border-white/20'
      },
        React.createElement('span', {
          className: `${gradeColor} font-black text-xl`
        }, letterGrade)
      ),
      
      // 球員姓名（底部）
      React.createElement('div', {
        className: 'absolute bottom-2 left-2 right-2 text-center'
      },
        React.createElement('div', {
          className: 'bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2'
        },
          React.createElement('p', {
            className: 'text-white font-black text-sm truncate'
          }, player.name)
        )
      )
    );
  }

  // 完整版（用於詳細展示）
  return React.createElement('div', {
    className: 'relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl'
  },
    // 背景圖
    React.createElement('img', {
      src: cardBgImage,
      alt: tier,
      className: 'absolute inset-0 w-full h-full object-cover'
    }),
    
    // 球隊 Logo（左上角）
    React.createElement('div', {
      className: 'absolute top-6 left-6 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/20 shadow-xl'
    },
      React.createElement('img', {
        src: 'photos/team-logo.png',
        alt: 'Team Logo',
        className: 'w-14 h-14 object-contain',
        onError: (e) => {
          e.target.style.display = 'none';
        }
      })
    ),
    
    // 背號（Logo 下方，半透明大字）
    React.createElement('div', {
      className: 'absolute top-28 left-6 text-white/20 font-black text-7xl leading-none pointer-events-none',
      style: { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }
    }, player.number || '?'),
    
    // 球員照片
    React.createElement('div', {
      className: 'absolute inset-0 flex items-end justify-center pb-[20%]'
    },
      React.createElement('img', {
        src: playerImage,
        alt: player.name,
        className: 'w-[80%] h-[80%] object-contain drop-shadow-2xl',
        onError: (e) => {
          e.target.style.display = 'none';
        }
      })
    ),
    
    // 右上角評級
    React.createElement('div', {
      className: 'absolute top-6 right-6 bg-black/90 backdrop-blur-md rounded-2xl px-5 py-3 border-2 border-white/30 shadow-xl'
    },
      React.createElement('span', {
        className: `${gradeColor} font-black text-4xl`
      }, letterGrade)
    ),
    
    // 球員資訊（底部）
    React.createElement('div', {
      className: 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 pt-24'
    },
      // 姓名與背號
      React.createElement('div', {
        className: 'text-center mb-4'
      },
        React.createElement('h2', {
          className: 'text-white font-black text-3xl mb-1'
        }, player.name),
        React.createElement('p', {
          className: 'text-white/60 font-bold text-lg'
        }, `NO.${player.number || '?'} • ${player.primaryPosition || '?'}`)
      ),
      
      // 能力值網格
      React.createElement('div', {
        className: 'grid grid-cols-4 gap-2'
      },
        [
          { label: '打擊', value: player.grades.hitting },
          { label: '力量', value: player.grades.power },
          { label: '選球', value: player.grades.discipline },
          { label: '速度', value: player.grades.speed },
          { label: '守備', value: player.grades.defense },
          { label: '傳準', value: player.grades.accuracy },
          { label: '臂力', value: player.grades.armStrength },
          { label: '球商', value: player.grades.iq }
        ].map(stat =>
          React.createElement('div', {
            key: stat.label,
            className: 'bg-black/50 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10'
          },
            React.createElement('p', {
              className: 'text-white/60 text-[10px] font-bold mb-1'
            }, stat.label),
            React.createElement('p', {
              className: `font-black text-lg ${
                GRADE_VALUES[stat.value] >= 6 ? 'text-yellow-400' :
                GRADE_VALUES[stat.value] >= 5 ? 'text-orange-400' :
                GRADE_VALUES[stat.value] >= 4 ? 'text-blue-400' :
                'text-slate-400'
              }`
            }, stat.value)
          )
        )
      )
    )
  );
};
