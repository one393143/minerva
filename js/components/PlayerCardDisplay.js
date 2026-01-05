/**
 * 球員卡顯示組件 - 精確對齊底圖版
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
  
  return total / 8;
}

/**
 * 將平均值轉換成字母評級 (放寬一級)
 */
function getLetterGrade(average) {
  if (average >= 6.7) return 'S';
  
  if (average >= 6.3) return 'A+';
  if (average >= 6.0) return 'A';
  if (average >= 5.7) return 'A-';
  
  if (average >= 5.3) return 'B+';
  if (average >= 5.0) return 'B';
  if (average >= 4.7) return 'B-';
  
  if (average >= 4.3) return 'C+';
  if (average >= 4.0) return 'C';
  if (average >= 3.7) return 'C-';
  
  if (average >= 3.3) return 'D+';
  if (average >= 3.0) return 'D';
  if (average >= 2.7) return 'D-';
  
  if (average >= 2.3) return 'E+';
  if (average >= 2.0) return 'E';
  if (average >= 1.7) return 'E-';
  
  return 'F';
}

/**
 * 根據字母評級決定卡片等級 (放寬一級)
 */
function getCardTier(letterGrade) {
  const grade = letterGrade.replace(/[+-]/g, '');
  
  if (grade === 'S') return 'diamond';
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
  
  const cardBgImage = `photo/card/${tier}.jpg`;
  const playerImage = `photo/player/${player.name}.png`;

  if (compact) {
    // 簡化版（精確等比例縮小）
    return React.createElement('div', {
      className: 'relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl'
    },
      // 背景圖
      React.createElement('img', {
        src: cardBgImage,
        alt: tier,
        className: 'absolute inset-0 w-full h-full object-cover'
      }),
      
      // 守備位置（對齊底圖左下方框，縮小版）
      React.createElement('div', {
        className: 'absolute bottom-[14.5%] left-[6.5%] w-[13%] aspect-square flex items-center justify-center'
      },
        React.createElement('span', {
          className: 'text-white font-black text-[0.65rem] drop-shadow-lg',
          style: { textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }
        }, player.primaryPosition || '?')
      ),
      
      // 背號（左上角，下移避免重疊）
      React.createElement('div', {
        className: 'absolute top-[12%] left-[6%] text-white/25 font-black text-2xl leading-none',
        style: { textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }
      }, player.number || '?'),
      
      // 球員照片（上移並裁切）
      React.createElement('div', {
        className: 'absolute bottom-[12%] left-1/2 transform -translate-x-1/2 w-[85%] h-[75%] overflow-hidden'
      },
        React.createElement('img', {
          src: playerImage,
          alt: player.name,
          className: 'w-full h-full object-contain object-bottom drop-shadow-2xl',
          onError: (e) => {
            e.target.style.display = 'none';
          }
        })
      ),
      
      // 右上角評級（無底色）
      React.createElement('div', {
        className: 'absolute top-[5%] right-[7%]'
      },
        React.createElement('span', {
          className: `${gradeColor} font-black text-xl drop-shadow-lg`,
          style: { textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }
        }, letterGrade)
      ),
      
      // 球員姓名（底部中央，對齊底圖）
      React.createElement('div', {
        className: 'absolute bottom-[6%] left-0 right-0 text-center px-2'
      },
        React.createElement('p', {
          className: 'text-white font-black text-base drop-shadow-lg truncate',
          style: { textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }
        }, player.name)
      )
    );
  }

  // 完整版（詳細展示，精確對齊底圖）
  return React.createElement('div', {
    className: 'relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl'
  },
    // 背景圖
    React.createElement('img', {
      src: cardBgImage,
      alt: tier,
      className: 'absolute inset-0 w-full h-full object-cover'
    }),
    
    // 守備位置（對齊底圖左下方框）
    React.createElement('div', {
      className: 'absolute bottom-[14.5%] left-[6.5%] w-[13%] aspect-square flex items-center justify-center'
    },
      React.createElement('span', {
        className: 'text-white font-black text-2xl drop-shadow-lg',
        style: { textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }
      }, player.primaryPosition || '?')
    ),
    
    // 背號（左上角，下移避免重疊 Logo）
    React.createElement('div', {
      className: 'absolute top-[15%] left-[6%] text-white/20 font-black text-6xl leading-none pointer-events-none',
      style: { textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }
    }, player.number || '?'),
    
    // 球員照片（上移並裁切到名字欄位）
    React.createElement('div', {
      className: 'absolute bottom-[12%] left-1/2 transform -translate-x-1/2 w-[85%] h-[75%] overflow-hidden'
    },
      React.createElement('img', {
        src: playerImage,
        alt: player.name,
        className: 'w-full h-full object-contain object-bottom drop-shadow-2xl',
        onError: (e) => {
          e.target.style.display = 'none';
        }
      })
    ),
    
    // 右上角評級（無底色）
    React.createElement('div', {
      className: 'absolute top-[5%] right-[7%]'
    },
      React.createElement('span', {
        className: `${gradeColor} font-black text-5xl drop-shadow-2xl`,
        style: { textShadow: '3px 3px 6px rgba(0,0,0,0.9)' }
      }, letterGrade)
    ),
    
    // 球員資訊（底部，對齊底圖）
    React.createElement('div', {
      className: 'absolute bottom-0 left-0 right-0'
    },
      // 球員姓名（放大，對齊底圖中央）
      React.createElement('div', {
        className: 'text-center mb-[1.5%]'
      },
        React.createElement('h2', {
          className: 'text-white font-black text-4xl drop-shadow-lg px-4',
          style: { textShadow: '3px 3px 6px rgba(0,0,0,0.9)' }
        }, player.name)
      ),
      
      // 能力值網格（精確對齊底圖 2x4 格子）
      React.createElement('div', {
        className: 'grid grid-cols-4 gap-x-[1%] gap-y-[0.5%] px-[6.5%] pb-[2%]'
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
            className: 'text-center py-1'
          },
            React.createElement('p', {
              className: 'text-white/80 text-xs font-bold mb-0.5 drop-shadow-sm',
              style: { textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }
            }, stat.label),
            React.createElement('p', {
              className: `font-black text-2xl drop-shadow-lg ${
                GRADE_VALUES[stat.value] >= 6 ? 'text-yellow-300' :
                GRADE_VALUES[stat.value] >= 5 ? 'text-orange-300' :
                GRADE_VALUES[stat.value] >= 4 ? 'text-blue-300' :
                'text-slate-300'
              }`,
              style: { textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }
            }, stat.value)
          )
        )
      )
    )
  );
};
