import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

// ── Types ──────────────────────────────────────────────
type Metric = 'vehicle' | 'fleet';
type InfraMode = 'auto' | 'lean' | 'full';
type ClaudePlan = 'shared' | 'max5' | 'max20';

interface Client {
  id: number;
  name: string;
  metric: Metric;
  quantity: number;
}

interface Tier {
  upTo: number;
  price: number;
}

// ── Defaults (see economia-do-produto for sources) ────
const DEFAULT_CLIENTS: Client[] = [
  {id: 1, name: 'Suzano Imperatriz', metric: 'vehicle', quantity: 250},
  {id: 2, name: 'Vale das Carretas', metric: 'fleet', quantity: 110},
];

const DEFAULT_TIERS: Tier[] = [
  {upTo: 100, price: 39},
  {upTo: 300, price: 36},
  {upTo: 1000, price: 32},
  {upTo: Number.POSITIVE_INFINITY, price: 25},
];

const CLAUDE_PLANS: Record<ClaudePlan, {label: string; usd: number | null; brl: number | null}> = {
  shared: {label: 'Dividido (R$ 397)', usd: null, brl: 397},
  max5: {label: 'Max 5x próprio (US$ 100)', usd: 100, brl: null},
  max20: {label: 'Max 20x próprio (US$ 200, premissa)', usd: 200, brl: null},
};

const R2_USD_PER_GB_MONTH = 0.015;
const POSTHOG_FREE_EVENTS = 1_000_000;
const POSTHOG_USD_PER_EVENT = 0.00005;
const EVENTS_PER_USER_MONTH = 5_000;
const UNITS_PER_USER = 6.25;
const PAYMENT_FEE_BRL = 1.99;
const AUTO_FULL_INFRA_FROM_UNITS = 150;

// ── Pure calculations ──────────────────────────────────
function progressiveRevenue(quantity: number, tiers: Tier[]): number {
  let remaining = quantity;
  let lowerBound = 0;
  let total = 0;
  for (const tier of tiers) {
    if (remaining <= 0) break;
    const bandSize = tier.upTo - lowerBound;
    const inBand = Math.min(remaining, bandSize);
    total += inBand * tier.price;
    remaining -= inBand;
    lowerBound = tier.upTo;
  }
  return total;
}

function clientRevenue(client: Client, tiers: Tier[], pricePerFleet: number, minimum: number): number {
  const raw = client.metric === 'vehicle'
    ? progressiveRevenue(client.quantity, tiers)
    : client.quantity * pricePerFleet;
  return client.quantity > 0 ? Math.max(raw, minimum) : 0;
}

interface Inputs {
  clients: Client[];
  tiers: Tier[];
  pricePerFleet: number;
  minimum: number;
  taxRate: number;
  infraMode: InfraMode;
  leanInfra: number;
  fullInfra: number;
  fx: number;
  cardFactor: number;
  osPerUnit: number;
  photosPerOs: number;
  photoKb: number;
  accountant: number;
  claudePlan: ClaudePlan;
  partnerPro: number;
  extras: number;
  proLabore: number;
}

function compute(inputs: Inputs) {
  const usd = (value: number) => value * inputs.fx * inputs.cardFactor;
  const perClient = inputs.clients.map((client) => ({
    client,
    revenue: clientRevenue(client, inputs.tiers, inputs.pricePerFleet, inputs.minimum),
  }));
  const revenue = perClient.reduce((sum, row) => sum + row.revenue, 0);
  const totalUnits = inputs.clients.reduce((sum, client) => sum + client.quantity, 0);

  const useFull = inputs.infraMode === 'full'
    || (inputs.infraMode === 'auto' && totalUnits >= AUTO_FULL_INFRA_FROM_UNITS);
  const infra = useFull ? inputs.fullInfra : inputs.leanInfra;

  // Photos accumulate: the cost shown is the month after one year of storage.
  const photosGbAfterYear = (totalUnits * inputs.osPerUnit * inputs.photosPerOs * inputs.photoKb * 12) / 1_000_000;
  const photos = photosGbAfterYear * R2_USD_PER_GB_MONTH * inputs.fx;
  const events = (totalUnits / UNITS_PER_USER) * EVENTS_PER_USER_MONTH;
  const analytics = Math.max(0, events - POSTHOG_FREE_EVENTS) * POSTHOG_USD_PER_EVENT * inputs.fx;
  const payment = inputs.clients.filter((client) => client.quantity > 0).length * PAYMENT_FEE_BRL;
  const variable = photos + analytics + payment;

  const tax = revenue * (inputs.taxRate / 100);
  const systemMargin = revenue - infra - variable - tax;

  const plan = CLAUDE_PLANS[inputs.claudePlan];
  const claude = plan.brl ?? usd(plan.usd ?? 0);
  const company = inputs.accountant + claude + inputs.partnerPro + inputs.extras + inputs.proLabore;
  const profit = systemMargin - company;

  return {perClient, revenue, totalUnits, infra, useFull, variable, tax, systemMargin, company, claude, profit};
}

function breakEvenForFirstClient(inputs: Inputs): number | null {
  if (inputs.clients.length === 0) return null;
  for (let quantity = 0; quantity <= 10_000; quantity += 1) {
    const trial = {
      ...inputs,
      clients: inputs.clients.map((client, index) => (index === 0 ? {...client, quantity} : client)),
    };
    if (compute(trial).profit >= 0) return quantity;
  }
  return null;
}

// ── Formatting ─────────────────────────────────────────
const brl = (value: number) =>
  value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL', maximumFractionDigits: 0});
const signed = (value: number) => (value >= 0 ? `+${brl(value)}` : `−${brl(Math.abs(value))}`);

// ── Styles ─────────────────────────────────────────────
const card: CSSProperties = {
  border: '1px solid var(--ifm-color-emphasis-300)',
  borderRadius: 12,
  padding: 16,
  background: 'var(--ifm-background-surface-color)',
  marginBottom: 16,
};
const grid: CSSProperties = {display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12};
const label: CSSProperties = {display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: 'var(--ifm-color-emphasis-800)'};
const input: CSSProperties = {
  padding: '6px 8px',
  borderRadius: 8,
  border: '1px solid var(--ifm-color-emphasis-300)',
  background: 'var(--ifm-background-color)',
  color: 'var(--ifm-font-color-base)',
  fontSize: 14,
  width: '100%',
};
const sectionTitle: CSSProperties = {margin: '0 0 12px', fontSize: 15, fontWeight: 700};
const row: CSSProperties = {display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--ifm-color-emphasis-200)', gap: 12};

function NumberField({text, value, onChange, step = 1}: {text: string; value: number; onChange: (value: number) => void; step?: number}): ReactNode {
  return (
    <label style={label}>
      {text}
      <input
        style={input}
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
      />
    </label>
  );
}

// ── Component ──────────────────────────────────────────
export function EconomicsSimulator(): ReactNode {
  const [clients, setClients] = useState<Client[]>(DEFAULT_CLIENTS);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [pricePerFleet, setPricePerFleet] = useState(39);
  const [minimum, setMinimum] = useState(990);
  const [setupFee, setSetupFee] = useState(3000);
  const [taxRate, setTaxRate] = useState(6);
  const [infraMode, setInfraMode] = useState<InfraMode>('auto');
  const [leanInfra, setLeanInfra] = useState(585);
  const [fullInfra, setFullInfra] = useState(1270);
  const [fx, setFx] = useState(5.5);
  const [cardFactor, setCardFactor] = useState(1.06);
  const [osPerUnit, setOsPerUnit] = useState(1.8);
  const [photosPerOs, setPhotosPerOs] = useState(12);
  const [photoKb, setPhotoKb] = useState(150);
  const [accountant, setAccountant] = useState(270);
  const [claudePlan, setClaudePlan] = useState<ClaudePlan>('max20');
  const [partnerPro, setPartnerPro] = useState(120);
  const [extras, setExtras] = useState(30);
  const [proLabore, setProLabore] = useState(0);

  const inputs: Inputs = {
    clients, tiers, pricePerFleet, minimum, taxRate, infraMode, leanInfra, fullInfra, fx, cardFactor,
    osPerUnit, photosPerOs, photoKb, accountant, claudePlan, partnerPro, extras, proLabore,
  };
  const result = useMemo(() => compute(inputs), [JSON.stringify(inputs)]);
  const breakEven = useMemo(() => breakEvenForFirstClient(inputs), [JSON.stringify(inputs)]);
  const margin = result.revenue > 0 ? (result.profit / result.revenue) * 100 : 0;
  const activeSetup = clients.filter((client) => client.quantity > 0).length * setupFee;

  const updateClient = (id: number, patch: Partial<Client>) =>
    setClients((current) => current.map((client) => (client.id === id ? {...client, ...patch} : client)));
  const addClient = () =>
    setClients((current) => [...current, {id: Date.now(), name: `Cliente ${current.length + 1}`, metric: 'vehicle', quantity: 50}]);
  const removeClient = (id: number) => setClients((current) => current.filter((client) => client.id !== id));
  const updateTier = (index: number, patch: Partial<Tier>) =>
    setTiers((current) => current.map((tier, i) => (i === index ? {...tier, ...patch} : tier)));

  return (
    <div>
      <div style={card}>
        <h4 style={sectionTitle}>Clientes</h4>
        {clients.map((client) => (
          <div key={client.id} style={{...grid, gridTemplateColumns: '2fr 1.4fr 1fr auto', alignItems: 'end', marginBottom: 8}}>
            <label style={label}>
              Nome
              <input style={input} value={client.name} onChange={(event) => updateClient(client.id, {name: event.target.value})} />
            </label>
            <label style={label}>
              Cobrança
              <select style={input} value={client.metric} onChange={(event) => updateClient(client.id, {metric: event.target.value as Metric})}>
                <option value="vehicle">Por veículo (faixas)</option>
                <option value="fleet">Por frota atendida</option>
              </select>
            </label>
            <NumberField text={client.metric === 'vehicle' ? 'Veículos' : 'Frotas atendidas/mês'} value={client.quantity} onChange={(quantity) => updateClient(client.id, {quantity})} />
            <button type="button" className="button button--sm button--secondary" onClick={() => removeClient(client.id)} aria-label={`Remover ${client.name}`}>
              Remover
            </button>
          </div>
        ))}
        <button type="button" className="button button--sm button--primary" onClick={addClient}>Adicionar cliente</button>
      </div>

      <div style={card}>
        <h4 style={sectionTitle}>Preço</h4>
        <div style={grid}>
          {tiers.map((tier, index) => {
            const from = index === 0 ? 1 : tiers[index - 1].upTo + 1;
            const isLast = index === tiers.length - 1;
            return (
              <div key={index} style={{display: 'grid', gap: 6}}>
                {isLast ? (
                  <span style={{...label, paddingBottom: 2}}>Acima de {from - 1} veículos</span>
                ) : (
                  <NumberField text={`Faixa ${index + 1}: de ${from} até`} value={tier.upTo} onChange={(upTo) => updateTier(index, {upTo})} />
                )}
                <NumberField text="R$ por veículo nesta faixa" value={tier.price} step={0.5} onChange={(price) => updateTier(index, {price})} />
              </div>
            );
          })}
          <NumberField text="R$ por frota atendida" value={pricePerFleet} step={0.5} onChange={setPricePerFleet} />
          <NumberField text="Mínimo mensal por cliente (R$)" value={minimum} onChange={setMinimum} />
          <NumberField text="Implantação por cliente, única (R$)" value={setupFee} onChange={setSetupFee} />
        </div>
      </div>

      <div style={card}>
        <h4 style={sectionTitle}>Custos</h4>
        <div style={grid}>
          <NumberField text="Imposto (%)" value={taxRate} step={0.5} onChange={setTaxRate} />
          <label style={label}>
            Infraestrutura
            <select style={input} value={infraMode} onChange={(event) => setInfraMode(event.target.value as InfraMode)}>
              <option value="auto">Automática (completa a partir de {AUTO_FULL_INFRA_FROM_UNITS} unidades)</option>
              <option value="lean">Enxuta</option>
              <option value="full">Completa</option>
            </select>
          </label>
          <NumberField text="Infra enxuta (R$/mês)" value={leanInfra} onChange={setLeanInfra} />
          <NumberField text="Infra completa (R$/mês)" value={fullInfra} onChange={setFullInfra} />
          <NumberField text="Câmbio (R$ por US$)" value={fx} step={0.05} onChange={setFx} />
          <NumberField text="Fator IOF e spread do cartão" value={cardFactor} step={0.01} onChange={setCardFactor} />
          <NumberField text="OS por unidade por mês" value={osPerUnit} step={0.1} onChange={setOsPerUnit} />
          <NumberField text="Fotos por OS" value={photosPerOs} onChange={setPhotosPerOs} />
          <NumberField text="KB por foto (comprimida)" value={photoKb} step={10} onChange={setPhotoKb} />
        </div>
        <h4 style={{...sectionTitle, marginTop: 16}}>Custo para a empresa existir</h4>
        <div style={grid}>
          <NumberField text="Contador (R$/mês)" value={accountant} onChange={setAccountant} />
          <label style={label}>
            Claude da arquiteta
            <select style={input} value={claudePlan} onChange={(event) => setClaudePlan(event.target.value as ClaudePlan)}>
              {Object.entries(CLAUDE_PLANS).map(([key, plan]) => <option key={key} value={key}>{plan.label}</option>)}
            </select>
          </label>
          <NumberField text="Claude Pro do marido (R$/mês)" value={partnerPro} onChange={setPartnerPro} />
          <NumberField text="Domínio e extras (R$/mês)" value={extras} onChange={setExtras} />
          <NumberField text="Pró-labore (R$/mês)" value={proLabore} step={100} onChange={setProLabore} />
        </div>
      </div>

      <div style={{...card, borderColor: result.profit >= 0 ? 'var(--ifm-color-success)' : 'var(--ifm-color-danger)'}}>
        <h4 style={sectionTitle}>Resultado por mês</h4>
        {result.perClient.map(({client, revenue}) => (
          <div key={client.id} style={row}>
            <span>{client.name} · {client.quantity} {client.metric === 'vehicle' ? 'veículos' : 'frotas atendidas'}</span>
            <span>{brl(revenue)}</span>
          </div>
        ))}
        <div style={{...row, fontWeight: 700}}><span>Receita</span><span>{brl(result.revenue)}</span></div>
        <div style={row}><span>− Infra ({result.useFull ? 'completa' : 'enxuta'})</span><span>{brl(result.infra)}</span></div>
        <div style={row}><span>− Variável (fotos após 1 ano, analytics, cobrança)</span><span>{brl(result.variable)}</span></div>
        <div style={row}><span>− Imposto ({taxRate}%)</span><span>{brl(result.tax)}</span></div>
        <div style={{...row, fontWeight: 700}}><span>= O que sobra do sistema</span><span>{brl(result.systemMargin)}</span></div>
        <div style={row}><span>− Custo para a empresa existir (Claude {brl(result.claude)})</span><span>{brl(result.company)}</span></div>
        <div style={{...row, fontWeight: 800, fontSize: 18, borderBottom: 'none', color: result.profit >= 0 ? 'var(--ifm-color-success-darkest)' : 'var(--ifm-color-danger-darkest)'}}>
          <span>= Lucro</span><span>{signed(result.profit)}</span>
        </div>
        <p style={{margin: '8px 0 0', fontSize: 13, color: 'var(--ifm-color-emphasis-700)'}}>
          Margem: {margin.toFixed(0)}% da receita · {result.totalUnits} unidades no total ·
          implantação única: {brl(activeSetup)} ·{' '}
          {breakEven === null
            ? `nem com 10 mil unidades ${clients[0]?.name ?? 'o primeiro cliente'} empata com estes números.`
            : breakEven === 0
              ? `os demais clientes já cobrem todos os custos, mesmo sem ${clients[0]?.name ?? 'o primeiro cliente'}.`
              : `com os demais clientes como estão, ${clients[0]?.name ?? 'o primeiro cliente'} empata a partir de ${breakEven} ${clients[0]?.metric === 'fleet' ? 'frotas atendidas' : 'veículos'}.`}
        </p>
      </div>
    </div>
  );
}
