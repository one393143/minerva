/**
 * 輔助函數
 */

export const getGradeColor = (grade) => {
  const colors = {
    S: 'from-purple-400 to-purple-600',
    A: 'from-yellow-300 to-yellow-500',
    B: 'from-sky-300 to-blue-400',
    C: 'from-orange-300 to-orange-500',
    D: 'from-green-300 to-green-500',
    E: 'from-white to-slate-100',
    F: 'from-white to-slate-100'
  };
  return colors[grade] || colors.F;
};

export const getCardRarity = (grades) => {
  const gradeValues = { S: 7, A: 6, B: 5, C: 4, D: 3, E: 2, F: 1 };
  const values = Object.values(grades).map(g => gradeValues[g] || 1);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  if (avg >= 6) return 'from-purple-400 to-purple-600';
  if (avg >= 5) return 'from-yellow-300 to-amber-500';
  if (avg >= 4) return 'from-sky-300 to-blue-400';
  if (avg >= 3) return 'from-gray-300 to-slate-400';
  if (avg >= 2) return 'from-white to-slate-100';
  return 'from-white to-slate-100';
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
