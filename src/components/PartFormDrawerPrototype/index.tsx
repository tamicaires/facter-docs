import {useState, type CSSProperties} from 'react';

// ── Types ──────────────────────────────────────────────────
type TabKey = 'stepper' | 'accordion' | 'livepreview';

// ── Styles ─────────────────────────────────────────────────
const s: Record<string, CSSProperties> = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '2px solid var(--ifm-color-emphasis-200)',
  },
  tab: {
    padding: '10px 18px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ifm-color-emphasis-600)',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: 'var(--ifm-color-primary)',
    borderBottom: '2px solid var(--ifm-color-primary)',
    fontWeight: 600,
  },
  drawer: {
    border: '1px solid var(--ifm-color-emphasis-200)',
    borderRadius: '12px 0 0 12px',
    background: 'var(--ifm-background-surface-color)',
    boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
    background: 'var(--ifm-color-emphasis-100)',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--ifm-font-color-base)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-200)',
    background: 'none',
    cursor: 'pointer',
    fontSize: 16,
    color: 'var(--ifm-color-emphasis-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerBody: {
    padding: 20,
    overflowY: 'auto',
    maxHeight: 520,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--ifm-color-emphasis-600)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#ef4444',
    marginLeft: 2,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-200)',
    background: 'var(--ifm-background-surface-color)',
    fontSize: 14,
    color: 'var(--ifm-font-color-base)',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--ifm-color-emphasis-200)',
    background: 'var(--ifm-background-surface-color)',
    fontSize: 14,
    color: 'var(--ifm-font-color-base)',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  row: {
    display: 'flex',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid var(--ifm-color-emphasis-200)',
  },
  btn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  btnPrimary: {
    background: 'var(--ifm-color-primary)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'none',
    border: '1px solid var(--ifm-color-emphasis-200)',
    color: 'var(--ifm-font-color-base)',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    padding: '16px 20px',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    transition: 'all 0.2s',
  },
  stepDotActive: {
    background: 'var(--ifm-color-primary)',
    color: '#fff',
  },
  stepDotInactive: {
    background: 'var(--ifm-color-emphasis-200)',
    color: 'var(--ifm-color-emphasis-600)',
  },
  stepDotDone: {
    background: '#22c55e',
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    transition: 'all 0.2s',
  },
  stepLabel: {
    fontSize: 11,
    color: 'var(--ifm-color-emphasis-600)',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: 'var(--ifm-font-color-base)',
  },
  accordionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    cursor: 'pointer',
    border: 'none',
    background: 'var(--ifm-color-emphasis-100)',
    width: '100%',
    textAlign: 'left',
    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
    transition: 'background 0.2s',
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--ifm-font-color-base)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  accordionBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 10,
    background: 'var(--ifm-color-emphasis-200)',
    color: 'var(--ifm-color-emphasis-600)',
  },
  accordionBody: {
    padding: 20,
    transition: 'all 0.2s',
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 4,
    background: '#fef3c7',
    color: '#92400e',
    marginLeft: 8,
  },
  splitLayout: {
    display: 'flex',
    minHeight: 480,
  },
  leftPanel: {
    flex: '0 0 60%',
    padding: 20,
    overflowY: 'auto',
    maxHeight: 520,
    borderRight: '1px solid var(--ifm-color-emphasis-200)',
  },
  rightPanel: {
    flex: '0 0 40%',
    padding: 20,
    background: 'var(--ifm-color-emphasis-100)',
    overflowY: 'auto',
    maxHeight: 520,
  },
  previewCard: {
    border: '1px solid var(--ifm-color-emphasis-200)',
    borderRadius: 12,
    background: 'var(--ifm-background-surface-color)',
    overflow: 'hidden',
  },
  previewCardHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
    background: 'var(--ifm-color-emphasis-100)',
  },
  previewCardBody: {
    padding: 16,
  },
  previewRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
  },
  previewLabel: {
    fontSize: 11,
    color: 'var(--ifm-color-emphasis-600)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--ifm-font-color-base)',
  },
  previewDivider: {
    borderTop: '1px dashed var(--ifm-color-emphasis-200)',
    margin: '10px 0',
  },
  conversionPreview: {
    padding: '10px 14px',
    borderRadius: 8,
    background: 'var(--ifm-color-emphasis-100)',
    fontSize: 13,
    fontWeight: 500,
    marginTop: 8,
    textAlign: 'center',
  },
  sectionDivider: {
    borderTop: '1px solid var(--ifm-color-emphasis-200)',
    margin: '20px 0',
  },
  chevron: {
    fontSize: 12,
    transition: 'transform 0.2s',
  },
};

// ── Helper Components ──────────────────────────────────────

function FormField({label, required, placeholder, type = 'text', value, onChange}: {
  label: string;
  required?: boolean;
  placeholder: string;
  type?: 'text' | 'select';
  value?: string;
  onChange?: (v: string) => void;
  options?: string[];
}) {
  return (
    <div style={s.formGroup}>
      <label style={s.label}>
        {label}
        {required && <span style={s.required}>*</span>}
      </label>
      {type === 'text' ? (
        <input
          style={s.input}
          placeholder={placeholder}
          value={value || ''}
          onChange={e => onChange?.(e.target.value)}
          readOnly={!onChange}
        />
      ) : (
        <select
          style={s.select}
          value={value || ''}
          onChange={e => onChange?.(e.target.value)}
        >
          <option value="">{placeholder}</option>
        </select>
      )}
    </div>
  );
}

function SelectField({label, required, placeholder, options, value, onChange}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div style={s.formGroup}>
      <label style={s.label}>
        {label}
        {required && <span style={s.required}>*</span>}
      </label>
      <select
        style={s.select}
        value={value || ''}
        onChange={e => onChange?.(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ── Proposal A: Stepper ────────────────────────────────────

function ProposalStepper() {
  const [step, setStep] = useState(0);
  const steps = ['Identificacao', 'Estoque & Financeiro', 'Unidade de Medida'];

  return (
    <div style={{...s.drawer, width: 500}}>
      <div style={s.drawerHeader}>
        <span style={s.drawerTitle}>Cadastrar Peca</span>
        <button style={s.closeBtn}>&#10005;</button>
      </div>

      {/* Step Indicator */}
      <div style={s.stepIndicator}>
        {steps.map((label, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div
                style={{
                  ...s.stepDot,
                  ...(i < step ? s.stepDotDone : i === step ? s.stepDotActive : s.stepDotInactive),
                }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span style={s.stepLabel}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  ...s.stepLine,
                  background: i < step ? '#22c55e' : 'var(--ifm-color-emphasis-200)',
                  margin: '0 8px',
                  marginBottom: 18,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div style={s.drawerBody}>
        {step === 0 && (
          <div>
            <div style={s.sectionTitle}>Identificacao</div>
            <FormField label="Nome" required placeholder="Ex: Filtro de oleo" />
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="N. Serie" required placeholder="Ex: SN-001234" />
              </div>
              <div style={s.col}>
                <FormField label="N. Peca" required placeholder="Ex: FLT-5W30" />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Marca" placeholder="Ex: Tecfil" />
              </div>
              <div style={s.col}>
                <FormField label="Modelo" placeholder="Ex: PH-5300" />
              </div>
            </div>
            <FormField label="Fornecedor" placeholder="Selecionar fornecedor" type="select" />
          </div>
        )}

        {step === 1 && (
          <div>
            <div style={s.sectionTitle}>Estoque & Financeiro</div>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Preco Custo" required placeholder="R$ 0,00" />
              </div>
              <div style={s.col}>
                <FormField label="Preco Venda" placeholder="R$ 0,00" />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Qtd Estoque" required placeholder="0" />
              </div>
              <div style={s.col}>
                <SelectField
                  label="Localizacao"
                  required
                  placeholder="Selecionar"
                  options={['Almoxarifado A', 'Almoxarifado B', 'Prateleira 01', 'Prateleira 02']}
                />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <SelectField
                  label="Status"
                  required
                  placeholder="Selecionar"
                  options={['Ativo', 'Inativo', 'Descontinuado']}
                />
              </div>
              <div style={s.col}>
                <SelectField
                  label="Categoria"
                  required
                  placeholder="Selecionar"
                  options={['Filtros', 'Lubrificantes', 'Freios', 'Eletrica', 'Suspensao']}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
              <span style={s.sectionTitle}>Unidade de Medida</span>
              <span style={s.optionalBadge}>Opcional</span>
            </div>
            <SelectField
              label="Un. Estoque"
              placeholder="Ex: Rolo"
              options={['Unidade (un)', 'Rolo (rl)', 'Balde (bd)', 'Caixa (cx)', 'Litro (L)', 'Quilograma (kg)']}
            />
            <SelectField
              label="Un. Consumo"
              placeholder="Ex: Metro"
              options={['Unidade (un)', 'Metro (m)', 'Litro (L)', 'Quilograma (kg)', 'Centimetro (cm)']}
            />
            <FormField label="Fator de Conversao" placeholder="Ex: 100" />
            <div style={s.conversionPreview}>
              1 rolo = 100 metros
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div>
          {step > 0 && (
            <button
              style={{...s.btn, ...s.btnSecondary}}
              onClick={() => setStep(step - 1)}
            >
              &larr; Voltar
            </button>
          )}
        </div>
        <div>
          {step < 2 ? (
            <button
              style={{...s.btn, ...s.btnPrimary}}
              onClick={() => setStep(step + 1)}
            >
              Continuar &rarr;
            </button>
          ) : (
            <button style={{...s.btn, ...s.btnPrimary}}>
              Cadastrar Peca
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Proposal B: Accordion ──────────────────────────────────

function ProposalAccordion() {
  const [open, setOpen] = useState<Record<string, boolean>>({
    identificacao: true,
    estoque: false,
    unidade: false,
  });

  const toggle = (key: string) => {
    setOpen(prev => ({...prev, [key]: !prev[key]}));
  };

  return (
    <div style={{...s.drawer, width: 500}}>
      <div style={s.drawerHeader}>
        <span style={s.drawerTitle}>Cadastrar Peca</span>
        <button style={s.closeBtn}>&#10005;</button>
      </div>

      <div style={{maxHeight: 480, overflowY: 'auto'}}>
        {/* Section: Identificacao */}
        <button style={s.accordionHeader} onClick={() => toggle('identificacao')}>
          <span style={s.accordionTitle}>
            <span style={s.chevron}>{open.identificacao ? '▼' : '▶'}</span>
            Identificacao
          </span>
          <span style={s.accordionBadge}>6 campos</span>
        </button>
        {open.identificacao && (
          <div style={s.accordionBody}>
            <FormField label="Nome" required placeholder="Ex: Filtro de oleo" />
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="N. Serie" required placeholder="Ex: SN-001234" />
              </div>
              <div style={s.col}>
                <FormField label="N. Peca" required placeholder="Ex: FLT-5W30" />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Marca" placeholder="Ex: Tecfil" />
              </div>
              <div style={s.col}>
                <FormField label="Modelo" placeholder="Ex: PH-5300" />
              </div>
            </div>
            <FormField label="Fornecedor" placeholder="Selecionar fornecedor" type="select" />
          </div>
        )}

        {/* Section: Estoque & Financeiro */}
        <button style={s.accordionHeader} onClick={() => toggle('estoque')}>
          <span style={s.accordionTitle}>
            <span style={s.chevron}>{open.estoque ? '▼' : '▶'}</span>
            Estoque & Financeiro
          </span>
          <span style={s.accordionBadge}>6 campos</span>
        </button>
        {open.estoque && (
          <div style={s.accordionBody}>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Preco Custo" required placeholder="R$ 0,00" />
              </div>
              <div style={s.col}>
                <FormField label="Preco Venda" placeholder="R$ 0,00" />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <FormField label="Qtd Estoque" required placeholder="0" />
              </div>
              <div style={s.col}>
                <SelectField
                  label="Localizacao"
                  required
                  placeholder="Selecionar"
                  options={['Almoxarifado A', 'Almoxarifado B', 'Prateleira 01', 'Prateleira 02']}
                />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.col}>
                <SelectField
                  label="Status"
                  required
                  placeholder="Selecionar"
                  options={['Ativo', 'Inativo', 'Descontinuado']}
                />
              </div>
              <div style={s.col}>
                <SelectField
                  label="Categoria"
                  required
                  placeholder="Selecionar"
                  options={['Filtros', 'Lubrificantes', 'Freios', 'Eletrica', 'Suspensao']}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section: Unidade de Medida */}
        <button style={s.accordionHeader} onClick={() => toggle('unidade')}>
          <span style={s.accordionTitle}>
            <span style={s.chevron}>{open.unidade ? '▼' : '▶'}</span>
            Unidade de Medida
            <span style={s.optionalBadge}>Opcional</span>
          </span>
          <span style={s.accordionBadge}>3 campos</span>
        </button>
        {open.unidade && (
          <div style={s.accordionBody}>
            <SelectField
              label="Un. Estoque"
              placeholder="Ex: Rolo"
              options={['Unidade (un)', 'Rolo (rl)', 'Balde (bd)', 'Caixa (cx)', 'Litro (L)', 'Quilograma (kg)']}
            />
            <SelectField
              label="Un. Consumo"
              placeholder="Ex: Metro"
              options={['Unidade (un)', 'Metro (m)', 'Litro (L)', 'Quilograma (kg)', 'Centimetro (cm)']}
            />
            <FormField label="Fator de Conversao" placeholder="Ex: 100" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div />
        <button style={{...s.btn, ...s.btnPrimary}}>
          Cadastrar Peca
        </button>
      </div>
    </div>
  );
}

// ── Proposal C: Live Preview ───────────────────────────────

function ProposalLivePreview() {
  const [form, setForm] = useState({
    nome: '',
    serie: '',
    peca: '',
    marca: '',
    modelo: '',
    fornecedor: '',
    precoCusto: '',
    precoVenda: '',
    qtdEstoque: '',
    localizacao: '',
    status: '',
    categoria: '',
    unEstoque: '',
    unConsumo: '',
    fator: '',
  });

  const update = (field: string) => (v: string) => {
    setForm(prev => ({...prev, [field]: v}));
  };

  const hasConversion = form.unEstoque && form.unConsumo && form.fator;

  return (
    <div style={{...s.drawer, width: 750}}>
      <div style={s.drawerHeader}>
        <span style={s.drawerTitle}>Cadastrar Peca</span>
        <button style={s.closeBtn}>&#10005;</button>
      </div>

      <div style={s.splitLayout}>
        {/* Left Panel: Form */}
        <div style={s.leftPanel}>
          {/* Section: Identificacao */}
          <div style={s.sectionTitle}>Identificacao</div>
          <FormField label="Nome" required placeholder="Ex: Filtro de oleo" value={form.nome} onChange={update('nome')} />
          <div style={s.row}>
            <div style={s.col}>
              <FormField label="N. Serie" required placeholder="Ex: SN-001234" value={form.serie} onChange={update('serie')} />
            </div>
            <div style={s.col}>
              <FormField label="N. Peca" required placeholder="Ex: FLT-5W30" value={form.peca} onChange={update('peca')} />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.col}>
              <FormField label="Marca" placeholder="Ex: Tecfil" value={form.marca} onChange={update('marca')} />
            </div>
            <div style={s.col}>
              <FormField label="Modelo" placeholder="Ex: PH-5300" value={form.modelo} onChange={update('modelo')} />
            </div>
          </div>
          <SelectField
            label="Fornecedor"
            placeholder="Selecionar fornecedor"
            options={['Fornecedor A', 'Fornecedor B', 'Fornecedor C']}
            value={form.fornecedor}
            onChange={update('fornecedor')}
          />

          <div style={s.sectionDivider} />

          {/* Section: Estoque & Financeiro */}
          <div style={s.sectionTitle}>Estoque & Financeiro</div>
          <div style={s.row}>
            <div style={s.col}>
              <FormField label="Preco Custo" required placeholder="R$ 0,00" value={form.precoCusto} onChange={update('precoCusto')} />
            </div>
            <div style={s.col}>
              <FormField label="Preco Venda" placeholder="R$ 0,00" value={form.precoVenda} onChange={update('precoVenda')} />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.col}>
              <FormField label="Qtd Estoque" required placeholder="0" value={form.qtdEstoque} onChange={update('qtdEstoque')} />
            </div>
            <div style={s.col}>
              <SelectField
                label="Localizacao"
                required
                placeholder="Selecionar"
                options={['Almoxarifado A', 'Almoxarifado B', 'Prateleira 01', 'Prateleira 02']}
                value={form.localizacao}
                onChange={update('localizacao')}
              />
            </div>
          </div>
          <div style={s.row}>
            <div style={s.col}>
              <SelectField
                label="Status"
                required
                placeholder="Selecionar"
                options={['Ativo', 'Inativo', 'Descontinuado']}
                value={form.status}
                onChange={update('status')}
              />
            </div>
            <div style={s.col}>
              <SelectField
                label="Categoria"
                required
                placeholder="Selecionar"
                options={['Filtros', 'Lubrificantes', 'Freios', 'Eletrica', 'Suspensao']}
                value={form.categoria}
                onChange={update('categoria')}
              />
            </div>
          </div>

          <div style={s.sectionDivider} />

          {/* Section: Unidade de Medida */}
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16}}>
            <span style={s.sectionTitle}>Unidade de Medida</span>
            <span style={s.optionalBadge}>Opcional</span>
          </div>
          <SelectField
            label="Un. Estoque"
            placeholder="Ex: Rolo"
            options={['Unidade (un)', 'Rolo (rl)', 'Balde (bd)', 'Caixa (cx)', 'Litro (L)', 'Quilograma (kg)']}
            value={form.unEstoque}
            onChange={update('unEstoque')}
          />
          <SelectField
            label="Un. Consumo"
            placeholder="Ex: Metro"
            options={['Unidade (un)', 'Metro (m)', 'Litro (L)', 'Quilograma (kg)', 'Centimetro (cm)']}
            value={form.unConsumo}
            onChange={update('unConsumo')}
          />
          <FormField label="Fator de Conversao" placeholder="Ex: 100" value={form.fator} onChange={update('fator')} />
        </div>

        {/* Right Panel: Preview */}
        <div style={s.rightPanel}>
          <div style={{fontSize: 12, fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12}}>
            Preview do Cadastro
          </div>

          <div style={s.previewCard}>
            <div style={s.previewCardHeader}>
              <div style={{fontSize: 14, fontWeight: 700, color: 'var(--ifm-font-color-base)'}}>
                {form.nome || 'Nome da peca'}
              </div>
              <div style={{fontSize: 11, color: 'var(--ifm-color-emphasis-600)', marginTop: 2}}>
                {form.peca || 'N. Peca'}
              </div>
            </div>
            <div style={s.previewCardBody}>
              <div style={s.previewRow}>
                <span style={s.previewLabel}>Marca</span>
                <span style={s.previewValue}>{form.marca || '--'}</span>
              </div>
              <div style={s.previewRow}>
                <span style={s.previewLabel}>Categoria</span>
                <span style={s.previewValue}>{form.categoria || '--'}</span>
              </div>

              <div style={s.previewDivider} />

              <div style={s.previewRow}>
                <span style={s.previewLabel}>Preco Custo</span>
                <span style={s.previewValue}>
                  {form.precoCusto ? `R$ ${form.precoCusto}` : '--'}
                </span>
              </div>
              <div style={s.previewRow}>
                <span style={s.previewLabel}>Preco Venda</span>
                <span style={s.previewValue}>
                  {form.precoVenda ? `R$ ${form.precoVenda}` : '--'}
                </span>
              </div>

              {hasConversion && (
                <>
                  <div style={s.previewDivider} />
                  <div style={{fontSize: 11, fontWeight: 600, color: 'var(--ifm-color-emphasis-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6}}>
                    Conversao
                  </div>
                  <div style={s.conversionPreview}>
                    1 {form.unEstoque.split(' ')[0].toLowerCase()} = {form.fator} {form.unConsumo.split(' ')[0].toLowerCase()}(s)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <div />
        <button style={{...s.btn, ...s.btnPrimary}}>
          Cadastrar Peca
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function PartFormDrawerPrototype() {
  const [activeTab, setActiveTab] = useState<TabKey>('stepper');

  const tabs: {key: TabKey; label: string}[] = [
    {key: 'stepper', label: 'A: Stepper'},
    {key: 'accordion', label: 'B: Accordion'},
    {key: 'livepreview', label: 'C: Live Preview'},
  ];

  return (
    <div style={s.wrapper}>
      {/* Tab Bar */}
      <div style={s.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            style={{
              ...s.tab,
              ...(activeTab === tab.key ? s.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{display: 'flex', justifyContent: 'center', padding: '10px 0'}}>
        {activeTab === 'stepper' && <ProposalStepper />}
        {activeTab === 'accordion' && <ProposalAccordion />}
        {activeTab === 'livepreview' && <ProposalLivePreview />}
      </div>
    </div>
  );
}
