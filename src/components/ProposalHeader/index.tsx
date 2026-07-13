import {useState, type ReactNode} from 'react';
import {LuLink, LuCheck} from 'react-icons/lu';
import {StatusBadge} from '../StatusBadge';

type Status = 'em-discussao' | 'aprovado' | 'rejeitado' | 'implementado' | 'arquivado';

interface ProposalHeaderProps {
  status: Status;
  date?: string;
}

export function ProposalHeader({status, date}: ProposalHeaderProps): ReactNode {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="proposal-header">
      <div className="proposal-header__left">
        <StatusBadge status={status} />
        {date && <span className="proposal-header__date">{date}</span>}
      </div>
      <button
        className={`proposal-header__share ${copied ? 'proposal-header__share--copied' : ''}`}
        onClick={handleCopy}
        title="Copiar link da pagina"
      >
        {copied ? <LuCheck size={13} /> : <LuLink size={13} />}
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  );
}
