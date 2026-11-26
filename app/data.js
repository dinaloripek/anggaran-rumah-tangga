// Data Keluarga Prasetyo — November 2026 (per 26 November).
// Semua angka dalam rupiah. Satu-satunya sumber data situs ini.

export const HOUSEHOLD = {
  name: 'Keluarga Prasetyo',
  members: 'Budi (ayah) · Sari (ibu) · Nadia (12) · Raka (8)',
  month: 'November 2026',
  asOf: '26 November 2026',
  currency: 'Rp',
};

export const INCOME = [
  { source: 'Gaji Budi — staf gudang', amount: 9500000, date: '2026-11-01' },
  { source: 'Usaha sampingan Sari — katering', amount: 2000000, date: '2026-11-15' },
  { source: 'Lainnya — THR cicilan & refund', amount: 1000000, date: '2026-11-20' },
];

export const CATEGORIES = [
  { id: 'belanja', label: 'Belanja Harian', color: '#2e6b3e', budget: 2500000 },
  { id: 'makan', label: 'Makan & Jajan', color: '#c25e3a', budget: 1500000 },
  { id: 'transport', label: 'Transportasi', color: '#2f5d8a', budget: 1200000 },
  { id: 'tagihan', label: 'Tagihan Rumah', color: '#5b4a8a', budget: 1100000 },
  { id: 'pendidikan', label: 'Pendidikan Anak', color: '#b98a1d', budget: 1500000 },
  { id: 'kesehatan', label: 'Kesehatan', color: '#8a2f4d', budget: 500000 },
  { id: 'hiburan', label: 'Hiburan & Langganan', color: '#20655e', budget: 600000 },
  { id: 'tabungan', label: 'Tabungan & Dana Darurat', color: '#1e4d2a', budget: 2000000 },
];

export const BUDGET_TOTAL = CATEGORIES.reduce((sum, c) => sum + c.budget, 0);

// Pengeluaran yang sudah terjadi di bulan ini (26 hari pertama).
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-26', note: 'Belanja pasar — sayur, ayam, telur', category: 'belanja', amount: 385000 },
  { id: 't02', date: '2026-11-25', note: 'Bensin motor + tol', category: 'transport', amount: 142000 },
  { id: 't03', date: '2026-11-24', note: 'Makan siang keluarga di warteg', category: 'makan', amount: 96000 },
  { id: 't04', date: '2026-11-23', note: 'Listrik PLN (token)', category: 'tagihan', amount: 312000 },
  { id: 't05', date: '2026-11-22', note: 'Les matematika Nadia', category: 'pendidikan', amount: 450000 },
  { id: 't06', date: '2026-11-21', note: 'Belanja bulanan — beras, minyak, sabun', category: 'belanja', amount: 612000 },
  { id: 't07', date: '2026-11-20', note: 'Setor tabungan dana darurat', category: 'tabungan', amount: 1000000 },
  { id: 't08', date: '2026-11-19', note: 'Internet rumah (Indihome)', category: 'tagihan', amount: 275000 },
  { id: 't09', date: '2026-11-18', note: 'Jajan sekolah Raka (seminggu)', category: 'makan', amount: 150000 },
  { id: 't10', date: '2026-11-17', note: 'Ojek online — antar jemput', category: 'transport', amount: 88000 },
  { id: 't11', date: '2026-11-15', note: 'Buku & alat tulis Nadia', category: 'pendidikan', amount: 238000 },
  { id: 't12', date: '2026-11-14', note: 'Nonton bioskop keluarga', category: 'hiburan', amount: 185000 },
  { id: 't13', date: '2026-11-12', note: 'Periksa gigi Raka', category: 'kesehatan', amount: 210000 },
  { id: 't14', date: '2026-11-10', note: 'Air PDAM', category: 'tagihan', amount: 164000 },
  { id: 't15', date: '2026-11-08', note: 'Belanja pasar — ikan, buah, bumbu', category: 'belanja', amount: 428000 },
  { id: 't16', date: '2026-11-06', note: 'Langganan streaming', category: 'hiburan', amount: 54000 },
  { id: 't17', date: '2026-11-04', note: 'BPJS Kesehatan keluarga', category: 'kesehatan', amount: 105000 },
  { id: 't18', date: '2026-11-02', note: 'Sarapan & kopi — warung langganan', category: 'makan', amount: 72000 },
];

export const GOALS = [
  { id: 'g1', name: 'Dana darurat — 6 bulan pengeluaran', target: 30000000, saved: 18500000, note: 'Disimpan di rekening terpisah, tidak boleh dipakai kecuali darurat.' },
  { id: 'g2', name: 'Liburan keluarga ke Yogyakarta', target: 8000000, saved: 3200000, note: 'Rencana berangkat libur sekolah Juni 2027.' },
  { id: 'g3', name: 'DP motor baru', target: 6000000, saved: 4100000, note: 'Motor lama sudah 9 tahun; target lunas DP sebelum Lebaran.' },
];

// Pemasukan vs pengeluaran 6 bulan terakhir (riwayat keluarga).
export const MONTHLY = [
  { month: 'Jun 2026', income: 11800000, spent: 9840000 },
  { month: 'Jul 2026', income: 12100000, spent: 10250000 },
  { month: 'Agu 2026', income: 11900000, spent: 10120000 },
  { month: 'Sep 2026', income: 12400000, spent: 9930000 },
  { month: 'Okt 2026', income: 12200000, spent: 10680000 },
  { month: 'Nov 2026', income: 12500000, spent: 4966000 },
];

export function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
