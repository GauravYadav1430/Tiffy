/* ═══════════════════════════════════════════════════════════
   TIFFY — Shared JavaScript
   Cart engine, auth state, toasts, navbar, animations
═══════════════════════════════════════════════════════════ */

// ── Cart Engine ────────────────────────────────────────────
const Cart = {
  get() { return JSON.parse(localStorage.getItem('tiffy_cart') || '[]'); },
  save(cart) { localStorage.setItem('tiffy_cart', JSON.stringify(cart)); this.updateBadge(); },
  add(item) {
    const cart = this.get();
    const ex = cart.find(i => i.id === item.id);
    if (ex) ex.qty += (item.qty || 1);
    else cart.push({ ...item, qty: item.qty || 1 });
    this.save(cart);
    showToast(`${item.name} added to cart`, 'success');
  },
  remove(id) {
    const cart = this.get().filter(i => i.id !== id);
    this.save(cart); this.renderIfOnPage();
  },
  updateQty(id, qty) {
    const cart = this.get();
    const item = cart.find(i => i.id === id);
    if (item) { if (qty <= 0) return this.remove(id); item.qty = qty; }
    this.save(cart); this.renderIfOnPage();
  },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  clear() { localStorage.removeItem('tiffy_cart'); this.updateBadge(); },
  updateBadge() {
    const badge = document.querySelector('.cart-badge');
    const count = this.count();
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  },
  renderIfOnPage() {
    if (typeof renderCart === 'function') renderCart();
  }
};

// ── Auth State ─────────────────────────────────────────────
const Auth = {
  get()  { return JSON.parse(localStorage.getItem('tiffy_user') || 'null'); },
  set(u) { localStorage.setItem('tiffy_user', JSON.stringify(u)); },
  logout() {
    localStorage.removeItem('tiffy_user');
    window.location.href = 'login.html';
  },
  require(role) {
    const u = this.get();
    if (!u) { window.location.href = 'login.html'; return null; }
    if (role && u.role !== role && u.role !== 'admin') {
      window.location.href = 'index.html'; return null;
    }
    return u;
  }
};

// ── Toasts ─────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3200) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Navbar ─────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
  // Mark active link
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
  // Update nav based on auth
  const user = Auth.get();
  const loginBtn = document.querySelector('.btn-nav-login');
  if (loginBtn && user) {
    loginBtn.textContent = user.name.split(' ')[0];
    loginBtn.onclick = () => window.location.href = user.role === 'provider' ? 'provider-dashboard.html' : 'student-dashboard.html';
  } else if (loginBtn) {
    loginBtn.onclick = () => window.location.href = 'login.html';
  }
  // Cart badge
  Cart.updateBadge();
}

// ── Scroll Animations ──────────────────────────────────────
function initAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, idx) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), idx * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ── Form Validation ────────────────────────────────────────
function validateForm(formEl) {
  let valid = true;
  formEl.querySelectorAll('[required]').forEach(input => {
    const err = input.nextElementSibling;
    if (!input.value.trim()) {
      input.classList.add('error');
      if (err && err.classList.contains('form-error')) {
        err.style.display = 'block';
        err.textContent = 'This field is required';
      }
      valid = false;
    } else {
      input.classList.remove('error');
      if (err && err.classList.contains('form-error')) err.style.display = 'none';
    }
    if (input.type === 'email' && input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.classList.add('error');
      if (err && err.classList.contains('form-error')) { err.style.display = 'block'; err.textContent = 'Enter a valid email'; }
      valid = false;
    }
  });
  return valid;
}

// ── Mock Data ──────────────────────────────────────────────
const PROVIDERS = [
  { id: 'p1', name: "Manya Tiffin Service", owner: "Manya", area: "Suranussi",
    cuisine: "North Indian", rating: 4.8, reviews: 142, isVeg: true, isOpen: true,
    plans: ['Daily', 'Weekly', 'Monthly'], priceFrom: 60, priceMonthly: 1499,
    deliveryTime: "7:30 AM & 12:30 PM", emoji: "🍛", image: "public/tiffins/tiffin1.png",
    meals: [
      { id: 'm1', name: "Lunch Thali", desc: "2 sabzi, dal, rice, 3 roti, salad, pickle", price: 80, category: "Lunch" },
      { id: 'm2', name: "Dinner Thali", desc: "1 sabzi, dal, rice, 4 roti, sweet", price: 75, category: "Dinner" },
      { id: 'm3', name: "Breakfast Box", desc: "Paratha with curd / poha / upma", price: 45, category: "Breakfast" },
    ]
  },
  { id: 'p2', name: "RM Tiffin Service", owner: "RM", area: "Near SARB Multiplex",
    cuisine: "South Indian", rating: 4.6, reviews: 98, isVeg: true, isOpen: true,
    plans: ['Weekly', 'Monthly'], priceFrom: 55, priceMonthly: 1299,
    deliveryTime: "8:00 AM & 1:00 PM", emoji: "🥘", image: "public/tiffins/tiffin2.jpg",
    meals: [
      { id: 'm4', name: "Idli Sambar (4 pcs)", desc: "4 soft idlis, sambar, coconut chutney", price: 50, category: "Breakfast" },
      { id: 'm5', name: "Meals (Full)", desc: "Rice, sambar, 2 curries, rasam, papad", price: 90, category: "Lunch" },
    ]
  },
  { id: 'p3', name: "Jai Maa Tiffin Service", owner: "Gurpreet Kaur", area: "Near PAP Chownk",
    cuisine: "Punjabi", rating: 4.5, reviews: 67, isVeg: false, isOpen: true,
    plans: ['Daily', 'Monthly'], priceFrom: 70, priceMonthly: 1699,
    deliveryTime: "12:00 PM & 7:30 PM", emoji: "🫕", image: "public/tiffins/tiffin3.jpg",
    meals: [
      { id: 'm6', name: "Punjabi Lunch", desc: "Dal makhani / rajma, rice, 2 roti, lassi", price: 90, category: "Lunch" },
      { id: 'm7', name: "Non-Veg Thali", desc: "Chicken curry, rice, 3 roti, raita", price: 120, category: "Lunch" },
    ]
  },
  // { id: 'p4', name: "Ma Ki Rasoi", owner: "Anita Verma", area: "Near Boys Hostel B",
  //   cuisine: "Home Style", rating: 4.9, reviews: 203, isVeg: true, isOpen: false,
  //   plans: ['Monthly'], priceFrom: 55, priceMonthly: 1199,
  //   deliveryTime: "Lunch & Dinner only", emoji: "🍲",
  //   meals: [
  //     { id: 'm8', name: "Monthly Subscription", desc: "Seasonal home-cooked thali, 2 meals/day", price: 1199, category: "Monthly" },
  //   ]
  // },
  // { id: 'p5', name: "Spice Garden", owner: "Meena Pillai", area: "Market Block C",
  //   cuisine: "Multi-Cuisine", rating: 4.4, reviews: 55, isVeg: true, isOpen: true,
  //   plans: ['Daily', 'Weekly', 'Monthly'], priceFrom: 65, priceMonthly: 1549,
  //   deliveryTime: "8:00 AM, 1:00 PM & 8:00 PM", emoji: "🌿",
  //   meals: [
  //     { id: 'm9', name: "Veg Combo", desc: "Rice / roti, dal, sabzi, salad", price: 70, category: "Lunch" },
  //     { id: 'm10', name: "Special Weekend Thali", desc: "Paneer dish, dal, rice, roti, kheer", price: 110, category: "Special" },
  //   ]
  // },
  // { id: 'p6', name: "Bengal Kitchen", owner: "Sanjukta Das", area: "Faculty Quarters Lane",
  //   cuisine: "Bengali", rating: 4.7, reviews: 81, isVeg: false, isOpen: true,
  //   plans: ['Weekly', 'Monthly'], priceFrom: 60, priceMonthly: 1399,
  //   deliveryTime: "12:30 PM & 7:00 PM", emoji: "🐟",
  //   meals: [
  //     { id: 'm11', name: "Bong Lunch Thali", desc: "Rice, dal, begun bhaja, 1 fish curry / veg", price: 85, category: "Lunch" },
  //   ]
  // }
];

function getProvider(id) { return PROVIDERS.find(p => p.id === id) || null; }

// ── Pause Rules ────────────────────────────────────────────
const CUTOFF = { Breakfast: { h: 7, m: 0 }, Lunch: { h: 9, m: 0 }, Dinner: { h: 16, m: 0 } };
function canPause(mealType) {
  const now = new Date();
  const cut = CUTOFF[mealType] || CUTOFF.Lunch;
  const cutoff = new Date(now); cutoff.setHours(cut.h, cut.m, 0, 0);
  return now < cutoff;
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAnimations();
});
