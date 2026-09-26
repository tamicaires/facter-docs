import {useState, type CSSProperties} from 'react';
import {
  LuUserPlus,
  LuShieldCheck,
  LuTriangleAlert,
  LuX,
  LuSearch,
  LuEllipsisVertical,
} from 'react-icons/lu';
import {
  TechCareScreen,
  base,
  iniciais,
  TELA_A,
  VERDE,
  VERDE_FRACO,
  CINZA,
  BORDA,
  TINTA,
} from '../TechCareScreen';

// ── Dados ──────────────────────────────────────────────────
type Cargo = 'OWNER' | 'ADMIN' | 'MANAGER' | 'ATTENDANT' | 'TECHNICIAN';

interface Pessoa {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  ativa: boolean;
  dona?: boolean;
  desde: string;
  ordens: number;
}

const INICIAL: Pessoa[] = [
  {id: '1', nome: 'Sandra Moreira', email: 'sandra@bitebyte.com.br', cargo: 'OWNER', ativa: true, dona: true, desde: 'mar 2024', ordens: 41},
  {id: '2', nome: 'Éder Pimentel', email: 'eder@bitebyte.com.br', cargo: 'TECHNICIAN', ativa: true, desde: 'mar 2024', ordens: 38},
  {id: '3', nome: 'Vinícius Laurindo', email: 'vinicius@bitebyte.com.br', cargo: 'ATTENDANT', ativa: true, desde: 'ago 2026', ordens: 12},
  {id: '4', nome: 'Rosana Teles', email: 'rosana@bitebyte.com.br', cargo: 'TECHNICIAN', ativa: false, desde: 'jan 2025', ordens: 63},
];

const ROTULO: Record<Cargo, string> = {
  OWNER: 'Dona',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  ATTENDANT: 'Atendente',
  TECHNICIAN: 'Técnico',
};

const RESUMO: Record<Cargo, string> = {
  OWNER: 'Pode tudo, inclusive mudar o modo da oficina',
  ADMIN: 'Opera tudo e cadastra gente',
  MANAGER: 'Opera tudo e distribui ordens',
  ATTENDANT: 'Recebe, orça e cobra. Não mexe no estoque',
  TECHNICIAN: 'Conserta e julga garantia. Não vê dinheiro',
};

// OWNER não entra: propriedade se transfere, não se concede por menu suspenso.
const ATRIBUIVEIS: Cargo[] = ['ADMIN', 'MANAGER', 'ATTENDANT', 'TECHNICIAN'];

const GRADE = '2.1fr 1.5fr 1.8fr 0.9fr 0.8fr 40px';

const s: Record<string, CSSProperties> = {
  busca: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: `1px solid ${BORDA}`,
    borderRadius: 8,
    padding: '7px 11px',
    width: 280,
    color: CINZA,
    fontSize: 13,
  },
  cabTabela: {
    display: 'grid',
    gridTemplateColumns: GRADE,
    gap: 16,
    padding: '10px 18px',
    borderBottom: `1px solid ${BORDA}`,
    background: '#fafbfa',
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: CINZA,
  },
  linha: {
    display: 'grid',
    gridTemplateColumns: GRADE,
    gap: 16,
    padding: '13px 18px',
    borderBottom: `1px solid ${BORDA}`,
    alignItems: 'center',
    fontSize: 13.5,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 999,
    background: VERDE_FRACO,
    color: VERDE,
    display: 'grid',
    placeItems: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  nome: {fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7},
  email: {fontSize: 12, color: CINZA, marginTop: 1},
  selo: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 10.5,
    fontWeight: 700,
    background: VERDE,
    color: '#fff',
  },
  select: {
    width: '100%',
    padding: '7px 9px',
    borderRadius: 7,
    border: `1px solid ${BORDA}`,
    background: '#fff',
    color: TINTA,
    fontSize: 13,
  },
  resumoCargo: {fontSize: 12, color: CINZA, lineHeight: 1.4},
  pastilha: {display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: 'pointer'},
  ativa: {background: VERDE_FRACO, color: VERDE},
  inativa: {background: '#f1f1f1', color: '#8a8a8a'},
  acao: {border: 'none', background: 'none', color: CINZA, cursor: 'pointer', display: 'grid', placeItems: 'center'},
  aviso: {
    display: 'flex',
    gap: 9,
    alignItems: 'flex-start',
    padding: '11px 18px',
    background: '#fff8e6',
    color: '#8a6100',
    fontSize: 12.5,
    lineHeight: 1.45,
    borderBottom: `1px solid ${BORDA}`,
  },

  gaveta: {
    width: 380,
    height: TELA_A,
    background: '#fff',
    borderLeft: `1px solid ${BORDA}`,
    boxShadow: '-10px 0 34px rgba(0,0,0,0.10)',
    display: 'flex',
    flexDirection: 'column',
    transformOrigin: 'top left',
  },
  gavetaTopo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: `1px solid ${BORDA}`,
  },
  gavetaCorpo: {padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 15, flex: 1},
  rotulo: {fontSize: 12.5, fontWeight: 600, marginBottom: 6, display: 'block'},
  campo: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: `1px solid ${BORDA}`,
    background: '#fff',
    color: TINTA,
    fontSize: 13.5,
  },
  cargoOpcao: {
    display: 'flex',
    gap: 11,
    padding: '11px 13px',
    border: `1px solid ${BORDA}`,
    borderRadius: 9,
    cursor: 'pointer',
    alignItems: 'flex-start',
  },
  cargoOpcaoAtiva: {borderColor: VERDE, background: VERDE_FRACO},
  radio: {width: 15, height: 15, borderRadius: 999, border: `2px solid ${BORDA}`, flexShrink: 0, marginTop: 2},
  radioAtivo: {border: `5px solid ${VERDE}`},
  gavetaRodape: {padding: '16px 22px', borderTop: `1px solid ${BORDA}`, display: 'flex', gap: 10},
};

export default function TeamScreenMockup() {
  const [pessoas, setPessoas] = useState<Pessoa[]>(INICIAL);
  const [gaveta, setGaveta] = useState(false);
  const [nome, setNome] = useState('');
  const [cargoNovo, setCargoNovo] = useState<Cargo>('TECHNICIAN');
  const [aviso, setAviso] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'bancada'>('todas');

  const ativas = pessoas.filter((p) => p.ativa);
  const bancada = ativas.filter((p) => p.cargo === 'TECHNICIAN');
  const visiveis = pessoas.filter((p) =>
    filtro === 'ativas' ? p.ativa : filtro === 'bancada' ? p.cargo === 'TECHNICIAN' : true,
  );

  function trocarCargo(id: string, cargo: Cargo) {
    setPessoas((a) => a.map((p) => (p.id === id ? {...p, cargo} : p)));
    setAviso(null);
  }

  function alternar(id: string) {
    const pessoa = pessoas.find((p) => p.id === id);
    if (!pessoa) return;
    // A oficina não pode ficar sem dona; a saída vai escrita na mensagem.
    if (pessoa.dona && pessoa.ativa) {
      setAviso(
        'Sandra é a única dona. Para desativá-la, transfira a propriedade da oficina para outra pessoa antes.',
      );
      return;
    }
    setAviso(null);
    setPessoas((a) => a.map((p) => (p.id === id ? {...p, ativa: !p.ativa} : p)));
  }

  function adicionar() {
    if (!nome.trim()) return;
    const primeiro = nome.trim().split(' ')[0].toLowerCase();
    setPessoas((a) => [
      ...a,
      {
        id: String(Date.now()),
        nome: nome.trim(),
        email: `${primeiro}@bitebyte.com.br`,
        cargo: cargoNovo,
        ativa: true,
        desde: 'set 2026',
        ordens: 0,
      },
    ]);
    setNome('');
    setGaveta(false);
  }

  return (
    <TechCareScreen
      id="tela-de-equipe"
      caminho="/settings/team"
      usuario={{nome: 'Sandra Moreira', cargo: 'Dona'}}
      trilha={['Configurações', 'Equipe']}
      secao="ajustes"
      nota={
        <>
          <strong>Quem está vendo:</strong> Sandra, a dona. Esta tela exige permissão
          de gerenciar usuários, que só dona e administrador têm — o Éder não a alcança
          nem pelo endereço direto. <strong>Experimente:</strong> troque um cargo, clique
          na pastilha de situação, filtre por bancada e abra “Adicionar pessoa”. Tente
          também tirar o acesso da própria Sandra.
        </>
      }
      sobreposicao={(escala) =>
        gaveta ? (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 380 * escala,
              height: TELA_A * escala,
              overflow: 'hidden',
            }}
          >
            <div style={{...s.gaveta, transform: `scale(${escala})`}}>
              <div style={s.gavetaTopo}>
                <strong style={{fontSize: 16}}>Adicionar pessoa</strong>
                <button style={s.acao} onClick={() => setGaveta(false)}>
                  <LuX size={18} />
                </button>
              </div>
              <div style={s.gavetaCorpo}>
                <div>
                  <label style={s.rotulo}>Nome</label>
                  <input
                    style={s.campo}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como aparece nas ordens"
                    onKeyDown={(e) => e.key === 'Enter' && adicionar()}
                  />
                </div>
                <div>
                  <label style={s.rotulo}>O que essa pessoa faz</label>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    {ATRIBUIVEIS.map((c) => (
                      <div
                        key={c}
                        style={{...s.cargoOpcao, ...(cargoNovo === c ? s.cargoOpcaoAtiva : {})}}
                        onClick={() => setCargoNovo(c)}
                      >
                        <span style={{...s.radio, ...(cargoNovo === c ? s.radioAtivo : {})}} />
                        <span>
                          <div style={{fontWeight: 600, fontSize: 13.5}}>{ROTULO[c]}</div>
                          <div style={{fontSize: 12, color: CINZA, lineHeight: 1.4}}>
                            {RESUMO[c]}
                          </div>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{fontSize: 12, color: CINZA, lineHeight: 1.5, margin: 0}}>
                  A senha provisória aparece depois de salvar, para você passar
                  pessoalmente — o sistema ainda não envia mensagem nenhuma.
                </p>
              </div>
              <div style={s.gavetaRodape}>
                <button
                  style={{...base.botao, flex: 1, justifyContent: 'center'}}
                  onClick={adicionar}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        ) : null
      }
    >
      <div style={base.cabecalhoPagina}>
        <div>
          <h1 style={base.h1}>Equipe</h1>
          <p style={base.sub}>
            Quem tem acesso a esta oficina e o que cada pessoa pode fazer. Desativar
            tira o acesso e mantém o histórico das ordens.
          </p>
        </div>
        <button style={base.botao} onClick={() => setGaveta(true)}>
          <LuUserPlus size={15} /> Adicionar pessoa
        </button>
      </div>

      <div style={base.tiles}>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Com acesso</div>
          <div style={base.tileValor}>{ativas.length}</div>
          <div style={base.tileNota}>de {pessoas.length} cadastradas</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Na bancada</div>
          <div style={base.tileValor}>{bancada.length}</div>
          <div style={base.tileNota}>podem receber ordens</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>No balcão</div>
          <div style={base.tileValor}>
            {ativas.filter((p) => p.cargo === 'ATTENDANT' || p.dona).length}
          </div>
          <div style={base.tileNota}>orçam e cobram</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Modo da oficina</div>
          <div style={{...base.tileValor, fontSize: 19, paddingTop: 5}}>Com equipe</div>
          <div style={base.tileNota}>autônomo exige uma pessoa só</div>
        </div>
      </div>

      <div style={base.cartao}>
        <div style={base.cartaoTopo}>
          <div style={s.busca}>
            <LuSearch size={14} /> Buscar por nome ou e-mail
          </div>
          <div style={{display: 'flex', gap: 7}}>
            {(['todas', 'ativas', 'bancada'] as const).map((f) => (
              <button
                key={f}
                style={{...base.chip, ...(filtro === f ? base.chipAtivo : {})}}
                onClick={() => setFiltro(f)}
              >
                {f === 'todas' ? 'Todas' : f === 'ativas' ? 'Com acesso' : 'Bancada'}
              </button>
            ))}
          </div>
        </div>

        {aviso && (
          <div style={s.aviso}>
            <LuTriangleAlert size={15} style={{flexShrink: 0, marginTop: 1}} />
            <span>{aviso}</span>
          </div>
        )}

        <div style={s.cabTabela}>
          <span>Pessoa</span>
          <span>Cargo</span>
          <span>O que pode fazer</span>
          <span>Na oficina</span>
          <span>Situação</span>
          <span />
        </div>

        {visiveis.map((p) => (
          <div key={p.id} style={{...s.linha, opacity: p.ativa ? 1 : 0.55}}>
            <div style={{display: 'flex', gap: 11, alignItems: 'center'}}>
              <span style={s.avatar}>{iniciais(p.nome)}</span>
              <span>
                <div style={s.nome}>
                  {p.nome}
                  {p.dona && (
                    <span style={s.selo}>
                      <LuShieldCheck size={10} /> Dona
                    </span>
                  )}
                </div>
                <div style={s.email}>{p.email}</div>
              </span>
            </div>

            <div>
              {p.dona ? (
                <span style={{color: CINZA}}>{ROTULO.OWNER}</span>
              ) : (
                <select
                  style={s.select}
                  value={p.cargo}
                  disabled={!p.ativa}
                  onChange={(e) => trocarCargo(p.id, e.target.value as Cargo)}
                >
                  {ATRIBUIVEIS.map((c) => (
                    <option key={c} value={c}>
                      {ROTULO[c]}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={s.resumoCargo}>{RESUMO[p.cargo]}</div>

            <div style={{fontSize: 12.5, color: CINZA}}>
              desde {p.desde}
              <div style={{fontSize: 11.5}}>{p.ordens} ordens</div>
            </div>

            <div>
              <span
                style={{...s.pastilha, ...(p.ativa ? s.ativa : s.inativa)}}
                onClick={() => alternar(p.id)}
              >
                {p.ativa ? 'Com acesso' : 'Sem acesso'}
              </span>
            </div>

            <button style={s.acao} onClick={() => alternar(p.id)} title="Ações">
              <LuEllipsisVertical size={16} />
            </button>
          </div>
        ))}
      </div>
    </TechCareScreen>
  );
}
