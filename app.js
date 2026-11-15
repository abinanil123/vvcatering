// V.V Events & Catering Service — Core Application Logic
// Mamkoottam, Neyyattinkara • Ph: 8281857273, 9072721633, 0471-2265273
// Offline-first PWA, Bilingual Malayalam/Manglish Multi-Store Procurement,
// Single-Letter Fast Autocomplete Search, Wholesale Vendor Directory,
// Non-Sadya Diverse Banquet Menu Bank, Real UPI QR & 1-Tap Pay.

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

// Store Procurement State
let currentSupplierTab = 'veggies';
let currentSupplierEventId = null;
let currentEventExpenses = [];
let currentReceiptPhotoBase64 = null;
let currentBillType = 'invoice';
let activeMandiCategory = 'all';
let currentStoreSearchQuery = '';

// ==========================================
// 1. MASTER DISHES BANK (SADYA + NON-SADYA)
// ==========================================

const DEFAULT_MASTER_DISHES = [
  // Tamil Nadu & Malabar Biryanis (Mains)
  { name: 'Dindigul Thalappakatti Seeraga Samba Mutton Biryani', category: 'mains' },
  { name: 'Ambur Star Chicken Dum Biryani', category: 'mains' },
  { name: 'Thalassery Chicken Dum Biryani (Kaima Rice)', category: 'mains' },
  { name: 'Malabar Mutton Dum Biryani', category: 'mains' },
  { name: 'Malabar Beef Dum Biryani', category: 'mains' },
  { name: 'Tamil Nadu Ennai Kathirikai (Brinjal Salna)', category: 'mains' },
  { name: 'Neyyattinkara Beef Ularthiyathu', category: 'mains' },
  { name: 'Naadan Kozhi Roast (Kerala Chicken Roast)', category: 'mains' },
  { name: 'Kerala Chicken Curry', category: 'mains' },
  { name: 'Tender Chicken Stew (കോഴി സ്റ്റൂ)', category: 'mains' },
  { name: 'Creamy Vegetable Stew', category: 'mains' },
  { name: 'Live Karimeen Pollichathu in Banana Leaf', category: 'mains' },

  // Authentic Travancore Sadya Items (Mains)
  { name: 'Neyyattinkara Sambar (സാമ്പാർ)', category: 'mains' },
  { name: 'Travancore Avial (അവിയൽ)', category: 'mains' },
  { name: 'Neyyum Parippum (നെയ്യും പരിപ്പും)', category: 'mains' },
  { name: 'Kalan (കാളൻ)', category: 'mains' },
  { name: 'Olan (ഓലൻ)', category: 'mains' },
  { name: 'Koottukari (കൂട്ടുകറി)', category: 'mains' },
  { name: 'Mathanga Erissery (മത്തങ്ങ എരിശ്ശേരി)', category: 'mains' },
  { name: 'Moru Curry / Pulissery (മോരുകറി)', category: 'mains' },
  { name: 'Thakkali Rasam (രസം)', category: 'mains' },
  { name: 'Beetroot Pachadi (പച്ചടി)', category: 'mains' },
  { name: 'Pineapple Pachadi (പൈനാപ്പിൾ പച്ചടി)', category: 'mains' },
  { name: 'Vellarikka Kichadi (കിച്ചടി)', category: 'mains' },

  // Starters, Sides & Achars
  { name: 'Chicken 65 Crispy Fry', category: 'starters' },
  { name: 'Thattukada Chicken Fry with Curry Leaves', category: 'starters' },
  { name: 'Onion Cucumber Pachadi (Raita)', category: 'starters' },
  { name: 'Boiled Egg Pepper Fry', category: 'starters' },
  { name: 'Inji Puli / Puli Inji (ഇഞ്ചിപ്പുളി)', category: 'starters' },
  { name: 'Kadu Manga Achar (കടുമാങ്ങ അച്ചാർ)', category: 'starters' },
  { name: 'Sweet & Sour Dates Pickle (ഈന്തപ്പഴം അച്ചാർ)', category: 'starters' },
  { name: 'Naranga Achar (നാരങ്ങ അച്ചാർ)', category: 'starters' },
  { name: 'Crispy Sharkkara Varatti & Upperi', category: 'starters' },

  // Breads & Rice
  { name: 'Fluffy Kerala Malabar Porotta', category: 'breads' },
  { name: 'Hot Appam (വെള്ളയപ്പം / പാലപ്പം)', category: 'breads' },
  { name: 'Live Dosa Counter (Ghee Roast & Masala Dosa)', category: 'breads' },
  { name: 'Live Idiyappam Counter', category: 'breads' },
  { name: 'Kerala Jaya / Matta Rice (ചോറ്)', category: 'breads' },
  { name: 'Crispy Large Kerala Pappadam', category: 'breads' },

  // Desserts, Sweets & Fountain
  { name: '4-Tier Flowing Chocolate Fountain with Fresh Fruits', category: 'desserts' },
  { name: 'Assorted Ice Cream Bar (Vanilla, Strawberry, Butterscotch)', category: 'desserts' },
  { name: 'Hot Gulab Jamun with Shahi Rabri', category: 'desserts' },
  { name: 'Sweet Bread Halwa / Asoka Halwa', category: 'desserts' },
  { name: 'Royal Malabar Falooda with Kulfi', category: 'desserts' },
  { name: 'Fresh Cut Seasonal Fruit Salad with Honey', category: 'desserts' },
  { name: 'Palada Pradhaman (പാലട പ്രഥമൻ)', category: 'desserts' },
  { name: 'Parippu Pradhaman with Coconut Milk (പരിപ്പ് പ്രഥമൻ)', category: 'desserts' },
  { name: 'Chakka Pradhaman (ചക്ക പ്രഥമൻ)', category: 'desserts' },

  // Welcome Drinks & Beverages
  { name: 'Kulukki Sarbath (കുലുക്കി സർബത്ത്)', category: 'drinks' },
  { name: 'Elaneer Tender Coconut Punch with Fresh Pulp', category: 'drinks' },
  { name: 'Fresh Mint Lime Juice / Mojito', category: 'drinks' },
  { name: 'Badam Milk with Crushed Pistachios', category: 'drinks' },
  { name: 'Sulaimani Tea with Fresh Mint & Cardamom', category: 'drinks' }
];

// ==========================================
// 2. COMPLETE MULTI-STORE CATALOGS
// ==========================================

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

const STORE_CATALOGS = {
  veggies: MASTER_PRODUCE_CATALOG,
  fruits: [
    { id: 'f1', ml: 'ഏത്തൻപഴം', mang: 'Nendran Pazham', eng: 'Ripe Nendran Banana', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'f2', ml: 'റസകദളി പഴം', mang: 'Rasakadali', eng: 'Rasakadali Banana', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'f3', ml: 'റോബസ്റ്റ പഴം', mang: 'Robusta', eng: 'Robusta Banana', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f4', ml: 'പൂവൻ പഴം', mang: 'Poovan Pazham', eng: 'Poovan Banana', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'f5', ml: 'പാളയംകോടൻ പഴം', mang: 'Palayamkodan', eng: 'Palayamkodan Banana', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f6', ml: 'പൈനാപ്പിൾ', mang: 'Pineapple', eng: 'Ripe Pineapple', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f7', ml: 'തണ്ണിമത്തൻ', mang: 'Thannimathan', eng: 'Watermelon', cat: 'fruits', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'f8', ml: 'മുന്തിരി (കറുപ്പ്/പച്ച)', mang: 'Munthiri', eng: 'Seedless Grapes', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'f9', ml: 'ആപ്പിൾ', mang: 'Apple', eng: 'Red Royal Gala Apples', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f10', ml: 'മുസമ്പി / ഓറഞ്ച്', mang: 'Mosambi', eng: 'Sweet Orange / Mosambi', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f11', ml: 'മാതളനാരങ്ങ', mang: 'Mathalanaranga', eng: 'Pomegranate / Anar', cat: 'fruits', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'f12', ml: 'പപ്പായ', mang: 'Papaya', eng: 'Ripe Sweet Papaya', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f13', ml: 'സ്ട്രോബെറി (ഫൗണ്ടൻ)', mang: 'Strawberry', eng: 'Fresh Strawberries for Fountain', cat: 'fruits', unit: 'Boxes', step: 5, defaultQty: 0 },
    { id: 'f14', ml: 'ഷമാം', mang: 'Shamam', eng: 'Musk Melon / Cantaloupe', cat: 'fruits', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'f15', ml: 'കിവി', mang: 'Kiwi', eng: 'Fresh Kiwi', cat: 'fruits', unit: 'Boxes', step: 2, defaultQty: 0 }
  ],
  grocery: [
    { id: 'g1', ml: 'ജീരക സമ്പ ബിരിയാണി അരി', mang: 'Seeraga Samba', eng: 'Seeraga Samba Biryani Rice', cat: 'grocery', unit: 'Kg', step: 25, defaultQty: 0 },
    { id: 'g2', ml: 'കൈമ / ജീരകശാല അരി', mang: 'Kaima Rice', eng: 'Thalassery Kaima / Jeerakasala Rice', cat: 'grocery', unit: 'Kg', step: 25, defaultQty: 0 },
    { id: 'g3', ml: 'ബാസ്മതി ബിരിയാണി അരി', mang: 'Basmati Rice', eng: 'Premium Long Grain Basmati', cat: 'grocery', unit: 'Kg', step: 25, defaultQty: 0 },
    { id: 'g4', ml: 'കേരള മട്ട അരി', mang: 'Matta Rice', eng: 'Kerala Jaya / Matta Rice', cat: 'grocery', unit: 'Kg', step: 50, defaultQty: 0 },
    { id: 'g5', ml: 'സൂര്യകാന്തി എണ്ണ', mang: 'Sunflower Oil', eng: 'Sunflower Cooking Oil', cat: 'grocery', unit: 'Liters', step: 15, defaultQty: 0 },
    { id: 'g6', ml: 'ശുദ്ധമായ നാടൻ നെയ്യ്', mang: 'Nadan Neyyu', eng: 'Pure Desi Cow Ghee', cat: 'grocery', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'g7', ml: 'അണ്ടിപ്പരിപ്പ്', mang: 'Andiparippu', eng: 'Premium Whole Cashews', cat: 'grocery', unit: 'Kg', step: 1, defaultQty: 0 },
    { id: 'g8', ml: 'ഉണക്കമുന്തിരി / കിസ്മിസ്', mang: 'Kismis', eng: 'Golden Raisins', cat: 'grocery', unit: 'Kg', step: 1, defaultQty: 0 },
    { id: 'g9', ml: 'ബിരിയാണി മസാലക്കൂട്ട്', mang: 'Biryani Spices', eng: 'Whole Biryani Spices Kit', cat: 'grocery', unit: 'Kg', step: 1, defaultQty: 0 },
    { id: 'g10', ml: 'ഏലയ്ക്ക', mang: 'Elakka', eng: 'Green Cardamom', cat: 'grocery', unit: 'Kg', step: 0.25, defaultQty: 0 },
    { id: 'g11', ml: 'കറുവപ്പട്ട', mang: 'Karuvapatta', eng: 'Cinnamon Sticks', cat: 'grocery', unit: 'Kg', step: 0.5, defaultQty: 0 },
    { id: 'g12', ml: 'ഗ്രാമ്പൂ', mang: 'Karambu', eng: 'Cloves', cat: 'grocery', unit: 'Kg', step: 0.25, defaultQty: 0 },
    { id: 'g13', ml: 'തക്കോലം', mang: 'Thakkolam', eng: 'Star Anise', cat: 'grocery', unit: 'Kg', step: 0.25, defaultQty: 0 },
    { id: 'g14', ml: 'പെരുംജീരകം', mang: 'Perumjeerakam', eng: 'Fennel Seeds', cat: 'grocery', unit: 'Kg', step: 0.5, defaultQty: 0 },
    { id: 'g15', ml: 'തുവരപ്പരിപ്പ്', mang: 'Thuvarapparippu', eng: 'Toor Dal for Sambar', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g16', ml: 'ചെറുപയർ പരിപ്പ്', mang: 'Cheruparippu', eng: 'Moong Dal for Payasam / Sadya', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g17', ml: 'ഉഴുന്ന് പരിപ്പ്', mang: 'Uzhunnu', eng: 'Urad Dal', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g18', ml: 'മൈദ മാവ്', mang: 'Maida', eng: 'Maida Flour for Porotta', cat: 'grocery', unit: 'Kg', step: 25, defaultQty: 0 },
    { id: 'g19', ml: 'ഗോതമ്പ് പൊടി / ആട്ട', mang: 'Atta', eng: 'Chakki Fresh Atta', cat: 'grocery', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'g20', ml: 'വറുത്ത റവ', mang: 'Rava', eng: 'Roasted Rava / Semolina', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g21', ml: 'കടലമാവ്', mang: 'Kadalamavu', eng: 'Besan / Gram Flour', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g22', ml: 'കല്ലുപ്പ്', mang: 'Kalluppu', eng: 'Crystal Sea Salt', cat: 'grocery', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'g23', ml: 'പൊടി ഉപ്പ്', mang: 'Podi Uppu', eng: 'Fine Table Salt', cat: 'grocery', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'g24', ml: 'പഞ്ചസാര', mang: 'Panchasara', eng: 'Pure White Sugar', cat: 'grocery', unit: 'Kg', step: 25, defaultQty: 0 },
    { id: 'g25', ml: 'മറയൂർ ശർക്കര', mang: 'Sharkkara', eng: 'Kerala Jaggery for Payasam', cat: 'grocery', unit: 'Kg', step: 15, defaultQty: 0 },
    { id: 'g26', ml: 'വലിയ പപ്പടം', mang: 'Pappadam', eng: 'Kerala Large Pappadam', cat: 'grocery', unit: 'Packs', step: 10, defaultQty: 0 },
    { id: 'g27', ml: 'റോസ് വാട്ടർ', mang: 'Rose Water', eng: 'Rose Water for Biryani / Sweets', cat: 'grocery', unit: 'Bottles', step: 2, defaultQty: 0 }
  ],
  dairy: [
    { id: 'd1', ml: 'മിൽമ നീല പാക്കറ്റ് പാല്', mang: 'Milma Blue Milk', eng: 'Milma Toned Milk', cat: 'dairy', unit: 'Liters', step: 10, defaultQty: 0 },
    { id: 'd2', ml: 'മിൽമ പച്ച പാക്കറ്റ് പാല്', mang: 'Milma Green Milk', eng: 'Milma Rich Full Cream Milk', cat: 'dairy', unit: 'Liters', step: 10, defaultQty: 0 },
    { id: 'd3', ml: 'കട്ട തൈര്', mang: 'Katta Thayiru', eng: 'Fresh Thick Curd for Raita & Sadya', cat: 'dairy', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'd4', ml: 'ശുദ്ധമായ വെണ്ണ', mang: 'Venna', eng: 'Pure Unsalted Butter', cat: 'dairy', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'd5', ml: 'ഫ്രഷ് പനീർ', mang: 'Fresh Paneer', eng: 'Fresh Malai Paneer', cat: 'dairy', unit: 'Kg', step: 2, defaultQty: 0 },
    { id: 'd6', ml: 'ഫ്രഷ് ക്രീം', mang: 'Fresh Cream', eng: 'Fresh Cooking Cream', cat: 'dairy', unit: 'Liters', step: 2, defaultQty: 0 },
    { id: 'd7', ml: 'കണ്ടൻസ്ഡ് മിൽക്ക്', mang: 'Condensed Milk', eng: 'Sweetened Condensed Milk', cat: 'dairy', unit: 'Tins', step: 5, defaultQty: 0 },
    { id: 'd8', ml: 'ഖോവ / മാവ', mang: 'Khoya / Mawa', eng: 'Khoya for Gulab Jamun', cat: 'dairy', unit: 'Kg', step: 2, defaultQty: 0 }
  ],
  meat: [
    { id: 'm1', ml: 'ബ്രോയിലർ ചിക്കൻ ബിരിയാണി കട്ട്', mang: 'Chicken Biryani Cut', eng: 'Fresh Broiler Chicken (Biryani Cut)', cat: 'meat', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'm2', ml: 'ചിക്കൻ കറി കട്ട്', mang: 'Chicken Curry Cut', eng: 'Fresh Chicken (Curry Cut)', cat: 'meat', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'm3', ml: 'നാടൻ കോഴി', mang: 'Nadan Kozhi', eng: 'Country Chicken', cat: 'meat', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'm4', ml: 'ഫ്രഷ് ഇളം മട്ടൻ', mang: 'Fresh Mutton', eng: 'Fresh Tender Mutton', cat: 'meat', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'm5', ml: 'നെയ്യാറ്റിൻകര ബീഫ് കറി കട്ട്', mang: 'Neyyattinkara Beef', eng: 'Tender Beef Curry Cut', cat: 'meat', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'm6', ml: 'ബീഫ് ഉലർത്ത് ബോൺലെസ്സ്', mang: 'Beef Boneless Roast', eng: 'Boneless Beef Roast Cut', cat: 'meat', unit: 'Kg', step: 10, defaultQty: 0 },
    { id: 'm7', ml: 'ഫ്രഷ് കരിമീൻ', mang: 'Karimeen', eng: 'Fresh Pearlspot Fish', cat: 'meat', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'm8', ml: 'നെയ്മീൻ / അയിലക്കൂറ', mang: 'Neymeen', eng: 'King Fish / Seer Fish', cat: 'meat', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'm9', ml: 'വലിയ ചെമ്മീൻ / കൊഞ്ച്', mang: 'Tiger Prawns', eng: 'Fresh Tiger Prawns', cat: 'meat', unit: 'Kg', step: 5, defaultQty: 0 },
    { id: 'm10', ml: 'ഫ്രഷ് കോഴിമുട്ട', mang: 'Kozhimutta', eng: 'Fresh Farm Eggs', cat: 'meat', unit: 'Nos', step: 50, defaultQty: 0 }
  ],
  rentals: [
    { id: 'r1', ml: 'വലിയ ബിരിയാണി ഡെഗ് 50kg', mang: 'Biryani Deg 50kg', eng: 'Large Dum Degs 50kg', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r2', ml: 'മീഡിയം ബിരിയാണി ഡെഗ് 25kg', mang: 'Biryani Deg 25kg', eng: 'Medium Dum Degs 25kg', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r3', ml: 'ഇരട്ട ബർണർ വാണിജ്യ അടുപ്പ്', mang: 'Commercial Stove', eng: 'Commercial Double Burner Gas Stove', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r4', ml: 'വാണിജ്യ എൽ.പി.ജി സിലിണ്ടർ 19kg', mang: 'LPG Cylinder 19kg', eng: 'Commercial LPG Cylinder 19kg', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r5', ml: 'ബഫെ ചാഫിംഗ് ഡിഷ്', mang: 'Chafing Dish', eng: 'Stainless Steel Chafing Dishes', cat: 'rentals', unit: 'Nos', step: 2, defaultQty: 0 },
    { id: 'r6', ml: '4-നില ചോക്ലേറ്റ് ഫൗണ്ടൻ മെഷീൻ', mang: 'Chocolate Fountain Machine', eng: '4-Tier Chocolate Fountain Machine', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r7', ml: 'ലൈവ് പൊറോട്ട / ദോശ തവ', mang: 'Porotta Dosa Tawa', eng: 'Live Porotta / Dosa Heavy Tawa', cat: 'rentals', unit: 'Nos', step: 1, defaultQty: 0 },
    { id: 'r8', ml: 'മേലാമൈൻ ഹെവി പ്ലേറ്റ്', mang: 'Melamine Plates', eng: 'Melamine Heavy Dinner Plates', cat: 'rentals', unit: 'Nos', step: 50, defaultQty: 0 },
    { id: 'r9', ml: 'വാഴയില പേപ്പർ പ്ലേറ്റ്', mang: 'Banana Leaf Paper Plates', eng: 'Eco-Friendly Leaf Pattern Plates', cat: 'rentals', unit: 'Nos', step: 100, defaultQty: 0 },
    { id: 'r10', ml: 'സ്റ്റീൽ ഗ്ലാസ്', mang: 'Steel Glasses', eng: 'Stainless Steel Water Glasses', cat: 'rentals', unit: 'Nos', step: 50, defaultQty: 0 },
    { id: 'r11', ml: 'കുടിവെള്ള ക്യാൻ 20L', mang: 'Water Cans 20L', eng: 'Drinking Water 20L Bubble Cans', cat: 'rentals', unit: 'Nos', step: 5, defaultQty: 0 },
    { id: 'r12', ml: 'ബഫെ ടേബിളുകൾ വിത്ത് ഫ്രിൽ', mang: 'Buffet Tables', eng: 'Buffet Display Tables with Frills', cat: 'rentals', unit: 'Nos', step: 2, defaultQty: 0 },
    { id: 'r13', ml: 'വലിയ തവികളും തുഴകളും', mang: 'Large Ladles', eng: 'Heavy Wooden Ladles & Cooking Spoons', cat: 'rentals', unit: 'Sets', step: 1, defaultQty: 0 }
  ]
};

// Store Working State (in-memory per session with custom items persisted)
let workingStoreLists = {};

function initWorkingStoreLists() {
  Object.keys(STORE_CATALOGS).forEach(tab => {
    workingStoreLists[tab] = JSON.parse(JSON.stringify(STORE_CATALOGS[tab]));
    try {
      const raw = localStorage.getItem('vv_custom_store_' + tab);
      if (raw) {
        const customs = JSON.parse(raw);
        if (Array.isArray(customs)) {
          customs.forEach(c => {
            if (!workingStoreLists[tab].some(item => item.id === c.id)) {
              workingStoreLists[tab].unshift(c);
            }
          });
        }
      }
    } catch (e) {}
  });
}

function saveCustomStoreItem(tab, item) {
  try {
    let customs = [];
    const raw = localStorage.getItem('vv_custom_store_' + tab);
    if (raw) customs = JSON.parse(raw);
    customs.unshift(item);
    localStorage.setItem('vv_custom_store_' + tab, JSON.stringify(customs));
  } catch (e) {}
}

// ==========================================
// 3. WHOLESALE VENDOR DIRECTORY
// ==========================================

const DEFAULT_VENDORS = [
  { id: 'v_veg_1', name: 'Chalai Murugan Vegetables', category: 'veggies', phone: '9447012345' },
  { id: 'v_fruit_1', name: 'Suresh Fruits Chalai', category: 'fruits', phone: '9847123456' },
  { id: 'v_groc_1', name: 'Sree Murugan Maligai / Provision', category: 'grocery', phone: '9447234567' },
  { id: 'v_dairy_1', name: 'Milma Neyyattinkara Agency', category: 'dairy', phone: '9447345678' },
  { id: 'v_meat_1', name: 'Amaravila Fresh Chicken & Mutton', category: 'meat', phone: '9846456789' },
  { id: 'v_rent_1', name: 'Neyyattinkara Bartan & Rentals', category: 'rentals', phone: '9447567890' }
];

let savedVendors = [];

const CATEGORY_ICONS = {
  veggies: '🥦',
  fruits: '🍎',
  grocery: '🏬',
  dairy: '🧀',
  meat: '🍗',
  rentals: '🪑'
};

const CATEGORY_TITLES = {
  veggies: 'Vegetable Store (പച്ചക്കറി കട)',
  fruits: 'Fruit Store (പഴക്കട)',
  grocery: 'Kirana / Grocery (പലചരക്ക് കട)',
  dairy: 'Dairy & Milk (പാല് & തൈര്)',
  meat: 'Meat & Poultry (ഇറച്ചി കട)',
  rentals: 'Bartan & Rentals (പാത്രങ്ങൾ & വാടക)'
};

function loadSavedVendors() {
  try {
    const raw = localStorage.getItem('vv_saved_vendors');
    if (raw) {
      savedVendors = JSON.parse(raw);
    } else {
      savedVendors = [...DEFAULT_VENDORS];
      localStorage.setItem('vv_saved_vendors', JSON.stringify(savedVendors));
    }
  } catch (e) {
    savedVendors = [...DEFAULT_VENDORS];
  }
}

function persistSavedVendors() {
  try {
    localStorage.setItem('vv_saved_vendors', JSON.stringify(savedVendors));
  } catch (e) {}
}

function renderSavedVendorsList() {
  const container = document.getElementById('savedVendorsList');
  if (!container) return;

  if (savedVendors.length === 0) {
    container.innerHTML = `<div class="p-3 bg-black/60 rounded-xl text-center text-xs text-[#8E8E93]">No saved vendors. Add one above.</div>`;
    return;
  }

  container.innerHTML = savedVendors.map(v => {
    const icon = CATEGORY_ICONS[v.category] || '🏪';
    const catTitle = CATEGORY_TITLES[v.category] || v.category;
    return `
      <div class="p-2.5 bg-black rounded-xl border border-[#2C2C2E] flex items-center justify-between text-xs">
        <div class="space-y-0.5">
          <div class="flex items-center gap-1.5">
            <span>${icon}</span>
            <span class="font-bold text-white">${v.name}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px] text-[#8E8E93]">
            <span>${catTitle}</span>
            <span>•</span>
            <a href="tel:${v.phone}" class="text-emerald-400 font-mono font-semibold">📞 ${v.phone}</a>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="editVendor('${v.id}')" class="p-1.5 px-2 bg-[#2C2C2E] hover:bg-[#38383A] text-white rounded-lg text-[10px] font-semibold transition">✏️ Edit</button>
          <button onclick="deleteVendor('${v.id}')" class="p-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-[10px] font-semibold transition">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleAddVendorForm(show) {
  const box = document.getElementById('vendorFormBox');
  if (!box) return;
  const isHidden = box.classList.contains('hidden');
  const shouldShow = typeof show === 'boolean' ? show : isHidden;
  if (shouldShow) {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
    document.getElementById('editVendorId').value = '';
    document.getElementById('vendorNameInput').value = '';
    document.getElementById('vendorPhoneInput').value = '';
    document.getElementById('vendorCategoryInput').value = 'veggies';
  }
}

function editVendor(id) {
  const v = savedVendors.find(x => x.id === id);
  if (!v) return;
  document.getElementById('editVendorId').value = v.id;
  document.getElementById('vendorNameInput').value = v.name;
  document.getElementById('vendorCategoryInput').value = v.category;
  document.getElementById('vendorPhoneInput').value = v.phone;
  toggleAddVendorForm(true);
}

function deleteVendor(id) {
  const v = savedVendors.find(x => x.id === id);
  if (!v) return;
  if (confirm(`Delete vendor "${v.name}"?`)) {
    savedVendors = savedVendors.filter(x => x.id !== id);
    persistSavedVendors();
    renderSavedVendorsList();
    populateVendorDropdownForTab(currentSupplierTab);
  }
}

function saveVendorFromForm() {
  const name = document.getElementById('vendorNameInput')?.value.trim();
  const category = document.getElementById('vendorCategoryInput')?.value || 'veggies';
  const rawPhone = document.getElementById('vendorPhoneInput')?.value.trim();
  const phone = sanitizePhoneNumber(rawPhone);
  const editId = document.getElementById('editVendorId')?.value;

  if (!name || !phone) {
    alert('Please enter Vendor Name and a valid Phone number.');
    return;
  }

  if (editId) {
    const idx = savedVendors.findIndex(x => x.id === editId);
    if (idx >= 0) {
      savedVendors[idx] = { id: editId, name, category, phone };
    }
  } else {
    savedVendors.push({ id: 'v_' + Date.now(), name, category, phone });
  }

  persistSavedVendors();
  toggleAddVendorForm(false);
  renderSavedVendorsList();
  populateVendorDropdownForTab(currentSupplierTab);
}

function populateVendorDropdownForTab(tab) {
  const select = document.getElementById('savedVendorSelect');
  const phoneInput = document.getElementById('supplierVendorPhone');
  if (!select) return;

  const matchingVendors = savedVendors.filter(v => v.category === tab);
  const otherVendors = savedVendors.filter(v => v.category !== tab);

  let html = '';
  if (matchingVendors.length > 0) {
    html += `<optgroup label="Primary for this Store">`;
    matchingVendors.forEach(v => {
      html += `<option value="${v.id}" data-phone="${v.phone}">${v.name} (${v.phone})</option>`;
    });
    html += `</optgroup>`;
  }
  if (otherVendors.length > 0) {
    html += `<optgroup label="Other Saved Vendors">`;
    otherVendors.forEach(v => {
      html += `<option value="${v.id}" data-phone="${v.phone}">${v.name} [${v.category}] (${v.phone})</option>`;
    });
    html += `</optgroup>`;
  }

  if (!html) {
    html = `<option value="">No saved vendors</option>`;
  }

  select.innerHTML = html;

  // Select the first matching vendor by default, set phone
  const firstVendor = matchingVendors[0] || savedVendors[0];
  if (firstVendor && phoneInput) {
    select.value = firstVendor.id;
    phoneInput.value = firstVendor.phone;
  } else if (phoneInput) {
    phoneInput.value = '';
  }
}

function onVendorSelectChange(val) {
  const v = savedVendors.find(x => x.id === val);
  const phoneInput = document.getElementById('supplierVendorPhone');
  if (v && phoneInput) {
    phoneInput.value = v.phone;
  }
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
      else masterDishes = [...DEFAULT_MASTER_DISHES];
    } catch (e) {
      console.warn('[DB] Fallback to local storage:', e);
      loadFromLocalStorage();
      masterDishes = [...DEFAULT_MASTER_DISHES];
    }
  } else {
    loadFromLocalStorage();
    masterDishes = [...DEFAULT_MASTER_DISHES];
  }

  if (events.length === 0) loadDemoData(false);

  loadNotifSettings();
  initWorkingStoreLists();
  loadSavedVendors();
  renderSavedVendorsList();
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
// 4. EVENT BUILDER & BUDGET CALCULATOR
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
  document.getElementById('evRatePerPlate').value = '';
  document.getElementById('evVenue').value = '';
  document.getElementById('evPhone').value = '';
  document.getElementById('evPhone2').value = '';
  document.getElementById('evBudget').value = '';
  document.getElementById('evAdvance').value = '';
  document.getElementById('evNotes').value = '';

  currentEditingMenu = { mains: [], starters: [], breads: [], desserts: [], drinks: [] };
  renderMenuPills();
  filterMenuBankPills('');

  document.getElementById('eventModal')?.classList.remove('hidden');
}

function closeEventModal() {
  document.getElementById('eventModal')?.classList.add('hidden');
}

// Auto-Budget Calculator: Guests × Rate per Plate
function calcTotalBudget() {
  const guests = parseFloat(document.getElementById('evGuests')?.value) || 0;
  const rate = parseFloat(document.getElementById('evRatePerPlate')?.value) || 0;
  if (guests > 0 && rate > 0) {
    const total = Math.round(guests * rate);
    const budgetInput = document.getElementById('evBudget');
    if (budgetInput) budgetInput.value = total;
  }
}

function saveEvent() {
  const id = document.getElementById('editEventId')?.value || 'ev_' + Date.now();
  const title = document.getElementById('evTitle')?.value.trim();
  const date = document.getElementById('evDate')?.value;
  const guests = parseInt(document.getElementById('evGuests')?.value) || 0;

  if (!title || !date) {
    alert('Please enter Event Title and Date.');
    return;
  }

  const evObj = {
    id,
    title,
    status: document.getElementById('evStatus')?.value || 'Booked',
    date,
    time: document.getElementById('evTime')?.value || '11:30',
    guests,
    ratePerPlate: parseFloat(document.getElementById('evRatePerPlate')?.value) || 0,
    venue: document.getElementById('evVenue')?.value.trim() || '',
    phone: sanitizePhoneNumber(document.getElementById('evPhone')?.value || ''),
    phone2: sanitizePhoneNumber(document.getElementById('evPhone2')?.value || ''),
    budget: parseFloat(document.getElementById('evBudget')?.value) || 0,
    advance: parseFloat(document.getElementById('evAdvance')?.value) || 0,
    serviceStyle: document.getElementById('evServiceStyle')?.value || 'Traditional Sadya (ഇലയിൽ)',
    plates: {
      required: document.getElementById('evPlatesReq')?.checked || false,
      type: document.getElementById('evPlateType')?.value || 'Melamine Heavy',
      count: parseInt(document.getElementById('evPlateCount')?.value) || guests
    },
    dishes: currentEditingMenu,
    notes: document.getElementById('evNotes')?.value.trim() || '',
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
  let cleaned = String(raw).replace(/\D/g, '').replace(/^0+/, '');
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
// 5. RENDERING EVENTS & CALENDAR
// ==========================================

function renderEvents() {
  const container = document.getElementById('eventsList');
  if (!container) return;

  let filtered = [...events];
  if (currentFilter !== 'all') {
    filtered = filtered.filter(e => e.status === currentFilter);
  }

  // Apply Calendar Date Filter if selected
  if (selectedCalendarDate) {
    filtered = filtered.filter(e => e.date === selectedCalendarDate);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="apple-card p-8 rounded-3xl text-center border border-[#2C2C2E] space-y-2">
        <span class="text-3xl">📅</span>
        <h4 class="text-sm font-bold text-white">No Catering Bookings</h4>
        <p class="text-xs text-[#8E8E93]">Tap "+ New Event" to record a wedding, feast, or reception.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(ev => {
    const total = ev.budget || 0;
    const advance = ev.advance || 0;
    const balance = total - advance;

    return `
      <div class="apple-card p-4 rounded-3xl border border-[#2C2C2E] space-y-3 hover:border-[#38383A] transition">
        <div class="flex items-start justify-between">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-white text-sm">${ev.title}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusBadgeClass(ev.status)}">${ev.status}</span>
            </div>
            <p class="text-xs text-[#8E8E93]">
              📅 ${formatDisplayDate(ev.date)} • ⏰ ${ev.time || '11:30 AM'} • 👥 ${ev.guests || 0} Plates
            </p>
            ${ev.venue ? `<p class="text-[11px] text-[#8E8E93] truncate">📍 ${ev.venue}</p>` : ''}
          </div>
          <div class="text-right">
            <span class="text-xs font-extrabold text-white block">₹${total.toLocaleString()}</span>
            <span class="text-[10px] font-semibold ${balance > 0 ? 'text-[#E53935]' : 'text-emerald-400'} block">
              ${balance > 0 ? 'Due: ₹' + balance.toLocaleString() : 'Settled'}
            </span>
          </div>
        </div>

        <!-- Action Row -->
        <div class="flex items-center justify-between border-t border-[#2C2C2E]/60 pt-2 text-xs">
          <div class="flex gap-2">
            <a href="tel:${ev.phone}" class="p-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-95 rounded-xl text-emerald-400 transition" title="Call Primary">📞</a>
            ${ev.phone2 ? `<a href="tel:${ev.phone2}" class="p-2 bg-[#2C2C2E] hover:bg-[#38383A] active:scale-95 rounded-xl text-white transition" title="Call Alternate">📱</a>` : ''}
            <button onclick="openWhatsAppDirect('${ev.id}')" class="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl transition font-bold" title="WhatsApp">💬</button>
            <button onclick="openBillModal('${ev.id}', 'invoice')" class="px-3 py-1.5 bg-[#2C2C2E] hover:bg-[#38383A] text-white rounded-xl text-xs font-semibold" title="Invoice">📄 Invoice</button>
            <button onclick="openSupplierModal('${ev.id}')" class="px-3 py-1.5 bg-[#E53935]/20 hover:bg-[#E53935]/30 text-[#E53935] rounded-xl text-xs font-bold" title="Procurement">🥦 Stores</button>
          </div>
          <button onclick="openViewModal('${ev.id}')" class="px-3 py-1.5 bg-[#2C2C2E] hover:bg-white hover:text-black text-white font-bold rounded-xl text-xs transition">
            View Details →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function getStatusBadgeClass(st) {
  if (st === 'Confirmed') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (st === 'Completed') return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  if (st === 'Cancelled') return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
  return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return dateStr; }
}

function toggleCalendarView() {
  isCalendarViewActive = !isCalendarViewActive;
  const calArea = document.getElementById('interactiveCalendarCard') || document.getElementById('calendarViewArea');
  const btn = document.getElementById('viewToggleCal') || document.getElementById('calendarToggleBtn');
  if (calArea) {
    if (isCalendarViewActive) {
      calArea.classList.remove('hidden');
      if (btn) btn.innerText = 'Hide Calendar';
      renderCalendar();
    } else {
      calArea.classList.add('hidden');
      if (btn) btn.innerText = 'Calendar';
    }
  }
}

function changeMonth(delta) {
  calCurrentMonth += delta;
  if (calCurrentMonth > 11) {
    calCurrentMonth = 0;
    calCurrentYear++;
  } else if (calCurrentMonth < 0) {
    calCurrentMonth = 11;
    calCurrentYear--;
  }
  renderCalendar();
}

function goToCurrentMonth() {
  calCurrentYear = new Date().getFullYear();
  calCurrentMonth = new Date().getMonth();
  renderCalendar();
}

function renderCalendar() {
  const label = document.getElementById('calMonthYear') || document.getElementById('calMonthYearLabel');
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  if (label) label.innerText = `${monthNames[calCurrentMonth]} ${calCurrentYear}`;

  const firstDay = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();

  // Capacity Conflict Tracking (Map date -> count)
  const eventCountsByDate = {};
  events.forEach(e => {
    if (e.date) eventCountsByDate[e.date] = (eventCountsByDate[e.date] || 0) + 1;
  });

  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="h-10"></div>`;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(calCurrentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateStr = `${calCurrentYear}-${mStr}-${dStr}`;

    const count = eventCountsByDate[dateStr] || 0;
    const isSelected = selectedCalendarDate === dateStr;
    const isToday = todayStr === dateStr;

    let dotColor = '';
    if (count === 1) dotColor = 'bg-emerald-400';
    else if (count === 2) dotColor = 'bg-amber-400';
    else if (count >= 3) dotColor = 'bg-[#E53935] animate-pulse';

    html += `
      <button onclick="selectCalendarDate('${dateStr}')" 
        class="h-10 rounded-xl flex flex-col items-center justify-center relative transition active:scale-95 ${isSelected ? 'bg-[#E53935] text-white font-extrabold shadow-md' : isToday ? 'border border-[#E53935] text-white font-bold' : 'hover:bg-[#2C2C2E] text-white'}">
        <span class="text-xs">${day}</span>
        ${count > 0 ? `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColor} mt-0.5"></span>` : ''}
      </button>
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
// 6. MULTI-STORE PROCUREMENT ENGINE & FAST SEARCH
// ==========================================

function openSupplierModal(eventId) {
  currentSupplierEventId = eventId;
  // Clear search and never put client phone into vendor phone input
  currentStoreSearchQuery = '';
  const searchInput = document.getElementById('storeSearchInput');
  if (searchInput) searchInput.value = '';
  document.getElementById('clearStoreSearchBtn')?.classList.add('hidden');

  setSupplierTab('veggies');
  document.getElementById('supplierOrderModal')?.classList.remove('hidden');
}

function closeSupplierModal() {
  document.getElementById('supplierOrderModal')?.classList.add('hidden');
}

// ==========================================
// 6b. WHOLESALE MANDI RATE & WEIGHT CALCULATOR
// ==========================================

function toggleMandiCalculator() {
  const box = document.getElementById('mandiCalcBox');
  const arrow = document.getElementById('mandiCalcArrow');
  if (!box) return;
  const isHidden = box.classList.contains('hidden');
  if (isHidden) {
    box.classList.remove('hidden');
    if (arrow) arrow.innerText = '▲';
  } else {
    box.classList.add('hidden');
    if (arrow) arrow.innerText = '▼';
  }
}

function calculateMandiRate() {
  const qty = parseFloat(document.getElementById('mandiUnitQty')?.value) || 0;
  const unitType = document.getElementById('mandiUnitType')?.value;
  const customKgInput = document.getElementById('mandiCustomKg');
  let kgPerUnit = parseFloat(unitType) || 0;

  if (unitType === 'custom') {
    customKgInput?.classList.remove('hidden');
    kgPerUnit = parseFloat(customKgInput?.value) || 0;
  } else {
    customKgInput?.classList.add('hidden');
  }

  const unitPrice = parseFloat(document.getElementById('mandiUnitPrice')?.value) || 0;
  const totalKg = qty * kgPerUnit;
  const totalCost = qty * unitPrice;
  const ratePerKg = totalKg > 0 ? (totalCost / totalKg) : 0;

  const wtEl = document.getElementById('mandiTotalWeight');
  const rateEl = document.getElementById('mandiRatePerKg');
  const costEl = document.getElementById('mandiTotalCost');

  if (wtEl) wtEl.innerText = totalKg + ' Kg';
  if (rateEl) rateEl.innerText = '₹' + ratePerKg.toFixed(2) + ' / Kg';
  if (costEl) costEl.innerText = '₹' + Math.round(totalCost).toLocaleString();
}

function addMandiCalcToExpenses() {
  const qty = parseFloat(document.getElementById('mandiUnitQty')?.value) || 0;
  const unitPrice = parseFloat(document.getElementById('mandiUnitPrice')?.value) || 0;
  const totalCost = qty * unitPrice;
  const rateEl = document.getElementById('mandiRatePerKg')?.innerText || '';
  const wtEl = document.getElementById('mandiTotalWeight')?.innerText || '';

  if (totalCost <= 0) {
    alert('Please enter valid Mandi quantity and price.');
    return;
  }

  const exp = {
    id: 'exp_' + Date.now(),
    category: currentSupplierTab === 'veggies' ? 'Produce' : currentSupplierTab === 'grocery' ? 'Grocery' : 'Wholesale Market',
    amount: Math.round(totalCost),
    vendor: document.getElementById('supplierVendorPhone')?.value || 'Wholesale Mandi',
    date: new Date().toISOString().split('T')[0],
    notes: 'Mandi: ' + qty + ' units (' + wtEl + ') @ ' + rateEl
  };

  // Merge into this event's saved list (do not clobber another event's expenses)
  let targetExpenses = [];
  try {
    const raw = localStorage.getItem('vv_expenses_' + currentSupplierEventId);
    targetExpenses = raw ? JSON.parse(raw) : [];
  } catch (e) { targetExpenses = []; }
  if (!Array.isArray(targetExpenses)) targetExpenses = [];

  targetExpenses.unshift(exp);
  localStorage.setItem('vv_expenses_' + currentSupplierEventId, JSON.stringify(targetExpenses));

  if (currentViewingEventId === currentSupplierEventId) {
    currentEventExpenses = targetExpenses;
  }

  alert('Logged ₹' + Math.round(totalCost).toLocaleString() + ' to event purchase expenses!');
}

function setSupplierTab(tab) {
  currentSupplierTab = tab;
  document.querySelectorAll('.sup-tab-btn').forEach(btn => {
    btn.className = 'sup-tab-btn py-1.5 px-3 rounded-xl text-xs font-semibold bg-[#2C2C2E] text-[#8E8E93] whitespace-nowrap';
  });
  const activeBtn = document.getElementById(`supTab-${tab}`);
  if (activeBtn) activeBtn.className = 'sup-tab-btn py-1.5 px-3 rounded-xl text-xs font-bold bg-[#E53935] text-white whitespace-nowrap';

  // Category title & badge update
  const badge = document.getElementById('supplierCategoryBadge');
  if (badge) {
    const icon = CATEGORY_ICONS[tab] || '🏪';
    const catTitle = CATEGORY_TITLES[tab] || tab;
    badge.innerText = `${icon} ${catTitle}`;
  }

  // Show chips only for veggies
  const chipsContainer = document.getElementById('mandiCategoryChips');
  if (chipsContainer) {
    if (tab === 'veggies') chipsContainer.classList.remove('hidden');
    else chipsContainer.classList.add('hidden');
  }

  // Auto-populate saved vendor for this tab
  populateVendorDropdownForTab(tab);

  // Render store items list
  renderStoreItemsList();
  updateChitPreview();
}

function filterMandiCategory(cat) {
  activeMandiCategory = cat;
  renderStoreItemsList();
}

// Single-Letter Fast Autocomplete Search
function handleStoreSearch(val) {
  currentStoreSearchQuery = (val || '').trim();
  const clearBtn = document.getElementById('clearStoreSearchBtn');
  if (clearBtn) {
    if (currentStoreSearchQuery) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
  renderStoreItemsList();
}

function clearStoreSearch() {
  currentStoreSearchQuery = '';
  const input = document.getElementById('storeSearchInput');
  if (input) input.value = '';
  document.getElementById('clearStoreSearchBtn')?.classList.add('hidden');
  renderStoreItemsList();
}

function renderStoreItemsList() {
  const container = document.getElementById('supplierItemsList');
  if (!container) return;

  const list = workingStoreLists[currentSupplierTab] || [];
  let items = [...list];

  // If search query active: fast single-letter autocomplete
  if (currentStoreSearchQuery) {
    const q = currentStoreSearchQuery.toLowerCase();
    const startsWithMatches = [];
    const containsMatches = [];

    items.forEach(item => {
      const ml = item.ml || '';
      const mang = (item.mang || '').toLowerCase();
      const eng = (item.eng || '').toLowerCase();
      const name = (item.name || '').toLowerCase();

      if (mang.startsWith(q) || eng.startsWith(q) || name.startsWith(q) || ml.startsWith(q)) {
        startsWithMatches.push(item);
      } else if (mang.includes(q) || eng.includes(q) || name.includes(q) || ml.includes(q)) {
        containsMatches.push(item);
      }
    });

    items = [...startsWithMatches, ...containsMatches];
  } else if (currentSupplierTab === 'veggies') {
    // Apply Veggies Mandi category chip filter
    if (activeMandiCategory === 'selected') items = items.filter(i => (i.defaultQty || 0) > 0);
    else if (activeMandiCategory !== 'all') items = items.filter(i => i.cat === activeMandiCategory);
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-black/60 rounded-xl text-center space-y-1">
        <p class="text-xs text-[#8E8E93]">No items found matching "${currentStoreSearchQuery}".</p>
        <p class="text-[11px] text-white">Use "+ Add custom item" below to add it directly to this store!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const qty = item.defaultQty || 0;
    const hasQty = qty > 0;

    return `
      <div class="p-2.5 rounded-2xl border transition flex items-center justify-between gap-2 ${hasQty ? 'bg-emerald-950/20 border-emerald-500/40 text-white' : 'bg-black border-[#2C2C2E] text-white'}">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs truncate">${item.ml}</span>
            <span class="text-[10px] text-[#8E8E93] truncate">(${item.mang})</span>
          </div>
          <p class="text-[10px] text-[#636366] truncate">${item.eng} • ${item.unit}</p>
        </div>

        <!-- Micro-Stepper -->
        <div class="flex items-center gap-1">
          <button type="button" onclick="adjustStoreItemQty('${currentSupplierTab}', '${item.id}', -${item.step || 1})" 
            class="w-7 h-7 rounded-lg bg-[#2C2C2E] hover:bg-[#38383A] active:scale-95 text-white font-bold text-xs flex items-center justify-center transition">
            -
          </button>
          <input type="number" step="${item.step || 1}" min="0" value="${qty}" 
            onchange="setStoreItemQtyDirect('${currentSupplierTab}', '${item.id}', this.value)" 
            class="w-14 text-center bg-[#1C1C1E] border border-[#2C2C2E] text-white text-xs font-mono py-1 rounded-lg focus:outline-none focus:border-[#E53935]">
          <button type="button" onclick="adjustStoreItemQty('${currentSupplierTab}', '${item.id}', ${item.step || 1})" 
            class="w-7 h-7 rounded-lg bg-[#2C2C2E] hover:bg-[#38383A] active:scale-95 text-white font-bold text-xs flex items-center justify-center transition">
            +
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function adjustStoreItemQty(tab, id, delta) {
  const list = workingStoreLists[tab] || [];
  const item = list.find(i => i.id === id);
  if (item) {
    const current = parseFloat(item.defaultQty) || 0;
    const next = Math.max(0, current + delta);
    item.defaultQty = parseFloat(next.toFixed(2));
    renderStoreItemsList();
    updateChitPreview();
  }
}

function setStoreItemQtyDirect(tab, id, val) {
  const list = workingStoreLists[tab] || [];
  const item = list.find(i => i.id === id);
  if (item) {
    const num = Math.max(0, parseFloat(val) || 0);
    item.defaultQty = parseFloat(num.toFixed(2));
    renderStoreItemsList();
    updateChitPreview();
  }
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
    cat: currentSupplierTab,
    unit: currentSupplierTab === 'rentals' ? 'Nos' : currentSupplierTab === 'dairy' ? 'Liters' : 'Kg',
    step: 1,
    defaultQty: 1
  };

  if (!workingStoreLists[currentSupplierTab]) workingStoreLists[currentSupplierTab] = [];
  workingStoreLists[currentSupplierTab].unshift(newItem);
  saveCustomStoreItem(currentSupplierTab, newItem);

  input.value = '';
  renderStoreItemsList();
  updateChitPreview();
}

function updateChitPreview() {
  const preview = document.getElementById('supplierMessagePreview');
  if (!preview) return;

  const ev = events.find(e => e.id === currentSupplierEventId);
  const items = (workingStoreLists[currentSupplierTab] || []).filter(i => (i.defaultQty || 0) > 0);
  const tabTitle = CATEGORY_TITLES[currentSupplierTab] || currentSupplierTab;

  let text = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  text += `*CHALAI / NEYYATTINKARA MARKET ORDER*\n`;
  text += `--------------------------------\n`;
  text += `*STORE:* ${tabTitle.toUpperCase()}\n`;
  if (ev) {
    text += `*EVENT:* ${ev.title}\n`;
    text += `*DATE:* ${formatDisplayDate(ev.date)}\n`;
    text += `*DELIVERY VENUE:* ${ev.venue || 'Mamkoottam / Kitchen'}\n`;
    text += `--------------------------------\n`;
  }
  text += `*REQUIRED ITEMS:*\n`;

  if (items.length === 0) {
    text += `[No items selected with quantity > 0]\n`;
    text += `(Use the + / - steppers to add quantities for this vendor)`;
  } else {
    items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.ml}* (${item.mang}): *${item.defaultQty} ${item.unit}*\n`;
    });
    text += `\n--------------------------------\n`;
    text += `*Total Items:* ${items.length}\n`;
    text += `*Please confirm stock & morning delivery timing.* 🙏`;
  }

  preview.innerText = text;
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
    navigator.share({ title: 'V.V Catering Market Order Chit', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Order chit copied to clipboard!'));
  }
}

// ==========================================
// 7. INVOICING & REAL WORKING UPI QR
// ==========================================

function openBillModal(eventId, type) {
  currentViewingEventId = eventId;
  currentBillType = type || 'invoice';
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const titleEl = document.getElementById('invoiceModalTitle');
  if (titleEl) titleEl.innerText = type === 'estimate' ? 'Quotation / Estimate (എസ്റ്റിമേറ്റ്)' : 'Banquet Tax Invoice (കസ്റ്റമർ ഇൻവോയ്സ്)';

  const container = document.getElementById('printableInvoiceArea');
  const total = ev.budget || 0;
  const advance = ev.advance || 0;
  const balance = total - advance;

  const payAmount = balance > 0 ? balance : 0;
  const upiUrl = `upi://pay?pa=8281857273@upi&pn=VV%20Events%20and%20Catering&am=${payAmount}&cu=INR&tn=Invoice%20${ev.id}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  container.innerHTML = `
    <div class="space-y-4 text-xs">
      <div class="border-b border-[#2C2C2E] pb-3 text-center">
        <h2 class="text-base font-extrabold text-[#E53935]">V.V EVENTS & CATERING SERVICE</h2>
        <p class="text-[11px] text-[#8E8E93]">Mamkoottam, Neyyattinkara | Ph: 8281857273, 9072721633</p>
        <p class="text-[10px] text-[#636366]">FSSAI License: 11321001001393 | GSTIN: Verified</p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-[#8E8E93] block text-[10px]">Customer / Event:</span>
          <span class="font-bold text-white">${ev.title}</span>
        </div>
        <div class="text-right">
          <span class="text-[#8E8E93] block text-[10px]">Event Date:</span>
          <span class="font-bold text-white">${formatDisplayDate(ev.date)}</span>
        </div>
        <div>
          <span class="text-[#8E8E93] block text-[10px]">Headcount / Plates:</span>
          <span class="font-bold text-white">${ev.guests || 0} Plates</span>
          ${ev.ratePerPlate ? `<span class="text-[10px] text-[#8E8E93]">(@ ₹${ev.ratePerPlate}/plate)</span>` : ''}
        </div>
        <div class="text-right">
          <span class="text-[#8E8E93] block text-[10px]">Venue:</span>
          <span class="font-bold text-white">${ev.venue || 'Mamkoottam'}</span>
        </div>
      </div>

      <!-- Itemized Dishes Breakdown -->
      <div class="border-t border-b border-[#2C2C2E] py-2.5 space-y-1.5">
        <span class="text-[10px] font-bold text-[#8E8E93] uppercase block">Selected Banquet Menu:</span>
        ${Object.entries(ev.dishes || {}).map(([cat, list]) => (list && list.length > 0) ? `
          <div class="text-[11px]">
            <strong class="text-[#E53935] capitalize">${cat}:</strong>
            <span class="text-white"> ${list.join(' • ')}</span>
          </div>
        ` : '').join('') || '<p class="text-[11px] text-[#8E8E93]">Standard Traditional Sadya</p>'}
      </div>

      <!-- Financial Calculation -->
      <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E] space-y-1.5 text-xs">
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
          <span class="text-[#E53935]">₹${balance > 0 ? balance.toLocaleString() : '0 (Settled)'}</span>
        </div>
      </div>

      <!-- Real Scannable UPI QR Code & 1-Tap Pay -->
      <div class="bg-black p-3.5 rounded-2xl border border-[#2C2C2E] text-center space-y-2.5">
        <span class="text-[11px] font-bold text-white block">Scan to Pay via UPI (GPay / PhonePe / Paytm / BHIM)</span>
        <div class="flex justify-center py-1">
          <img src="${qrImgUrl}" alt="UPI QR Code" class="w-40 h-40 bg-white p-2 rounded-xl shadow-lg mx-auto" onerror="this.style.display='none'">
        </div>
        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl text-xs font-mono text-white">
            <span>UPI ID: 8281857273@upi</span>
            <button onclick="navigator.clipboard.writeText('8281857273@upi').then(() => alert('UPI ID copied to clipboard!'))" class="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] uppercase">Copy</button>
          </div>
          <div>
            <a href="${upiUrl}" class="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95">
              <span>📱</span> Pay ₹${payAmount.toLocaleString()} via UPI App
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('billInvoiceModal')?.classList.remove('hidden');
}

function closeBillModal() {
  document.getElementById('billInvoiceModal')?.classList.add('hidden');
}

function printBanquetInvoice() {
  window.print();
}

function shareInvoiceWhatsApp() {
  const ev = events.find(e => e.id === currentViewingEventId);
  if (!ev) return;

  const total = ev.budget || 0;
  const advance = ev.advance || 0;
  const balance = total - advance;

  let text = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  text += `📍 Mamkoottam, Neyyattinkara • Ph: 8281857273\n`;
  text += `------------------------------------\n`;
  text += `*STATEMENT OF ACCOUNT / INVOICE*\n`;
  text += `*Event:* ${ev.title}\n`;
  text += `*Date:* ${formatDisplayDate(ev.date)}\n`;
  text += `*Guests / Plates:* ${ev.guests} Plates\n`;
  text += `------------------------------------\n`;
  text += `*Total Charge:* ₹${total.toLocaleString()}\n`;
  text += `*Advance Received:* ₹${advance.toLocaleString()}\n`;
  text += `*Balance Payable:* ₹${balance.toLocaleString()}\n`;
  text += `------------------------------------\n`;
  text += `*UPI Payment ID:* 8281857273@upi\n`;
  text += `Thank you for your business! 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ==========================================
// 8. PURCHASE EXPENSES & RECEIPTS
// ==========================================

function openExpenseModal(eventId) {
  currentViewingEventId = eventId;
  const ev = events.find(e => e.id === eventId);
  const dateInput = document.getElementById('newExpDate');
  if (dateInput) {
    dateInput.value = ev?.date || new Date().toISOString().split('T')[0];
  }

  try {
    const raw = localStorage.getItem('vv_expenses_' + eventId);
    currentEventExpenses = raw ? JSON.parse(raw) : [];
  } catch (e) { currentEventExpenses = []; }

  renderExpensesList();
  document.getElementById('expenseTrackerModal')?.classList.remove('hidden');
}

function closeExpenseModal() {
  document.getElementById('expenseTrackerModal')?.classList.add('hidden');
}

function handleReceiptImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    currentReceiptPhotoBase64 = ev.target?.result || null;
    const previewContainer = document.getElementById('receiptThumbnailPreview');
    const previewImg = document.getElementById('receiptPreviewImg');
    const statusLabel = document.getElementById('receiptPhotoStatus');
    if (previewImg && previewContainer) {
      previewImg.src = currentReceiptPhotoBase64;
      previewContainer.classList.remove('hidden');
    }
    if (statusLabel) {
      statusLabel.innerText = file.name || 'Photo captured';
    }
  };
  reader.readAsDataURL(file);
}

function clearReceiptImage() {
  currentReceiptPhotoBase64 = null;
  const previewContainer = document.getElementById('receiptThumbnailPreview');
  const previewImg = document.getElementById('receiptPreviewImg');
  const statusLabel = document.getElementById('receiptPhotoStatus');
  const fileInput = document.getElementById('receiptPhotoInput');
  if (previewContainer) previewContainer.classList.add('hidden');
  if (previewImg) previewImg.src = '';
  if (statusLabel) statusLabel.innerText = 'No photo';
  if (fileInput) fileInput.value = '';
}

function savePurchaseExpense() {
  const amount = parseFloat(document.getElementById('newExpAmount')?.value) || 0;
  const category = document.getElementById('newExpCategory')?.value || 'Produce';
  const vendor = document.getElementById('newExpVendor')?.value.trim() || '';
  const date = document.getElementById('newExpDate')?.value || new Date().toISOString().split('T')[0];

  if (amount <= 0) {
    alert('Please enter a valid Purchase Bill Amount.');
    return;
  }

  const exp = {
    id: 'exp_' + Date.now(),
    category,
    amount,
    vendor,
    date,
    photo: currentReceiptPhotoBase64
  };

  currentEventExpenses.unshift(exp);
  localStorage.setItem('vv_expenses_' + currentViewingEventId, JSON.stringify(currentEventExpenses));

  // Reset Form
  document.getElementById('newExpAmount').value = '';
  document.getElementById('newExpVendor').value = '';
  clearReceiptImage();

  renderExpensesList();
}

function renderExpensesList() {
  const container = document.getElementById('expenseItemsList');
  const totalCostEl = document.getElementById('expTotalCost');
  const totalRevEl = document.getElementById('expTotalRev');
  const netProfitEl = document.getElementById('expNetProfit');
  const countBadge = document.getElementById('expCountBadge');
  if (!container) return;

  const ev = events.find(e => e.id === currentViewingEventId);
  const revenue = ev ? (ev.budget || 0) : 0;
  const totalCost = currentEventExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = revenue - totalCost;

  if (totalRevEl) totalRevEl.innerText = '₹' + revenue.toLocaleString();
  if (totalCostEl) totalCostEl.innerText = '₹' + totalCost.toLocaleString();
  if (netProfitEl) {
    netProfitEl.innerText = '₹' + netProfit.toLocaleString();
    netProfitEl.className = netProfit >= 0 ? 'text-sm font-bold text-emerald-400' : 'text-sm font-bold text-rose-500';
  }
  if (countBadge) countBadge.innerText = `${currentEventExpenses.length} bills`;

  if (currentEventExpenses.length === 0) {
    container.innerHTML = '<p class="text-xs text-[#8E8E93] text-center py-4">No purchases recorded yet for this event.</p>';
    return;
  }

  container.innerHTML = currentEventExpenses.map((exp, idx) => `
    <div class="p-3 bg-black rounded-xl border border-[#2C2C2E] flex justify-between items-center text-xs">
      <div>
        <span class="font-bold text-white block">${exp.category}</span>
        <span class="text-[10px] text-[#8E8E93] block">${exp.vendor ? exp.vendor + ' • ' : ''}${formatDisplayDate(exp.date)}</span>
        ${exp.photo ? `<span class="text-[9px] text-emerald-400 font-semibold block mt-0.5">📸 Receipt attached</span>` : ''}
      </div>
      <div class="text-right">
        <span class="font-extrabold text-[#E53935] block">₹${exp.amount.toLocaleString()}</span>
        <button onclick="deleteExpenseItem(${idx})" class="text-[10px] text-[#8E8E93] hover:text-rose-400">Remove</button>
      </div>
    </div>
  `).join('');
}

function deleteExpenseItem(idx) {
  currentEventExpenses.splice(idx, 1);
  localStorage.setItem('vv_expenses_' + currentViewingEventId, JSON.stringify(currentEventExpenses));
  renderExpensesList();
}

// ==========================================
// 9. MENU BANK & DISH BUILDER
// ==========================================

function switchTab(tab) {
  document.querySelectorAll('.app-tab-btn').forEach(b => {
    b.className = 'app-tab-btn flex-1 py-3 text-xs font-semibold text-[#8E8E93] border-b-2 border-transparent transition';
  });
  const activeBtn = document.getElementById(`tabBtn-${tab}`);
  if (activeBtn) activeBtn.className = 'app-tab-btn flex-1 py-3 text-xs font-bold text-white border-b-2 border-[#E53935] transition';

  document.querySelectorAll('.app-tab-content').forEach(c => c.classList.add('hidden'));
  const content = document.getElementById(`tabContent-${tab}`);
  if (content) content.classList.remove('hidden');

  if (tab === 'vendors' || tab === 'settings') {
    renderSavedVendorsList();
  }
}

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

// IME-Safe Input Handler per modern-web-guidance
function handleDishTagInput(e, cat) {
  if (e.key === 'Enter') {
    // Check isComposing / keyCode 229 for Malayalam virtual keyboards & IMEs
    if (e.isComposing || e.keyCode === 229) return;
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

function addCustomDishDirect(cat) {
  const input = document.getElementById(`input-${cat}`);
  if (!input) return;
  const val = input.value.trim();
  if (val) {
    if (!currentEditingMenu[cat]) currentEditingMenu[cat] = [];
    currentEditingMenu[cat].push(val);
    input.value = '';
    renderMenuPills();
  }
}

function removeDishTag(cat, idx) {
  currentEditingMenu[cat]?.splice(idx, 1);
  renderMenuPills();
}

// Quick Dish Picker from Menu Bank
function filterMenuBankPills(query) {
  const container = document.getElementById('quickDishPillsContainer');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();
  const allDishes = masterDishes.length > 0 ? masterDishes : DEFAULT_MASTER_DISHES;

  let filtered = allDishes;
  if (q) {
    filtered = allDishes.filter(d => d.name.toLowerCase().includes(q) || (d.category && d.category.toLowerCase().includes(q)));
  } else {
    filtered = allDishes.slice(0, 35);
  }

  container.innerHTML = filtered.map(d => `
    <button type="button" onclick="pickDishFromBank('${d.name.replace(/'/g, "\\'")}', '${d.category || 'mains'}')" 
      class="px-2.5 py-1 bg-[#1C1C1E] hover:bg-[#E53935] hover:text-white border border-[#2C2C2E] rounded-lg text-[11px] text-white transition active:scale-95 flex items-center gap-1">
      <span>+</span> ${d.name}
    </button>
  `).join('');
}

function pickDishFromBank(dishName, defaultCat) {
  const targetSelect = document.getElementById('quickMenuTargetCat');
  let cat = defaultCat || 'mains';
  if (targetSelect && targetSelect.value && targetSelect.value !== 'auto') {
    cat = targetSelect.value;
  }
  if (!currentEditingMenu[cat]) currentEditingMenu[cat] = [];
  if (!currentEditingMenu[cat].includes(dishName)) {
    currentEditingMenu[cat].push(dishName);
    renderMenuPills();
  }
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

  const allDishes = masterDishes.length > 0 ? masterDishes : DEFAULT_MASTER_DISHES;
  container.innerHTML = `
    <div class="apple-card p-4 rounded-3xl border border-[#2C2C2E] space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold text-[#E53935] uppercase">Pre-Loaded Banquet & Sadya Menu Bank (${allDishes.length} Items)</h3>
        <button onclick="openAddDishModal()" class="px-2.5 py-1 bg-[#E53935] text-white rounded-lg text-[11px] font-bold">+ New Dish</button>
      </div>
      <div class="flex flex-wrap gap-1.5 pt-1 max-h-72 overflow-y-auto pr-1">
        ${allDishes.map(d => `
          <span class="px-2.5 py-1 bg-black border border-[#2C2C2E] rounded-lg text-xs text-white">
            ${d.name}
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

// ==========================================
// 10. NOTIFICATIONS & ALARM SETTINGS
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
  if (kp) kp.checked = s.kitchenPrep !== false;
  if (vd) vd.checked = s.vanDeparture !== false;
  if (gr) gr.checked = s.googleReview !== false;
}

function saveNotifSettings() {
  const s = {
    kitchenPrep: document.getElementById('notifKitchenPrep')?.checked ?? true,
    vanDeparture: document.getElementById('notifVanDeparture')?.checked ?? true,
    googleReview: document.getElementById('notifGoogleReview')?.checked ?? true
  };
  localStorage.setItem('vv_notif_settings', JSON.stringify(s));
}

// Operational Radar (48h lock & today events)
function renderOpsRadar() {
  const container = document.getElementById('kitchenOpsRadar') || document.getElementById('opsRadarContent');
  if (!container) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const in48h = new Date(now.getTime() + 48 * 3600 * 1000).toISOString().split('T')[0];

  const todayEvents = events.filter(e => e.date === todayStr);
  const lockEvents = events.filter(e => e.date > todayStr && e.date <= in48h);

  if (todayEvents.length === 0 && lockEvents.length === 0) {
    container.innerHTML = '<p class="text-xs text-[#8E8E93]">No immediate kitchen preps or van dispatches in the next 48 hours.</p>';
    return;
  }

  let html = '';
  if (todayEvents.length > 0) {
    html += `<div class="space-y-1"><span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">🚨 Today's Food Delivery Vans:</span>`;
    todayEvents.forEach(e => {
      html += `
        <div class="p-2.5 bg-black rounded-xl border border-emerald-500/30 flex justify-between items-center text-xs">
          <div>
            <strong class="text-white block">${e.title}</strong>
            <span class="text-[10px] text-[#8E8E93]">${e.time || '11:30 AM'} • ${e.guests} Plates • ${e.venue || 'Neyyattinkara'}</span>
          </div>
          <button onclick="openWhatsAppDeliveryUpdate('${e.id}')" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">Van Out</button>
        </div>
      `;
    });
    html += '</div>';
  }

  if (lockEvents.length > 0) {
    html += `<div class="space-y-1 pt-1"><span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">⏰ 48-Hour Headcount Lock:</span>`;
    lockEvents.forEach(e => {
      html += `
        <div class="p-2.5 bg-black rounded-xl border border-amber-500/30 flex justify-between items-center text-xs">
          <div>
            <strong class="text-white block">${e.title}</strong>
            <span class="text-[10px] text-[#8E8E93]">${formatDisplayDate(e.date)} • ${e.guests} Plates</span>
          </div>
          <button onclick="openWhatsAppHeadcountLock('${e.id}')" class="px-2.5 py-1 bg-amber-500 text-black rounded-lg text-[10px] font-bold">Lock Count</button>
        </div>
      `;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

// .ics Calendar Alarm Generator
function downloadEventICS(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  const dateClean = ev.date.replace(/-/g, '');
  const startDT = `${dateClean}T060000`;
  const endDT = `${dateClean}T150000`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VV Catering Neyyattinkara//Catering Ops//EN',
    'BEGIN:VEVENT',
    `UID:${ev.id}@vvcatering.in`,
    `DTSTAMP:${dateClean}T000000Z`,
    `DTSTART:${startDT}`,
    `DTEND:${endDT}`,
    `SUMMARY:${ev.title} (${ev.guests} Plates)`,
    `DESCRIPTION:Catering banquet at ${ev.venue || 'Mamkoottam'}. Balance: ₹${((ev.budget || 0) - (ev.advance || 0))}`,
    `LOCATION:${ev.venue || 'Mamkoottam, Neyyattinkara'}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Catering Prep: 24 Hours to Service',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Delivery Van Departure: 3 Hours to Service',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${ev.title.replace(/\s+/g, '_')}_Alarms.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// WhatsApp Milestones
function openWhatsAppHeadcountLock(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  let msg = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `*HEADCOUNT CONFIRMATION (48-HOUR LOCK)*\n`;
  msg += `------------------------------------\n`;
  msg += `Dear Client,\n`;
  msg += `Your catering event *${ev.title}* is scheduled for *${formatDisplayDate(ev.date)}* at *${ev.venue || 'your venue'}*.\n\n`;
  msg += `Current booked plates: *${ev.guests} Plates*.\n`;
  msg += `As we are procuring fresh ingredients from Chalai wholesale market tomorrow morning, please confirm if there are any final additions to your guest count today.\n\n`;
  msg += `Thank you! 🙏\n`;
  msg += `V.V Catering, Neyyattinkara • Ph: 8281857273`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function openWhatsAppDeliveryUpdate(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  let msg = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `*FOOD DELIVERY VAN DISPATCHED 🚚*\n`;
  msg += `------------------------------------\n`;
  msg += `Our catering delivery van has departed from our Mamkoottam kitchen towards your venue: *${ev.venue || 'Venue'}*.\n\n`;
  msg += `Serving time: *${ev.time || '11:30 AM'}*\n`;
  msg += `Total banquet plates: *${ev.guests} Plates*\n\n`;
  msg += `Our service team is on board for buffet / table setup. See you shortly! 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function sendGoogleReviewWhatsApp(eventId) {
  const ev = events.find(e => e.id === eventId);
  if (!ev) return;

  let msg = `*🍽️ V.V EVENTS & CATERING SERVICE*\n`;
  msg += `Dear Client,\n`;
  msg += `It was an honor catering for *${ev.title}*! We hope you and your guests enjoyed the feast.\n\n`;
  msg += `Could you please take 30 seconds to leave us a 5-star review on Google? Your review helps our local Neyyattinkara catering business grow:\n\n`;
  msg += `⭐ https://maps.app.goo.gl/kH4Ey2bZwa6aDzfQA\n\n`;
  msg += `Thank you from V.V Catering! 🙏`;

  const phone = sanitizePhoneNumber(ev.phone);
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function deleteEvent(eventId) {
  if (confirm('Are you sure you want to delete this event?')) {
    events = events.filter(e => e.id !== eventId);
    persistEvents();
    renderOpsRadar();
    renderEvents();
    renderCalendar();
  }
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.className = 'filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#2C2C2E] text-[#8E8E93]';
  });
  const activeBtn = document.getElementById(`filterBtn-${filter}`);
  if (activeBtn) activeBtn.className = 'filter-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E53935] text-white';
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
            ${ev.ratePerPlate ? `<span class="text-[10px] text-[#8E8E93] block">@ ₹${ev.ratePerPlate}/plate</span>` : ''}
          </div>
          <div class="bg-black p-3 rounded-2xl border border-[#2C2C2E]">
            <span class="text-[10px] text-[#8E8E93] block">Balance Due</span>
            <span class="text-base font-bold text-white">₹${balance > 0 ? balance.toLocaleString() : 'Settled'}</span>
            <span class="text-[10px] text-[#8E8E93] block">Total: ₹${(ev.budget || 0).toLocaleString()}</span>
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
  document.getElementById('evRatePerPlate').value = ev.ratePerPlate || '';
  document.getElementById('evVenue').value = ev.venue || '';
  document.getElementById('evPhone').value = ev.phone || '';
  document.getElementById('evPhone2').value = ev.phone2 || '';
  document.getElementById('evBudget').value = ev.budget || '';
  document.getElementById('evAdvance').value = ev.advance || '';
  document.getElementById('evServiceStyle').value = ev.serviceStyle || 'Traditional Sadya (ഇലയിൽ)';
  document.getElementById('evNotes').value = ev.notes || '';

  currentEditingMenu = ev.dishes || { mains: [], starters: [], breads: [], desserts: [], drinks: [] };
  renderMenuPills();
  filterMenuBankPills('');

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

  const text = `Catering Booking: ${ev.title} on ${formatDisplayDate(ev.date)} (${ev.guests} Plates) - V.V Events Neyyattinkara`;
  if (navigator.share) {
    navigator.share({ title: ev.title, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => alert('Event summary copied to clipboard!'));
  }
}

function togglePlatesSection() {
  const req = document.getElementById('evPlatesReq')?.checked;
  const box = document.getElementById('platesDetailBox') || document.getElementById('platesConfigBox');
  if (box) {
    if (req) box.classList.remove('hidden');
    else box.classList.add('hidden');
  }
}

function toggleBillType() {
  currentBillType = currentBillType === 'invoice' ? 'estimate' : 'invoice';
  const btn = document.getElementById('toggleBillTypeBtn');
  if (btn) btn.innerText = currentBillType === 'invoice' ? 'Switch to Estimate' : 'Switch to Invoice';
  if (currentViewingEventId) openBillModal(currentViewingEventId, currentBillType);
}

// Demo Data Loader (Diverse Banquets & Sadyas)
function loadDemoData(force = true) {
  if (!force && events.length > 0) return;

  const today = new Date();
  const d1 = new Date(today.getTime() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const d2 = new Date(today.getTime() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0];

  events = [
    {
      id: 'demo_1',
      title: 'Arun & Divya Grand Wedding Reception',
      status: 'Confirmed',
      date: d1,
      time: '12:30',
      guests: 500,
      ratePerPlate: 450,
      venue: 'Sree Padmanabha Auditorium, Neyyattinkara',
      phone: '918281857273',
      phone2: '919072721633',
      budget: 225000,
      advance: 75000,
      serviceStyle: 'Buffet Counter',
      plates: { required: true, type: 'Melamine Heavy', count: 500 },
      dishes: {
        mains: ['Dindigul Thalappakatti Seeraga Samba Mutton Biryani', 'Tamil Nadu Ennai Kathirikai (Brinjal Salna)', 'Neyyattinkara Beef Ularthiyathu'],
        starters: ['Chicken 65 Crispy Fry', 'Onion Cucumber Pachadi (Raita)', 'Sweet & Sour Dates Pickle'],
        breads: ['Fluffy Kerala Malabar Porotta', 'Boiled Egg Pepper Fry'],
        desserts: ['4-Tier Flowing Chocolate Fountain with Fresh Fruits', 'Assorted Ice Cream Bar (Vanilla, Strawberry)', 'Hot Gulab Jamun with Shahi Rabri'],
        drinks: ['Kulukki Sarbath (കുലുക്കി സർബത്ത്)', 'Fresh Mint Lime Juice']
      },
      notes: 'VIP buffet setup on stage by 11:45 AM. Chocolate fountain near main entrance.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'demo_2',
      title: 'Lakshmi Temple Traditional Sadya',
      status: 'Booked',
      date: d2,
      time: '11:30',
      guests: 350,
      ratePerPlate: 220,
      venue: 'Mamkoottam Community Hall',
      phone: '919447012345',
      phone2: '',
      budget: 77000,
      advance: 25000,
      serviceStyle: 'Traditional Sadya (ഇലയിൽ)',
      plates: { required: true, type: 'Banana Leaf Paper Plates', count: 400 },
      dishes: {
        mains: ['Neyyattinkara Sambar (സാമ്പാർ)', 'Travancore Avial (അവിയൽ)', 'Neyyum Parippum (നെയ്യും പരിപ്പും)', 'Kalan (കാളൻ)', 'Olan (ഓലൻ)', 'Mathanga Erissery (മത്തങ്ങ എരിശ്ശേരി)'],
        starters: ['Inji Puli / Puli Inji (ഇഞ്ചിപ്പുളി)', 'Kadu Manga Achar', 'Crispy Sharkkara Varatti & Upperi'],
        breads: ['Kerala Jaya / Matta Rice (ചോറ്)', 'Crispy Large Kerala Pappadam'],
        desserts: ['Palada Pradhaman (പാലട പ്രഥമൻ)', 'Parippu Pradhaman with Coconut Milk'],
        drinks: []
      },
      notes: '3 rounds of traditional leaf service. Morning prep starts 4:30 AM.',
      updatedAt: new Date().toISOString()
    }
  ];

  persistEvents();
  renderOpsRadar();
  renderEvents();
  renderCalendar();
}

// Data Export & Import
function exportToCSV() {
  if (events.length === 0) {
    alert('No events to export.');
    return;
  }

  let csv = 'ID,Event Title,Date,Time,Guests,Rate Per Plate,Budget,Advance,Balance,Status,Phone,Venue\n';
  events.forEach(e => {
    const bal = (e.budget || 0) - (e.advance || 0);
    csv += `"${e.id}","${e.title}","${e.date}","${e.time || ''}",${e.guests || 0},${e.ratePerPlate || 0},${e.budget || 0},${e.advance || 0},${bal},"${e.status}","${e.phone || ''}","${(e.venue || '').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VV_Catering_Events_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportDataToFile() {
  const data = JSON.stringify({
    events,
    masterDishes,
    savedVendors,
    exportedAt: new Date().toISOString()
  }, null, 2);

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VV_Catering_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataFromFile(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target?.result);
      if (Array.isArray(data.events)) {
        events = data.events;
        persistEvents();
      }
      if (Array.isArray(data.savedVendors)) {
        savedVendors = data.savedVendors;
        persistSavedVendors();
      }
      if (Array.isArray(data.masterDishes)) {
        masterDishes = data.masterDishes;
      }
      initApp();
      alert('Data backup successfully restored!');
    } catch (err) {
      alert('Invalid backup file format.');
    }
  };
  reader.readAsText(file);
}
