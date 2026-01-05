/**
 * 輪替編輯 Modal
 */

import { PlayerCard } from '../components/PlayerCard.js';

export const RotationEditModal = ({
  editingSlot,
  players,
  onSwapPositions,
  onSubstitutePlayer,
  onSubstitutePitcher,
  onClose
}) => {
  if (!editingSlot) return null;

  const availablePlayers = players.filter(p => p.willAttend);
  const { rotId, slotIdx, currentPlayerId, rotation, isPitcher } = editingSlot;

  // 取得場上球員（用於換位置）
  const onFieldPlayers = Object.entries(rotation.lineup)
    .filter(([pos, pid]) => pid && pid !== currentPlayerId)
    .map(([pos, pid]) => availablePlayers.find(p => p.id === pid))
    .filter(Boolean);

  // 取得板凳球員（用於換人）
  const benchPlayers = availablePlayers.filter(p => 
    !Object.values(rotation.lineup).includes(p.id)
  );

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop modal-enter'
  },
    React.createElement('div', {
      className: 'bg-slate-900 w-full max-w-md rounded-3xl border-2 border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]'
    },
      React.createElement('h3', {
        className: 'text-lg font-black mb-4 text-cyan-400'
      }, isPitcher ? '更換投手' : '調整球員'),

      // 換位置
      !isPitcher && onFieldPlayers.length > 0 && React.createElement('div', { className: 'mb-6' },
        React.createElement('h4', {
          className: 'text-xs font-black text-slate-500 uppercase mb-2'
        }, '換位置'),
        React.createElement('div', { className: 'space-y-2' },
          onFieldPlayers.map(p =>
            React.createElement(PlayerCard, {
              key: p.id,
              player: p,
              compact: true,
              onClick: () => onSwapPositions(rotId, slotIdx, p.id)
            })
          )
        )
      ),

      // 換人
      React.createElement('div', null,
        React.createElement('h4', {
          className: 'text-xs font-black text-slate-500 uppercase mb-2'
        }, '換人'),
        React.createElement('div', { className: 'space-y-2' },
          benchPlayers.length > 0 ? benchPlayers.map(p =>
            React.createElement(PlayerCard, {
              key: p.id,
              player: p,
              compact: true,
              onClick: () => isPitcher 
                ? onSubstitutePitcher(rotId, p.id)
                : onSubstitutePlayer(rotId, slotIdx, p.id)
            })
          ) : React.createElement('p', {
            className: 'text-center py-6 text-slate-600 text-sm'
          }, '無可用替補球員')
        )
      ),

      React.createElement('button', {
        onClick: onClose,
        className: 'w-full mt-6 py-3 rounded-2xl bg-slate-800 text-slate-400 font-black text-xs'
      }, '取消')
    )
  );
};
