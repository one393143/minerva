/**
 * 球員卡顯示組件 - 純百分比定位版 (Container Queries 優化)
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
  const playerImage = `photo/player/${player.name}.webp`;

  // 共用的 stats 順序
  const statsList = [
    player.grades.hitting,    // 打擊
    player.grades.power,      // 力量
    player.grades.discipline, // 選球
    player.grades.speed,      // 速度
    player.grades.defense,    // 守備
    player.grades.accuracy,   // 傳準
    player.grades.armStrength,// 臂力
    player.grades.iq          // 球商
  ];

  /* 
     使用 Container Queries (cqw) 來確保字體大小隨卡片寬度縮放。
     container-type: size 在 style 中設定。
  */

  if (compact) {
    return React.createElement('div', {
      className: 'relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl',
      style: {
        containerType: 'size',
        position: 'relative'
      }
    },
      // 背景圖
      React.createElement('img', {
        src: cardBgImage,
        alt: tier,
        className: 'absolute inset-0 w-full h-full object-cover',
        loading: 'lazy',   // 🚀 延遲載入
        decoding: 'async'  // 🚀 非同步解碼
      }),

      // 守備位置
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
          className: 'text-white font-black drop-shadow-lg leading-none',
          style: {
            fontSize: '10cqw',
            textShadow: '0.1cqw 0.1cqw 0.2cqw rgba(0,0,0,0.9)'
          }
        }, player.primaryPosition || '?')
      ),

      // 球員照片
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
          style: { filter: 'drop-shadow(0 1cqw 1.5cqw rgba(0, 0, 0, 0.5))' },
          onError: (e) => { e.target.style.display = 'none'; },
          loading: 'lazy',   // 🚀 延遲載入
          decoding: 'async'  // 🚀 非同步解碼
        })
      ),

      // 右上角評級
      React.createElement('div', {
        className: 'absolute flex justify-end items-center',
        style: {
          top: '5%',
          right: '8%',
          width: '30%'
        }
      },
        React.createElement('span', {
          className: `${gradeColor} font-black drop-shadow-lg leading-none`,
          style: {
            fontSize: '18cqw',
            textShadow: '0.2cqw 0.2cqw 0.4cqw rgba(0,0,0,0.9)'
          }
        }, letterGrade)
      ),

      // 球員姓名（加上背號）
      React.createElement('div', {
        className: 'absolute flex items-center justify-center',
        style: {
          top: '64.5%',
          left: '5%',
          right: '5%',
          bottom: '17.5%'
        }
      },
        React.createElement('h2', {
          className: 'text-white font-black drop-shadow-lg whitespace-nowrap',
          style: {
            fontSize: '11cqw',
            letterSpacing: '0.5cqw',
            textShadow: '0.2cqw 0.2cqw 0.4cqw rgba(0,0,0,0.9)'
          }
        }, `#${player.number} ${player.name}`)
      ),

      // 🔧 修正：能力值網格（恢復舊版定位參數 + cqw 縮放）
      React.createElement('div', {
        className: 'absolute grid grid-cols-4',
        style: {
          inset: '81% 8% 7.5% 21.5%',
          gap: '30%' // 恢復使用 gap 來控制間距，這會讓網格內容撐開到正確位置
        }
      },
        statsList.map((grade, index) =>
          React.createElement('div', {
            key: index,
            className: 'flex items-center justify-center w-full h-full' // 保持置中
          },
            React.createElement('span', {
              className: `${getStatColor(grade)} font-black leading-none`,
              style: {
                fontSize: '9cqw', // 稍微加大字體
                textShadow: '0.1cqw 0.1cqw 0.2cqw rgba(0,0,0,0.9)'
              }
            }, grade)
          )
        )
      )
    );
  }

  // 完整版 (Full)
  return React.createElement('div', {
    className: 'relative w-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl',
    style: {
      containerType: 'size',
      position: 'relative'
    }
  },
    // 背景圖
    React.createElement('img', {
      src: cardBgImage,
      alt: tier,
      className: 'absolute inset-0 w-full h-full object-cover',
      loading: 'lazy',   // 🚀 延遲載入
      decoding: 'async'  // 🚀 非同步解碼
    }),

    // 守備位置
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
        className: 'text-white font-black drop-shadow-lg leading-none',
        style: {
          fontSize: '10cqw',
          textShadow: '0.1cqw 0.1cqw 0.2cqw rgba(0,0,0,0.9)'
        }
      }, player.primaryPosition || '?')
    ),

    // 球員照片
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
        style: { filter: 'drop-shadow(0 1cqw 1.5cqw rgba(0, 0, 0, 0.5))' },
        onError: (e) => { e.target.style.display = 'none'; },
        loading: 'lazy',   // 🚀 延遲載入
        decoding: 'async'  // 🚀 非同步解碼
      })
    ),

    // 右上角評級
    React.createElement('div', {
      className: 'absolute flex justify-end items-center',
      style: {
        top: '5%',
        right: '8%',
        width: '30%'
      }
    },
      React.createElement('span', {
        className: `${gradeColor} font-black drop-shadow-2xl leading-none`,
        style: {
          fontSize: '18cqw',
          textShadow: '0.2cqw 0.2cqw 0.4cqw rgba(0,0,0,0.9)'
        }
      }, letterGrade)
    ),

    // 球員姓名
    React.createElement('div', {
      className: 'absolute flex items-center justify-center',
      style: {
        top: '64.5%',
        left: '5%',
        right: '5%',
        bottom: '17.5%'
      }
    },
      React.createElement('h2', {
        className: 'text-white font-black drop-shadow-lg whitespace-nowrap',
        style: {
          fontSize: '11cqw',
          letterSpacing: '0.5cqw',
          textShadow: '0.2cqw 0.2cqw 0.4cqw rgba(0,0,0,0.9)'
        }
      }, `#${player.number} ${player.name}`)
    ),

    // 能力值網格
    React.createElement('div', {
      className: 'absolute grid grid-cols-4',
      style: {
        inset: '81% 8% 7.5% 21.5%',
        gap: '30%' // 恢復舊參數
      }
    },
      statsList.map((grade, index) =>
        React.createElement('div', {
          key: index,
          className: 'flex items-center justify-center w-full h-full'
        },
          React.createElement('span', {
            className: `${getStatColor(grade)} font-black leading-none`,
            style: {
              fontSize: '8cqw',
              textShadow: '0.1cqw 0.1cqw 0.2cqw rgba(0,0,0,0.9)'
            }
          }, grade)
        )
      )
    )
  );
};
