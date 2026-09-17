import {useMemo, useState, type CSSProperties} from 'react';
import {
  LuSearch,
  LuUser,
  LuLaptop,
  LuClipboardList,
  LuPlus,
  LuCornerDownLeft,
} from 'react-icons/lu';
import {
  TechCareScreen,
  base,
  TELA_A,
  VERDE,
  VERDE_FRACO,
  CINZA,
  BORDA,
  TINTA,
} from '../TechCareScreen';

// ── Dados ──────────────────────────────────────────────────
type Tipo = 'cliente' | 'ordem' | 'aparelho';

interface Item {
  tipo: Tipo;
  titulo: string;
  detalhe: string;
  chaves: string[];
}

const ACERVO: Item[] = [
  {tipo: 'cliente', titulo: 'Neusa Barreto', detalhe: '(99) 98812-4471 · 3 aparelhos · cliente desde 2024', chaves: ['neusa barreto', '99988124471', 'neusa.barreto@gmail.com']},
  {tipo: 'cliente', titulo: 'Wellington Prado', detalhe: '(99) 99145-2230 · 1 aparelho', chaves: ['wellington prado', '99991452230', 'well.prado@gmail.com']},
  {tipo: 'cliente', titulo: 'Papelaria Arco-Íris', detalhe: 'CNPJ 18.442.109/0001-55 · 2 aparelhos', chaves: ['papelaria arco iris', 'arco-iris', '18442109000155']},
  {tipo: 'ordem', titulo: 'OS-202609-00014', detalhe: 'Neusa Barreto · Dell Inspiron 15 · Em execução · Éder', chaves: ['os-202609-00014', '00014', '14', 'neusa barreto', 'dell inspiron']},
  {tipo: 'ordem', titulo: 'OS-202609-00009', detalhe: 'Papelaria Arco-Íris · Impressora Epson · Atrasada há 2 dias', chaves: ['os-202609-00009', '00009', '9', 'papelaria arco iris', 'epson']},
  {tipo: 'aparelho', titulo: 'Dell Inspiron 15 3511', detalhe: 'Série JK7PL92 · Neusa Barreto · na garantia até 14/12', chaves: ['dell inspiron 15 3511', 'jk7pl92', 'dell', 'neusa barreto']},
  {tipo: 'aparelho', titulo: 'Acer Aspire 5 A515-54', detalhe: 'Série 8HD2K10 · Wellington Prado', chaves: ['acer aspire 5 a515-54', '8hd2k10', 'acer', 'wellington prado']},
];

const ICONE: Record<Tipo, typeof LuUser> = {cliente: LuUser, ordem: LuClipboardList, aparelho: LuLaptop};
const NOME_DO_TIPO: Record<Tipo, string> = {cliente: 'Clientes', ordem: 'Ordens', aparelho: 'Aparelhos'};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s@.-]/g, '')
    .trim();
}

function casa(item: Item, termo: string): boolean {
  const limpo = normalizar(termo);
  if (!limpo) return false;
  const soDigitos = limpo.replace(/\D/g, '');
  if (soDigitos.length >= 2 && /^\d+$/.test(limpo.replace(/\s/g, ''))) {
    return item.chaves.some((c) => c.replace(/\D/g, '').includes(soDigitos));
  }
  return item.chaves.some((c) => normalizar(c).includes(limpo));
}

// ── Pendências de fundo, para a tela não parecer vazia ─────
const PENDENCIAS = [
  {os: 'OS-202609-00009', cliente: 'Papelaria Arco-Íris', motivo: 'Atrasada há 2 dias', acao: 'ligar'},
  {os: 'OS-202609-00006', cliente: 'Ademir Fontes', motivo: 'Na prateleira há 9 dias', acao: 'avisar'},
  {os: 'OS-202609-00011', cliente: 'Tânia Kowalski', motivo: 'Sem resposta há 4 dias', acao: 'copiar link'},
  {os: 'OS-202609-00014', cliente: 'Neusa Barreto', motivo: 'Conferência não terminada', acao: 'retomar'},
];

const s: Record<string, CSSProperties> = {
  linhaPend: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1.4fr 1fr 110px',
    gap: 16,
    padding: '13px 18px',
    borderBottom: `1px solid ${BORDA}`,
    alignItems: 'center',
    fontSize: 13.5,
  },
  acao: {
    border: `1px solid ${BORDA}`,
    background: '#fff',
    borderRadius: 7,
    padding: '5px 12px',
    fontSize: 12,
    color: TINTA,
  },
  buscaTopo: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    border: `1px solid ${BORDA}`,
    background: '#fff',
    borderRadius: 9,
    padding: '9px 13px',
    width: 420,
    color: CINZA,
    fontSize: 13.5,
  },
  atalho: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: 600,
    border: `1px solid ${BORDA}`,
    borderRadius: 5,
    padding: '1px 6px',
  },

  // Overlay
  paleta: {
    width: 640,
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 24px 70px rgba(0,0,0,0.30)',
    overflow: 'hidden',
    border: `1px solid ${BORDA}`,
  },
  campoLinha: {
    display: 'flex',
    alignItems: 'center',
    gap: 11,
    padding: '16px 18px',
    borderBottom: `1px solid ${BORDA}`,
  },
  campo: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: TINTA,
    fontSize: 17,
  },
  grupo: {
    padding: '9px 18px 5px',
    fontSize: 10.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: CINZA,
  },
  item: {display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px'},
  itemAtivo: {background: VERDE_FRACO},
  icone: {
    display: 'grid',
    placeItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    background: VERDE_FRACO,
    color: VERDE,
    flexShrink: 0,
  },
  vazio: {padding: '26px 18px', fontSize: 13.5, color: CINZA},
  rodape: {
    display: 'flex',
    gap: 16,
    padding: '9px 18px',
    borderTop: `1px solid ${BORDA}`,
    fontSize: 11.5,
    color: CINZA,
    background: '#fafbfa',
  },
  sugestoes: {display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center'},
  chipFora: {
    border: '1px solid var(--ifm-color-emphasis-300)',
    background: 'var(--ifm-background-color)',
    color: 'var(--ifm-font-color-base)',
    borderRadius: 999,
    padding: '4px 11px',
    fontSize: 12,
    cursor: 'pointer',
  },
};

const SUGESTOES = ['neusa', '99988124471', '14', 'jk7pl92', 'arco-iris', 'zzz'];

export default function CounterSearchMockup() {
  const [termo, setTermo] = useState('neusa');
  const achados = useMemo(() => ACERVO.filter((i) => casa(i, termo)), [termo]);

  const porTipo = useMemo(() => {
    const mapa: Record<Tipo, Item[]> = {cliente: [], ordem: [], aparelho: []};
    achados.forEach((i) => mapa[i.tipo].push(i));
    return mapa;
  }, [achados]);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={s.sugestoes}>
        <span style={{...base.legenda, marginRight: 2}}>Digite aqui:</span>
        {SUGESTOES.map((sug) => (
          <button key={sug} style={s.chipFora} onClick={() => setTermo(sug)}>
            {sug}
          </button>
        ))}
      </div>

      <TechCareScreen
        id="busca-do-balcao"
        caminho="/hoje"
        usuario={{nome: 'Sandra Moreira', cargo: 'Dona'}}
        trilha={['O Dia']}
        secao="hoje"
        escurecido
        nota={
          <>
            <strong>Quem está vendo:</strong> Sandra, a dona. A busca é a única das três
            propostas que serve a qualquer cargo — o que muda é o resultado, porque cada
            pessoa só encontra o que já pode abrir. <strong>Ordens vêm primeiro</strong>
            porque quem chega ao balcão quase sempre pergunta sobre um aparelho que já
            deixou, e a busca abre por cima do que a pessoa estava fazendo.
          </>
        }
        sobreposicao={(escala) => (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 118 * escala,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                width: 640 * escala,
                transformOrigin: 'top left',
                pointerEvents: 'auto',
              }}
            >
              <div style={{...s.paleta, transformOrigin: 'top left', transform: `scale(${escala})`, width: 640}}>
                <div style={s.campoLinha}>
                  <LuSearch size={19} style={{color: CINZA}} />
                  <input
                    style={s.campo}
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    placeholder="Nome, telefone, número da OS ou série…"
                    aria-label="Busca do balcão"
                  />
                </div>

                {termo.trim() === '' && (
                  <div style={s.vazio}>
                    Digite qualquer coisa que o cliente falar no balcão.
                  </div>
                )}

                {termo.trim() !== '' && achados.length === 0 && (
                  <div style={{...s.item, padding: '16px 18px'}}>
                    <span style={s.icone}>
                      <LuPlus size={16} />
                    </span>
                    <span>
                      <div style={{fontSize: 14.5, fontWeight: 600}}>
                        Cadastrar “{termo}” como cliente novo
                      </div>
                      <div style={{fontSize: 12.5, color: CINZA}}>
                        Quem não está no sistema costuma ser cliente novo, não erro de
                        digitação
                      </div>
                    </span>
                  </div>
                )}

                {(['ordem', 'cliente', 'aparelho'] as Tipo[]).map((tipo, gi) =>
                  porTipo[tipo].length === 0 ? null : (
                    <div key={tipo}>
                      <div style={s.grupo}>{NOME_DO_TIPO[tipo]}</div>
                      {porTipo[tipo].map((item, i) => {
                        const Icone = ICONE[item.tipo];
                        const primeiro = gi === 0 && i === 0;
                        return (
                          <div
                            key={item.titulo}
                            style={{...s.item, ...(primeiro ? s.itemAtivo : {})}}
                          >
                            <span style={s.icone}>
                              <Icone size={16} />
                            </span>
                            <span style={{flex: 1}}>
                              <div style={{fontSize: 14.5, fontWeight: 600}}>
                                {item.titulo}
                              </div>
                              <div style={{fontSize: 12.5, color: CINZA}}>
                                {item.detalhe}
                              </div>
                            </span>
                            {primeiro && (
                              <LuCornerDownLeft size={15} style={{color: VERDE}} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ),
                )}

                <div style={s.rodape}>
                  <span>↑↓ navegar</span>
                  <span>↵ abrir</span>
                  <span>esc fechar</span>
                  <span style={{marginLeft: 'auto'}}>
                    {achados.length} {achados.length === 1 ? 'resultado' : 'resultados'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      >
        <div style={base.cabecalhoPagina}>
          <div>
            <h1 style={base.h1}>O Dia</h1>
            <p style={base.sub}>Quinta, 17 de setembro · 4 coisas pedindo alguém</p>
          </div>
          <div style={s.buscaTopo}>
            <LuSearch size={15} /> Buscar no balcão
            <span style={s.atalho}>⌘K</span>
          </div>
        </div>

        <div style={base.tiles}>
          {[
            ['Atrasadas', '2', 'com cliente esperando'],
            ['Para hoje', '2', 'prometidas até as 18h'],
            ['Na prateleira', '1', 'pronto e não retirado'],
            ['Sem técnico', '3', 'ninguém assumiu'],
          ].map(([r, v, n]) => (
            <div key={r} style={base.tile}>
              <div style={base.tileRotulo}>{r}</div>
              <div style={base.tileValor}>{v}</div>
              <div style={base.tileNota}>{n}</div>
            </div>
          ))}
        </div>

        <div style={base.cartao}>
          <div style={base.cartaoTopo}>
            <strong style={{fontSize: 14}}>Precisa de alguém</strong>
            <span style={{fontSize: 12.5, color: CINZA}}>por urgência</span>
          </div>
          {PENDENCIAS.map((p) => (
            <div key={p.os} style={s.linhaPend}>
              <span>
                <div style={{fontWeight: 600}}>{p.cliente}</div>
                <div style={{fontSize: 12, color: CINZA}}>{p.os}</div>
              </span>
              <span style={{color: CINZA}}>{p.motivo}</span>
              <span />
              <button style={s.acao}>{p.acao}</button>
            </div>
          ))}
        </div>
      </TechCareScreen>
    </div>
  );
}
