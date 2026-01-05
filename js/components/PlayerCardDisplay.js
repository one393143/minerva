/**
 * 球員卡顯示組件 - 純百分比定位版
 * 檔案位置: js/components/PlayerCardDisplay.js
 */

const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

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

function getCardTier(letterGrade) {
  const grade = letterGrade.replace(/[+-]/g, '');
  if (grade === 'S') return 'diamond';
  if (grade === 'A') return 'gold';
  if (grade === 'B') return 'silver';
  if (grade === 'C') return 'bronze';
  return 'normal';
}

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

export const PlayerCardDisplay = ({ player, compact = false }) => {
  const average = calculateAverageGrade(player);
  const letterGrade = getLetterGrade(average);
  const tier = getCardTier(letterGrade);
  const gradeColor = getGradeColor(letterGrade);
  
  const cardBgImage = `photo/card/${tier}.jpg`;
  const playerImage = `photo/player/${player.name}.png`;

  if (compact) {
    // 簡化版（純百分比定位）
    return React.createElement('div', {
      className: 'relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl',
      style: { position: 'relative' }
    },
      // 背景圖
      React.createElement('img', {
        src: cardBgImage,
        alt: tier,
        className: 'absolute inset-0 w-full h-full object-cover'
      }),
      
      // 守備位置（純百分比）
      React.createElement('div', {
        className: 'absolute flex items-center justify-center',
        style: {
          bottom: '14.5%',
          left: '6.5%',
          width: '13%',
          aspectRatio: '1/1'
        }
      },
        React.createElement('span', {
          className: 'text-white font-black drop-shadow-lg',
          style: { 
            fontSize: '0.65rem',
            textShadow: '1px 1px 3px rgba(0,0,0,0.9)' 
          }
        }, player.primaryPosition || '?')
      ),
      
      // 背號（純百分比）
      React.createElement('div', {
        className: 'text-white/25 font-black leading-none',
        style: {
          position: 'absolute',
          top: '12%',
          left: '6%',
          fontSize: '1.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }
      }, player.number || '?'),
      
      // 球員照片（純百分比）
      React.createElement('div', {
        className: 'absolute overflow-hidden',
        style: {
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85%',
          height: '75%'
        }
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
      
      // 右上角評級（純百分比）
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '5%',
          right: '7%'
        }
      },
        React.createElement('span', {
          className: `${gradeColor} font-black drop-shadow-lg`,
          style: { 
            fontSize: '1.25rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
          }
        }, letterGrade)
      ),
      
      // 球員姓名（純百分比）
      React.createElement('div', {
        className: 'text-center',
        style: {
          position: 'absolute',
          bottom: '6%',
          left: '5%',
          right: '5%'
        }
      },
        React.createElement('p', {
          className: 'text-white font-black drop-shadow-lg truncate',
          style: { 
            fontSize: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
          }
        }, player.name)
      )
    );
  }

  // 完整版（純百分比定位）
  return React.createElement('div', {
    className: 'relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl',
    style: { position: 'relative' }
  },
    // 背景圖
    React.createElement('img', {
      src: cardBgImage,
      alt: tier,
      className: 'absolute inset-0 w-full h-full object-cover'
    }),
    
    // 守備位置（純百分比）
    React.createElement('div', {
      className: 'absolute flex items-center justify-center',
      style: {
        bottom: '14.5%',
        left: '6.5%',
        width: '13%',
        aspectRatio: '1/1'
      }
    },
      React.createElement('span', {
        className: 'text-white font-black drop-shadow-lg',
        style: { 
          fontSize: '1.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
        }
      }, player.primaryPosition || '?')
    ),
    
    // 背號（純百分比）
    React.createElement('div', {
      className: 'text-white/20 font-black leading-none pointer-events-none',
      style: {
        position: 'absolute',
        top: '15%',
        left: '6%',
        fontSize: '3.75rem',
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)'
      }
    }, player.number || '?'),
    
    // 球員照片（純百分比）
    React.createElement('div', {
      className: 'absolute overflow-hidden',
      style: {
        bottom: '12%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '85%',
        height: '75%'
      }
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
    
    // 右上角評級（純百分比）
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: '5%',
        right: '7%'
      }
    },
      React.createElement('span', {
        className: `${gradeColor} font-black drop-shadow-2xl`,
        style: { 
          fontSize: '3rem',
          textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
        }
      }, letterGrade)
    ),
    
    // 球員資訊（純百分比）
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
      }
    },
      // 球員姓名（純百分比）
      React.createElement('div', {
        className: 'text-center',
        style: {
          marginBottom: '1.5%'
        }
      },
        React.createElement('h2', {
          className: 'text-white font-black drop-shadow-lg',
          style: { 
            fontSize: '2.25rem',
            paddingLeft: '5%',
            paddingRight: '5%',
            textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
          }
        }, player.name)
      ),
      
      // 能力值網格（純百分比）
      React.createElement('div', {
        className: 'grid grid-cols-4',
        style: {
          gap: '1%',
          paddingLeft: '6.5%',
          paddingRight: '6.5%',
          paddingBottom: '2%'
        }
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
            className: 'text-center',
            style: { paddingTop: '2%', paddingBottom: '2%' }
          },
            React.createElement('p', {
              className: 'text-white/80 font-bold drop-shadow-sm',
              style: { 
                fontSize: '0.75rem',
                marginBottom: '0.125rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)' 
              }
            }, stat.label),
            React.createElement('p', {
              className: `font-black drop-shadow-lg ${
                GRADE_VALUES[stat.value] >= 6 ? 'text-yellow-300' :
                GRADE_VALUES[stat.value] >= 5 ? 'text-orange-300' :
                GRADE_VALUES[stat.value] >= 4 ? 'text-blue-300' :
                'text-slate-300'
              }`,
              style: { 
                fontSize: '1.5rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
              }
            }, stat.value)
          )
        )
      )
    )
  );
};
