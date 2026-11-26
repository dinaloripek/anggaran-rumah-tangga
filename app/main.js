// Titik masuk situs: rute hash, penyimpanan lokal, dan penghubung antarmuka.
// Data awal dari data.js; perubahan pengguna tersimpan di localStorage peramban ini.

import { CATEGORIES, TRANSACTIONS, GOALS } from './data.js';
import { renderDashboard, renderExpenses, renderBudget, renderSavings, renderReport } from './views.js';

const STORE_KEY = 'anggaran-rumah-tangga-v1';

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const saved = loadInitial();

const store = {
  transactions: saved?.transactions ?? structuredClone(TRANSACTIONS),
  goals: saved?.goals ?? structuredClone(GOALS),
  budgets: saved?.budgets ?? Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget])),

  save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        transactions: this.transactions,
        goals: this.goals,
        budgets: this.budgets,
      }));
    } catch {
      // Penyimpanan penuh atau dimatikan: situs tetap jalan untuk sesi ini.
    }
  },

  totals() {
    const income = 12500000;
    const spentByCat = {};
    let spent = 0;
    for (const t of this.transactions) {
      spent += t.amount;
      spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amount;
    }
    return { income, spent, remaining: income - spent, spentByCat };
  },

  budgetTotal() {
    return Object.values(this.budgets).reduce((s, v) => s + v, 0);
  },
};

// Sinkronkan anggaran kategori dengan nilai tersimpan (agar views membaca satu sumber).
for (const c of CATEGORIES) c.budget = store.budgets[c.id] ?? c.budget;

const app = document.getElementById('app');

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  const [page] = hash.split('?');
  document.querySelectorAll('.nav a').forEach((a) => {
    a.classList.toggle('active', (a.dataset.route || '') === page);
  });
  let html;
  if (page === 'pengeluaran') html = renderExpenses(store, store.filter);
  else if (page === 'anggaran') html = renderBudget(store);
  else if (page === 'tabungan') html = renderSavings(store);
  else if (page === 'laporan') html = renderReport(store);
  else html = renderDashboard(store);
  app.innerHTML = html;
  window.scrollTo(0, 0);
  wire(page);
}

function wire(page) {
  if (page === 'pengeluaran') {
    const form = document.getElementById('add-form');
    form?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const date = document.getElementById('f-date').value;
      const amount = Number(document.getElementById('f-amount').value);
      const category = document.getElementById('f-cat').value;
      const note = document.getElementById('f-note').value.trim();
      const msg = document.getElementById('add-msg');
      if (!date || !Number.isFinite(amount) || amount < 1000 || !note) {
        msg.textContent = 'Isi tanggal, jumlah minimal Rp 1.000, dan catatan.';
        return;
      }
      store.transactions.push({ id: 'u' + Date.now(), date, note, category, amount });
      store.save();
      msg.textContent = 'Tersimpan: ' + note + ' — Rp ' + amount.toLocaleString('id-ID') + '.';
      form.reset();
      document.getElementById('f-date').value = '2026-11-26';
      route();
      document.getElementById('add-msg').textContent = msg.textContent;
    });
    document.getElementById('f-filter')?.addEventListener('change', (ev) => {
      store.filter = ev.target.value || undefined;
      route();
    });
    app.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => {
        store.transactions = store.transactions.filter((t) => t.id !== btn.dataset.delete);
        store.save();
        route();
      });
    });
  }
  if (page === 'anggaran') {
    app.querySelectorAll('.budget-edit').forEach((form) => {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const value = Number(form.budget.value);
        if (!Number.isFinite(value) || value < 0) return;
        store.budgets[form.dataset.cat] = value;
        const cat = CATEGORIES.find((c) => c.id === form.dataset.cat);
        if (cat) cat.budget = value;
        store.save();
        route();
      });
    });
  }
  if (page === 'tabungan') {
    app.querySelectorAll('.goal-add').forEach((form) => {
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const value = Number(form.amount.value);
        if (!Number.isFinite(value) || value < 1000) return;
        const goal = store.goals.find((g) => g.id === form.dataset.goal);
        if (!goal) return;
        goal.saved += value;
        store.save();
        route();
      });
    });
  }
}

window.addEventListener('hashchange', route);
route();
