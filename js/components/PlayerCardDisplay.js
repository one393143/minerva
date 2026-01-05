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
  if (average >= 6.4) return 'S';
  if (average >= 6.0) return 'A+';
  if (average >= 5.7) return 'A';
  if (average >= 5.4) return 'A-';
  if (average >= 5.0) return 'B+';
  if (average >= 4.7) return 'B';
  if (average >= 4.4) return 'B-';
  if (average >= 4.0) return 'C+';
  if (average >= 3.7) return 'C';
  if (average >= 3.4) return 'C-';
  if (average >= 3.0) return 'D+';
  if (average >= 2.7) return 'D';
  if (average >= 2.4) return 'D-';
  if (average >= 2.0) return 'E+';
  if (average >= 1.7) return 'E';
  if (average >= 1.4) return 'E-';
  return 'F';
}

function getCardTier(letterGrade) {
  if (letterGrade === 'S' || letterGrade === 'A+' || letterGrade === 'A' || letterGrade === 'A-') {
    return 'diamond';
  }
  if (letterGrade.startsWith('B')) return 'gold';
  if (letterGrade.startsWith('C')) return 'silver';
  if (letterGrade.startsWith('D')) return 'bronze';
  return 'normal';
}

function getStatColor(grade) {
  if (grade === 'S') return 'text-red-400';
  if (grade === 'A') return 'text-orange-400';
  if (grade === 'B') return 'text-yellow-400';
  if (grade === 'C') return 'text-slate-300';
  return 'text-white';
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
          bottom: '35.5%',
          left: '7.5%',
          width: '12%',
          aspectRatio: '1/1'
        }
      },
        React.createElement('span', {
          className: 'text-white font-black drop-shadow-lg',
          style: { 
            fontSize: '1.18rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
          }
        }, player.primaryPosition || '?')
      ),
      
      // 球員照片（純百分比）
      React.createElement('div', {
        className: 'absolute overflow-hidden',
        style: {
          bottom: '32.5%',
          left: '53%',
          transform: 'translateX(-50%)',
          width: '65%',
          height: '65%'
        }
      },
        React.createElement('img', {
          src: playerImage,
          alt: player.name,
          className: 'w-full h-full object-contain object-bottom',
          style: { filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.5))' },
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
          right: '8%'
        }
      },
        React.createElement('span', {
          className: `${gradeColor} font-black drop-shadow-lg`,
          style: { 
            fontSize: '2.3rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
          }
        }, letterGrade)
      ),
      
      // 🔧 修正：球員姓名（加上背號）
      React.createElement('div', {
        className: 'text-center',
        style: {
          position: 'absolute',
          top: '64.5%',
          left: '5%',
          right: '5%',
          bottom: '17.5%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      },
        React.createElement('h2', {
          className: 'text-white font-black drop-shadow-lg',
          style: { 
            fontSize: '1.64rem',
            letterSpacing: '0.33rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
          }
        }, `#${player.number} ${player.name}`)
      ),
      
      // 🔧 修正：能力值網格（調整定位）
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '81%',
          left: '19.5%',
          right: '15%',
          bottom: '7.5%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8%',
          rowGap: '15%'
        }
      },
        [
          player.grades.hitting,
          player.grades.power,
          player.grades.discipline,
          player.grades.speed,
          player.grades.defense,
          player.grades.accuracy,
          player.grades.armStrength,
          player.grades.iq
        ].map((grade, index) =>
          React.createElement('div', {
            key: index,
            className: 'flex items-center justify-center'
          },
            React.createElement('span', {
              className: `${getStatColor(grade)} font-black`,
              style: { 
                fontSize: '1.05rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
              }
            }, grade)
          )
        )
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
        bottom: '35.5%',
        left: '7.5%',
        width: '12%',
        aspectRatio: '1/1'
      }
    },
      React.createElement('span', {
        className: 'text-white font-black drop-shadow-lg',
        style: { 
          fontSize: '1.8rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
        }
      }, player.primaryPosition || '?')
    ),
    
    // 球員照片（純百分比）
    React.createElement('div', {
      className: 'absolute overflow-hidden',
      style: {
        bottom: '32.5%',
        left: '53%',
        transform: 'translateX(-50%)',
        width: '65%',
        height: '65%'
      }
    },
      React.createElement('img', {
        src: playerImage,
        alt: player.name,
        className: 'w-full h-full object-contain object-bottom',
        style: { filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.5))' },
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
        right: '8%'
      }
    },
      React.createElement('span', {
        className: `${gradeColor} font-black drop-shadow-2xl`,
        style: { 
          fontSize: '3.5rem',
          textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
        }
      }, letterGrade)
    ),
    
    // 🔧 修正：球員姓名（加上背號）
    React.createElement('div', {
      className: 'text-center',
      style: {
        position: 'absolute',
        top: '64.5%',
        left: '5%',
        right: '5%',
        bottom: '17.5%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      React.createElement('h2', {
        className: 'text-white font-black drop-shadow-lg',
        style: { 
          fontSize: '2.5rem',
          letterSpacing: '0.5rem',
          textShadow: '3px 3px 6px rgba(0,0,0,0.9)' 
        }
      }, `#${player.number} ${player.name}`)
    ),
    
    // 🔧 修正：能力值網格（調整定位與間距）
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: '81%',
        left: '19.5%',
        right: '15%',
        bottom: '7.5%',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8%',
        rowGap: '15%'
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
          className: 'flex items-center justify-center'
        },
          React.createElement('span', {
            className: `${getStatColor(stat.value)} font-black`,
            style: { 
              fontSize: '1.6rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9)' 
            }
          }, stat.value)
        )
      )
    )
  );
};
