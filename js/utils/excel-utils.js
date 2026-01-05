/**
 * Excel 匯入/匯出工具
 */

import { STAT_NAMES, STAT_LABELS } from './constants.js';

export const exportToExcel = (players) => {
  const data = players.map(p => ({
    '姓名': p.name,
    '背號': p.number,
    '主要位置': p.primaryPosition,
    '次要位置': p.secondaryPositions?.join(','),
    ...STAT_NAMES.reduce((obj, stat) => {
      obj[STAT_LABELS[stat]] = p.grades[stat];
      return obj;
    }, {}),
    '會到場': p.willAttend ? '是' : '否',
    '積分': p.points || 0
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "球員名冊");
  XLSX.writeFile(wb, "Roster_Master.xlsx");
};

export const importFromExcel = (file, callback) => {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const players = data.map((d, i) => {
        const grades = {};
        STAT_NAMES.forEach(stat => {
          grades[stat] = d[STAT_LABELS[stat]] || 'C';
        });
        
        return {
          id: 'imp-' + Date.now() + i,
          name: d.姓名 || '球員',
          number: String(d.背號 || '0'),
          primaryPosition: d.主要位置 || 'P',
          secondaryPositions: d.次要位置 ? String(d.次要位置).split(',') : [],
          grades,
          willAttend: d.會到場 === '是',
          points: d.積分 ?? 0 
        };
      });
      
      callback(players);
    } catch (error) {
      console.error('Excel 匯入失敗:', error);
      alert('匯入失敗：' + error.message);
    }
  };
  
  reader.readAsBinaryString(file);
};
