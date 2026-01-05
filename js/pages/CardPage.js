/**
 * 球員卡測試頁面 - Modal 置中版
 * 檔案位置: js/pages/CardPage.js
 */

import { PlayerCardDisplay } from '../components/PlayerCardDisplay.js';

export const CardPage = ({ players }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [filterTier, setFilterTier] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('grade');

  const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };

  const calculateAverageGrade = (player) => {
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
  };

  const getLetterGrade = (average) => {
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
  };

  const getCardTier = (letterGrade) => {
    const grade = letterGrade.replace(/[+-]/g, '');
    if (grade === 'S') return 'diamond';
    if (grade === 'A') return 'gold';
    if (grade === 'B') return 'silver';
    if (grade === 'C') return 'bronze';
    return 'normal';
  };

  const filteredPlayers = React.useMemo(() => {
    if (filterTier === 'all') return players;
    
    return players.filter(p => {
      const average = calculateAverageGrade(p);
      const letterGrade = getLetterGrade(average);
      const tier = getCardTier(letterGrade);
      return tier === filterTier;
    });
  }, [players, filterTier]);

  const sortedPlayers = React.useMemo(() => {
    const sorted = [...filteredPlayers];
    
    if (sortBy === 'grade') {
      sorted.sort((a, b) => {
        const avgA = calculateAverageGrade(a);
        const avgB = calculateAverageGrade(b);
        return avgB - avgA;
      });
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh-TW'));
    } else if (sortBy === 'number') {
      sorted.sort((a, b) => (a.number || 999) - (b.number || 999));
    }
    
    return sorted;
  }, [filteredPlayers, sortBy]);

  const tierStats = React.useMemo(() => {
    const stats = { diamond: 0, gold: 0, silver: 0, bronze: 0, normal: 0 };
    
    players.forEach(p => {
      const average = calculateAverageGrade(p);
      const letterGrade = getLetterGrade(average);
      const tier = getCardTier(letterGrade);
      stats[tier]++;
    });
    
    return stats;
  }, [players]);

  return React.createElement('div', { className: 'animate-slide-up space-y-6' },
    // Header
    React.createElement('div', { className: 'bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-xl' },
      React.createElement('h2', {
        className: 'font-black italic text-cyan-400 uppercase tracking-widest text-xl mb-4'
      }, '🎴 Player Cards Gallery'),
      
      // 篩選器
      React.createElement('div', { className: 'space-y-3' },
        React.createElement('div', { className: 'flex gap-2 flex-wrap' },
          [
            { value: 'all', label: `全部 (${players.length})`, color: 'slate' },
            { value: 'diamond', label: `Diamond (${tierStats.diamond})`, color: 'cyan' },
            { value: 'gold', label: `Gold (${tierStats.gold})`, color: 'yellow' },
            { value: 'silver', label: `Silver (${tierStats.silver})`, color: 'gray' },
            { value: 'bronze', label: `Bronze (${tierStats.bronze})`, color: 'orange' },
            { value: 'normal', label: `Normal (${tierStats.normal})`, color: 'slate' }
          ].map(tier =>
            React.createElement('button', {
              key: tier.value,
              onClick: () => setFilterTier(tier.value),
              className: `px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
                filterTier === tier.value
                  ? `bg-${tier.color}-600 text-white border-2 border-${tier.color}-400 shadow-lg scale-105`
                  : `bg-${tier.color}-900/30 text-${tier.color}-400 border border-${tier.color}-700/30 hover:bg-${tier.color}-800/40`
              }`
            }, tier.label)
          )
        ),
        
        // 排序選項
        React.createElement('div', { className: 'flex gap-2 items-center' },
          React.createElement('span', { className: 'text-slate-500 text-xs font-bold' }, '排序:'),
          ['grade', 'name', 'number'].map(sort =>
            React.createElement('button', {
              key: sort,
              onClick: () => setSortBy(sort),
              className: `px-3 py-1 rounded-full font-bold text-xs transition-all ${
                sortBy === sort
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`
            }, 
              sort === 'grade' ? '評級' :
              sort === 'name' ? '姓名' :
              '背號'
            )
          )
        )
      ),
      
      // 統計資訊
      React.createElement('div', { className: 'mt-4 flex gap-4 text-sm flex-wrap' },
        React.createElement('p', { className: 'text-slate-400' },
          `顯示 ${sortedPlayers.length} 張卡片`
        ),
        React.createElement('p', { className: 'text-slate-400' },
          `平均評級: ${getLetterGrade(sortedPlayers.reduce((sum, p) => sum + calculateAverageGrade(p), 0) / sortedPlayers.length || 0)}`
        )
      )
    ),

    // 卡片網格
    sortedPlayers.length > 0 ? React.createElement('div', { 
      className: 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' 
    },
      sortedPlayers.map(player =>
        React.createElement('div', {
          key: player.id,
          onClick: () => setSelectedPlayer(player)
        },
          React.createElement(PlayerCardDisplay, { player, compact: true })
        )
      )
    ) : React.createElement('div', {
      className: 'text-center py-12 text-slate-500'
    },
      React.createElement('p', { className: 'text-2xl mb-2' }, '🔍'),
      React.createElement('p', { className: 'font-bold' }, '沒有符合條件的球員卡')
    ),

    // 詳細卡片 Modal（置中）
    selectedPlayer && React.createElement('div', {
      className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm',
      onClick: () => setSelectedPlayer(null)
    },
      React.createElement('div', {
        className: 'w-full max-w-md',
        onClick: (e) => e.stopPropagation()
      },
        React.createElement(PlayerCardDisplay, { player: selectedPlayer, compact: false }),
        
        // 關閉按鈕
        React.createElement('button', {
          onClick: () => setSelectedPlayer(null),
          className: 'mt-4 w-full py-3 rounded-2xl bg-slate-800 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all'
        }, 'Close')
      )
    )
  );
};
