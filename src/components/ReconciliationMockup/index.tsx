import {useState, type CSSProperties} from 'react';
import {LuCircleAlert, LuCircleCheck, LuPhone, LuCopy, LuLock} from 'react-icons/lu';
import {
  TechCareScreen,
  base,
  reais,
  iniciais,
  VERDE,
  VERDE_FRACO,
  CINZA,
  BORDA,
  TINTA,
} from '../TechCareScreen';

// ── Dados ──────────────────────────────────────────────────
interface Conta {
  os: string;
  cliente: string;
  aparelho: string;
  aprovado: number;
  pagamentos: {forma: string; valor: number; quando: string}[];
  entregue: boolean;
  dias: number;
}

const CONTAS: Conta[] = [
  {
    os: 'OS-202609-00006',
    cliente: 'Ademir Fontes',
    aparelho: 'Lenovo IdeaPad 3',
    aprovado: 320,
    pagamentos: [],
    entregue: true,
    dias: 9,
  },
  {
    os: 'OS-202609-00011',
    cliente: 'Tânia Kowalski',
    aparelho: 'Acer Aspire 5',
    aprovado: 470,
    pagamentos: [{forma: 'Pix (sinal)', valor: 200, quando: '12/09'}],
    entregue: false,
    dias: 4,
  },
  {
    os: 'OS-202609-00003',
    cliente: 'Papelaria Arco-Íris',
    aparelho: 'Epson L3250',
    aprovado: 245,
    pagamentos: [{forma: 'Dinheiro', valor: 100, quando: '15/09'}],
    entregue: false,
    dias: 2,
  },
  {
    os: 'OS-202609-00014',
    cliente: 'Neusa Barreto',
    aparelho: 'Dell Inspiron 15',
    aprovado: 470,
    pagamentos: [{forma: 'Pix', valor: 470, quando: '16/09'}],
    entregue: true,
    dias: 1,
  },
];

const pago = (c: Conta) => c.pagamentos.reduce((t, p) => t + p.valor, 0);
const saldo = (c: Conta) => Math.max(0, c.aprovado - pago(c));

const s: Record<string, CSSProperties> = {
  colunas: {display: 'grid', gridTemplateColumns: '1fr 372px', gap: 18, alignItems: 'start'},
  cabTabela: {
    display: 'grid',
    gridTemplateColumns: '1.9fr 1.3fr 1fr 1fr 96px',
    gap: 14,
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
    gridTemplateColumns: '1.9fr 1.3fr 1fr 1fr 96px',
    gap: 14,
    padding: '12px 18px',
    borderBottom: `1px solid ${BORDA}`,
    alignItems: 'center',
    fontSize: 13.5,
    cursor: 'pointer',
  },
  linhaAtiva: {background: VERDE_FRACO},
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: '#f0f2f1',
    color: CINZA,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11.5,
    fontWeight: 700,
    flexShrink: 0,
  },
  pastilha: {display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600},
  alerta: {background: '#fdeaea', color: '#a22'},
  parcial: {background: '#fff4e0', color: '#8a6100'},
  quitado: {background: VERDE_FRACO, color: VERDE},
  botaoMini: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    border: `1px solid ${BORDA}`,
    background: '#fff',
    color: TINTA,
    borderRadius: 7,
    padding: '5px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  painel: {background: '#fff', border: `1px solid ${BORDA}`, borderRadius: 12, overflow: 'hidden'},
  painelTopo: {padding: '15px 18px', borderBottom: `1px solid ${BORDA}`},
  painelCorpo: {padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 11},
  par: {display: 'flex', justifyContent: 'space-between', fontSize: 13.5},
  fraco: {color: CINZA},
  barra: {height: 7, borderRadius: 999, background: '#eef1ef', overflow: 'hidden'},
  faixa: {height: '100%', background: VERDE, transition: 'width .3s'},
  saldoLinha: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 18,
    fontWeight: 700,
    paddingTop: 11,
    borderTop: `1px solid ${BORDA}`,
  },
  faixaAviso: {
    display: 'flex',
    gap: 9,
    alignItems: 'flex-start',
    padding: '12px 18px',
    fontSize: 12.5,
    lineHeight: 1.45,
    background: '#fdeaea',
    color: '#a22',
  },
  faixaOk: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    padding: '12px 18px',
    fontSize: 12.5,
    background: VERDE_FRACO,
    color: VERDE,
  },
  rodapeTabela: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '13px 18px',
    fontSize: 14,
    fontWeight: 700,
  },
};

const PERFIS = {
  sandra: {nome: 'Sandra Moreira', cargo: 'Dona', veDinheiro: true},
  eder: {nome: 'Éder Pimentel', cargo: 'Técnico', veDinheiro: false},
} as const;

export default function ReconciliationMockup() {
  const [perfil, setPerfil] = useState<keyof typeof PERFIS>('sandra');
  const [selecionada, setSelecionada] = useState(CONTAS[0].os);
  const conta = CONTAS.find((c) => c.os === selecionada)!;
  const emAberto = CONTAS.filter((c) => saldo(c) > 0);
  const totalAberto = emAberto.reduce((t, c) => t + saldo(c), 0);
  const entreguesDevendo = emAberto.filter((c) => c.entregue);
  const proporcao = conta.aprovado > 0 ? (pago(conta) / conta.aprovado) * 100 : 0;

  const quem = PERFIS[perfil];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap'}}>
        <span style={{...base.legenda, marginRight: 2}}>Entrar como:</span>
        {(Object.keys(PERFIS) as (keyof typeof PERFIS)[]).map((k) => (
          <button
            key={k}
            onClick={() => setPerfil(k)}
            style={{
              border: '1px solid var(--ifm-color-emphasis-300)',
              background:
                perfil === k ? 'var(--ifm-color-primary)' : 'var(--ifm-background-color)',
              color: perfil === k ? '#fff' : 'var(--ifm-font-color-base)',
              borderRadius: 999,
              padding: '4px 13px',
              fontSize: 12,
              fontWeight: perfil === k ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {PERFIS[k].nome.split(' ')[0]} · {PERFIS[k].cargo}
          </button>
        ))}
      </div>

    <TechCareScreen
      id="conciliacao"
      caminho="/recebiveis"
      usuario={{nome: quem.nome, cargo: quem.cargo}}
      trilha={['Dinheiro', 'A receber']}
      secao="dinheiro"
      nota={
        quem.veDinheiro ? (
          <>
            <strong>Esta tela não existe hoje.</strong> A conta por ordem já é feita, mas
            só dentro da tela daquela ordem e só no navegador — não há como perguntar
            “quem me deve?” sem abrir uma OS de cada vez. Clique numa linha para ver o
            detalhe à direita, e troque para o Éder acima para ver o que muda.
          </>
        ) : (
          <>
            <strong>O técnico não vê dinheiro.</strong> Não é a tela que se esvazia: o
            item nem aparece no menu, e o servidor recusa a chamada mesmo que alguém
            digite o endereço. É a mesma regra que hoje já esconde o bloco de valores na
            ordem — e que a aba de pagamentos estava furando.
          </>
        )
      }
    >
      {!quem.veDinheiro ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            height: 520,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: '#f0f2f1',
              color: CINZA,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LuLock size={24} />
          </span>
          <div style={{fontSize: 19, fontWeight: 700}}>Esta parte não é sua</div>
          <p style={{...base.sub, maxWidth: 420, marginTop: 0}}>
            Quem conserta não vê o dinheiro. Se precisar saber se uma ordem foi paga,
            pergunte à Sandra — ela atende, orça e cobra.
          </p>
          <button style={{...base.botao, marginTop: 6}}>Voltar para a bancada</button>
        </div>
      ) : (
      <>
      <div style={base.cabecalhoPagina}>
        <div>
          <h1 style={base.h1}>A receber</h1>
          <p style={base.sub}>
            O que foi aprovado e ainda não entrou. Serviço feito sem orçar não aparece
            aqui — sem valor combinado não há dívida.
          </p>
        </div>
      </div>

      <div style={base.tiles}>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Em aberto</div>
          <div style={{...base.tileValor, color: '#a22'}}>{reais(totalAberto)}</div>
          <div style={base.tileNota}>{emAberto.length} ordens</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Entregue devendo</div>
          <div style={{...base.tileValor, color: '#a22'}}>
            {reais(entreguesDevendo.reduce((t, c) => t + saldo(c), 0))}
          </div>
          <div style={base.tileNota}>aparelho já saiu</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Recebido no mês</div>
          <div style={base.tileValor}>{reais(2840)}</div>
          <div style={base.tileNota}>setembro</div>
        </div>
        <div style={base.tile}>
          <div style={base.tileRotulo}>Ticket médio</div>
          <div style={base.tileValor}>{reais(376)}</div>
          <div style={base.tileNota}>últimos 30 dias</div>
        </div>
      </div>

      <div style={s.colunas}>
        <div style={base.cartao}>
          <div style={base.cartaoTopo}>
            <strong style={{fontSize: 14}}>Quem está devendo</strong>
            <div style={{display: 'flex', gap: 7}}>
              <span style={{...base.chip, ...base.chipAtivo}}>Em aberto</span>
              <span style={base.chip}>Quitadas</span>
            </div>
          </div>

          <div style={s.cabTabela}>
            <span>Cliente</span>
            <span>Situação</span>
            <span style={{textAlign: 'right'}}>Aprovado</span>
            <span style={{textAlign: 'right'}}>Falta</span>
            <span />
          </div>

          {CONTAS.map((c) => {
            const falta = saldo(c);
            const estilo =
              falta === 0 ? s.quitado : c.entregue ? s.alerta : s.parcial;
            const texto =
              falta === 0
                ? 'Quitada'
                : c.entregue
                  ? `Entregue há ${c.dias}d`
                  : 'Na oficina';
            return (
              <div
                key={c.os}
                style={{...s.linha, ...(c.os === selecionada ? s.linhaAtiva : {})}}
                onClick={() => setSelecionada(c.os)}
              >
                <span style={{display: 'flex', gap: 11, alignItems: 'center'}}>
                  <span style={s.avatar}>{iniciais(c.cliente)}</span>
                  <span>
                    <div style={{fontWeight: 600}}>{c.cliente}</div>
                    <div style={{fontSize: 12, color: CINZA}}>
                      {c.os} · {c.aparelho}
                    </div>
                  </span>
                </span>
                <span>
                  <span style={{...s.pastilha, ...estilo}}>{texto}</span>
                </span>
                <span style={{textAlign: 'right', color: CINZA}}>{reais(c.aprovado)}</span>
                <span style={{textAlign: 'right', fontWeight: 700}}>
                  {falta === 0 ? '—' : reais(falta)}
                </span>
                <span>
                  {falta > 0 && (
                    <button style={s.botaoMini}>
                      <LuPhone size={12} /> Cobrar
                    </button>
                  )}
                </span>
              </div>
            );
          })}

          <div style={s.rodapeTabela}>
            <span>Total em aberto</span>
            <span style={{color: '#a22'}}>{reais(totalAberto)}</span>
          </div>
        </div>

        <div style={s.painel}>
          <div style={s.painelTopo}>
            <div style={{fontSize: 14, fontWeight: 700}}>{conta.cliente}</div>
            <div style={{fontSize: 12, color: CINZA, marginTop: 2}}>
              {conta.os} · {conta.aparelho}
            </div>
          </div>
          <div style={s.painelCorpo}>
            <div style={s.par}>
              <span style={s.fraco}>Orçamento aprovado</span>
              <span>{reais(conta.aprovado)}</span>
            </div>
            {conta.pagamentos.length === 0 ? (
              <div style={s.par}>
                <span style={s.fraco}>Recebido</span>
                <span>{reais(0)}</span>
              </div>
            ) : (
              conta.pagamentos.map((p, i) => (
                <div key={i} style={s.par}>
                  <span style={s.fraco}>
                    {p.forma} · {p.quando}
                  </span>
                  <span>{reais(p.valor)}</span>
                </div>
              ))
            )}
            <div style={s.barra}>
              <div style={{...s.faixa, width: `${proporcao}%`}} />
            </div>
            <div style={s.saldoLinha}>
              <span>Falta receber</span>
              <span style={{color: saldo(conta) > 0 ? '#a22' : VERDE}}>
                {reais(saldo(conta))}
              </span>
            </div>
          </div>

          {saldo(conta) === 0 ? (
            <div style={s.faixaOk}>
              <LuCircleCheck size={15} /> Quitada em {conta.pagamentos.at(-1)?.quando}.
            </div>
          ) : conta.entregue ? (
            <div style={s.faixaAviso}>
              <LuCircleAlert size={15} style={{flexShrink: 0, marginTop: 1}} />
              <span>
                <strong>Entregue com {reais(saldo(conta))} em aberto</strong> há{' '}
                {conta.dias} dias. Hoje isso não aparece em lugar nenhum.
              </span>
            </div>
          ) : (
            <div style={{padding: '12px 18px', fontSize: 12.5, color: CINZA}}>
              O aparelho ainda está na oficina — cobrar na retirada.
            </div>
          )}

          <div style={{padding: '13px 18px', borderTop: `1px solid ${BORDA}`, display: 'flex', gap: 9}}>
            <button style={{...base.botao, flex: 1, justifyContent: 'center', padding: '9px 12px'}}>
              Registrar pagamento
            </button>
            <button style={s.botaoMini}>
              <LuCopy size={12} /> Copiar cobrança
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </TechCareScreen>
    </div>
  );
}
