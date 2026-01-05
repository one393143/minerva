/**
 * 等級條元件
 */

import { getGradeColor } from '../utils/helpers.js';

export const GradeBar = ({ label, grade }) => {
  return React.createElement('div', { className: 'flex items-center gap-2' },
    React.createElement('span', { className: 'text-[8px] font-black text-white/70 w-8' }, label),
    React.createElement('div', {
      className: `px-2 py-0.5 rounded text-[10px] font-black bg-gradient-to-r text-slate-900 ${getGradeColor(grade)}`
    }, grade)
  );
};
