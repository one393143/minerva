/**
 * 輔助函數
 */

export const getGradeColor = (grade) => {
  const colors = {
    S: 'from-purple-400 to-purple-600',
    A: 'from-yellow-300 to-yellow-500',
    B: 'from-slate-200 to-slate-400', // Silver updated
    C: 'from-orange-700 to-amber-900', // Bronze updated
    D: 'from-green-300 to-green-500', // D uses Green
    E: 'from-white to-slate-100',
    F: 'from-white to-slate-100'
  };
  return colors[grade] || colors.F;
};

export const getCardRarity = (grades) => {
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  const values = Object.values(grades).map(g => gradeValues[g] || 1);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // 修正級距判定邏輯，讓更多人進入鑽石/金卡
  // S=7, A=6, B=5, C=4, D=3, E=2, F=1
  // A- (平均 5.375) 應為鑽石
  // B+ (平均 5.125) 應為金卡

  if (avg >= 5.25) return 'from-purple-400 to-purple-600'; // Diamond (S ~ A-)
  if (avg >= 4.25) return 'from-yellow-300 to-amber-500'; // Gold (B+ ~ B-)
  if (avg >= 3.25) return 'from-slate-200 to-slate-400'; // Silver (C+ ~ C-)
  if (avg >= 2.0) return 'from-orange-700 to-amber-900'; // Bronze (D)
  return 'from-white to-slate-100'; // Normal
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateAverageGrade = (player) => {
  if (!player || !player.grades) return 0;
  
  const GRADE_VALUES = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  const grades = player.grades;
  
  const total =
    (GRADE_VALUES[grades.hitting] || 1) +
    (GRADE_VALUES[grades.power] || 1) +
    (GRADE_VALUES[grades.discipline] || 1) +
    (GRADE_VALUES[grades.speed] || 1) +
    (GRADE_VALUES[grades.defense] || 1) +
    (GRADE_VALUES[grades.accuracy] || 1) +
    (GRADE_VALUES[grades.armStrength] || 1) +
    (GRADE_VALUES[grades.iq] || 1);

  return total / 8;
};
