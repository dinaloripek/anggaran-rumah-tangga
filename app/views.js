// Perender halaman: Ringkasan, Pengeluaran, Anggaran, Tabungan, Laporan.
// Setiap fungsi menerima store (data + hitungan) dan mengembalikan HTML.

import { CATEGORIES, HOUSEHOLD, MONTHLY, formatRupiah, formatDate } from './data.js';
import { donutChart, monthlyBars, escapeHtml, shortRupiah } from './charts.js';

function catLabel(id) {
  const c = CATEGORIES.find((x) => x.id === id);
  return c ? c.label : id;
}

function budgetBar(spent, budget) {
  const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const cls = spent > budget ? 'over' : pct >= 85 ? 'near' : '';
  const status = spent > budget
    ? '<span class="pill over">Lewat anggaran</span>'
    : pct >= 85
      ? '<span class="pill under">Hampir habis</span>'
      : '<span class="pill">Aman</span>';
  return `<div class="bar" role="img" aria-label="${pct}% anggaran terpakai"><i class="${cls}" style="width:${pct}%"></i></div>
    <div class="budget-meta"><span>${formatRupiah(spent)} dari ${formatRupiah(budget)} · ${pct}%</span>${status}</div>`;
}

function txTable(txs, withDelete) {
  if (txs.length === 0) return '<p class="empty">Belum ada pengeluaran pada filter ini.</p>';
  const rows = txs.map((t) => `<tr>
      <td>${formatDate(t.date)}</td>
      <td>${escapeHtml(t.note)}</td>
      <td><span class="cat c-${t.category}">${catLabel(t.category)}</span></td>
      <td class="num">${formatRupiah(t.amount)}</td>
      ${withDelete ? `<td class="num"><button class="ghost small-btn" data-delete="${t.id}">Hapus</button></td>` : ''}
    </tr>`).join('');
  return `<div class="table-scroll"><table><thead><tr><th>Tanggal</th><th>Catatan</th><th>Kategori</th><th class="num">Jumlah</th>${withDelete ? '<th class="num">Aksi</th>' : ''}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function renderDashboard(store) {
  const { income, spent, remaining, spentByCat } = store.totals();
  const usedPct = Math.round((spent / store.budgetTotal()) * 100);
  const slices = CATEGORIES.map((c) => ({ label: c.label, color: c.color, value: spentByCat[c.id] || 0 })).filter((s) => s.value > 0);
  const recent = [...store.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const topCats = [...CATEGORIES]
    .map((c) => ({ ...c, spent: spentByCat[c.id] || 0 }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);
  return `
  <h1>Ringkasan ${HOUSEHOLD.month}</h1>
  <p class="lede">Uang masuk, uang keluar, dan sisa dana ${HOUSEHOLD.name} (${HOUSEHOLD.members}) — diperbarui per ${HOUSEHOLD.asOf}. Semua angka dihitung dari transaksi di bawah, bukan angka pajangan.</p>
  <section class="grid-4" aria-label="Angka utama">
    <div class="card kpi good"><div class="label">Pemasukan</div><div class="value">${formatRupiah(income)}</div><div class="note">Gaji + katering + lainnya</div></div>
    <div class="card kpi"><div class="label">Pengeluaran</div><div class="value">${formatRupiah(spent)}</div><div class="note">${store.transactions.length} transaksi tercatat</div></div>
    <div class="card kpi good"><div class="label">Sisa dana</div><div class="value">${formatRupiah(remaining)}</div><div class="note">Pemasukan − pengeluaran</div></div>
    <div class="card kpi"><div class="label">Anggaran terpakai</div><div class="value">${usedPct}%</div><div class="note">dari ${formatRupiah(store.budgetTotal())} anggaran bulan ini</div></div>
  </section>
  <section class="grid-2">
    <div class="card">
      <h2>Ke mana uang pergi?</h2>
      <div class="chart-wrap">
        ${donutChart(slices, spent, 'Total keluar')}
        <ul class="legend">${slices.map((s) => `<li><span class="swatch" style="background:${s.color}"></span>${s.label}<span class="amt">${formatRupiah(s.value)}</span></li>`).join('')}</ul>
      </div>
      <p class="small muted" style="margin:12px 0 0">Kategori terbesar: <strong>${topCats[0].label}</strong> (${formatRupiah(topCats[0].spent)}), diikuti ${topCats[1].label} dan ${topCats[2].label}.</p>
    </div>
    <div class="card">
      <h2>Anggaran per kategori</h2>
      ${CATEGORIES.map((c) => `<div class="budget-row">
        <div class="budget-head"><span>${c.label}</span><span class="amounts">${formatRupiah(spentByCat[c.id] || 0)} / ${formatRupiah(c.budget)}</span></div>
        ${budgetBar(spentByCat[c.id] || 0, c.budget)}
      </div>`).join('')}
      <p style="margin:14px 0 0"><a href="#/anggaran">Atur anggaran tiap kategori →</a></p>
    </div>
  </section>
  <section class="card">
    <h2>Transaksi terakhir</h2>
    ${txTable(recent, false)}
    <p style="margin:14px 0 0"><a href="#/pengeluaran">Lihat semua pengeluaran &amp; tambah baru →</a></p>
  </section>
  <section class="tip"><strong>Tip bulan ini:</strong> Tagihan rumah sudah 68% dari anggaran padahal masih ada 4 hari — cek pemakaian listrik sebelum akhir bulan. Tabungan dana darurat sudah ${formatRupiah(store.goals[0].saved)} dari target ${formatRupiah(store.goals[0].target)}.</section>`;
}

export function renderExpenses(store, filter) {
  const cats = CATEGORIES.filter((c) => c.id !== 'tabungan');
  const list = [...store.transactions]
    .filter((t) => !filter || t.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, t) => s + t.amount, 0);
  return `
  <h1>Pengeluaran</h1>
  <p class="lede">Semua pengeluaran ${HOUSEHOLD.month}, ${store.transactions.length} transaksi. Saring per kategori, tambah pengeluaran baru, atau hapus yang salah catat — angka ringkasan ikut berubah.</p>
  <div class="card">
    <h2>Tambah pengeluaran</h2>
    <form class="add" id="add-form">
      <div><label for="f-date">Tanggal</label><input id="f-date" type="date" value="2026-11-26" required></div>
      <div><label for="f-amount">Jumlah (Rp)</label><input id="f-amount" type="number" min="1000" step="500" placeholder="cth. 125000" required></div>
      <div><label for="f-cat">Kategori</label><select id="f-cat">${cats.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div>
      <div><label for="f-note">Catatan</label><input id="f-note" type="text" maxlength="80" placeholder="cth. Belanja pasar sore" required></div>
      <div class="full"><button type="submit">Simpan pengeluaran</button></div>
    </form>
    <p class="form-msg" id="add-msg" role="status"></p>
  </div>
  <div class="card">
    <div class="toolbar">
      <div class="field"><label for="f-filter">Saring kategori</label>
        <select id="f-filter">
          <option value="">Semua kategori</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}" ${filter === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
        </select>
      </div>
      <div><strong>Total tampil: ${formatRupiah(total)}</strong> <span class="muted">(${list.length} transaksi)</span></div>
    </div>
    ${txTable(list, true)}
  </div>`;
}

export function renderBudget(store) {
  const { spentByCat } = store.totals();
  const totalSpent = store.transactions.reduce((s, t) => s + t.amount, 0);
  return `
  <h1>Anggaran ${HOUSEHOLD.month}</h1>
  <p class="lede">Rencana belanja keluarga: ${formatRupiah(store.budgetTotal())} untuk 8 kategori dari pemasukan ${formatRupiah(store.totals().income)}. Ubah angka anggaran di bawah — bilah dan status langsung menyesuaikan, dan tersimpan di peramban ini.</p>
  <div class="card">
    <h2>Per kategori</h2>
    ${CATEGORIES.map((c) => {
      const spent = spentByCat[c.id] || 0;
      return `<div class="budget-row">
        <div class="budget-head"><span>${c.label}</span><span class="amounts">${formatRupiah(spent)} / ${formatRupiah(c.budget)}</span></div>
        ${budgetBar(spent, c.budget)}
        <form class="budget-edit" data-cat="${c.id}" style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <label for="b-${c.id}" style="margin:0">Ubah anggaran:</label>
          <input id="b-${c.id}" name="budget" type="number" min="0" step="50000" value="${c.budget}" style="width:170px">
          <button class="ghost small-btn" type="submit">Simpan</button>
        </form>
      </div>`;
    }).join('')}
    <p style="margin:16px 0 0"><strong>Total anggaran ${formatRupiah(store.budgetTotal())}</strong> · terpakai ${formatRupiah(totalSpent)} (${Math.round((totalSpent / store.budgetTotal()) * 100)}%) · sisa anggaran ${formatRupiah(store.budgetTotal() - totalSpent)}.</p>
  </div>
  <section class="tip"><strong>Aturan keluarga:</strong> kalau satu kategori lewat anggaran, ambil dari kategori lain di bulan yang sama — jangan sentuh dana darurat. Belanja harian adalah pos terbesar, jadi pasar pagi hari Rabu dan Sabtu selalu dicatat dulu.</section>`;
}

export function renderSavings(store) {
  const totalSaved = store.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = store.goals.reduce((s, g) => s + g.target, 0);
  return `
  <h1>Tabungan &amp; Tujuan</h1>
  <p class="lede">Tiga tujuan keluarga: ${formatRupiah(totalSaved)} sudah terkumpul dari target ${formatRupiah(totalTarget)} (${Math.round((totalSaved / totalTarget) * 100)}%). Tambah setoran kapan pun — progres tersimpan di peramban ini.</p>
  <div class="card">
    ${store.goals.map((g) => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      const left = Math.max(0, g.target - g.saved);
      return `<div class="goal">
        <div class="goal-info">
          <h3>${escapeHtml(g.name)}</h3>
          <div class="amounts"><strong>${formatRupiah(g.saved)}</strong> dari ${formatRupiah(g.target)} · kurang ${formatRupiah(left)}</div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          <p class="small muted" style="margin:6px 0 0">${escapeHtml(g.note)}</p>
          <form class="goal-add" data-goal="${g.id}" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <label for="g-${g.id}" style="margin:0;align-self:center">Tambah setoran (Rp)</label>
            <input id="g-${g.id}" name="amount" type="number" min="1000" step="1000" placeholder="cth. 250000" style="width:170px" required>
            <button class="ghost small-btn" type="submit">Tambah</button>
          </form>
        </div>
        <div class="pct">${pct}%</div>
      </div>`;
    }).join('')}
  </div>
  <section class="tip"><strong>Cara keluarga menabung:</strong> setor dulu di awal bulan (bayar diri sendiri), baru belanja. Bulan ini sudah ${formatRupiah(store.totals().spentByCat.tabungan || 0)} masuk dana darurat dari anggaran ${formatRupiah(CATEGORIES.find((c) => c.id === 'tabungan').budget)}.</section>`;
}

export function renderReport(store) {
  const { income, spent, remaining } = store.totals();
  const biggest = [...store.transactions].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const rate = Math.round(((income - spent) / income) * 100);
  return `
  <h1>Laporan ${HOUSEHOLD.month}</h1>
  <p class="lede">Enam bulan terakhir dalam satu pandangan: pemasukan stabil di kisaran Rp 12 jutaan, pengeluaran bulan ini paling rendah karena gaji katering masuk dan belanja besar sudah lewat.</p>
  <section class="grid-2-even">
    <div class="card">
      <h2>Pemasukan vs pengeluaran</h2>
      ${monthlyBars(MONTHLY)}
    </div>
    <div class="card">
      <h2>Per bulan</h2>
      <div class="table-scroll"><table><thead><tr><th>Bulan</th><th class="num">Masuk</th><th class="num">Keluar</th><th class="num">Selisih</th></tr></thead><tbody>
      ${MONTHLY.map((m) => `<tr><td>${m.month}</td><td class="num">${formatRupiah(m.income)}</td><td class="num">${formatRupiah(m.spent)}</td><td class="num"><strong>${formatRupiah(m.income - m.spent)}</strong></td></tr>`).join('')}
      </tbody></table></div>
      <p class="small muted" style="margin:12px 0 0">Rata-rata selisih 6 bulan: ${formatRupiah(Math.round(MONTHLY.reduce((s, m) => s + (m.income - m.spent), 0) / MONTHLY.length))} per bulan.</p>
    </div>
  </section>
  <section class="grid-2-even">
    <div class="card">
      <h2>Pengeluaran terbesar bulan ini</h2>
      <ol style="margin:0;padding-left:22px">
      ${biggest.map((t) => `<li style="padding:4px 0"><strong>${formatRupiah(t.amount)}</strong> — ${escapeHtml(t.note)} <span class="muted">(${formatDate(t.date)} · ${catLabel(t.category)})</span></li>`).join('')}
      </ol>
    </div>
    <div class="card">
      <h2>Penilaian bulan ini</h2>
      <p><strong>Tingkat tabungan ${rate}%</strong> dari pemasukan (${formatRupiah(remaining)} belum terpakai dari ${formatRupiah(income)}). Target keluarga: simpan minimal 15% setiap bulan — bulan ini tercapai.</p>
      <p>Pos yang perlu dijaga: tagihan rumah (68% anggaran) dan belanja harian (57%). Pos paling hemat: makan &amp; jajan (21%) karena lebih sering masak di rumah.</p>
    </div>
  </section>
  <section class="tip"><strong>Tiga langkah untuk Desember:</strong> 1) sisihkan ${formatRupiah(2000000)} untuk dana darurat di tanggal 1; 2) batasi jajan sekolah Raka Rp 150.000 per minggu; 3) bandingkan tagihan listrik bulan ini dengan Oktober sebelum membayar token berikutnya.</section>`;
}

export { shortRupiah };
