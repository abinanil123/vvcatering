/**
 * CaterLog Pro — Core IndexedDB Storage Layer (js/db.js)
 * Implements window.CaterLogDB interface contract
 * Offline-first, Blob-compatible, multi-tab broadcast, outbox sync queue
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const dbExport = factory();
    root.CaterLogDB = dbExport;
    if (typeof window !== 'undefined') {
      window.CaterLogDB = dbExport;
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DB_NAME = 'caterlog_db';
  const DB_VERSION = 1;
  const SYNC_CHANNEL_NAME = 'caterlog_sync';

  const STORES = {
    EVENTS: 'events',
    MASTER_DISHES: 'master_dishes',
    SUPPLIERS: 'suppliers',
    EXPENSES: 'expenses',
    RECEIPTS: 'receipts',
    SETTINGS: 'settings',
    SYNC_QUEUE: 'sync_queue'
  };

  const DEFAULT_MASTER_DISHES = [
    // Traditional Travancore Sadya Dishes
    { category: 'mains', name: 'അവിയൽ (Avial)' },
    { category: 'mains', name: 'സാമ്പാർ (Varutharacha Sambar)' },
    { category: 'mains', name: 'ഓലൻ (Olan)' },
    { category: 'mains', name: 'കാളൻ (Kurukku Kalan)' },
    { category: 'mains', name: 'കൂട്ടുകറി (Koottukari)' },
    { category: 'mains', name: 'എരിശ്ശേരി (Erissery)' },
    { category: 'mains', name: 'തീയ്യൽ (Ulli Theeyal)' },
    { category: 'mains', name: 'തോരൻ (Beans / Cabbage Thoran)' },
    { category: 'mains', name: 'പച്ചടി (Pineapple / Beetroot Pachadi)' },
    { category: 'mains', name: 'കിച്ചടി (Vellarikka Kichadi)' },
    { category: 'mains', name: 'പരിപ്പും നെയ്യും (Parippu & Pure Ghee)' },
    { category: 'mains', name: 'തക്കാളി രസം (Tomato Rasam)' },
    { category: 'mains', name: 'കാച്ചിയ മോര് (Moru Curry)' },
    // Travancore Pickles (Achars)
    { category: 'starters', name: 'കടുമാങ്ങ അച്ചാർ (Kadumanga Achar)' },
    { category: 'starters', name: 'ഇഞ്ചിപ്പുളി (Inji Puli / Puli Inji)' },
    { category: 'starters', name: 'വറുത്ത നാരങ്ങ അച്ചാർ (Naranga Achar)' },
    { category: 'starters', name: 'നെല്ലിക്ക അച്ചാർ (Nellikka Achar)' },
    { category: 'starters', name: 'വെളുത്തുള്ളി അച്ചാർ (Veluthulli Achar)' },
    { category: 'starters', name: 'ഈന്തപ്പഴം-നാരങ്ങ (Dates-Lime Achar)' },
    // Crisps & Savouries
    { category: 'starters', name: 'നേന്ത്രക്കായ വറുത്തത് (Banana Chips / Upperi)' },
    { category: 'starters', name: 'ശർക്കരവരട്ടി (Sharkara Upperi)' },
    { category: 'starters', name: 'പപ്പടം (Pappadam)' },
    // Payasams & Desserts
    { category: 'desserts', name: 'അടപ്രഥമൻ (Ada Pradhaman)' },
    { category: 'desserts', name: 'പാൽപായസം (Paalada Payasam)' },
    { category: 'desserts', name: 'പരിപ്പ് പ്രഥമൻ (Parippu Payasam)' },
    { category: 'desserts', name: 'തിരുവനന്തപുരം ബോളി (Trivandrum Boli)' },
    { category: 'desserts', name: 'റസകദളി പഴം (Rasakadali Banana)' },
    // Feast Breads & Rice
    { category: 'breads', name: 'കേരള പൊറോട്ട (Kerala Porotta)' },
    { category: 'breads', name: 'വെള്ളയപ്പം (Vellayappam)' },
    { category: 'breads', name: 'ഇടിയപ്പം (Idiyappam)' },
    { category: 'breads', name: 'ജീരകശാല നെയ്ച്ചോറ് (Jeerakasala Ghee Rice)' },
    // Travancore Non-Veg Specialties
    { category: 'mains', name: 'നെയ്യാറ്റിൻകര ബീഫ് ഉലർത്തിയത് (Neyyattinkara Beef Ularthiyathu)' },
    { category: 'mains', name: 'കേരള ചിക്കൻ റോസ്റ്റ് (Kerala Naadan Chicken Roast)' },
    { category: 'mains', name: 'മലബാർ ചിക്കൻ ദം ബിരിയാണി (Malabar Chicken Dum Biryani)' },
    { category: 'mains', name: 'മട്ടൻ ദം ബിരിയാണി (Mutton Dum Biryani)' },
    { category: 'mains', name: 'കരിമീൻ / മീൻ പൊള്ളിച്ചത് (Fish Pollichathu)' },
    { category: 'mains', name: 'മട്ടൻ സ്റ്റൂ (Travancore Mutton Stew)' },
    { category: 'drinks', name: 'സുലൈമാനി (Mint Sulaimani)' },
    { category: 'drinks', name: 'കരിക്കിൻ വെള്ളം (Tender Coconut Water)' }
  ];

  let dbInstance = null;
  let initPromise = null;

  function getIDBFactory() {
    if (typeof indexedDB !== 'undefined') return indexedDB;
    if (typeof window !== 'undefined' && window.indexedDB) return window.indexedDB;
    if (typeof globalThis !== 'undefined' && globalThis.indexedDB) return globalThis.indexedDB;
    return null;
  }

  function broadcastChange(storeName, action, recordId) {
    const ChannelClass = typeof BroadcastChannel !== 'undefined'
      ? BroadcastChannel
      : (typeof globalThis !== 'undefined' && globalThis.BroadcastChannel ? globalThis.BroadcastChannel : null);

    if (ChannelClass) {
      try {
        const channel = new ChannelClass(SYNC_CHANNEL_NAME);
        channel.postMessage({
          type: 'IDB_MUTATION',
          store: storeName,
          entity: storeName,
          action: action,
          recordId: recordId,
          id: recordId,
          timestamp: Date.now()
        });
        if (typeof channel.close === 'function') {
          channel.close();
        }
      } catch (e) {
        // Channel postMessage might be unavailable or restricted
      }
    }
  }

  function reqToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
    });
  }

  function txToPromise(tx) {
    return new Promise((resolve, reject) => {
      if (tx._completed || tx.readyState === 'done') {
        return resolve();
      }
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
      tx.onerror = () => reject(tx.error || new Error('Transaction error'));
    });
  }

  async function openDatabase() {
    const idb = getIDBFactory();
    if (!idb) {
      throw new Error('IndexedDB is not supported in this runtime environment.');
    }

    return new Promise((resolve, reject) => {
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // 1. events
        if (!db.objectStoreNames.contains(STORES.EVENTS)) {
          const eventsStore = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' });
          eventsStore.createIndex('by_date', 'date', { unique: false });
          eventsStore.createIndex('by_status', 'status', { unique: false });
          eventsStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
        }

        // 2. master_dishes
        if (!db.objectStoreNames.contains(STORES.MASTER_DISHES)) {
          const dishesStore = db.createObjectStore(STORES.MASTER_DISHES, { keyPath: 'id' });
          dishesStore.createIndex('by_category', 'category', { unique: false });
          dishesStore.createIndex('by_name', 'name', { unique: false });
          dishesStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
        }

        // 3. suppliers
        if (!db.objectStoreNames.contains(STORES.SUPPLIERS)) {
          const suppStore = db.createObjectStore(STORES.SUPPLIERS, { keyPath: 'id' });
          suppStore.createIndex('by_category', 'category', { unique: false });
          suppStore.createIndex('by_name', 'name', { unique: false });
          suppStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
        }

        // 4. expenses
        if (!db.objectStoreNames.contains(STORES.EXPENSES)) {
          const expStore = db.createObjectStore(STORES.EXPENSES, { keyPath: 'id' });
          expStore.createIndex('by_eventId', 'eventId', { unique: false });
          expStore.createIndex('by_date', 'date', { unique: false });
          expStore.createIndex('by_category', 'category', { unique: false });
          expStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
        }

        // 5. receipts
        if (!db.objectStoreNames.contains(STORES.RECEIPTS)) {
          const rcptStore = db.createObjectStore(STORES.RECEIPTS, { keyPath: 'id' });
          rcptStore.createIndex('by_eventId', 'eventId', { unique: false });
          rcptStore.createIndex('by_expenseId', 'expenseId', { unique: false });
          rcptStore.createIndex('by_createdAt', 'createdAt', { unique: false });
        }

        // 6. settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          const settStore = db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
          settStore.createIndex('by_updatedAt', 'updatedAt', { unique: false });
        }

        // 7. sync_queue
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('by_status', 'status', { unique: false });
          syncStore.createIndex('by_timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('by_store', 'store', { unique: false });
        }
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        if (dbInstance) {
          dbInstance.onversionchange = () => {
            if (dbInstance) {
              dbInstance.close();
              dbInstance = null;
            }
          };
        }
        resolve(dbInstance);
      };

      request.onerror = () => reject(request.error || new Error('Failed to open database'));
      request.onblocked = () => console.warn('[CaterLogDB] Database upgrade blocked by another tab.');
    });
  }

  async function getDB() {
    if (dbInstance) return dbInstance;
    if (!initPromise) {
      initPromise = openDatabase().then(async (db) => {
        await runAutomaticMigration(db);
        return db;
      });
    }
    return initPromise;
  }

  async function runAutomaticMigration(db) {
    let storageObj = null;
    if (typeof localStorage !== 'undefined') {
      storageObj = localStorage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      storageObj = window.localStorage;
    } else if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      storageObj = globalThis.localStorage;
    }
    if (!storageObj) return;

    try {
      const alreadyMigrated = storageObj.getItem('caterlog_migrated_to_idb');
      if (alreadyMigrated === 'true') return;

      const rawEvents = storageObj.getItem('caterlog_events');
      const rawDishes = storageObj.getItem('caterlog_master_dishes');

      let legacyEvents = [];
      let legacyDishes = [];

      if (rawEvents) {
        try {
          legacyEvents = JSON.parse(rawEvents);
        } catch (e) {
          console.warn('[CaterLogDB] Corrupt legacy events JSON:', e);
        }
      }
      if (rawDishes) {
        try {
          legacyDishes = JSON.parse(rawDishes);
        } catch (e) {
          console.warn('[CaterLogDB] Corrupt legacy dishes JSON:', e);
        }
      }

      if (!Array.isArray(legacyDishes) || legacyDishes.length === 0) {
        legacyDishes = DEFAULT_MASTER_DISHES;
      }

      const tx = db.transaction([STORES.EVENTS, STORES.MASTER_DISHES], 'readwrite');
      const eventsStore = tx.objectStore(STORES.EVENTS);
      const dishesStore = tx.objectStore(STORES.MASTER_DISHES);

      if (Array.isArray(legacyEvents)) {
        for (const ev of legacyEvents) {
          if (!ev.id) {
            ev.id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          }
          if (!ev.createdAt) ev.createdAt = new Date().toISOString();
          if (!ev.updatedAt) ev.updatedAt = ev.createdAt;
          const budgetNum = Number(ev.budget) || 0;
          const advanceNum = Number(ev.advance) || 0;
          if (ev.balance === undefined) {
            ev.balance = Math.max(0, budgetNum - advanceNum);
          }
          eventsStore.put(ev);
        }
      }

      if (Array.isArray(legacyDishes)) {
        for (const d of legacyDishes) {
          if (!d.id) {
            const slug = (d.name || 'dish').toLowerCase().replace(/[^a-z0-9]/g, '_');
            d.id = 'dish_' + (d.category || 'general') + '_' + slug;
          }
          if (!d.createdAt) d.createdAt = new Date().toISOString();
          if (!d.updatedAt) d.updatedAt = d.createdAt;
          dishesStore.put(d);
        }
      }

      await txToPromise(tx);
      storageObj.setItem('caterlog_migrated_to_idb', 'true');
      console.log('[CaterLogDB] Successfully migrated legacy localStorage to IndexedDB.');
    } catch (err) {
      console.error('[CaterLogDB] Migration from localStorage failed:', err);
      // Mark as migrated anyway to prevent infinite retry loops on corrupt structures
      try {
        storageObj.setItem('caterlog_migrated_to_idb', 'true');
      } catch (e) {}
    }
  }

  // CaterLogDB API
  const CaterLogDB = {
    async init() {
      await getDB();
    },

    async getDB() {
      return await getDB();
    },

    isMigrated() {
      const storageObj = typeof localStorage !== 'undefined'
        ? localStorage
        : (typeof globalThis !== 'undefined' && globalThis.localStorage ? globalThis.localStorage : null);
      if (storageObj) {
        return storageObj.getItem('caterlog_migrated_to_idb') === 'true';
      }
      return false;
    },

    // --- EVENTS ---
    async getEvents() {
      const db = await getDB();
      const tx = db.transaction(STORES.EVENTS, 'readonly');
      const store = tx.objectStore(STORES.EVENTS);
      const results = await reqToPromise(store.getAll());
      // Sort ascending by date
      results.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      return results;
    },

    async getEventById(id) {
      if (!id) return null;
      const db = await getDB();
      const tx = db.transaction(STORES.EVENTS, 'readonly');
      const store = tx.objectStore(STORES.EVENTS);
      const res = await reqToPromise(store.get(id));
      return res || null;
    },

    async saveEvent(event) {
      if (!event) throw new Error('Event object is required');
      if (!event.id) {
        event.id = 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      }
      const now = new Date().toISOString();
      if (!event.createdAt) event.createdAt = now;
      event.updatedAt = now;

      // Calculate balance if budget and advance are present
      const budgetNum = Number(event.budget) || 0;
      const advanceNum = Number(event.advance) || 0;
      event.balance = Math.max(0, budgetNum - advanceNum);

      const db = await getDB();
      const tx = db.transaction(STORES.EVENTS, 'readwrite');
      tx.objectStore(STORES.EVENTS).put(event);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'upsert',
        store: STORES.EVENTS,
        recordId: event.id,
        payload: event
      });

      broadcastChange(STORES.EVENTS, 'upsert', event.id);
      return event;
    },

    async deleteEvent(id) {
      if (!id) return;
      const db = await getDB();
      const txRead = db.transaction(STORES.EXPENSES, 'readonly');
      const expIndex = txRead.objectStore(STORES.EXPENSES).index('by_eventId');
      const linkedExpenses = await reqToPromise(expIndex.getAll(id));

      const txReadRcpt = db.transaction(STORES.RECEIPTS, 'readonly');
      const rcptIndex = txReadRcpt.objectStore(STORES.RECEIPTS).index('by_eventId');
      const linkedReceipts = await reqToPromise(rcptIndex.getAll(id));

      const tx = db.transaction([STORES.EVENTS, STORES.EXPENSES, STORES.RECEIPTS], 'readwrite');
      const txPromise = txToPromise(tx);
      const eventsStore = tx.objectStore(STORES.EVENTS);
      const expensesStore = tx.objectStore(STORES.EXPENSES);
      const receiptsStore = tx.objectStore(STORES.RECEIPTS);

      eventsStore.delete(id);
      for (const exp of linkedExpenses) {
        expensesStore.delete(exp.id);
        if (exp.receiptId) {
          receiptsStore.delete(exp.receiptId);
        }
      }
      for (const rcpt of linkedReceipts) {
        receiptsStore.delete(rcpt.id);
      }

      await txPromise;

      await this.queueMutation({
        action: 'delete',
        store: STORES.EVENTS,
        recordId: id,
        payload: null
      });

      broadcastChange(STORES.EVENTS, 'delete', id);
    },

    // --- MASTER DISHES ---
    async getMasterDishes() {
      const db = await getDB();
      const tx = db.transaction(STORES.MASTER_DISHES, 'readonly');
      const store = tx.objectStore(STORES.MASTER_DISHES);
      return await reqToPromise(store.getAll());
    },

    async getMasterDishById(id) {
      if (!id) return null;
      const db = await getDB();
      const tx = db.transaction(STORES.MASTER_DISHES, 'readonly');
      const store = tx.objectStore(STORES.MASTER_DISHES);
      const res = await reqToPromise(store.get(id));
      return res || null;
    },

    async saveMasterDish(dish) {
      if (!dish) throw new Error('Dish object is required');
      if (!dish.id) {
        const slug = (dish.name || 'dish').toLowerCase().replace(/[^a-z0-9]/g, '_');
        dish.id = 'dish_' + (dish.category || 'general') + '_' + slug;
      }
      const now = new Date().toISOString();
      if (!dish.createdAt) dish.createdAt = now;
      dish.updatedAt = now;

      const db = await getDB();
      const tx = db.transaction(STORES.MASTER_DISHES, 'readwrite');
      tx.objectStore(STORES.MASTER_DISHES).put(dish);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'upsert',
        store: STORES.MASTER_DISHES,
        recordId: dish.id,
        payload: dish
      });

      broadcastChange(STORES.MASTER_DISHES, 'upsert', dish.id);
      return dish;
    },

    async deleteMasterDish(id) {
      if (!id) return;
      const db = await getDB();
      const tx = db.transaction(STORES.MASTER_DISHES, 'readwrite');
      tx.objectStore(STORES.MASTER_DISHES).delete(id);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'delete',
        store: STORES.MASTER_DISHES,
        recordId: id,
        payload: null
      });

      broadcastChange(STORES.MASTER_DISHES, 'delete', id);
    },

    // --- SUPPLIERS ---
    async getSuppliers(category) {
      const db = await getDB();
      const tx = db.transaction(STORES.SUPPLIERS, 'readonly');
      const store = tx.objectStore(STORES.SUPPLIERS);
      if (category) {
        const index = store.index('by_category');
        return await reqToPromise(index.getAll(category));
      }
      return await reqToPromise(store.getAll());
    },

    async saveSupplier(supplier) {
      if (!supplier) throw new Error('Supplier object is required');
      if (!supplier.id) {
        supplier.id = 'supp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      }
      const now = new Date().toISOString();
      if (!supplier.createdAt) supplier.createdAt = now;
      supplier.updatedAt = now;

      const db = await getDB();
      const tx = db.transaction(STORES.SUPPLIERS, 'readwrite');
      tx.objectStore(STORES.SUPPLIERS).put(supplier);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'upsert',
        store: STORES.SUPPLIERS,
        recordId: supplier.id,
        payload: supplier
      });

      broadcastChange(STORES.SUPPLIERS, 'upsert', supplier.id);
      return supplier;
    },

    async deleteSupplier(id) {
      if (!id) return;
      const db = await getDB();
      const tx = db.transaction(STORES.SUPPLIERS, 'readwrite');
      tx.objectStore(STORES.SUPPLIERS).delete(id);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'delete',
        store: STORES.SUPPLIERS,
        recordId: id,
        payload: null
      });

      broadcastChange(STORES.SUPPLIERS, 'delete', id);
    },

    // --- EXPENSES ---
    async getExpenses(eventId) {
      const db = await getDB();
      const tx = db.transaction(STORES.EXPENSES, 'readonly');
      const store = tx.objectStore(STORES.EXPENSES);
      if (eventId) {
        const index = store.index('by_eventId');
        return await reqToPromise(index.getAll(eventId));
      }
      return await reqToPromise(store.getAll());
    },

    async getExpenseById(id) {
      if (!id) return null;
      const db = await getDB();
      const tx = db.transaction(STORES.EXPENSES, 'readonly');
      const store = tx.objectStore(STORES.EXPENSES);
      const res = await reqToPromise(store.get(id));
      return res || null;
    },

    async saveExpense(expense) {
      if (!expense) throw new Error('Expense object is required');
      if (!expense.id) {
        expense.id = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      }
      const now = new Date().toISOString();
      if (!expense.createdAt) expense.createdAt = now;
      expense.updatedAt = now;
      expense.amount = Number(expense.amount) || 0;

      const db = await getDB();
      const tx = db.transaction(STORES.EXPENSES, 'readwrite');
      tx.objectStore(STORES.EXPENSES).put(expense);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'upsert',
        store: STORES.EXPENSES,
        recordId: expense.id,
        payload: expense
      });

      broadcastChange(STORES.EXPENSES, 'upsert', expense.id);
      return expense;
    },

    async deleteExpense(id) {
      if (!id) return;
      const db = await getDB();
      const txRead = db.transaction(STORES.EXPENSES, 'readonly');
      const exp = await reqToPromise(txRead.objectStore(STORES.EXPENSES).get(id));

      const tx = db.transaction([STORES.EXPENSES, STORES.RECEIPTS], 'readwrite');
      const txPromise = txToPromise(tx);
      const expStore = tx.objectStore(STORES.EXPENSES);
      const rcptStore = tx.objectStore(STORES.RECEIPTS);

      if (exp && exp.receiptId) {
        rcptStore.delete(exp.receiptId);
      }
      expStore.delete(id);
      await txPromise;

      await this.queueMutation({
        action: 'delete',
        store: STORES.EXPENSES,
        recordId: id,
        payload: null
      });

      broadcastChange(STORES.EXPENSES, 'delete', id);
    },

    // --- RECEIPTS (BLOB & BASE64 STORAGE) ---
    async saveReceiptImage(id, blobOrDataUrl, meta = {}) {
      if (!id) throw new Error('Receipt ID is required');
      if (!blobOrDataUrl) throw new Error('Receipt image data is required');

      let mimeType = 'image/jpeg';
      let fileSize = 0;

      if (typeof Blob !== 'undefined' && blobOrDataUrl instanceof Blob) {
        mimeType = blobOrDataUrl.type || 'image/jpeg';
        fileSize = blobOrDataUrl.size;
      } else if (typeof blobOrDataUrl === 'string') {
        fileSize = blobOrDataUrl.length;
        if (blobOrDataUrl.startsWith('data:')) {
          const match = blobOrDataUrl.match(/^data:([^;]+);/);
          if (match) mimeType = match[1];
        }
      }

      const now = new Date().toISOString();
      const record = {
        id: id,
        expenseId: meta.expenseId || id,
        eventId: meta.eventId || '',
        data: blobOrDataUrl,
        mimeType: mimeType,
        fileSize: fileSize,
        fileName: meta.fileName || `receipt_${id}.jpg`,
        ocrData: meta.ocrData || null,
        createdAt: meta.createdAt || now,
        updatedAt: now
      };

      const db = await getDB();
      const tx = db.transaction(STORES.RECEIPTS, 'readwrite');
      tx.objectStore(STORES.RECEIPTS).put(record);
      await txToPromise(tx);

      broadcastChange(STORES.RECEIPTS, 'upsert', id);
    },

    async getReceiptImage(id) {
      if (!id) return null;
      const db = await getDB();
      const tx = db.transaction(STORES.RECEIPTS, 'readonly');
      const store = tx.objectStore(STORES.RECEIPTS);
      const record = await reqToPromise(store.get(id));
      return record ? record.data : null;
    },

    async getReceiptRecord(id) {
      if (!id) return null;
      const db = await getDB();
      const tx = db.transaction(STORES.RECEIPTS, 'readonly');
      const store = tx.objectStore(STORES.RECEIPTS);
      const record = await reqToPromise(store.get(id));
      return record || null;
    },

    async deleteReceiptImage(id) {
      if (!id) return;
      const db = await getDB();
      const tx = db.transaction(STORES.RECEIPTS, 'readwrite');
      tx.objectStore(STORES.RECEIPTS).delete(id);
      await txToPromise(tx);
      broadcastChange(STORES.RECEIPTS, 'delete', id);
    },

    // --- SETTINGS ---
    async getSettings() {
      const defaultSettings = {
        id: 'app_settings',
        businessName: 'CaterLog Pro Catering Services',
        ownerName: '',
        contactPhone: '',
        upiVpa: '',
        upiName: '',
        businessAddress: '',
        logoUrl: '',
        firebaseConfig: null,
        cloudSyncEnabled: false,
        autoBackupEnabled: true,
        updatedAt: new Date().toISOString()
      };

      const db = await getDB();
      const tx = db.transaction(STORES.SETTINGS, 'readonly');
      const store = tx.objectStore(STORES.SETTINGS);
      const record = await reqToPromise(store.get('app_settings'));
      return record ? Object.assign(defaultSettings, record) : defaultSettings;
    },

    async saveSettings(settings) {
      if (!settings) throw new Error('Settings object is required');
      settings.id = 'app_settings';
      settings.updatedAt = new Date().toISOString();

      const db = await getDB();
      const tx = db.transaction(STORES.SETTINGS, 'readwrite');
      tx.objectStore(STORES.SETTINGS).put(settings);
      await txToPromise(tx);

      await this.queueMutation({
        action: 'upsert',
        store: STORES.SETTINGS,
        recordId: 'app_settings',
        payload: settings
      });

      broadcastChange(STORES.SETTINGS, 'upsert', 'app_settings');
    },

    // --- OUTBOX SYNC QUEUE ---
    async queueMutation(mutation) {
      if (!mutation || (!mutation.store && !mutation.entity) || (!mutation.action && !mutation.type)) return;

      const storeName = mutation.store || mutation.entity;
      const actionName = mutation.action || mutation.type;
      const recordId = mutation.recordId || mutation.id || '';

      const record = {
        mutationId: mutation.mutationId || 'mut_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        action: actionName,
        type: actionName,
        store: storeName,
        entity: storeName,
        recordId: recordId,
        payload: mutation.payload || null,
        timestamp: mutation.timestamp || Date.now(),
        attempts: 0,
        status: 'pending',
        lastError: null
      };

      try {
        const db = await getDB();
        const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
        const txPromise = txToPromise(tx);
        tx.objectStore(STORES.SYNC_QUEUE).add(record);
        await txPromise;
      } catch (e) {
        console.warn('[CaterLogDB] Failed to queue mutation:', e);
      }
    },

    async getPendingMutations() {
      const db = await getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const index = store.index('by_status');
      const mutations = await reqToPromise(index.getAll('pending'));
      mutations.sort((a, b) => a.timestamp - b.timestamp);
      return mutations;
    },

    async getSyncQueue() {
      return await this.getPendingMutations();
    },

    async updateMutationStatus(id, status, error = null) {
      const db = await getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      const store = tx.objectStore(STORES.SYNC_QUEUE);
      const record = await reqToPromise(store.get(id));
      if (record) {
        record.status = status;
        if (error) record.lastError = error;
        record.attempts = (record.attempts || 0) + 1;
        store.put(record);
      }
      await txToPromise(tx);
    },

    async clearMutation(id) {
      const db = await getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      tx.objectStore(STORES.SYNC_QUEUE).delete(id);
      await txToPromise(tx);
    },

    async clearAllMutations() {
      const db = await getDB();
      const tx = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
      tx.objectStore(STORES.SYNC_QUEUE).clear();
      await txToPromise(tx);
    },

    async clearSyncQueue() {
      return await this.clearAllMutations();
    },

    // --- BACKUP & RESTORE ---
    async exportAllData() {
      const [events, dishes, suppliers, expenses, settings] = await Promise.all([
        this.getEvents(),
        this.getMasterDishes(),
        this.getSuppliers(),
        this.getExpenses(),
        this.getSettings()
      ]);

      return {
        version: 1,
        exportedAt: new Date().toISOString(),
        appName: 'CaterLog Pro',
        data: {
          events,
          master_dishes: dishes,
          suppliers,
          expenses,
          settings
        }
      };
    },

    async importAllData(backup) {
      if (!backup || !backup.data) throw new Error('Invalid backup file format');
      const { events, master_dishes, suppliers, expenses, settings } = backup.data;

      const db = await getDB();
      const tx = db.transaction(
        [STORES.EVENTS, STORES.MASTER_DISHES, STORES.SUPPLIERS, STORES.EXPENSES, STORES.SETTINGS],
        'readwrite'
      );

      if (Array.isArray(events)) {
        const store = tx.objectStore(STORES.EVENTS);
        for (const ev of events) store.put(ev);
      }
      if (Array.isArray(master_dishes)) {
        const store = tx.objectStore(STORES.MASTER_DISHES);
        for (const d of master_dishes) store.put(d);
      }
      if (Array.isArray(suppliers)) {
        const store = tx.objectStore(STORES.SUPPLIERS);
        for (const s of suppliers) store.put(s);
      }
      if (Array.isArray(expenses)) {
        const store = tx.objectStore(STORES.EXPENSES);
        for (const e of expenses) store.put(e);
      }
      if (settings && typeof settings === 'object') {
        const store = tx.objectStore(STORES.SETTINGS);
        store.put(settings);
      }

      await txToPromise(tx);
      broadcastChange('all', 'import', 'all');
    },

    // --- DIAGNOSTICS & RESET ---
    close() {
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
        initPromise = null;
      }
    },

    async clearDatabase() {
      const db = await getDB();
      const tx = db.transaction(
        [
          STORES.EVENTS,
          STORES.MASTER_DISHES,
          STORES.SUPPLIERS,
          STORES.EXPENSES,
          STORES.RECEIPTS,
          STORES.SETTINGS,
          STORES.SYNC_QUEUE
        ],
        'readwrite'
      );
      tx.objectStore(STORES.EVENTS).clear();
      tx.objectStore(STORES.MASTER_DISHES).clear();
      tx.objectStore(STORES.SUPPLIERS).clear();
      tx.objectStore(STORES.EXPENSES).clear();
      tx.objectStore(STORES.RECEIPTS).clear();
      tx.objectStore(STORES.SETTINGS).clear();
      tx.objectStore(STORES.SYNC_QUEUE).clear();
      await txToPromise(tx);
    }
  };

  return CaterLogDB;
});
