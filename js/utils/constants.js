/**
 * 常數定義
 */

export const ALL_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE', 'DH1', 'DH2', 'DH3'];

export const POSITION_OPTIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'FE', 'DH'];

export const GRADE_OPTIONS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

export const STAT_NAMES = ['hitting', 'power', 'discipline', 'speed', 'defense', 'accuracy', 'armStrength', 'iq'];

export const STAT_LABELS = {
  hitting: '打擊',
  power: '力量',
  discipline: '選球',
  speed: '速度',
  defense: '守備',
  accuracy: '傳準',
  armStrength: '臂力',
  iq: '球商'
};

export const DEFAULT_PLAYERS = [
  {
    id: '1',
    name: '王大強',
    number: '1',
    primaryPosition: 'P',
    secondaryPositions: ['DH'],
    grades: { hitting: 'C', power: 'C', discipline: 'C', speed: 'C', defense: 'A', accuracy: 'A', armStrength: 'B', iq: 'A' },
    willAttend: true,
    points: 80
  },
  {
    id: '2',
    name: '李重砲',
    number: '24',
    primaryPosition: 'RF',
    secondaryPositions: ['1B', 'DH'],
    grades: { hitting: 'A', power: 'S', discipline: 'B', speed: 'D', defense: 'C', accuracy: 'B', armStrength: 'A', iq: 'B' },
    willAttend: true,
    points: 90
  }
];

export const FIELD_POSITIONS = [
  { pos: 'P', top: '55%', left: '50%' },
  { pos: 'C', top: '78%', left: '50%' },
  { pos: '1B', top: '45%', left: '82%' },
  { pos: '2B', top: '25%', left: '65%' },
  { pos: '3B', top: '45%', left: '18%' },
  { pos: 'SS', top: '25%', left: '35%' },
  { pos: 'LF', top: '15%', left: '15%' },
  { pos: 'CF', top: '8%', left: '50%' },
  { pos: 'RF', top: '15%', left: '85%' },
  { pos: 'FE', top: '35%', left: '50%' }
];
