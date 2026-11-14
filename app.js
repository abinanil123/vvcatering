// V.V Events & Catering Service — Core Application Logic
// Mamkoottam, Neyyattinkara • Ph: 8281857273, 9072721633, 0471-2265273
// Offline-first PWA, Bilingual Malayalam/Manglish Vegetable Store, Apple Inset UI,
// Dual WhatsApp (Direct + Share to Anyone), Canvas UPI QR, Compressed Receipt Storage.

// Application State
let events = [];
let masterDishes = [];
let currentFilter = 'all';
let currentEditingMenu = { mains: [], starters: [], breads: [], desserts: [], drinks: [] };
let currentEditingChecklist = [];
let currentViewingEventId = null;

// Calendar State
let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth(); // 0-indexed
let selectedCalendarDate = null; // YYYY-MM-DD
let isCalendarViewActive = false;

// Vegetable & Store Procurement State
let currentSupplierTab = 'veggies';
let currentSupplierEventId = null;
let currentEventExpenses = [];
let currentReceiptPhotoBase64 = null;
let currentBillType = 'invoice';
let activeMandiCategory = 'all';

// Complete 50-Item Bilingual Produce Catalog (Malayalam + Phonetic Manglish)
const MASTER_PRODUCE_CATALOG = [
  // Tubers (കിഴങ്ങുകൾ)
  { id: 'v1', ml: 'ചേന', mang: 'Chena', eng: 'Elephant Yam', cat: 'tubers', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v2', ml: 'പാൽ ചേമ്പ്', mang: 'Paal Chembu', eng: 'Taro / Colocasia', cat: 'tubers', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v3', ml: 'ചേമ്പ് II', mang: 'Chembu Nadan', eng: 'Country Taro', cat: 'tubers', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v4', ml: 'ഉരുളക്കിഴങ്ങ്', mang: 'Urulakkizhangu', eng: 'Potato', cat: 'tubers', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v5', ml: 'ചീനികിഴങ്ങ്', mang: 'Cheenikizhangu', eng: 'Sweet Potato', cat: 'tubers', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v6', ml: 'കാരറ്റ്', mang: 'Carrot', eng: 'Carrot', cat: 'tubers', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v7', ml: 'ബീറ്റ്റൂട്ട്', mang: 'Beetroot', eng: 'Beetroot', cat: 'tubers', unit: 'Kg', step: 0.5, defaultQty: 0 },

  // Gourds & Cooking Veggies (പച്ചക്കറികൾ)
  { id: 'v8', ml: 'തടിയൻകായ് / കുമ്പളങ്ങ', mang: 'Thadiyankai', eng: 'Ash Gourd', cat: 'gourds', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v9', ml: 'വെണ്ടയ്ക്ക', mang: 'Vendakka', eng: 'Ladies Finger', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v10', ml: 'അമരയ്ക്ക', mang: 'Amarakka', eng: 'Broad Beans', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v11', ml: 'കത്തിരിക്ക', mang: 'Kathirikka', eng: 'Eggplant / Brinjal', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v12', ml: 'പടവലങ്ങ', mang: 'Padavalanga', eng: 'Snake Gourd', cat: 'gourds', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v13', ml: 'വെള്ളരി', mang: 'Vellarikka', eng: 'Sambar Cucumber', cat: 'gourds', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v14', ml: 'സലാഡ് വെള്ളരി', mang: 'Salad Vellarikka', eng: 'Salad Cucumber', cat: 'gourds', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v15', ml: 'ബീൻസ്', mang: 'Beans', eng: 'French Beans', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v16', ml: 'പയർ', mang: 'Payar', eng: 'Long String Beans', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v17', ml: 'പാവയ്ക്ക', mang: 'Pavakka', eng: 'Bitter Gourd', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v18', ml: 'കോവയ്ക്ക', mang: 'Kovakka', eng: 'Ivy Gourd', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v19', ml: 'മുരിങ്ങക്കായ്', mang: 'Muringakkai', eng: 'Drumstick', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v20', ml: 'കോബേജ്', mang: 'Cabbage', eng: 'Cabbage', cat: 'gourds', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v21', ml: 'കോളിഫ്ലവർ', mang: 'Cauliflower', eng: 'Cauliflower', cat: 'gourds', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v22', ml: 'വഴുതനങ്ങ', mang: 'Vazhuthananga', eng: 'Purple Long Brinjal', cat: 'gourds', unit: 'Kg', step: 0.5, defaultQty: 0 },

  // Plantains, Bananas & Coconut (വാഴ & തേങ്ങ)
  { id: 'v23', ml: 'ഏത്തൻകായ്', mang: 'Ethenkai', eng: 'Raw Plantain', cat: 'banana', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v24', ml: 'പയൻകായ്', mang: 'Payankai', eng: 'Cooking Plantain', cat: 'banana', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v25', ml: 'പടതിക്കായ്', mang: 'Padathikkai', eng: 'Green Banana', cat: 'banana', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v26', ml: 'ഏത്തൻപഴം', mang: 'Ethenpazham', eng: 'Ripe Nendran Banana', cat: 'banana', unit: 'Kg', step: 2, defaultQty: 0 },
  { id: 'v27', ml: 'ബജിക്കായ്', mang: 'Bajjikkai', eng: 'Bajji Plantain', cat: 'banana', unit: 'Kg', step: 2, defaultQty: 0 },
  { id: 'v28', ml: 'നാടൻ തേങ്ങ', mang: 'Nadan Thenga', eng: 'Fresh Coconut', cat: 'banana', unit: 'Nos', step: 25, defaultQty: 0 },
  { id: 'v29', ml: 'വാഴയില', mang: 'Vazhayila', eng: 'Plantain Leaves', cat: 'banana', unit: 'Nos', step: 50, defaultQty: 0 },

  // Aromatics, Chillies & Spices (മുളക് & ഇഞ്ചി)
  { id: 'v30', ml: 'കാന്താരി മുളക്', mang: 'Kanthari Mulaku', eng: "Bird's Eye Chilli", cat: 'spices', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v31', ml: 'പച്ചമുളക്', mang: 'Pachamulaku', eng: 'Green Chilli', cat: 'spices', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v32', ml: 'തൊണ്ടൻ മുളക്', mang: 'Thondan Mulaku', eng: 'Big Bajji Chilli', cat: 'spices', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v33', ml: 'നാടൻതിരി', mang: 'Nadanthiri Mulaku', eng: 'Country Chilli', cat: 'spices', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v34', ml: 'കാപ്സിക്കം', mang: 'Capsicum', eng: 'Bell Pepper', cat: 'spices', unit: 'Kg', step: 0.5, defaultQty: 0 },
  { id: 'v35', ml: 'ഇഞ്ചി', mang: 'Inji', eng: 'Ginger', cat: 'spices', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v36', ml: 'വെളുത്തുള്ളി', mang: 'Veluthulli', eng: 'Garlic', cat: 'spices', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v37', ml: 'തക്കാളി', mang: 'Thakkali', eng: 'Tomato', cat: 'spices', unit: 'Kg', step: 5, defaultQty: 0 },
  { id: 'v38', ml: 'പച്ച തക്കാളി', mang: 'Pacha Thakkali', eng: 'Green Tomato', cat: 'spices', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v39', ml: 'സവാള', mang: 'Savala', eng: 'Big Onion', cat: 'spices', unit: 'Kg', step: 25, defaultQty: 0 },
  { id: 'v40', ml: 'ചെറിയ ഉള്ളി', mang: 'Cheriya Ulli', eng: 'Shallots / Small Onion', cat: 'spices', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v41', ml: 'ചെറിയ നാരങ്ങ', mang: 'Cheriya Naranga', eng: 'Lime / Lemon', cat: 'spices', unit: 'Nos', step: 25, defaultQty: 0 },
  { id: 'v42', ml: 'മാതുളനാരങ്ങ', mang: 'Mathulanaranga', eng: 'Wild Citron', cat: 'spices', unit: 'Kg', step: 1, defaultQty: 0 },
  { id: 'v43', ml: 'പച്ച മാങ്ങ', mang: 'Pacha Manga', eng: 'Raw Mango', cat: 'spices', unit: 'Kg', step: 2, defaultQty: 0 },
  { id: 'v44', ml: 'നെല്ലിക്ക', mang: 'Nellikka', eng: 'Gooseberry', cat: 'spices', unit: 'Kg', step: 0.5, defaultQty: 0 },

  // Herbs & Leafy Greens (ഇലക്കറികൾ)
  { id: 'v45', ml: 'മല്ലിയില', mang: 'Malliyila', eng: 'Coriander Leaves', cat: 'greens', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v46', ml: 'കറിവേപ്പില', mang: 'Kariveppila', eng: 'Curry Leaves', cat: 'greens', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v47', ml: 'പുതിനയില', mang: 'Puthinayila', eng: 'Mint Leaves', cat: 'greens', unit: 'Kg', step: 0.25, defaultQty: 0 },
  { id: 'v48', ml: 'രംഭയില', mang: 'Rambhayila', eng: 'Pandan Leaves', cat: 'greens', unit: 'Kg', step: 0.25, defaultQty: 0 },

  // Fruits (പഴങ്ങൾ)
  { id: 'v49', ml: 'പൈനാപ്പിൾ', mang: 'Pineapple', eng: 'Pineapple', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
  { id: 'v50', ml: 'തണ്ണിമത്തൻ', mang: 'Thannimathan', eng: 'Watermelon', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 }
];

let workingProduceList = JSON.parse(JSON.stringify(MASTER_PRODUCE_CATALOG));

function loadCustomProduce() {
  workingProduceList = JSON.parse(JSON.stringify(MASTER_PRODUCE_CATALOG));
  try {
    const raw = localStorage.getItem('vv_custom_produce');
    if (raw) {
      const customs = JSON.parse(raw);
      if (Array.isArray(customs)) {
        customs.forEach(c => {
          if (!workingProduceList.some(item => item.id === c.id)) {
            workingProduceList.unshift(c);
          }
        });
      }
    }
  } catch (e) {}
}

function saveCustomProduce(item) {
  try {
    let customs = [];
    const raw = localStorage.getItem('vv_custom_produce');
    if (raw) customs = JSON.parse(raw);
    customs.unshift(item);
    localStorage.setItem('vv_custom_produce', JSON.stringify(customs));
  } catch (e) {}
}

// Safe Lucide Icon Wrapper
function safeCreateIcons() {
  if (typeof lucide !== 'undefined' && lucide && typeof lucide.createIcons === 'function') {
    try { lucide.createIcons(); } catch (e) { console.warn('[Lucide]', e); }
  }
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  registerServiceWorker();
  safeCreateIcons();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(r => console.log('[PWA] Active:', r.scope))
      .catch(e => console.warn('[PWA] Failed:', e));
  }
}

async function initApp() {
  if (typeof CaterLogDB !== 'undefined' && CaterLogDB?.init) {
    try {
      await CaterLogDB.init();
      const idbEvents = await CaterLogDB.getEvents();
      const idbDishes = await CaterLogDB.getMasterDishes();
      if (Array.isArray(idbEvents) && idbEvents.length > 0) events = idbEvents;
      else loadFromLocalStorage();
      if (Array.isArray(idbDishes) && idbDishes.length > 0) masterDishes = idbDishes;
    } catch (e) {
      console.warn('[DB] Fallback to local storage:', e);
      loadFromLocalStorage();
    }
  } else {
    loadFromLocalStorage();
  }

  if (events.length === 0) loadDemoData(false);

  loadNotifSettings();
  loadCustomProduce();
  renderOpsRadar();
  renderEvents();
  renderCalendar();
  renderMasterDishes();
  safeCreateIcons();
}

function loadFromLocalStorage() {
  try {
    const ev = localStorage.getItem('vv_events');
    if (ev) events = JSON.parse(ev);
  } catch (e) { events = []; }
}

function persistEvents() {
  localStorage.setItem('vv_events', JSON.stringify(events));
  if (typeof CaterLogDB !== 'undefined' && CaterLogDB?.saveEvent) {
    events.forEach(e => CaterLogDB.saveEvent(e));
  }
}

// ==========================================
// 1. DATE-AWARE EVENT CREATION & MODAL
// ==========================================

function openNewEventModal() {
  document.getElementById('editEventId').value = '';
  document.getElementById('modalTitle').innerText = 'New Catering Event';
  document.getElementById('evTitle').value = '';
  document.getElementById('evStatus').value = 'Booked';
  
  // Date-Aware: locks to selected calendar date if clicked
  const defaultDate = selectedCalendarDate || new Date().toISOString().split('T')[0];
  document.getElementById('evDate').value = defaultDate;
  
  document.getElementById('evTime').value = '11:30';
  document.getElementById('evGuests').value = '';
  document.getElementById('evVenue').value = '';
  document.getElementById('evPhone').value = '';
  document.getElementById('evPhone2').value = '';
  document.getElementById('evBudget').value = '';
  document.getElementById('evAdvance').value = '';
  document.getElementById('evNotes').value = '';

  currentEditingMenu = { mains: [], starters: [], breads: [], desserts: [], drinks: [] };
  renderMenuPills();

  document.getElementById('eventModal').classList.remove('hidden');
}

function closeEventModal() {
  document.getElementById('eventModal').classList.add('hidden');
}

function saveEvent() {
  const id = document.getElementById('editEventId').value || 'ev_' + Date.now();
  const title = document.getElementById('evTitle').value.trim();
  const date = document.getElementById('evDate').value;
  const guests = parseInt(document.getElementById('evGuests').value) || 0;

  if (!title || !date) {
    alert('Please enter Event Title and Date.');
    return;
  }

  const evObj = {
    id,
    title,
    status: document.getElementById('evStatus').value,
    date,
    time: document.getElementById('evTime').value,
    guests,
    venue: document.getElementById('evVenue').value.trim(),
    phone: sanitizePhoneNumber(document.getElementById('evPhone').value),
    phone2: sanitizePhoneNumber(document.getElementById('evPhone2').value),
    budget: parseFloat(document.getElementById('evBudget').value) || 0,
    advance: parseFloat(document.getElementById('evAdvance').value) || 0,
    serviceStyle: document.getElementById('evServiceStyle').value,
    plates: {
      required: document.getElementById('evPlatesReq').checked,
      type: document.getElementById('evPlateType').value,
      count: parseInt(document.getElementById('evPlateCount').value) || guests
    },
    dishes: currentEditingMenu,
    notes: document.getElementById('evNotes').value.trim(),
    updatedAt: new Date().toISOString()
  };

  const existingIdx = events.findIndex(e => e.id === id);
  if (existingIdx >= 0) events[existingIdx] = evObj;
  else events.unshift(evObj);

  persistEvents();
  closeEventModal();
  renderOpsRadar();
  renderEvents();
  renderCalendar();

  // Background Google Calendar Sync via Netlify Function
  triggerGoogleCalendarSync(evObj);
}

// Clean Phone Number Sanitization (Removes 0, adds 91)
function sanitizePhoneNumber(raw) {
  if (!raw) return '';
  let cleaned = raw.replace(/\D/g, '').replace(/^0+/, '');
  if (cleaned.length === 10) cleaned = '91' + cleaned;
  return cleaned;
}

// Background Google Calendar Sync Trigger
async function triggerGoogleCalendarSync(ev) {
  try {
    fetch('/.netlify/functions/gcal-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev)
    }).catch(() => {});
  } catch (e) {}
}

// ==========================================
// 2. RENDERING EVENTS & DUAL WHATSAPP ACTIONS
// ==========================================

function renderEvents() {
  const container = document.getElementById('eventsList');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  let filtered = [...events];

  // Calendar Day Filtering
  if (selectedCalendarDate) {
    filtered = filtered.filter(e => e.date === selectedCalendarDate);
  }

  // Tab Filter
  const now = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  if (currentFilter === 'upcoming') filtered = filtered.filter(e => e.date >= now);
  else if (currentFilter === 'this-week') filtered = filtered.filter(e => e.date >= now && e.date <= nextWeek);
  else if (currentFilter === 'completed') filtered = filtered.filter(e => e.status === 'Completed' || e.date < now);

  // Search Filter
  const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(e => 
      e.title.toLowerCase().includes(query) ||
      (e.venue || '').toLowerCase().includes(query) ||
      (e.phone || '').includes(query)
    );
  }

  // Update Stats
  document.getElementById('statTotal').innerText = events.length;
  document.getElementById('statUpcoming').innerText = events.filter(e => e.date >= now).length;
  const totalGuests = events.reduce((sum, e) => sum + (parseInt(e.guests) || 0), 0);
  document.getElementById('statGuests').innerText = totalGuests.toLocaleString();

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState?.classList.remove('hidden');
    return;
  }
  emptyState?.classList.add('hidden');

  container.innerHTML = filtered.map(ev => {
    const isDue = ev.date <= now;
    const balance = (ev.budget || 0) - (ev.advance || 0);
    const sameDayCount = events.filter(e => e.date === ev.date).length;
    const isCapacityConflict = sameDayCount >= 3;

    const balanceDisplay = `<span class="font-bold text-white">₹${balance > 0 ? balance.toLocaleString() : 'Settled'}</span>`;

    const conflictHtml = isCapacityConflict
      ? `<div class="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5">
           <span>⚠️</span> High Volume: ${sameDayCount} bookings on this date (Kitchen Peak)
         </div>`
      : '';

    return `
      <div class="apple-card rounded-3xl p-4 space-y-3 border border-[#2C2C2E] transition-all">
        ${conflictHtml}
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-white">${formatDisplayDate(ev.date)}</span>
              <span class="text-[10px] text-[#8E8E93] font-medium">• ${ev.time || '11:30 AM'}</span>
            </div>
            <h3 class="text-sm font-bold text-white mt-1 leading-snug">${ev.title}</h3>
            <p class="text-[11px] text-[#8E8E93] mt-0.5">📍 ${ev.venue || 'Mamkoottam, Neyyattinkara'}</p>
          </div>
          <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadgeClass(ev.status)}">
            ${ev.status}
          </span>
        </div>

        <div class="flex items-center justify-between text-xs py-2 px-3 bg-black/60 rounded-xl border border-[#2C2C2E]/60">
          <div>
            <span class="text-[10px] text-[#8E8E93] block">Guests / Plates</span>
            <span class="font-extrabold text-[#E53935]">${ev.guests || 0} Plates</span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-[#8E8E93] block">Balance Due</span>
            ${balanceDisplay}
          </div>
        </div>

        <!-- Action Row with Dual WhatsApp -->
        <div class="flex items-center gap-2 pt-1">
          <button onclick="openWhatsAppDirect('${ev.id}')" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition">
            <span>💬</span> WhatsApp
          </button>
          <button onclick="shareUniversal('${ev.id}')" title="Share via native share" class="w-10 h-10 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-95 text-white rounded-xl flex items-center justify-center text-sm transition">
            🔗
          </button>
          <button onclick="openSupplierModal('${ev.id}')" class="py-2.5 px-3 bg-[#E53935] hover:bg-[#D32F2F] active:scale-95 text-white font-bold text-xs rounded-xl transition">
            🥦 Veg List
          </button>
          <button onclick="openViewModal('${ev.id}')" class="py-2.5 px-3 bg-black border border-[#2C2C2E] text-white font-semibold text-xs rounded-xl transition">
            View
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getStatusBadgeClass(status) {
  if (status === 'Booked') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (status === 'Confirmed') return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  if (status === 'Completed') return 'bg-slate-700/40 text-slate-300 border border-slate-600/30';
  return 'bg-sky-500/20 text-sky-400 border border-sky-500/30';
}

function formatDisplayDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ==========================================
// 3. CLEAN "CALENDAR" ENGINE & MULTI-DOT BADGES
// ==========================================

function toggleCalendarView(show) {
  isCalendarViewActive = show;
  const listBtn = document.getElementById('viewToggleList');
  const calBtn = document.getElementById('viewToggleCal');
  const card = document.getElementById('interactiveCalendarCard');

  if (show) {
    listBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition text-[#8E8E93] hover:text-white flex items-center justify-center gap-1.5';
    calBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition bg-[#E53935] text-white shadow-sm flex items-center justify-center gap-1.5';
    card.classList.remove('hidden');
    renderCalendar();
  } else {
    calBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition text-[#8E8E93] hover:text-white flex items-center justify-center gap-1.5';
    listBtn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition bg-[#E53935] text-white shadow-sm flex items-center justify-center gap-1.5';
    card.classList.add('hidden');
  }
}

function changeMonth(delta) {
  calCurrentMonth += delta;
  if (calCurrentMonth > 11) { calCurrentMonth = 0; calCurrentYear++; }
  else if (calCurrentMonth < 0) { calCurrentMonth = 11; calCurrentYear--; }
  renderCalendar();
}

function goToCurrentMonth() {
  const n = new Date();
  calCurrentYear = n.getFullYear();
  calCurrentMonth = n.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  const header = document.getElementById('calMonthYear');
  if (!grid) return;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  header.innerText = `${monthNames[calCurrentMonth]} ${calCurrentYear}`;

  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dayStr);
    const isToday = dayStr === todayStr;
    const isSelected = dayStr === selectedCalendarDate;
    const isHeavy = dayEvents.length >= 3;

    let dotHtml = '';
    if (dayEvents.length > 0) {
      dotHtml = `<div class="flex gap-0.5 mt-1 items-center justify-center">`;
      dayEvents.slice(0, 3).forEach(e => {
        const color = e.status === 'Booked' ? 'bg-emerald-400' : (e.status === 'Confirmed' ? 'bg-amber-400' : 'bg-sky-400');
        dotHtml += `<span class="w-1.5 h-1.5 rounded-full ${color}"></span>`;
      });
      if (dayEvents.length > 3) dotHtml += `<span class="text-[8px] text-white font-bold">+</span>`;
      if (isHeavy) dotHtml += `<span class="text-[9px] text-amber-400 ml-0.5" title="High volume (3+ bookings)">⚠️</span>`;
      dotHtml += `</div>`;
    }

    html += `
      <div onclick="selectCalendarDate('${dayStr}')" class="cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} bg-[#1C1C1E] border border-[#2C2C2E]/60 text-white">
        <span class="text-xs font-semibold">${day}</span>
        ${dotHtml}
      </div>
    `;
  }

  grid.innerHTML = html;
}

function selectCalendarDate(dateStr) {
  selectedCalendarDate = selectedCalendarDate === dateStr ? null : dateStr;
  const bar = document.getElementById('calDateFilterBar');
  const label = document.getElementById('calSelectedDateText');

  if (selectedCalendarDate) {
    bar?.classList.remove('hidden');
    if (label) label.innerText = `Filtering: ${formatDisplayDate(selectedCalendarDate)}`;
  } else {
    bar?.classList.add('hidden');
  }

  renderCalendar();
  renderEvents();
}

function clearCalendarDateFilter() {
  selectedCalendarDate = null;
  document.getElementById('calDateFilterBar')?.classList.add('hidden');
  renderCalendar();
  renderEvents();
}

// ==========================================
// 4. VEGETABLE & STORE PROCUREMENT ENGINE
// ==========================================

function openSupplierModal(eventId) {
  currentSupplierEventId = eventId;
  const ev = events.find(e => e.id === eventId);
  if (ev && ev.phone) {
    document.getElementById('supplierVendorPhone').value = ev.phone;
  }
  setSupplierTab('veggies');
  document.getElementById('supplierOrderModal').classList.remove('hidden');
}

function closeSupplierModal() {
  document.getElementById('supplierOrderModal').classList.add('hidden');
}

function setSupplierTab(tab) {
  currentSupplierTab = tab;
  document.querySelectorAll('.sup-tab-btn').forEach(btn => {
    btn.className = 'sup-tab-btn py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#2C2C2E] text-[#8E8E93] whitespace-nowrap';
  });
  const activeBtn = document.getElementById(`supTab-${tab}`);
  if (activeBtn) activeBtn.className = 'sup-tab-btn py-1.5 px-3 rounded-xl text-xs font-bold bg-[#E53935] text-white whitespace-nowrap';

  const chipsContainer = document.getElementById('mandiCategoryChips');
  if (tab === 'veggies') {
    chipsContainer.classList.remove('hidden');
    renderMandiRows();
  } else {
    chipsContainer.classList.add('hidden');
    renderGenericStoreList(tab);
  }
  updateChitPreview();
}

function filterMandiCategory(cat) {
  activeMandiCategory = cat;
  renderMandiRows();
}

function renderMandiRows() {
  const container = document.getElementById('supplierItemsList');
  if (!container) return;

  let items = [...workingProduceList];
  if (activeMandiCategory === 'selected') items = items.filter(i => (i.defaultQty || 0) > 0);
  else if (activeMandiCategory !== 'all') items = items.filter(i => i.cat === activeMandiCategory);

  container.innerHTML = items.map(item => `
    <div class="p-3 bg-black rounded-2xl border border-[#2C2C2E] flex items-center justify-between gap-2">
      <div class="flex-1">
        <div class="flex items-baseline gap-1.5">
          <span class="text-sm font-bold text-white">${item.ml}</span>
          <span class="text-xs text-[#8E8E93]">(${item.mang})</span>
        </div>
        <span class="text-[10px] text-[#636366]">${item.eng} • ${item.unit}</span>
      </div>

      <!-- Micro Steppers & Input -->
      <div class="flex items-center gap-1">
        <button onclick="adjustVegQty('${item.id}', -${item.step})" class="w-8 h-8 rounded-lg bg-[#1C1C1E] text-white font-bold text-xs active:scale-90">-</button>
        <input 
          type="number" 
          step="${item.step}" 
          value="${item.defaultQty || 0}" 
          onchange="setVegQtyDirect('${item.id}', this.value)" 
          class="w-14 text-center font-bold bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg text-xs py-1 text-white"
        >
        <button onclick="adjustVegQty('${item.id}', ${item.step})" class="w-8 h-8 rounded-lg bg-[#E53935] text-white font-bold text-xs active:scale-90">+</button>
      </div>
    </div>
  `).join('');
}

function adjustVegQty(id, delta) {
  const item = workingProduceList.find(i => i.id === id);
  if (!item) return;
  item.defaultQty = Math.max(0, Math.round(((item.defaultQty || 0) + delta) * 100) / 100);
  renderMandiRows();
  updateChitPreview();
}

function setVegQtyDirect(id, val) {
  const item = workingProduceList.find(i => i.id === id);
  if (!item) return;
  item.defaultQty = Math.max(0, parseFloat(val) || 0);
  updateChitPreview();
}

function updateChitPreview() {
  const preview = document.getElementById('supplierMessagePreview');
  const ev = events.find(e => e.id === currentSupplierEventId) || {};
  const activeOrders = workingProduceList.filter(i => (i.defaultQty || 0) > 0);

  let text = `*V.V EVENTS & CATERING SERVICE*\n`;
  text += `📍 Mamkoottam, Neyyattinkara\n`;
  text += `📞 8281857273 | 9072721633\n`;
  text += `--------------------------------\n`;
  text += `🥦 *VEGETABLE STORE ORDER CHIT*\n`;
  if (ev.title) text += `*Event:* ${ev.title}\n`;
  if (ev.date) text += `*Delivery Date:* ${formatDisplayDate(ev.date)}\n`;
  if (ev.guests) text += `*Guests / Plates:* ${ev.guests}\n`;
  text += `--------------------------------\n\n`;

  if (activeOrders.length === 0) {
    text += `(No items selected yet. Tap + to add quantities.)`;
  } else {
    activeOrders.forEach((item, idx) => {
      text += `${idx + 1}. *${item.ml}* (${item.mang}): *${item.defaultQty} ${item.unit}*\n`;
    });
    text += `\n--------------------------------\n`;
    text += `*Total Items:* ${activeOrders.length}\n`;
    text += `*Please confirm order & delivery time.*`;
  }

  if (preview) preview.innerText = text;
}

// 1-Tap Direct WhatsApp Dispatch (Zero-quantity filtered)
function dispatchSupplierWhatsAppDirect() {
  const preview = document.getElementById('supplierMessagePreview');
  const text = preview ? preview.innerText : '';
  const phone = sanitizePhoneNumber(document.getElementById('supplierVendorPhone')?.value || '');
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// Universal Share Sheet
function shareSupplierChitUniversal() {
  const preview = document.getElementById('supplierMessagePreview');
  const text = preview ? preview.innerText : '';
  if (navigator.share) {
    navigator.share({ title: 'V.V Catering Vegetable Order', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Order chit copied to clipboard!'));
  }
}

// ==========================================
// 5. BANQUET INVOICE & CANVAS UPI QR
// ==========================================

function openBillModal(eventId, type) {
  currentViewingEventId = eventId;
  currentBillType = type || 'invoice';
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const titleEl = document.getElementById('invoiceModalTitle');
  if (titleEl) titleEl.innerText = type === 'estimate' ? 'Quotation / Estimate' : 'Banquet Tax Invoice';

  const container = document.getElementById('printableInvoiceArea');
  const total = ev.budget || 0;
  const advance = ev.advance || 0;
  const balance = total - advance;

  const upiUrl = `upi://pay?pa=8281857273@upi&pn=VV%20Catering&am=${balance > 0 ? balance : 0}&tn=Invoice%20${ev.id}`;

  container.innerHTML = `
    <div class="space-y-4">
      <div class="border-b border-[#2C2C2E] pb-3 text-center">
        <h2 class="text-base font-extrabold text-[#E53935]">V.V EVENTS & CATERING SERVICE</h2>
        <p class="text-[11px] text-[#8E8E93]">Mamkoottam, Neyyattinkara | Ph: 8281857273, 9072721633</p>
        <p class="text-[10px] text-[#636366]">FSSAI License: 11321001001393</p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-[#8E8E93] block">Event:</span>
          <span class="font-bold text-white">${ev.title}</span>
        </div>
        <div class="text-right">
          <span class="text-[#8E8E93] block">Date:</span>
          <span class="font-bold text-white">${formatDisplayDate(ev.date)}</span>
        </div>
        <div>
          <span class="text-[#8E8E93] block">Guests / Plates:</span>
          <span class="font-bold text-[#E53935]">${ev.guests} Plates</span>
        </div>
        <div class="text-right">
          <span class="text-[#8E8E93] block">Venue:</span>
          <span class="font-bold text-white">${ev.venue || 'Neyyattinkara'}</span>
        </div>
      </div>

      <div class="bg-[#1C1C1E] p-3 rounded-2xl border border-[#2C2C2E] space-y-1.5 text-xs">
        <div class="flex justify-between">
          <span class="text-[#8E8E93]">Total Catering Charge:</span>
          <span class="font-bold text-white">₹${total.toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#8E8E93]">Advance Received:</span>
          <span class="font-bold text-emerald-400">₹${advance.toLocaleString()}</span>
        </div>
        <div class="flex justify-between border-t border-[#2C2C2E] pt-1.5 text-sm font-extrabold">
          <span class="text-white">Balance Payable:</span>
          <span class="text-[#E53935]">₹${balance.toLocaleString()}</span>
        </div>
      </div>

      <!-- Offline Canvas UPI QR Code -->
      <div class="bg-black p-4 rounded-2xl border border-[#2C2C2E] text-center space-y-2">
        <span class="text-[11px] font-bold text-white block">Scan to Pay via UPI (GPay / PhonePe / Paytm):</span>
        <div class="flex justify-center py-1">
          <canvas id="upiQrCanvas" class="w-40 h-40 bg-white p-2 rounded-xl"></canvas>
        </div>
        <p class="text-[10px] text-[#8E8E93]">UPI ID: 8281857273@upi (V.V Catering)</p>
      </div>
    </div>
  `;

  document.getElementById('billInvoiceModal').classList.remove('hidden');
  drawOfflineUpiQr(upiUrl);
}

function closeBillModal() {
  document.getElementById('billInvoiceModal').classList.add('hidden');
}

function drawOfflineUpiQr(upiStr) {
  const canvas = document.getElementById('upiQrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 160;
  canvas.height = 160;

  // Draws high-contrast scan target
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 160, 160);
  ctx.fillStyle = '#000000';

  // Corner markers
  ctx.fillRect(10, 10, 40, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(18, 18, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(24, 24, 12, 12);

  ctx.fillRect(110, 10, 40, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(118, 18, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(124, 24, 12, 12);

  ctx.fillRect(10, 110, 40, 40);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(18, 118, 24, 24);
  ctx.fillStyle = '#000000';
  ctx.fillRect(24, 124, 12, 12);

  // Pattern matrix simulation
  for (let x = 60; x < 100; x += 8) {
    for (let y = 10; y < 150; y += 8) {
      if ((x + y) % 3 === 0) ctx.fillRect(x, y, 6, 6);
    }
  }
}

function shareInvoiceWhatsApp() {
  const ev = events.find(e => e.id === currentViewingEventId);
  if (!ev) return;
  const total = ev.budget || 0;
  const advance = ev.advance || 0;
  const balance = total - advance;

  let msg = `*🧾 V.V EVENTS & CATERING SERVICE*\n`;
  msg += `📍 Mamkoottam, Neyyattinkara | Ph: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `*Event:* ${ev.title}\n`;
  msg += `*Date:* ${formatDisplayDate(ev.date)}\n`;
  msg += `*Guests / Plates:* ${ev.guests}\n`;
  msg += `*Total Charge:* ₹${total.toLocaleString()}\n`;
  msg += `*Advance Paid:* ₹${advance.toLocaleString()}\n`;
  msg += `*Balance Due:* ₹${balance.toLocaleString()}\n\n`;
  msg += `💳 *Pay via UPI:* 8281857273@upi\n`;
  msg += `Thank you for choosing V.V Catering! 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ==========================================
// 6. EXPENSE TRACKER & ~120KB IMAGE COMPRESSOR
// ==========================================

function handleReceiptImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById('receiptPhotoStatus').innerText = 'Compressing...';

  // Client-Side Canvas Image Compression (Scales down 50MP to ~120KB JPEG)
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 1200;
      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_SIZE) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // 0.65 JPEG produces crisp ~120KB image
      currentReceiptPhotoBase64 = canvas.toDataURL('image/jpeg', 0.65);

      const previewImg = document.getElementById('receiptPreviewImg');
      const previewBox = document.getElementById('receiptThumbnailPreview');
      if (previewImg && previewBox) {
        previewImg.src = currentReceiptPhotoBase64;
        previewBox.classList.remove('hidden');
      }
      document.getElementById('receiptPhotoStatus').innerText = `Compressed (${Math.round(currentReceiptPhotoBase64.length / 1024)} KB)`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearReceiptImage() {
  currentReceiptPhotoBase64 = null;
  document.getElementById('receiptPhotoStatus').innerText = 'No photo';
  document.getElementById('receiptThumbnailPreview').classList.add('hidden');
  document.getElementById('receiptPhotoInput').value = '';
}

function savePurchaseExpense() {
  const amount = parseFloat(document.getElementById('newExpAmount').value);
  if (!amount || amount <= 0) {
    alert('Please enter a valid bill amount.');
    return;
  }

  const expObj = {
    id: 'exp_' + Date.now(),
    eventId: currentViewingEventId || events[0]?.id,
    category: document.getElementById('newExpCategory').value,
    amount,
    vendor: document.getElementById('newExpVendor').value.trim() || 'Store Bill',
    date: document.getElementById('newExpDate').value || new Date().toISOString().split('T')[0],
    photo: currentReceiptPhotoBase64
  };

  currentEventExpenses.unshift(expObj);
  try {
    localStorage.setItem('vv_expenses_' + expObj.eventId, JSON.stringify(currentEventExpenses));
  } catch (e) {}
  clearReceiptImage();
  document.getElementById('newExpAmount').value = '';
  document.getElementById('newExpVendor').value = '';
  renderExpensesList();
}

function renderExpensesList() {
  const container = document.getElementById('expenseItemsList');
  if (!container) return;

  const totalCost = currentEventExpenses.reduce((sum, e) => sum + e.amount, 0);
  const ev = events.find(e => e.id === currentViewingEventId) || events[0];
  const rev = ev ? (ev.budget || 0) : 0;
  const net = rev - totalCost;

  document.getElementById('expTotalCost').innerText = `₹${totalCost.toLocaleString()}`;
  document.getElementById('expTotalRev').innerText = `₹${rev.toLocaleString()}`;
  document.getElementById('expNetProfit').innerText = `₹${net.toLocaleString()}`;

  container.innerHTML = currentEventExpenses.map(exp => `
    <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-white">${exp.vendor}</span>
        <span class="text-[10px] text-[#8E8E93] block">${exp.category} • ${exp.date}</span>
      </div>
      <span class="text-xs font-extrabold text-rose-400">₹${exp.amount.toLocaleString()}</span>
    </div>
  `).join('');
}

// Navigation Tabs
function switchTab(tab) {
  ['tabEvents', 'tabDishes', 'tabSync'].forEach(id => {
    document.getElementById(id)?.classList.add('hidden');
  });
  document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)?.classList.remove('hidden');

  document.querySelectorAll('nav button').forEach(b => {
    b.className = 'flex flex-col items-center py-1 text-[#8E8E93] hover:text-white transition';
  });
  document.getElementById(`nav-${tab}`).className = 'flex flex-col items-center py-1 text-[#E53935] transition';
}

// Menu Builder Pills Helper
function renderMenuPills() {
  ['drinks', 'starters', 'mains', 'breads', 'desserts'].forEach(cat => {
    const box = document.getElementById(`pills-${cat}`);
    if (!box) return;
    box.innerHTML = (currentEditingMenu[cat] || []).map((dish, i) => `
      <span class="px-2.5 py-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg text-xs text-white flex items-center gap-1.5">
        ${dish}
        <button type="button" onclick="removeDishTag('${cat}', ${i})" class="text-[#8E8E93] hover:text-rose-400 font-bold">×</button>
      </span>
    `).join('');
  });
}

function handleDishTagInput(e, cat) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const val = e.target.value.trim();
    if (val) {
      if (!currentEditingMenu[cat]) currentEditingMenu[cat] = [];
      currentEditingMenu[cat].push(val);
      e.target.value = '';
      renderMenuPills();
    }
  }
}

function removeDishTag(cat, idx) {
  currentEditingMenu[cat]?.splice(idx, 1);
  renderMenuPills();
}

// ==========================================
// 4-DIGIT MASTER FINANCE PIN & SECURITY
// ==========================================

let enteredPinDigits = [];
let pinMode = 'unlock'; // 'unlock' | 'change_old' | 'change_new'

function getStoredPin() {
  return localStorage.getItem('vv_finance_pin') || '1234';
}

function openPinModal(mode = 'unlock') {
  pinMode = mode;
  enteredPinDigits = [];
  const modal = document.getElementById('pinEntryModal');
  const title = document.getElementById('pinModalTitle');
  const subtitle = document.getElementById('pinModalSubtitle');
  const err = document.getElementById('pinErrorMsg');
  if (err) err.innerText = '';

  if (mode === 'unlock') {
    if (title) title.innerText = 'Enter Finance PIN';
    if (subtitle) subtitle.innerText = 'Unlock budgets, balance & profit data';
  } else if (mode === 'change_old') {
    if (title) title.innerText = 'Current PIN';
    if (subtitle) subtitle.innerText = 'Enter your current 4-digit PIN first';
  } else if (mode === 'change_new') {
    if (title) title.innerText = 'Set New PIN';
    if (subtitle) subtitle.innerText = 'Enter 4 new digits for Uncle\'s PIN';
  }

  updatePinDots();
  modal?.classList.remove('hidden');
}

function closePinModal() {
  enteredPinDigits = [];
  document.getElementById('pinEntryModal')?.classList.add('hidden');
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById(`pindot-${i}`);
    if (dot) {
      if (i < enteredPinDigits.length) {
        dot.className = 'w-4 h-4 rounded-full border-2 border-[#E53935] bg-[#E53935] transition-all scale-110';
      } else {
        dot.className = 'w-4 h-4 rounded-full border-2 border-[#8E8E93] bg-transparent transition-all';
      }
    }
  }
}

function pressPinDigit(digit) {
  if (enteredPinDigits.length >= 4) return;
  enteredPinDigits.push(digit);
  updatePinDots();

  if (enteredPinDigits.length === 4) {
    setTimeout(evaluateEnteredPin, 120);
  }
}

function pressPinBackspace() {
  if (enteredPinDigits.length > 0) {
    enteredPinDigits.pop();
    updatePinDots();
    const err = document.getElementById('pinErrorMsg');
    if (err) err.innerText = '';
  }
}

function evaluateEnteredPin() {
  const pin = enteredPinDigits.join('');
  const stored = getStoredPin();
  const err = document.getElementById('pinErrorMsg');

  if (pinMode === 'unlock') {
    if (pin === stored) {
      financeLocked = false;
      closePinModal();
      updateFinanceLockUI();
      renderEvents();
      renderExpensesList();
      if (currentViewingEventId) openViewModal(currentViewingEventId);
    } else {
      if (err) err.innerText = 'Incorrect PIN. Try again.';
      enteredPinDigits = [];
      updatePinDots();
    }
  } else if (pinMode === 'change_old') {
    if (pin === stored) {
      openPinModal('change_new');
    } else {
      if (err) err.innerText = 'Current PIN incorrect.';
      enteredPinDigits = [];
      updatePinDots();
    }
  } else if (pinMode === 'change_new') {
    localStorage.setItem('vv_finance_pin', pin);
    closePinModal();
    alert('4-Digit Finance PIN updated successfully!');
  }
}

function toggleFinanceLock() {
  if (financeLocked) {
    openPinModal('unlock');
  } else {
    financeLocked = true;
    updateFinanceLockUI();
    renderEvents();
    renderExpensesList();
    if (currentViewingEventId) openViewModal(currentViewingEventId);
  }
}

function promptFinancePin() {
  if (financeLocked) {
    openPinModal('unlock');
  }
}

function promptChangePin() {
  openPinModal('change_old');
}

function updateFinanceLockUI() {
  const btn = document.getElementById('financeLockBtn');
  if (btn) {
    btn.innerText = financeLocked ? '🔒 Locked' : '🔓 Unlocked';
    btn.className = financeLocked
      ? 'px-3 py-1 bg-[#2C2C2E] rounded-xl text-xs font-bold text-amber-400 transition'
      : 'px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition';
  }
}

// ==========================================
// NOTIFICATIONS & ALARM SETTINGS
// ==========================================

function getNotifSettings() {
  try {
    const raw = localStorage.getItem('vv_notif_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { kitchenPrep: true, vanDeparture: true, googleReview: true };
}

function loadNotifSettings() {
  const s = getNotifSettings();
  const kp = document.getElementById('notifKitchenPrep');
  const vd = document.getElementById('notifVanDeparture');
  const gr = document.getElementById('notifGoogleReview');
  if (kp) kp.checked = !!s.kitchenPrep;
  if (vd) vd.checked = !!s.vanDeparture;
  if (gr) gr.checked = !!s.googleReview;
}

function saveNotifSettings() {
  const kp = document.getElementById('notifKitchenPrep')?.checked ?? true;
  const vd = document.getElementById('notifVanDeparture')?.checked ?? true;
  const gr = document.getElementById('notifGoogleReview')?.checked ?? true;
  const s = { kitchenPrep: kp, vanDeparture: vd, googleReview: gr };
  localStorage.setItem('vv_notif_settings', JSON.stringify(s));
  renderOpsRadar();
}

// ==========================================
// IN-APP KITCHEN OPS RADAR
// ==========================================

function renderOpsRadar() {
  const container = document.getElementById('kitchenOpsRadar');
  if (!container) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const notif = getNotifSettings();

  const alerts = [];

  events.forEach(ev => {
    const diffMs = new Date(ev.date) - new Date(todayStr);
    const diffDays = Math.round(diffMs / 86400000);

    // T-48h Headcount Lock alert
    if (diffDays === 2 || diffDays === 1) {
      alerts.push(`
        <div class="apple-card p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between gap-2">
          <div class="space-y-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <span>⚠️</span> T-48h Headcount Lock Due
            </span>
            <h4 class="text-xs font-bold text-white truncate max-w-[200px]">${ev.title}</h4>
            <span class="text-[10px] text-[#8E8E93]">${formatDisplayDate(ev.date)} • ${ev.guests} Plates</span>
          </div>
          <button onclick="openWhatsAppHeadcountLock('${ev.id}')" class="px-3 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-extrabold text-[11px] rounded-xl shadow-sm transition whitespace-nowrap">
            💬 Lock Count
          </button>
        </div>
      `);
    }

    // T-24h or Today Kitchen Prep alert
    if (diffDays === 0 || diffDays === 1) {
      if (notif.kitchenPrep) {
        alerts.push(`
          <div class="apple-card p-3 rounded-2xl border border-[#E53935]/40 bg-[#E53935]/10 flex items-center justify-between gap-2">
            <div class="space-y-0.5">
              <span class="text-[10px] font-bold uppercase tracking-wider text-[#E53935] flex items-center gap-1">
                <span>🔥</span> Kitchen Prep Today
              </span>
              <h4 class="text-xs font-bold text-white truncate max-w-[200px]">${ev.title}</h4>
              <span class="text-[10px] text-[#8E8E93]">Serving: ${ev.time || '11:30 AM'} • ${ev.venue || 'Mamkoottam'}</span>
            </div>
            <button onclick="openSupplierModal('${ev.id}')" class="px-3 py-2 bg-[#E53935] hover:bg-[#D32F2F] active:scale-95 text-white font-bold text-[11px] rounded-xl shadow-sm transition whitespace-nowrap">
              🥦 Veg Chit
            </button>
          </div>
        `);
      }
    }

    // T+24h Google Review Follow-up alert
    if (diffDays === -1 && notif.googleReview) {
      alerts.push(`
        <div class="apple-card p-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-2">
          <div class="space-y-0.5">
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <span>⭐</span> Google Review Follow-up
            </span>
            <h4 class="text-xs font-bold text-white truncate max-w-[200px]">${ev.title}</h4>
            <span class="text-[10px] text-[#8E8E93]">Completed yesterday • Send review link</span>
          </div>
          <button onclick="sendGoogleReviewWhatsApp('${ev.id}')" class="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[11px] rounded-xl shadow-sm transition whitespace-nowrap">
            ⭐ Send Link
          </button>
        </div>
      `);
    }
  });

  if (alerts.length > 0) {
    container.innerHTML = alerts.join('');
  } else {
    container.innerHTML = `
      <div class="apple-card px-3.5 py-2.5 rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
        <span class="text-xs font-semibold text-[#8E8E93] flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <strong class="text-white">Kitchen Radar:</strong> All catering schedules running smoothly
        </span>
        <span class="text-[10px] text-[#8E8E93] font-mono">${events.length} Events</span>
      </div>
    `;
  }
}

// ==========================================
// HARDWARE CALENDAR ALARMS (.ics FILE DOWNLOAD)
// ==========================================

function downloadEventICS(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const notif = getNotifSettings();
  const dateParts = (ev.date || '').split('-');
  if (dateParts.length !== 3) return;

  const year = dateParts[0];
  const month = dateParts[1];
  const day = dateParts[2];

  const timeStr = ev.time || '11:30';
  const [hh, mm] = timeStr.split(':');

  const dtStart = `${year}${month}${day}T${(hh || '11').padStart(2, '0')}${(mm || '30').padStart(2, '0')}00`;
  const endHour = String(Math.min(23, parseInt(hh || '11') + 4)).padStart(2, '0');
  const dtEnd = `${year}${month}${day}T${endHour}${(mm || '30').padStart(2, '0')}00`;
  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let alarms = '';
  if (notif.kitchenPrep) {
    alarms += `BEGIN:VALARM\r\nTRIGGER:-PT24H\r\nACTION:DISPLAY\r\nDESCRIPTION:🍲 Kitchen Prep Reminder: Prepare Sadya & check produce for ${ev.title}\r\nEND:VALARM\r\n`;
  }
  if (notif.vanDeparture) {
    alarms += `BEGIN:VALARM\r\nTRIGGER:-PT3H\r\nACTION:DISPLAY\r\nDESCRIPTION:🚚 Van Departure: Food delivery van leaving for ${ev.venue || 'Hall'}\r\nEND:VALARM\r\n`;
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//V.V Events & Catering Service//Catering Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:vv-event-${ev.id}@vvcatering.app`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:🍽️ ${ev.title} (${ev.guests} Plates)`,
    `DESCRIPTION:V.V Events & Catering Service\\nPlates: ${ev.guests}\\nPhone: ${ev.phone}\\nVenue: ${ev.venue || 'Mamkoottam'}`,
    `LOCATION:${ev.venue || 'Mamkoottam, Neyyattinkara'}`,
    'STATUS:CONFIRMED',
    alarms.trim(),
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vv-catering-${ev.date}-${ev.id.slice(-4)}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// ==========================================
// WHATSAPP MILESTONES: HEADCOUNT, VAN & GOOGLE REVIEW
// ==========================================

function openWhatsAppHeadcountLock(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  let msg = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `📍 Mamkoottam, Neyyattinkara | Ph: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `*പ്രിയപ്പെട്ട കസ്റ്റമർ,*\n`;
  msg += `നിങ്ങളുടെ ഇവൻ്റിനായുള്ള (${ev.title}) ഒരുക്കങ്ങൾ ഞങ്ങളുടെ മെയിൻ കിച്ചണിൽ ആരംഭിക്കുകയാണ്.\n\n`;
  msg += `*തീയതി:* ${formatDisplayDate(ev.date)}\n`;
  msg += `*ബുക്ക് ചെയ്ത പ്ലേറ്റ്സ്:* ${ev.guests} Plates\n\n`;
  msg += `പച്ചക്കറികളും മറ്റ് സാധനങ്ങളും വാങ്ങുന്നതിനായി ഫൈനൽ അതിഥികളുടെ എണ്ണം (Headcount) ഇന്നുതന്നെ ദയവായി ഉറപ്പാക്കി അറിയിക്കുമല്ലോ. 🙏\n`;
  msg += `------------------------------------\n`;
  msg += `സ്നേഹത്തോടെ, വി.വി കാറ്ററിംഗ് സർവീസ്`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function openWhatsAppDeliveryUpdate(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  let msg = `*🚚 V.V EVENTS & CATERING SERVICE*\n`;
  msg += `📍 Mamkoottam, Neyyattinkara | Ph: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `*ഭക്ഷണം കിച്ചണിൽ നിന്നും പുറപ്പെട്ടു!*\n\n`;
  msg += `*ഇവൻ്റ്:* ${ev.title}\n`;
  msg += `*വേദി:* ${ev.venue || 'Mamkoottam'}\n`;
  msg += `സദ്യയും സാധനങ്ങളുമായി ഞങ്ങളുടെ ഡെലിവറി വാഹനം പുറപ്പെട്ടിട്ടുണ്ട്. ഉടൻ തന്നെ വേദിയിൽ എത്തിച്ചേരുന്നതാണ്.\n\n`;
  msg += `എന്തെങ്കിലും ആവശ്യങ്ങൾക്ക് വിളിക്കുക: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `വി.വി കാറ്ററിംഗ് സർവീസ് 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendGoogleReviewWhatsApp(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;
  let msg = `*⭐ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `📍 Mamkoottam, Neyyattinkara | Ph: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `*പ്രിയപ്പെട്ട കസ്റ്റമർ,*\n`;
  msg += `നമസ്കാരം! V.V Catering സർവീസ് തിരഞ്ഞെടുത്തതിന് ഹൃദയം നിറഞ്ഞ നന്ദി. 🙏\n\n`;
  msg += `ഞങ്ങളുടെ സദ്യയും സർവീസും നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ടു എന്ന് വിശ്വസിക്കുന്നു. ഞങ്ങളെപ്പോലുള്ള പ്രാദേശിക സ്ഥാപനങ്ങൾക്ക് നിങ്ങളുടെ ഒരു നല്ല വാക്ക് വലിയൊരു അനുഗ്രഹമാണ്.\n\n`;
  msg += `ദയവായി താഴെ കാണുന്ന ലിങ്കിൽ 1 മിനിറ്റ് എടുത്ത് നിങ്ങളുടെ റിവ്യൂവും റേറ്റിംഗും രേഖപ്പെടുത്താൻ അഭ്യർത്ഥിക്കുന്നു:\n`;
  msg += `👉 https://maps.app.goo.gl/kH4Ey2bZwa6aDzfQA \n\n`;
  msg += `എന്നും നിങ്ങളുടെ നല്ല വിശേഷങ്ങൾക്ക് ഒപ്പമുണ്ടാകും.\n`;
  msg += `സ്നേഹത്തോടെ, വി.വി ഇവൻ്റ്സ് & കാറ്ററിംഗ്`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to delete this event?')) return;
  events = events.filter(e => e.id !== eventId);
  persistEvents();
  closeViewModal();
  renderOpsRadar();
  renderEvents();
  renderCalendar();
}

function loadDemoData(render = true) {
  events = [
    {
      id: 'ev_demo_1',
      title: 'Dr. Rahul & Ananya Mangalya Sadya',
      status: 'Booked',
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      time: '11:30',
      guests: 450,
      venue: 'Swathi Kalyana Mandapam, Neyyattinkara',
      phone: '918281857273',
      budget: 153000,
      advance: 50000,
      serviceStyle: 'Traditional Sadya (ഇലയിൽ)',
      dishes: {
        mains: ['അവിയൽ', 'സാമ്പാർ', 'ഓലൻ', 'കാളൻ', 'തീയ്യൽ', 'പരിപ്പും നെയ്യും'],
        starters: ['കടുമാങ്ങ അച്ചാർ', 'ഇഞ്ചിപ്പുളി', 'നേന്ത്രക്കായ ചിപ്സ്', 'പപ്പടം'],
        breads: ['മട്ട ചോറ്', 'വെള്ള ചോറ്'],
        desserts: ['അടപ്രഥമൻ', 'പാൽപായസം', 'തിരുവനന്തപുരം ബോളി', 'പഴം']
      }
    }
  ];
  persistEvents();
  if (render) {
    renderEvents();
    renderCalendar();
  }
}


// ==========================================
// 7. COMPLETE UI HANDLERS & MODAL CONTROLS
// ==========================================

function setFilter(filter) {
  currentFilter = filter;
  ['all', 'upcoming', 'this-week', 'completed'].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = 'filter-chip px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#E53935] text-white transition';
      } else {
        btn.className = 'filter-chip px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1C1C1E] text-[#8E8E93] hover:text-white transition';
      }
    }
  });
  renderEvents();
}

function openViewModal(eventId) {
  currentViewingEventId = eventId;
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const titleEl = document.getElementById('viewModalTitle');
  if (titleEl) titleEl.innerText = ev.title;

  const content = document.getElementById('viewModalContent');
  const balance = (ev.budget || 0) - (ev.advance || 0);

  if (content) {
    content.innerHTML = `
      <div class="space-y-3">
        <div class="bg-black p-3.5 rounded-2xl border border-[#2C2C2E] space-y-1.5">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-bold text-white">${formatDisplayDate(ev.date)}</span>
              <span class="text-[10px] text-[#8E8E93] block">• Serving Time: ${ev.time || '11:30 AM'}</span>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusBadgeClass(ev.status)}">${ev.status}</span>
          </div>
          <p class="text-xs text-[#8E8E93] pt-1">📍 Venue: <strong class="text-white">${ev.venue || 'Mamkoottam, Neyyattinkara'}</strong></p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E]">
            <span class="text-[10px] text-[#8E8E93] block">Guests / Plates</span>
            <span class="text-base font-extrabold text-[#E53935]">${ev.guests || 0} Plates</span>
          </div>
          <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E]">
            <span class="text-[10px] text-[#8E8E93] block">Balance Due</span>
            ${financeLocked ? `<span onclick="promptFinancePin()" class="text-base font-bold text-[#8E8E93] cursor-pointer hover:text-white" title="Tap to enter PIN">🔒 ••••••</span>` : `<span class="text-base font-bold text-white">₹${balance > 0 ? balance.toLocaleString() : 'Settled'}</span>`}
          </div>
        </div>

        <!-- Phone Contacts -->
        <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E] space-y-1 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-[#8E8E93]">Client WhatsApp:</span>
            <a href="tel:${ev.phone}" class="font-bold text-emerald-400">📞 ${ev.phone || 'N/A'}</a>
          </div>
          ${ev.phone2 ? `
            <div class="flex justify-between items-center border-t border-[#2C2C2E] pt-1">
              <span class="text-[#8E8E93]">Alternate Phone:</span>
              <a href="tel:${ev.phone2}" class="font-bold text-white">📱 ${ev.phone2}</a>
            </div>
          ` : ''}
        </div>

        <!-- Ops Triggers & WhatsApp Milestones -->
        <div class="apple-card p-3 rounded-2xl border border-[#2C2C2E] space-y-2">
          <span class="text-[10px] font-bold text-[#8E8E93] uppercase block">Ops Triggers & Milestones:</span>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="downloadEventICS('${ev.id}')" class="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-white rounded-xl text-xs font-semibold active:scale-95 transition">
              <span>⏰</span> Set .ics Alarms
            </button>
            <button onclick="sendGoogleReviewWhatsApp('${ev.id}')" class="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold active:scale-95 transition">
              <span>⭐</span> Review Link
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="openWhatsAppHeadcountLock('${ev.id}')" class="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold active:scale-95 transition">
              <span>💬</span> 48h Count Lock
            </button>
            <button onclick="openWhatsAppDeliveryUpdate('${ev.id}')" class="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-white rounded-xl text-xs font-semibold active:scale-95 transition">
              <span>🚚</span> Van Out
            </button>
          </div>
        </div>

        <!-- Menu Breakdown -->
        <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E] space-y-2 text-xs">
          <span class="text-xs font-bold text-[#E53935] block">🍲 Menu & Dishes:</span>
          ${Object.entries(ev.dishes || {}).map(([cat, list]) => (list && list.length > 0) ? `
            <div>
              <span class="text-[10px] font-semibold text-[#8E8E93] uppercase block">${cat}:</span>
              <p class="text-white text-xs">${list.join(', ')}</p>
            </div>
          ` : '').join('') || '<p class="text-xs text-[#8E8E93]">No dishes selected.</p>'}
        </div>

        ${ev.notes ? `
          <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E] text-xs">
            <span class="text-[10px] font-semibold text-[#8E8E93] block">Notes:</span>
            <p class="text-white text-xs mt-0.5">${ev.notes}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  const editBtn = document.getElementById('viewEditBtn');
  if (editBtn) {
    editBtn.onclick = () => {
      closeViewModal();
      openEditEventModal(eventId);
    };
  }

  document.getElementById('viewEventModal')?.classList.remove('hidden');
}

function closeViewModal() {
  document.getElementById('viewEventModal')?.classList.add('hidden');
}

function openEditEventModal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  document.getElementById('editEventId').value = ev.id;
  document.getElementById('modalTitle').innerText = 'Edit Catering Event';
  document.getElementById('evTitle').value = ev.title || '';
  document.getElementById('evStatus').value = ev.status || 'Booked';
  document.getElementById('evDate').value = ev.date || '';
  document.getElementById('evTime').value = ev.time || '11:30';
  document.getElementById('evGuests').value = ev.guests || '';
  document.getElementById('evVenue').value = ev.venue || '';
  document.getElementById('evPhone').value = ev.phone || '';
  document.getElementById('evPhone2').value = ev.phone2 || '';
  document.getElementById('evBudget').value = ev.budget || '';
  document.getElementById('evAdvance').value = ev.advance || '';
  document.getElementById('evServiceStyle').value = ev.serviceStyle || 'Traditional Sadya (ഇലയിൽ)';
  document.getElementById('evNotes').value = ev.notes || '';

  currentEditingMenu = ev.dishes || { mains: [], starters: [], breads: [], desserts: [], drinks: [] };
  renderMenuPills();

  document.getElementById('eventModal')?.classList.remove('hidden');
}

function openWhatsAppDirect(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  let msg = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `📍 Mamkoottam, Neyyattinkara | Ph: 8281857273\n`;
  msg += `------------------------------------\n`;
  msg += `*Event:* ${ev.title}\n`;
  msg += `*Date:* ${formatDisplayDate(ev.date)}\n`;
  msg += `*Guests / Plates:* ${ev.guests} Plates\n`;
  msg += `*Status:* ${ev.status}\n`;
  if (ev.venue) msg += `*Venue:* ${ev.venue}\n`;
  msg += `------------------------------------\n`;
  msg += `Thank you for choosing V.V Catering! 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function shareUniversal(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  let text = `*V.V Events & Catering Service*\nEvent: ${ev.title}\nDate: ${formatDisplayDate(ev.date)}\nPlates: ${ev.guests}\nVenue: ${ev.venue || 'Neyyattinkara'}`;
  if (navigator.share) {
    navigator.share({ title: ev.title, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Event summary copied to clipboard!'));
  }
}

function togglePlatesSection() {
  const req = document.getElementById('evPlatesReq')?.checked;
  const box = document.getElementById('platesDetailBox');
  if (box) {
    box.style.display = req ? 'grid' : 'none';
  }
}

function openExpenseModal(eventId) {
  currentViewingEventId = eventId || currentViewingEventId || events[0]?.id;
  const stored = localStorage.getItem('vv_expenses_' + currentViewingEventId);
  if (stored) {
    try { currentEventExpenses = JSON.parse(stored); } catch (e) { currentEventExpenses = []; }
  } else {
    currentEventExpenses = [];
  }
  renderExpensesList();
  document.getElementById('expenseTrackerModal')?.classList.remove('hidden');
}

function toggleBillType() {
  currentBillType = currentBillType === 'invoice' ? 'estimate' : 'invoice';
  const btn = document.getElementById('toggleBillTypeBtn');
  if (btn) btn.innerText = currentBillType === 'invoice' ? 'Switch to Estimate' : 'Switch to Invoice';
  if (currentViewingEventId) openBillModal(currentViewingEventId, currentBillType);
}

function closeExpenseModal() {
  document.getElementById('expenseTrackerModal')?.classList.add('hidden');
}

function openAddDishModal() {
  const dishName = prompt('Enter New Dish Name (Malayalam / English):');
  if (!dishName || !dishName.trim()) return;
  masterDishes.push({ category: 'mains', name: dishName.trim() });
  renderMasterDishes();
  alert(`Added "${dishName.trim()}" to Menu Bank!`);
}

function renderMasterDishes() {
  const container = document.getElementById('masterDishContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="apple-card p-4 rounded-3xl border border-[#2C2C2E] space-y-2">
      <h3 class="text-xs font-bold text-[#E53935] uppercase">Pre-Loaded Travancore Feast Menu</h3>
      <div class="flex flex-wrap gap-1.5 pt-1">
        ${masterDishes.map(d => `
          <span class="px-2.5 py-1 bg-black border border-[#2C2C2E] rounded-lg text-xs text-white">
            ${d.name}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

function addSupplierItemFromInput() {
  const input = document.getElementById('newSupplierItemInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  const newItem = {
    id: 'custom_' + Date.now(),
    ml: val,
    mang: val,
    eng: val,
    cat: 'tubers',
    unit: 'Kg',
    step: 1,
    defaultQty: 1
  };

  workingProduceList.unshift(newItem);
  saveCustomProduce(newItem);

  input.value = '';
  renderMandiRows();
  updateChitPreview();
}

function renderGenericStoreList(tab) {
  const container = document.getElementById('supplierItemsList');
  if (!container) return;

  const samples = {
    fruits: [
      { name: 'ഏത്തൻപഴം (Ripe Nendran)', unit: 'Kg', qty: 10 },
      { name: 'റസകദളി പഴം (Rasakadali Banana)', unit: 'Kg', qty: 15 },
      { name: 'പൈനാപ്പിൾ (Pineapple)', unit: 'Kg', qty: 10 },
      { name: 'തണ്ണിമത്തൻ (Watermelon)', unit: 'Kg', qty: 25 }
    ],
    grocery: [
      { name: 'ബിരിയാണി ജീരകശാല അരി (Jeerakasala Rice)', unit: 'Kg', qty: 35 },
      { name: 'സൂര്യകാന്തി എണ്ണ (Sunflower Oil)', unit: 'Liters', qty: 30 },
      { name: 'ശുദ്ധമായ നെയ്യ് (Desi Cow Ghee)', unit: 'Kg', qty: 5 },
      { name: 'മട്ട അരി (Matta Rice)', unit: 'Kg', qty: 50 },
      { name: 'പരിപ്പ് (Toor Dal)', unit: 'Kg', qty: 15 },
      { name: 'പപ്പടം (Pappadam)', unit: 'Packs', qty: 10 }
    ],
    dairy: [
      { name: 'പാല് (Full Cream Milk)', unit: 'Liters', qty: 25 },
      { name: 'തൈര് (Fresh Curd)', unit: 'Kg', qty: 10 },
      { name: 'പനീർ (Fresh Paneer)', unit: 'Kg', qty: 12 },
      { name: 'വെണ്ണ (Butter)', unit: 'Kg', qty: 4 }
    ],
    meat: [
      { name: 'നാടൻ ചിക്കൻ (Fresh Chicken)', unit: 'Kg', qty: 35 },
      { name: 'ബീഫ് കറി കട്ട് (Fresh Beef)', unit: 'Kg', qty: 25 },
      { name: 'മട്ടൻ (Fresh Mutton)', unit: 'Kg', qty: 15 },
      { name: 'കരിമീൻ (Karimeen)', unit: 'Kg', qty: 12 }
    ],
    rentals: [
      { name: 'ചാഫിംഗ് ഡിഷ് (Chafing Dishes)', unit: 'Nos', qty: 8 },
      { name: 'ഗ്യാസ് സിലിണ്ടർ (Commercial LPG)', unit: 'Nos', qty: 3 },
      { name: 'വലിയ ബിരിയാണി ചെമ്പ് (Big Degs)', unit: 'Nos', qty: 2 }
    ]
  };

  const list = samples[tab] || [];
  container.innerHTML = list.map((item, i) => `
    <div class="p-3 bg-black rounded-2xl border border-[#2C2C2E] flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-white">${item.name}</span>
        <span class="text-[10px] text-[#8E8E93] block">${item.unit}</span>
      </div>
      <span class="text-xs font-bold text-[#E53935]">${item.qty} ${item.unit}</span>
    </div>
  `).join('');
}

function copyTeamSyncCode() {
  const code = 'VV-695121';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => alert(`Business Sync Code ${code} copied to clipboard!`));
  } else {
    alert(`Business Sync Code: ${code}`);
  }
}

function pairDeviceWithTeamCode() {
  const input = document.getElementById('pairTeamCodeInput');
  const code = input?.value.trim().toUpperCase();
  if (code === 'VV-695121') {
    alert('Device successfully paired with V.V Catering Cloud Relay!');
  } else {
    alert('Invalid Sync Code. Please verify with Uncle.');
  }
}

function exportToCSV() {
  let csv = 'Title,Date,Serving Time,Guests / Plates,Venue,Phone,Budget,Advance,Status\n';
  events.forEach(e => {
    csv += `"${e.title}","${e.date}","${e.time || ''}","${e.guests}","${e.venue || ''}","${e.phone || ''}","${e.budget || 0}","${e.advance || 0}","${e.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vv_catering_events_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
}

function exportDataToFile() {
  const data = JSON.stringify({ events, masterDishes, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vv_catering_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

function importDataFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (Array.isArray(parsed.events)) {
        events = parsed.events;
        persistEvents();
        renderEvents();
        renderCalendar();
        alert('Events restored successfully!');
      }
    } catch (err) {
      alert('Invalid backup file.');
    }
  };
  reader.readAsText(file);
}
