import re
from pathlib import Path

SRC = Path(__file__).parent
OUT = SRC.parent / "index.html"

KM_WEEKS = [2410, 2680, 2390, 2750, 2220, 1980, 2610, 2530, 2890, 2470, 2340, 2760, 1210]
WEEK_STARTS = ["29/06", "06/07", "13/07", "20/07", "27/07", "03/08", "10/08", "17/08", "24/08", "31/08", "07/09", "14/09", "21/09"]
MONTHS = ["abr.", "mai.", "jun.", "jul.", "ago.", "set."]
CPK_VEH = [0.48, 0.55, 0.51, 0.58, 0.69, 0.86]
CPK_FLEET = [0.57, 0.56, 0.58, 0.57, 0.59, 0.60]


def br(n, d=0):
    s = f"{n:,.{d}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def icon(m):
    name, size = m.group(1), m.group(2)
    cls = f"ic s{size}" if size else "ic"
    return f'<i class="{cls}" aria-hidden="true" style="--i:url(https://api.iconify.design/ph/{name}.svg)"></i>'


def km_chart(w, h, labels_every=4):
    pad_l, pad_b, pad_t = 44, 22, 8
    ch = h - pad_b - pad_t
    cw = w - pad_l
    top = 3000
    n = len(KM_WEEKS)
    gap = 6
    bw = (cw - gap * (n - 1)) / n
    parts = [f'<svg class="chart" viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Km rodado por semana nas últimas 13 semanas">']
    for v in (0, 1500, 3000):
        y = pad_t + ch - ch * v / top
        parts.append(f'<line class="grid" x1="{pad_l}" x2="{w}" y1="{y:.1f}" y2="{y:.1f}"/>')
        parts.append(f'<text class="ax" x="{pad_l - 8}" y="{y + 4:.1f}" text-anchor="end">{br(v)}</text>')
    for i, v in enumerate(KM_WEEKS):
        x = pad_l + i * (bw + gap)
        bh = ch * v / top
        y = pad_t + ch - bh
        r = 3
        cls = "bar partial" if i == n - 1 else "bar"
        d = f"M{x:.1f},{pad_t + ch:.1f} V{y + r:.1f} Q{x:.1f},{y:.1f} {x + r:.1f},{y:.1f} H{x + bw - r:.1f} Q{x + bw:.1f},{y:.1f} {x + bw:.1f},{y + r:.1f} V{pad_t + ch:.1f} Z"
        parts.append(f'<g class="hit"><rect x="{x:.1f}" y="{pad_t}" width="{bw:.1f}" height="{ch}" fill="transparent"/><path class="{cls}" d="{d}"/><title>Semana de {WEEK_STARTS[i]}: {br(v)} km</title></g>')
        if i % labels_every == 0:
            parts.append(f'<text class="ax" x="{x + bw / 2:.1f}" y="{h - 5}" text-anchor="middle">{WEEK_STARTS[i]}</text>')
    parts.append("</svg>")
    return "".join(parts)


def cpk_chart(w, h):
    pad_l, pad_r, pad_b, pad_t = 44, 92, 22, 10
    lo, hi = 0.40, 1.00
    ch = h - pad_b - pad_t
    cw = w - pad_l - pad_r
    n = len(MONTHS)

    def xy(i, v):
        return pad_l + cw * i / (n - 1), pad_t + ch - ch * (v - lo) / (hi - lo)

    parts = [f'<svg class="chart" viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="Custo por km mês a mês, este veículo e a mediana da frota">']
    for v in (0.40, 0.70, 1.00):
        _, y = xy(0, v)
        parts.append(f'<line class="grid" x1="{pad_l}" x2="{w - pad_r + 8}" y1="{y:.1f}" y2="{y:.1f}"/>')
        parts.append(f'<text class="ax" x="{pad_l - 8}" y="{y + 4:.1f}" text-anchor="end">{br(v, 2)}</text>')
    for i, m in enumerate(MONTHS):
        x, _ = xy(i, lo)
        parts.append(f'<text class="ax" x="{x:.1f}" y="{h - 5}" text-anchor="middle">{m}</text>')
    fleet = " ".join(f"{xy(i, v)[0]:.1f},{xy(i, v)[1]:.1f}" for i, v in enumerate(CPK_FLEET))
    veh = " ".join(f"{xy(i, v)[0]:.1f},{xy(i, v)[1]:.1f}" for i, v in enumerate(CPK_VEH))
    parts.append(f'<polyline class="ln-ref" points="{fleet}"/>')
    parts.append(f'<polyline class="ln" points="{veh}"/>')
    for i, v in enumerate(CPK_VEH):
        x, y = xy(i, v)
        parts.append(f'<g class="hit"><circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="transparent"/><circle class="pt" cx="{x:.1f}" cy="{y:.1f}" r="4"/><title>{MONTHS[i]}: R$ {br(v, 2)}/km · frota R$ {br(CPK_FLEET[i], 2)}/km</title></g>')
    x, y = xy(n - 1, CPK_VEH[-1])
    parts.append(f'<text class="dl" x="{x + 10:.1f}" y="{y + 4:.1f}">QRT4B22 R$ {br(CPK_VEH[-1], 2)}</text>')
    x, y = xy(n - 1, CPK_FLEET[-1])
    parts.append(f'<text class="dl mute" x="{x + 10:.1f}" y="{y + 4:.1f}">Frota R$ {br(CPK_FLEET[-1], 2)}</text>')
    parts.append("</svg>")
    return "".join(parts)


def spark(w, h):
    lo, hi = min(CPK_VEH), max(CPK_VEH)
    pts = []
    for i, v in enumerate(CPK_VEH):
        x = 3 + (w - 6) * i / (len(CPK_VEH) - 1)
        y = 3 + (h - 6) * (1 - (v - lo) / (hi - lo))
        pts.append((x, y))
    p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
    x, y = pts[-1]
    return f'<svg class="spark" viewBox="0 0 {w} {h}" width="{w}" height="{h}" aria-hidden="true"><polyline points="{p}"/><circle cx="{x:.1f}" cy="{y:.1f}" r="3"/></svg>'


def main():
    html = (SRC / "template.html").read_text()
    html = html.replace("[[LOGO]]", (SRC / "logo.txt").read_text().strip())
    html = re.sub(r"\[\[km:(\d+):(\d+)(?::(\d+))?\]\]", lambda m: km_chart(int(m.group(1)), int(m.group(2)), int(m.group(3) or 4)), html)
    html = re.sub(r"\[\[cpk:(\d+):(\d+)\]\]", lambda m: cpk_chart(int(m.group(1)), int(m.group(2))), html)
    html = re.sub(r"\[\[spark:(\d+):(\d+)\]\]", lambda m: spark(int(m.group(1)), int(m.group(2))), html)
    html = re.sub(r"\[\[i:([a-z0-9-]+)(?::(\d+))?\]\]", icon, html)
    assert "[[" not in html, html[html.index("[["):html.index("[[") + 40]
    OUT.write_text(html)
    print(OUT, len(html))


main()
