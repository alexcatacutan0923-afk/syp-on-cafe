'use strict';

const API_URL = 'https://script.google.com/macros/s/AKfycbw8-313J5vT0eanrWTt52lGuzOO_AXs4jZxjuXz8Z5ic7gZS_vnZaUl7HxJQBYgpIs/exec';
const TOKEN_KEY = 'sypAccountToken';

const views = document.querySelectorAll('.view');
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.form-panel');
const authMessage = document.getElementById('authMessage');
const passwordMessage = document.getElementById('passwordMessage');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const headerLogout = document.getElementById('headerLogout');

function setView(name) {
  views.forEach(view => view.classList.toggle('active', view.dataset.view === name));
  headerLogout.classList.toggle('hidden', name !== 'dashboard');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setTab(name) {
  tabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === name));
  panels.forEach(panel => panel.classList.toggle('active', panel.dataset.panel === name));
  clearMessage(authMessage);
}

function showLoading(text) {
  loadingText.textContent = text || 'Please wait…';
  loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

function showMessage(element, text, type = 'error') {
  element.textContent = text;
  element.className = `message show ${type}`;
}

function clearMessage(element) {
  element.textContent = '';
  element.className = 'message';
}

function normalizeMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^09\d{9}$/.test(digits)) return digits;
  if (/^639\d{9}$/.test(digits)) return `0${digits.slice(2)}`;
  return '';
}

function validatePassword(password) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

async function api(payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);
  const url = `${API_URL}?action=v3api&payload=${encodeURIComponent(JSON.stringify(payload))}&_=${Date.now()}`;

  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`Server returned ${response.status}.`);
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (_) {
      throw new Error('The server returned an invalid response. Redeploy the Apps Script web app and try again.');
    }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Check your internet connection and try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function saveSession(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function renderCustomer(customer) {
  const stamps = Math.max(0, Number(customer.stamps) || 0);
  const capped = Math.min(stamps, 10);
  const remaining = Math.max(10 - capped, 0);
  const rewardReady = Boolean(customer.rewardReady) || stamps >= 10;
  const firstName = String(customer.name || 'Member').split(/\s+/)[0];

  document.getElementById('welcomeName').textContent = `Welcome back, ${firstName}`;
  document.getElementById('memberName').textContent = customer.name || 'SYP Member';
  document.getElementById('memberId').textContent = customer.id || 'SYP----';
  document.getElementById('memberMobile').textContent = customer.mobileMasked || '09•••0000';
  document.getElementById('avatar').textContent = String(customer.name || 'S').charAt(0).toUpperCase();
  document.getElementById('stampNumber').textContent = stamps;
  document.getElementById('stampProgress').style.width = `${capped * 10}%`;
  document.getElementById('accountStatus').textContent = String(customer.status || 'ACTIVE').toUpperCase();
  document.getElementById('referralCount').textContent = `${Number(customer.referrals) || 0} friends`;
  document.getElementById('totalStamps').textContent = `${Number(customer.totalStamps) || stamps} stamps`;

  const dots = document.getElementById('stampDots');
  dots.replaceChildren();
  for (let i = 0; i < 10; i += 1) {
    const dot = document.createElement('span');
    dot.className = `stamp-dot${i < capped ? ' filled' : ''}`;
    dot.textContent = i < capped ? '☕' : String(i + 1);
    dots.appendChild(dot);
  }

  const banner = document.getElementById('rewardBanner');
  banner.classList.toggle('ready', rewardReady);
  banner.textContent = rewardReady ? 'FREE DRINK READY — show this account to the cashier' : `${remaining} stamp${remaining === 1 ? '' : 's'} to your free drink`;
  document.getElementById('rewardTitle').textContent = rewardReady ? 'Free drink ready!' : `${remaining} stamp${remaining === 1 ? '' : 's'} remaining`;
  document.getElementById('rewardCopy').textContent = rewardReady ? 'Visit SYP ON CAFÉ and claim your loyalty reward.' : 'Keep ordering your favorite drinks to complete the card.';
}

async function loadAccount() {
  const token = getToken();
  if (!token) {
    setView('home');
    return;
  }

  showLoading('Loading your loyalty account…');
  try {
    const result = await api({ action: 'getAccount', token });
    if (!result.success) {
      clearSession();
      setView('auth');
      setTab('login');
      showMessage(authMessage, result.message || 'Please log in again.');
      return;
    }
    renderCustomer(result.customer);
    setView('dashboard');
  } catch (error) {
    setView('auth');
    setTab('login');
    showMessage(authMessage, error.message);
  } finally {
    hideLoading();
  }
}

document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    setView('auth');
    setTab(button.dataset.open);
  });
});

const backHome = document.getElementById('backHome');
if (backHome && backHome.tagName === 'BUTTON') backHome.addEventListener('click', () => location.href = '/');
tabs.forEach(tab => tab.addEventListener('click', () => setTab(tab.dataset.tab)));

document.getElementById('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  clearMessage(authMessage);
  const data = new FormData(event.currentTarget);
  const mobile = normalizeMobile(data.get('mobile'));
  const password = String(data.get('password') || '');
  if (!mobile || !password) return showMessage(authMessage, 'Enter a valid mobile number and password.');

  showLoading('Logging you in…');
  try {
    const result = await api({ action: 'loginAccount', mobile, password });
    if (!result.success) throw new Error(result.message || 'Login failed.');
    saveSession(result.token);
    renderCustomer(result.customer);
    form.reset();
    setView('dashboard');
  } catch (error) {
    showMessage(authMessage, error.message);
  } finally {
    hideLoading();
  }
});

document.getElementById('registerForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  clearMessage(authMessage);
  const data = new FormData(event.currentTarget);
  const payload = {
    action: 'registerAccount',
    name: String(data.get('name') || '').trim(),
    mobile: normalizeMobile(data.get('mobile')),
    birthday: String(data.get('birthday') || ''),
    password: String(data.get('password') || ''),
    referrer: String(data.get('referrer') || '').trim().toUpperCase()
  };
  const confirmPassword = String(data.get('confirmPassword') || '');

  if (!payload.name || !payload.mobile || !payload.birthday) return showMessage(authMessage, 'Complete all required fields with valid information.');
  if (!validatePassword(payload.password)) return showMessage(authMessage, 'Password must have at least 8 characters, one letter, and one number.');
  if (payload.password !== confirmPassword) return showMessage(authMessage, 'Passwords do not match.');

  showLoading('Creating your SYP account…');
  try {
    const result = await api(payload);
    if (!result.success) {
      if (result.code === 'EXISTING_MEMBER') {
        setTab('activate');
        const activateId = document.querySelector('#activateForm [name="customerId"]');
        activateId.value = result.customerId || '';
      }
      throw new Error(result.message || 'Registration failed.');
    }
    saveSession(result.token);
    renderCustomer(result.customer);
    form.reset();
    setView('dashboard');
  } catch (error) {
    showMessage(authMessage, error.message);
  } finally {
    hideLoading();
  }
});

document.getElementById('activateForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  clearMessage(authMessage);
  const data = new FormData(event.currentTarget);
  const password = String(data.get('password') || '');
  const confirmPassword = String(data.get('confirmPassword') || '');
  const payload = {
    action: 'activateAccount',
    customerId: String(data.get('customerId') || '').trim().toUpperCase(),
    mobile: normalizeMobile(data.get('mobile')),
    birthday: String(data.get('birthday') || ''),
    password
  };

  if (!payload.customerId || !payload.mobile || !payload.birthday) return showMessage(authMessage, 'Complete all required membership details.');
  if (!validatePassword(password)) return showMessage(authMessage, 'Password must have at least 8 characters, one letter, and one number.');
  if (password !== confirmPassword) return showMessage(authMessage, 'Passwords do not match.');

  showLoading('Activating your membership…');
  try {
    const result = await api(payload);
    if (!result.success) throw new Error(result.message || 'Activation failed.');
    saveSession(result.token);
    renderCustomer(result.customer);
    form.reset();
    setView('dashboard');
  } catch (error) {
    showMessage(authMessage, error.message);
  } finally {
    hideLoading();
  }
});

document.getElementById('passwordForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  clearMessage(passwordMessage);
  const data = new FormData(event.currentTarget);
  const currentPassword = String(data.get('currentPassword') || '');
  const newPassword = String(data.get('newPassword') || '');
  const confirmPassword = String(data.get('confirmPassword') || '');

  if (!validatePassword(newPassword)) return showMessage(passwordMessage, 'New password must have at least 8 characters, one letter, and one number.');
  if (newPassword !== confirmPassword) return showMessage(passwordMessage, 'New passwords do not match.');

  showLoading('Updating your password…');
  try {
    const result = await api({ action: 'changePassword', token: getToken(), currentPassword, newPassword });
    if (!result.success) throw new Error(result.message || 'Password update failed.');
    form.reset();
    showMessage(passwordMessage, result.message || 'Password changed successfully.', 'success');
  } catch (error) {
    showMessage(passwordMessage, error.message);
  } finally {
    hideLoading();
  }
});

async function logout() {
  const token = getToken();
  clearSession();
  setView('home');
  if (token) {
    try { await api({ action: 'logoutAccount', token }); } catch (_) { /* Local logout already completed. */ }
  }
}

headerLogout.addEventListener('click', logout);

window.addEventListener('hashchange', () => {
  const route = location.hash.replace('#', '');
  if (['login', 'register', 'activate'].includes(route)) {
    setView('auth');
    setTab(route);
  }
});

(async function init() {
  const route = location.hash.replace('#', '');
  const requestedView = new URLSearchParams(location.search).get('view');

  if (getToken()) {
    await loadAccount();
  } else if (['login', 'register', 'activate'].includes(requestedView)) {
    setView('auth');
    setTab(requestedView);
  } else if (['login', 'register', 'activate'].includes(route)) {
    setView('auth');
    setTab(route);
  } else {
    setView('home');
  }
})();
