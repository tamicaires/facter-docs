import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  LuSun,
  LuClipboardList,
  LuUsers,
  LuLaptop,
  LuFileText,
  LuPackage,
  LuSettings,
  LuChevronRight,
} from 'react-icons/lu';

/**
 * O chassi do TechCare, para os protótipos da documentação.
 *
 * Os mocks são desenhados numa tela fixa de 1440×900 e reduzidos para caber na
 * coluna da doc. Uma tabela solta não mostra se a tela respira: o que se julga
 * aqui é densidade, hierarquia e quanto espaço sobra — e isso só aparece com a
 * navegação, o cabeçalho e o resto do app em volta.
 *
 * As cores são fixas e claras de propósito: o protótipo representa o produto,
 * não a documentação, então não segue o tema do site.
 */
export const TELA_L = 1440;
export const TELA_A = 900;

export const VERDE = '#2f9e4f';
export const VERDE_FRACO = '#eaf6ee';
export const TINTA = '#16211a';
export const CINZA = '#6b7975';
export const BORDA = '#e3e9e5';
export const FUNDO = '#f7f9f8';

/** Qual ícone do trilho fica aceso. */
export type Secao = 'hoje' | 'ordens' | 'clientes' | 'aparelhos' | 'dinheiro' | 'estoque' | 'ajustes';

const ORDEM: Secao[] = ['hoje', 'ordens', 'clientes', 'aparelhos', 'dinheiro', 'estoque', 'ajustes'];
const ICONES = [LuSun, LuClipboardList, LuUsers, LuLaptop, LuFileText, LuPackage, LuSettings];

export const base: Record<string, CSSProperties> = {
  fora: {display: 'flex', flexDirection: 'column', gap: 12},
  moldura: {
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: 12,
    overflow: 'hidden',
    background: '#fff',
    boxShadow: '0 10px 34px rgba(0,0,0,0.12)',
  },
  barraNav: {display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', background: '#2b2b2b'},
  bolinha: {width: 9, height: 9, borderRadius: 999, display: 'inline-block'},
  urlBarra: {
    flex: 1,
    marginLeft: 8,
    background: '#3d3d3d',
    color: '#c9c9c9',
    borderRadius: 6,
    padding: '3px 10px',
    fontSize: 11,
  },
  palco: {position: 'relative', overflow: 'hidden', background: '#fff'},
  tela: {
    width: TELA_L,
    height: TELA_A,
    transformOrigin: 'top left',
    display: 'flex',
    background: FUNDO,
    fontFamily: 'var(--ifm-font-family-base)',
    color: TINTA,
  },
  trilho: {
    width: 56,
    background: '#fff',
    borderRight: `1px solid ${BORDA}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 14,
    gap: 4,
    flexShrink: 0,
  },
  marca: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: VERDE,
    display: 'grid',
    placeItems: 'center',
    color: '#fff',
    fontWeight: 800,
    fontSize: 15,
    marginBottom: 14,
  },
  icone: {width: 36, height: 36, borderRadius: 9, display: 'grid', placeItems: 'center', color: CINZA},
  iconeAtivo: {background: VERDE_FRACO, color: VERDE},
  conteudo: {flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0},
  topo: {
    height: 56,
    borderBottom: `1px solid ${BORDA}`,
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
  },
  trilha: {display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: CINZA},
  trilhaAtual: {color: TINTA, fontWeight: 600},
  empresa: {display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, fontWeight: 600, color: VERDE},
  pessoa: {display: 'flex', alignItems: 'center', gap: 9},
  pessoaNome: {fontSize: 13, fontWeight: 600, lineHeight: 1.2},
  pessoaCargo: {fontSize: 11.5, color: CINZA, lineHeight: 1.2, marginTop: 1},
  divisor: {width: 1, height: 26, background: BORDA, margin: '0 14px'},
  avatarPessoa: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: '#eef1ef',
    color: CINZA,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11.5,
    fontWeight: 700,
  },
  avatarEmpresa: {
    width: 30,
    height: 30,
    borderRadius: 999,
    background: VERDE_FRACO,
    color: VERDE,
    display: 'grid',
    placeItems: 'center',
    fontSize: 11,
    fontWeight: 800,
  },
  miolo: {padding: '26px 32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 20},
  h1: {fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.3},
  sub: {fontSize: 13.5, color: CINZA, marginTop: 5, maxWidth: 580, lineHeight: 1.5},
  cabecalhoPagina: {display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20},
  botao: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    padding: '10px 17px',
    borderRadius: 9,
    border: 'none',
    background: VERDE,
    color: '#fff',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  tiles: {display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14},
  tile: {background: '#fff', border: `1px solid ${BORDA}`, borderRadius: 11, padding: '14px 16px'},
  tileRotulo: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: CINZA,
  },
  tileValor: {fontSize: 25, fontWeight: 700, marginTop: 5, lineHeight: 1},
  tileNota: {fontSize: 11.5, color: CINZA, marginTop: 3},
  cartao: {background: '#fff', border: `1px solid ${BORDA}`, borderRadius: 12, overflow: 'hidden'},
  cartaoTopo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '13px 18px',
    borderBottom: `1px solid ${BORDA}`,
  },
  chip: {
    border: `1px solid ${BORDA}`,
    background: '#fff',
    borderRadius: 999,
    padding: '6px 13px',
    fontSize: 12.5,
    color: CINZA,
    cursor: 'pointer',
  },
  chipAtivo: {background: VERDE_FRACO, borderColor: VERDE, color: VERDE, fontWeight: 600},
  legenda: {fontSize: 12, color: 'var(--ifm-color-emphasis-600)', lineHeight: 1.55},
};

export const reais = (n: number) =>
  n.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

export const iniciais = (nome: string) =>
  nome.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Quem está com a tela aberta. A permissão muda o que aparece. */
export interface Usuario {
  nome: string;
  cargo: string;
}

interface Props {
  /** O caminho mostrado na barra de endereço. */
  caminho: string;
  /** Quem está logado. Sem isso o protótipo esconde de quem é a tela. */
  usuario: Usuario;
  /** Migalhas depois de "Início". */
  trilha: string[];
  secao: Secao;
  children: ReactNode;
  /** Desenhado por cima da tela, já em escala (gavetas, overlays). */
  sobreposicao?: (escala: number) => ReactNode;
  /** Escurece a tela — para overlay de busca. */
  escurecido?: boolean;
  nota?: ReactNode;
  id?: string;
}

export function TechCareScreen({
  caminho,
  usuario,
  trilha,
  secao,
  children,
  sobreposicao,
  escurecido,
  nota,
  id,
}: Props) {
  const palco = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.52);

  useEffect(() => {
    const alvo = palco.current;
    if (!alvo) return;
    const medir = () => setEscala(alvo.clientWidth / TELA_L);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  return (
    <div style={base.fora}>
      <div style={base.moldura} data-mock={id}>
        <div style={base.barraNav}>
          <span style={{...base.bolinha, background: '#ff5f57'}} />
          <span style={{...base.bolinha, background: '#febc2e'}} />
          <span style={{...base.bolinha, background: '#28c840'}} />
          <span style={base.urlBarra}>techcare.facter.app{caminho}</span>
        </div>

        <div ref={palco} style={{...base.palco, height: TELA_A * escala}}>
          <div style={{...base.tela, transform: `scale(${escala})`}}>
            <div style={base.trilho}>
              <div style={base.marca}>F</div>
              {ICONES.map((Icone, i) => (
                <div
                  key={i}
                  style={{...base.icone, ...(ORDEM[i] === secao ? base.iconeAtivo : {})}}
                >
                  <Icone size={18} />
                </div>
              ))}
            </div>

            <div style={base.conteudo}>
              <div style={base.topo}>
                <div style={base.trilha}>
                  <span>Início</span>
                  {trilha.map((t, i) => (
                    <span key={t} style={{display: 'flex', alignItems: 'center', gap: 7}}>
                      <LuChevronRight size={13} />
                      <span style={i === trilha.length - 1 ? base.trilhaAtual : undefined}>
                        {t}
                      </span>
                    </span>
                  ))}
                </div>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={base.empresa}>
                    <span style={base.avatarEmpresa}>BB</span>
                    Bit &amp; Byte Informática
                  </div>
                  <span style={base.divisor} />
                  <div style={base.pessoa}>
                    <span style={base.avatarPessoa}>{iniciais(usuario.nome)}</span>
                    <span>
                      <div style={base.pessoaNome}>{usuario.nome}</div>
                      <div style={base.pessoaCargo}>{usuario.cargo}</div>
                    </span>
                  </div>
                </div>
              </div>

              <div style={base.miolo}>{children}</div>
            </div>
          </div>

          {escurecido && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(12,24,18,0.42)',
                pointerEvents: 'none',
              }}
            />
          )}

          {sobreposicao?.(escala)}
        </div>
      </div>
      {nota && <p style={base.legenda}>{nota}</p>}
    </div>
  );
}
