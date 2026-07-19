import {useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
type TabKey = 'cadastro' | 'solicitacao' | 'aprovacao' | 'estoque';

interface UnitOption {
  name: string;
  abbr: string;
  category: string;
}

interface PartExample {
  name: string;
  stockUnit: string;
  stockAbbr: string;
  consumptionUnit: string;
  consumptionAbbr: string;
  factor: number;
  currentStock: number;
}

// ── Data ───────────────────────────────────────────────
const UNITS: UnitOption[] = [
  {name: 'Unidade', abbr: 'un', category: 'Quantidade'},
  {name: 'Par', abbr: 'par', category: 'Quantidade'},
  {name: 'Jogo', abbr: 'jg', category: 'Quantidade'},
  {name: 'Caixa', abbr: 'cx', category: 'Quantidade'},
  {name: 'Litro', abbr: 'L', category: 'Volume'},
  {name: 'Mililitro', abbr: 'mL', category: 'Volume'},
  {name: 'Quilograma', abbr: 'kg', category: 'Peso'},
  {name: 'Grama', abbr: 'g', category: 'Peso'},
  {name: 'Metro', abbr: 'm', category: 'Comprimento'},
  {name: 'Centimetro', abbr: 'cm', category: 'Comprimento'},
  {name: 'Metro quadrado', abbr: 'm2', category: 'Area'},
];

const PARTS: PartExample[] = [
  {name: 'Fio Eletrico 2.5mm', stockUnit: 'Rolo', stockAbbr: 'rl', consumptionUnit: 'Metro', consumptionAbbr: 'm', factor: 100, currentStock: 3},
  {name: 'Oleo Motor 15W40', stockUnit: 'Balde 20L', stockAbbr: 'bd', consumptionUnit: 'Litro', consumptionAbbr: 'L', factor: 20, currentStock: 5},
  {name: 'Graxa EP-2', stockUnit: 'Balde 5kg', stockAbbr: 'bd', consumptionUnit: 'Quilograma', consumptionAbbr: 'kg', factor: 5, currentStock: 2},
  {name: 'Lona de Freio', stockUnit: 'Jogo', stockAbbr: 'jg', consumptionUnit: 'Roda', consumptionAbbr: 'rd', factor: 4, currentStock: 8},
  {name: 'Parafuso M10', stockUnit: 'Unidade', stockAbbr: 'un', consumptionUnit: 'Unidade', consumptionAbbr: 'un', factor: 1, currentStock: 150},
];

// ── Styles ─────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  container: {display: 'flex', flexDirection: 'column', gap: 20},
  tabs: {display: 'flex', gap: 0, borderBottom: '2px solid var(--ifm-color-emphasis-200)'},
  tab: {padding: '10px 18px', cursor: 'pointer', border: 'none', background: 'none', fontSize: 13, fontWeight: 500, color: 'var(--ifm-color-emphasis-600)', borderBottom: '2px solid transparent', marginBottom: -2, transition: 'all 0.2s', whiteSpace: 'nowrap'},
  tabActive: {color: 'var(--ifm-color-primary)', borderBottom: '2px solid var(--ifm-color-primary)', fontWeight: 600},
  card: {border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 12, overflow: 'hidden', background: 'var(--ifm-background-surface-color)'},
  cardHeader: {padding: '14px 20px', borderBottom: '1px solid var(--ifm-color-emphasis-200)', background: 'var(--ifm-color-emphasis-100)'},
  cardTitle: {fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8},
  cardBody: {padding: '20px'},
  formGroup: {marginBottom: 16},
  label: {display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5},
  select: {width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-background-surface-color)', fontSize: 14, color: 'var(--ifm-font-color-base)', appearance: 'none' as const, cursor: 'pointer'},
  input: {width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-300)', background: 'var(--ifm-background-surface-color)', fontSize: 14, color: 'var(--ifm-font-color-base)'},
  inputWithSuffix: {display: 'flex', alignItems: 'stretch', borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-300)', overflow: 'hidden'},
  inputInner: {flex: 1, padding: '10px 12px', border: 'none', background: 'var(--ifm-background-surface-color)', fontSize: 14, color: 'var(--ifm-font-color-base)', outline: 'none'},
  inputSuffix: {padding: '10px 14px', background: 'var(--ifm-color-emphasis-100)', fontSize: 13, fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', display: 'flex', alignItems: 'center', borderLeft: '1px solid var(--ifm-color-emphasis-200)'},
  row: {display: 'flex', gap: 12},
  col: {flex: 1},
  hint: {fontSize: 12, color: 'var(--ifm-color-emphasis-500)', marginTop: 6, lineHeight: 1.4},
  factorPreview: {padding: '12px 16px', borderRadius: 8, background: 'var(--ifm-color-emphasis-100)', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, marginTop: 8},
  conversionResult: {padding: '14px 16px', borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-200)', marginTop: 12, fontSize: 13, lineHeight: 1.8},
  impactBadge: {display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600},
  table: {width: '100%', borderCollapse: 'collapse' as const, fontSize: 13},
  th: {textAlign: 'left' as const, padding: '10px 14px', fontWeight: 600, fontSize: 11, color: 'var(--ifm-color-emphasis-600)', borderBottom: '1px solid var(--ifm-color-emphasis-200)', textTransform: 'uppercase' as const, letterSpacing: 0.5},
  td: {padding: '12px 14px', borderBottom: '1px solid var(--ifm-color-emphasis-100)', verticalAlign: 'middle' as const},
  progressBar: {width: '100%', height: 6, borderRadius: 3, background: 'var(--ifm-color-emphasis-200)', overflow: 'hidden', marginTop: 4},
  progressFill: {height: '100%', borderRadius: 3, transition: 'width 0.5s ease'},
  approvalCard: {border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 10, padding: '16px 20px', marginBottom: 12, background: 'var(--ifm-background-surface-color)'},
  approvalRow: {display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0'},
  approvalLabel: {fontSize: 12, color: 'var(--ifm-color-emphasis-600)'},
  approvalValue: {fontSize: 13, fontWeight: 600},
  approvalDivider: {borderTop: '1px dashed var(--ifm-color-emphasis-200)', margin: '8px 0'},
  button: {padding: '10px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'},
  buttonPrimary: {background: 'var(--ifm-color-primary)', color: '#fff'},
  buttonDanger: {background: '#ef4444', color: '#fff'},
  buttonGhost: {background: 'transparent', color: 'var(--ifm-color-emphasis-600)', border: '1px solid var(--ifm-color-emphasis-300)'},
  desc: {padding: '14px 18px', fontSize: 13, color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6, background: 'var(--ifm-color-emphasis-100)', borderRadius: 8},
};

// ── Helpers ────────────────────────────────────────────
function Badge({color, label}: {color: string; label: string}) {
  const colors: Record<string, {bg: string; text: string; border: string}> = {
    green: {bg: '#d1fae5', text: '#065f46', border: '#6ee7b7'},
    blue: {bg: '#dbeafe', text: '#1e40af', border: '#93c5fd'},
    amber: {bg: '#fef3c7', text: '#92400e', border: '#fcd34d'},
    red: {bg: '#fee2e2', text: '#991b1b', border: '#fca5a5'},
    purple: {bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd'},
    gray: {bg: '#f3f4f6', text: '#374151', border: '#d1d5db'},
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
      borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {label}
    </span>
  );
}

function Dot({color}: {color: string}) {
  return <span style={{width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block'}} />;
}

// ── Tab: Cadastro ──────────────────────────────────────
function CadastroTab() {
  const [stockUnit, setStockUnit] = useState('Rolo');
  const [consumptionUnit, setConsumptionUnit] = useState('Metro');
  const [factor, setFactor] = useState('100');

  const isDifferent = stockUnit !== consumptionUnit;
  const factorNum = parseFloat(factor) || 1;

  return (
    <div>
      <div style={s.desc}>
        Prototipo do formulario de cadastro de peca com os novos campos de unidade de medida. Os campos de unidade de consumo e fator so aparecem quando relevante.
      </div>

      <div style={{...s.card, marginTop: 16}}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>Cadastro de Peca — Fio Eletrico 2.5mm</div>
        </div>
        <div style={s.cardBody}>
          <div style={s.row}>
            <div style={s.col}>
              <div style={s.formGroup}>
                <label style={s.label}>Nome da peca</label>
                <input style={s.input} value="Fio Eletrico 2.5mm" readOnly />
              </div>
            </div>
            <div style={s.col}>
              <div style={s.formGroup}>
                <label style={s.label}>Part Number</label>
                <input style={s.input} value="FIO-EL-250" readOnly />
              </div>
            </div>
          </div>

          <div style={{borderTop: '1px solid var(--ifm-color-emphasis-200)', margin: '8px 0 20px', paddingTop: 16}}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8}}>
              <Dot color="var(--ifm-color-primary)" /> Unidades de Medida
            </div>

            <div style={s.row}>
              <div style={s.col}>
                <div style={s.formGroup}>
                  <label style={s.label}>Unidade de estoque</label>
                  <select style={s.select} value={stockUnit} onChange={(e) => setStockUnit(e.target.value)}>
                    <option>Unidade</option>
                    <option>Par</option>
                    <option>Jogo</option>
                    <option>Caixa</option>
                    <option>Rolo</option>
                    <option>Litro</option>
                    <option>Quilograma</option>
                  </select>
                  <div style={s.hint}>Como esta peca e controlada no estoque</div>
                </div>
              </div>
              <div style={s.col}>
                <div style={s.formGroup}>
                  <label style={s.label}>Unidade de consumo</label>
                  <select style={s.select} value={consumptionUnit} onChange={(e) => setConsumptionUnit(e.target.value)}>
                    <option>Unidade</option>
                    <option>Metro</option>
                    <option>Centimetro</option>
                    <option>Litro</option>
                    <option>Mililitro</option>
                    <option>Quilograma</option>
                    <option>Grama</option>
                    <option>Roda</option>
                  </select>
                  <div style={s.hint}>Como o mecanico solicita esta peca</div>
                </div>
              </div>
            </div>

            {isDifferent && (
              <div>
                <div style={s.formGroup}>
                  <label style={s.label}>Fator de conversao</label>
                  <div style={s.inputWithSuffix}>
                    <span style={{...s.inputSuffix, borderLeft: 'none', borderRight: '1px solid var(--ifm-color-emphasis-200)'}}>1 {stockUnit} =</span>
                    <input
                      style={s.inputInner}
                      type="number"
                      value={factor}
                      onChange={(e) => setFactor(e.target.value)}
                      min="0.01"
                      step="0.01"
                    />
                    <span style={s.inputSuffix}>{consumptionUnit}</span>
                  </div>
                </div>

                <div style={s.factorPreview}>
                  <span style={{color: 'var(--ifm-color-primary)', fontSize: 16}}>{'='}</span>
                  <span>1 <strong>{stockUnit}</strong> = {factorNum} <strong>{consumptionUnit}</strong></span>
                  <span style={{margin: '0 4px', color: 'var(--ifm-color-emphasis-400)'}}>|</span>
                  <span>1 <strong>{consumptionUnit}</strong> = {(1 / factorNum).toFixed(4)} <strong>{stockUnit}</strong></span>
                </div>
              </div>
            )}

            {!isDifferent && (
              <div style={{...s.factorPreview, color: 'var(--ifm-color-emphasis-500)'}}>
                Unidades iguais — sem conversao necessaria. Fator fixo em 1.
              </div>
            )}
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20}}>
            <button style={{...s.button, ...s.buttonGhost}}>Cancelar</button>
            <button style={{...s.button, ...s.buttonPrimary}}>Salvar Peca</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Solicitacao ───────────────────────────────────
function SolicitacaoTab() {
  const [selectedPart, setSelectedPart] = useState(0);
  const [qty, setQty] = useState('15');

  const part = PARTS[selectedPart];
  const qtyNum = parseFloat(qty) || 0;
  const stockImpact = qtyNum / part.factor;
  const availableConsumption = part.currentStock * part.factor;
  const hasStock = part.currentStock >= stockImpact;
  const stockPercent = Math.min((stockImpact / part.currentStock) * 100, 100);

  return (
    <div>
      <div style={s.desc}>
        Prototipo da solicitacao de peca. O mecanico solicita na unidade de consumo (metros, litros) e o sistema calcula automaticamente o impacto no estoque.
      </div>

      <div style={{...s.card, marginTop: 16}}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>Nova Solicitacao de Peca</div>
        </div>
        <div style={s.cardBody}>
          <div style={s.formGroup}>
            <label style={s.label}>Peca</label>
            <select style={s.select} value={selectedPart} onChange={(e) => {setSelectedPart(Number(e.target.value)); setQty('15');}}>
              {PARTS.map((p, i) => (
                <option key={i} value={i}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Quantidade</label>
            <div style={s.inputWithSuffix}>
              <input
                style={s.inputInner}
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                min="0.5"
                step={part.factor === 1 ? '1' : '0.5'}
              />
              <span style={s.inputSuffix}>{part.consumptionAbbr}</span>
            </div>
            <div style={s.hint}>
              Disponivel: {part.currentStock} {part.stockAbbr}
              {part.factor !== 1 && <span> ({availableConsumption} {part.consumptionAbbr})</span>}
            </div>
          </div>

          {qtyNum > 0 && (
            <div style={s.conversionResult}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>Impacto no estoque</span>
                <span style={{...s.impactBadge, background: hasStock ? '#d1fae5' : '#fee2e2', color: hasStock ? '#065f46' : '#991b1b'}}>
                  {stockImpact.toFixed(2)} {part.stockAbbr} de {part.currentStock} {part.stockAbbr}
                </span>
              </div>

              <div style={{...s.progressBar, marginTop: 10}}>
                <div style={{...s.progressFill, width: `${stockPercent}%`, background: hasStock ? '#22c55e' : '#ef4444'}} />
              </div>

              {part.factor !== 1 && (
                <div style={{marginTop: 10, fontSize: 12, color: 'var(--ifm-color-emphasis-500)'}}>
                  {qtyNum} {part.consumptionAbbr} / {part.factor} = {stockImpact.toFixed(2)} {part.stockAbbr}
                  <span style={{margin: '0 8px'}}>|</span>
                  Restante: {(part.currentStock - stockImpact).toFixed(2)} {part.stockAbbr} ({((part.currentStock - stockImpact) * part.factor).toFixed(1)} {part.consumptionAbbr})
                </div>
              )}

              {!hasStock && (
                <div style={{marginTop: 10, padding: '8px 12px', borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 12, fontWeight: 500}}>
                  Estoque insuficiente. Disponivel: {availableConsumption} {part.consumptionAbbr}
                </div>
              )}
            </div>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20}}>
            <button style={{...s.button, ...s.buttonGhost}}>Cancelar</button>
            <button style={{...s.button, ...s.buttonPrimary, opacity: hasStock ? 1 : 0.5, pointerEvents: hasStock ? 'auto' : 'none'}}>
              Solicitar Peca
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Aprovacao ─────────────────────────────────────
function AprovacaoTab() {
  return (
    <div>
      <div style={s.desc}>
        Prototipo da tela de aprovacao. O gestor visualiza a solicitacao com as duas unidades de medida e o impacto calculado automaticamente.
      </div>

      <div style={{...s.card, marginTop: 16}}>
        <div style={s.cardHeader}>
          <div style={{...s.cardTitle, justifyContent: 'space-between'}}>
            <span>Aprovacao de Solicitacao</span>
            <Badge color="amber" label="Pendente" />
          </div>
        </div>
        <div style={s.cardBody}>
          {/* Request info */}
          <div style={s.approvalCard}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 10}}>Fio Eletrico 2.5mm</div>
            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Solicitado por</span>
              <span style={s.approvalValue}>Carlos Mecanico</span>
            </div>
            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Servico</span>
              <span style={{fontSize: 13}}>Substituir chicote eletrico</span>
            </div>
            <div style={s.approvalDivider} />

            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Quantidade solicitada</span>
              <span style={s.approvalValue}>15 metros</span>
            </div>
            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Impacto no estoque</span>
              <span style={{...s.approvalValue, color: '#7c3aed'}}>0.15 rolos</span>
            </div>
            <div style={s.approvalDivider} />

            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Estoque atual</span>
              <span style={s.approvalValue}>3.00 rolos <span style={{fontWeight: 400, color: 'var(--ifm-color-emphasis-500)'}}>(300 m)</span></span>
            </div>
            <div style={s.approvalRow}>
              <span style={s.approvalLabel}>Apos aprovacao</span>
              <span style={{...s.approvalValue, color: '#059669'}}>2.85 rolos <span style={{fontWeight: 400, color: 'var(--ifm-color-emphasis-500)'}}>(285 m)</span></span>
            </div>

            <div style={{...s.progressBar, marginTop: 10}}>
              <div style={{...s.progressFill, width: '5%', background: '#7c3aed'}} />
            </div>
            <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-500)', marginTop: 4, textAlign: 'right'}}>
              5% do estoque
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8}}>
            <button style={{...s.button, ...s.buttonDanger}}>Rejeitar</button>
            <button style={{...s.button, ...s.buttonPrimary}}>Aprovar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Estoque ───────────────────────────────────────
function EstoqueTab() {
  return (
    <div>
      <div style={s.desc}>
        Prototipo da visualizacao de estoque. Cada peca exibe a quantidade na unidade de estoque com a equivalencia em unidade de consumo entre parenteses.
      </div>

      <div style={{...s.card, marginTop: 16}}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>Estoque de Pecas</div>
        </div>
        <div style={{overflowX: 'auto'}}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Peca</th>
                <th style={{...s.th, textAlign: 'center'}}>Estoque</th>
                <th style={{...s.th, textAlign: 'center'}}>Equivalencia</th>
                <th style={{...s.th, textAlign: 'center'}}>Unidade Controle</th>
                <th style={{...s.th, textAlign: 'center'}}>Unidade Consumo</th>
                <th style={{...s.th, textAlign: 'center'}}>Fator</th>
              </tr>
            </thead>
            <tbody>
              {PARTS.map((part, i) => {
                const equiv = part.currentStock * part.factor;
                return (
                  <tr key={i}>
                    <td style={s.td}>
                      <div style={{fontWeight: 500}}>{part.name}</div>
                    </td>
                    <td style={{...s.td, textAlign: 'center', fontWeight: 600, fontVariantNumeric: 'tabular-nums'}}>
                      {part.currentStock} {part.stockAbbr}
                    </td>
                    <td style={{...s.td, textAlign: 'center', color: 'var(--ifm-color-emphasis-600)', fontVariantNumeric: 'tabular-nums'}}>
                      {part.factor !== 1 ? `${equiv} ${part.consumptionAbbr}` : '—'}
                    </td>
                    <td style={{...s.td, textAlign: 'center'}}>
                      <Badge color="blue" label={part.stockUnit} />
                    </td>
                    <td style={{...s.td, textAlign: 'center'}}>
                      <Badge color={part.factor !== 1 ? 'purple' : 'gray'} label={part.consumptionUnit} />
                    </td>
                    <td style={{...s.td, textAlign: 'center', fontFamily: 'monospace', fontSize: 12}}>
                      {part.factor !== 1 ? `1:${part.factor}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
const TAB_CONFIG: {key: TabKey; label: string; icon: string}[] = [
  {key: 'cadastro', label: 'Cadastro', icon: ''},
  {key: 'solicitacao', label: 'Solicitacao', icon: ''},
  {key: 'aprovacao', label: 'Aprovacao', icon: ''},
  {key: 'estoque', label: 'Estoque', icon: ''},
];

export function UnitOfMeasureMockup(): ReactNode {
  const [activeTab, setActiveTab] = useState<TabKey>('cadastro');

  return (
    <div style={s.container}>
      <div style={s.tabs}>
        {TAB_CONFIG.map(({key, label}) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{...s.tab, ...(activeTab === key ? s.tabActive : {})}}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'cadastro' && <CadastroTab />}
      {activeTab === 'solicitacao' && <SolicitacaoTab />}
      {activeTab === 'aprovacao' && <AprovacaoTab />}
      {activeTab === 'estoque' && <EstoqueTab />}

      <div style={{fontSize: 12, color: 'var(--ifm-color-emphasis-500)', textAlign: 'center', fontStyle: 'italic'}}>
        Prototipo interativo — altere valores nos campos para simular o comportamento
      </div>
    </div>
  );
}
