import type {ReactNode} from 'react';
import {LuMessageCircle, LuCheck, LuX, LuRocket, LuArchive} from 'react-icons/lu';

type Status = 'em-discussao' | 'aprovado' | 'rejeitado' | 'implementado' | 'arquivado';

const statusLabels: Record<Status, string> = {
  'em-discussao': 'Em discussao',
  'aprovado': 'Aprovado',
  'rejeitado': 'Rejeitado',
  'implementado': 'Implementado',
  'arquivado': 'Arquivado',
};

const statusIcons: Record<Status, ReactNode> = {
  'em-discussao': <LuMessageCircle size={13} />,
  'aprovado': <LuCheck size={13} />,
  'rejeitado': <LuX size={13} />,
  'implementado': <LuRocket size={13} />,
  'arquivado': <LuArchive size={13} />,
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({status}: StatusBadgeProps): ReactNode {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusIcons[status]}
      {statusLabels[status]}
    </span>
  );
}
