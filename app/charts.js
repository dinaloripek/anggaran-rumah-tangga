// Grafik SVG buatan sendiri: donat pembagian pengeluaran dan batang pemasukan vs pengeluaran.
// Tanpa pustaka apa pun — setiap fungsi mengembalikan string SVG.

export function donutChart(slices, total, centerLabel) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;
  const stroke = 30;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const arcs = slices.map((s) => {
    const frac = total > 0 ? s.value / total : 0;
    const dash = frac * circumference;
    const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" />`;
    offset += dash;
    return el;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Donat pembagian pengeluaran per kategori">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ece5d3" stroke-width="${stroke}" />
    ${arcs}
    <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-center">${centerLabel}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-total">${escapeHtml(shortRupiah(total))}</text>
  </svg>`;
}

export function monthlyBars(months) {
  const width = 560;
  const height = 260;
  const padLeft = 64;
  const padBottom = 30;
  const padTop = 14;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.spent))) * 1.08;
  const plotW = width - padLeft - 16;
  const plotH = height - padTop - padBottom;
  const groupW = plotW / months.length;
  const barW = Math.min(26, groupW / 3);
  const y = (v) => padTop + plotH - (v / max) * plotH;
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padTop + plotH - f * plotH;
    const label = shortRupiah(max * f);
    return `<line x1="${padLeft}" y1="${gy}" x2="${width - 16}" y2="${gy}" stroke="#e3dccb" />
      <text x="${padLeft - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="#5c6656">${label}</text>`;
  }).join('');
  const bars = months.map((m, i) => {
    const gx = padLeft + i * groupW + groupW / 2;
    return `<rect x="${(gx - barW - 3).toFixed(1)}" y="${y(m.income).toFixed(1)}" width="${barW}" height="${(padTop + plotH - y(m.income)).toFixed(1)}" rx="3" fill="#2e6b3e">
        <title>${m.month}: pemasukan ${m.income.toLocaleString('id-ID')}</title></rect>
      <rect x="${(gx + 3).toFixed(1)}" y="${y(m.spent).toFixed(1)}" width="${barW}" height="${(padTop + plotH - y(m.spent)).toFixed(1)}" rx="3" fill="#c25e3a">
        <title>${m.month}: pengeluaran ${m.spent.toLocaleString('id-ID')}</title></rect>
      <text x="${gx}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#22301f">${m.month}</text>`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir">
    ${grid}
    <line x1="${padLeft}" y1="${padTop + plotH}" x2="${width - 16}" y2="${padTop + plotH}" stroke="#c9c0a8" />
    ${bars}
  </svg>
  <p class="small muted" style="margin:8px 0 0"><span style="color:#2e6b3e">■</span> Pemasukan &nbsp; <span style="color:#c25e3a">■</span> Pengeluaran &nbsp;·&nbsp; November masih berjalan (per 26 November).</p>`;
}

export function shortRupiah(n) {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return 'Rp ' + Math.round(n);
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
