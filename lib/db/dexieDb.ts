/**
 * Dexie.js / IndexedDB Offline Storage Queue Engine
 * System: Kenanga Care
 */

export interface PendingMeasurement {
  id?: number;
  child_id: string;
  visit_date: string;
  weight?: string | number;
  weight_kg?: number;
  height?: string | number;
  height_cm?: number;
  head_circumference?: string | number;
  head_circ_cm?: number;
  muac?: string | number;
  muac_cm?: number;
  vitamin_a?: string;
  deworming?: boolean;
  pmt?: boolean;
  immunization?: string;
  notes?: string;
  timestamp?: string;
  synced?: boolean;
}

export interface PendingMaternalRecord {
  id?: number;
  mother_id: string;
  visit_date?: string;
  screening_date?: string;
  weight?: string | number;
  weight_kg?: number;
  blood_pressure?: string;
  systolic_bp?: number;
  diastolic_bp?: number;
  muac?: string | number;
  fundal_height?: string | number;
  fundal_height_cm?: number;
  hb_level?: number;
  fetal_heart_rate?: string | number;
  iron_pills_given?: string | number;
  is_high_risk?: boolean;
  cadre_notes?: string;
  notes?: string;
  timestamp?: string;
  synced?: boolean;
}


export interface OfflineChildRecord {
  child_id: string;
  data: any;
  updated_at: string;
}

export interface OfflineMotherRecord {
  mother_id: string;
  data: any;
  updated_at: string;
}

export interface AppCacheRecord {
  key: string;
  value: any;
  updated_at: string;
}

const DB_NAME = "KenangaCareOfflineDB";
const DB_VERSION = 1;

function getIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains("pendingChildMeasurements")) {
          db.createObjectStore("pendingChildMeasurements", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("pendingMaternalRecords")) {
          db.createObjectStore("pendingMaternalRecords", { keyPath: "id", autoIncrement: true });
        }
        if (!db.objectStoreNames.contains("offlineChildren")) {
          db.createObjectStore("offlineChildren", { keyPath: "child_id" });
        }
        if (!db.objectStoreNames.contains("offlineMothers")) {
          db.createObjectStore("offlineMothers", { keyPath: "mother_id" });
        }
        if (!db.objectStoreNames.contains("appCache")) {
          db.createObjectStore("appCache", { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

/**
 * Generic key-value cache item saver for Dexie.js (IndexedDB)
 */
export async function setCacheItem(key: string, value: any): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("appCache", "readwrite");
      tx.objectStore("appCache").put({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error(`[Dexie.js] Failed to set cache item ${key}:`, err);
  }
}

/**
 * Generic key-value cache item getter for Dexie.js (IndexedDB)
 */
export async function getCacheItem(key: string): Promise<any> {
  if (typeof window === "undefined") return null;
  return new Promise(async (resolve) => {
    try {
      const db = await getIndexedDB();
      if (!db) return resolve(null);
      const tx = db.transaction("appCache", "readonly");
      const req = tx.objectStore("appCache").get(key);
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => resolve(null);
    } catch (err) {
      console.error(`[Dexie.js] Failed to get cache item ${key}:`, err);
      resolve(null);
    }
  });
}

/**
 * Generic key-value cache item remover for Dexie.js (IndexedDB)
 */
export async function removeCacheItem(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("appCache", "readwrite");
      tx.objectStore("appCache").delete(key);
    }
  } catch (err) {
    console.error(`[Dexie.js] Failed to delete cache item ${key}:`, err);
  }
}

/**
 * Enqueues a child anthropometric measurement to Dexie.js (IndexedDB)
 */
export async function saveChildMeasurementToDexie(payload: any): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("pendingChildMeasurements", "readwrite");
      tx.objectStore("pendingChildMeasurements").add({
        ...payload,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      console.log("[Dexie.js] Enqueued offline child measurement to IndexedDB:", payload.child_id);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to save child measurement to IndexedDB:", err);
  }
}

/**
 * Enqueues a maternal health screening record to Dexie.js (IndexedDB)
 */
export async function saveMaternalRecordToDexie(payload: any): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("pendingMaternalRecords", "readwrite");
      tx.objectStore("pendingMaternalRecords").add({
        ...payload,
        timestamp: new Date().toISOString(),
        synced: false,
      });
      console.log("[Dexie.js] Enqueued offline maternal record to IndexedDB:", payload.mother_id);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to save maternal record to IndexedDB:", err);
  }
}

/**
 * Persists child offline micro-states to Dexie.js (IndexedDB)
 */
export async function saveChildOfflineStateToDexie(childId: string, stateData: any): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("offlineChildren", "readwrite");
      tx.objectStore("offlineChildren").put({
        child_id: childId,
        data: stateData,
        updated_at: new Date().toISOString(),
      });
      console.log("[Dexie.js] Saved offline child state to IndexedDB:", childId);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to save offline child state:", err);
  }
}

/**
 * Loads child offline micro-states from Dexie.js (IndexedDB)
 */
export async function getChildOfflineStateFromDexie(childId: string): Promise<any> {
  if (typeof window === "undefined") return null;
  return new Promise(async (resolve) => {
    try {
      const db = await getIndexedDB();
      if (!db) return resolve(null);
      const tx = db.transaction("offlineChildren", "readonly");
      const req = tx.objectStore("offlineChildren").get(childId);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    } catch (err) {
      console.error("[Dexie.js] Failed to load offline child state from IndexedDB:", err);
      resolve(null);
    }
  });
}

/**
 * Persists mother offline micro-states to Dexie.js (IndexedDB)
 */
export async function saveMotherOfflineStateToDexie(motherId: string, stateData: any): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("offlineMothers", "readwrite");
      tx.objectStore("offlineMothers").put({
        mother_id: motherId,
        data: stateData,
        updated_at: new Date().toISOString(),
      });
      console.log("[Dexie.js] Saved offline mother state to IndexedDB:", motherId);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to save offline mother state:", err);
  }
}

/**
 * Loads mother offline micro-states from Dexie.js (IndexedDB)
 */
export async function getMotherOfflineStateFromDexie(motherId: string): Promise<any> {
  if (typeof window === "undefined") return null;
  return new Promise(async (resolve) => {
    try {
      const db = await getIndexedDB();
      if (!db) return resolve(null);
      const tx = db.transaction("offlineMothers", "readonly");
      const req = tx.objectStore("offlineMothers").get(motherId);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    } catch (err) {
      console.error("[Dexie.js] Failed to load offline mother state from IndexedDB:", err);
      resolve(null);
    }
  });
}

/**
 * Gets all pending child measurements from Dexie.js (IndexedDB)
 */
export async function getPendingChildMeasurementsFromDexie(): Promise<any[]> {
  if (typeof window === "undefined") return [];
  return new Promise(async (resolve) => {
    try {
      const db = await getIndexedDB();
      if (!db) return resolve([]);
      const tx = db.transaction("pendingChildMeasurements", "readonly");
      const req = tx.objectStore("pendingChildMeasurements").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (err) {
      console.error("[Dexie.js] Failed to get pending child measurements:", err);
      resolve([]);
    }
  });
}

/**
 * Deletes a pending child measurement from Dexie.js (IndexedDB) by its ID
 */
export async function deletePendingChildMeasurementFromDexie(id: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("pendingChildMeasurements", "readwrite");
      tx.objectStore("pendingChildMeasurements").delete(id);
      console.log("[Dexie.js] Deleted pending child measurement from IndexedDB:", id);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to delete pending child measurement:", err);
  }
}

/**
 * Gets all pending maternal records from Dexie.js (IndexedDB)
 */
export async function getPendingMaternalRecordsFromDexie(): Promise<any[]> {
  if (typeof window === "undefined") return [];
  return new Promise(async (resolve) => {
    try {
      const db = await getIndexedDB();
      if (!db) return resolve([]);
      const tx = db.transaction("pendingMaternalRecords", "readonly");
      const req = tx.objectStore("pendingMaternalRecords").getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    } catch (err) {
      console.error("[Dexie.js] Failed to get pending maternal records:", err);
      resolve([]);
    }
  });
}

/**
 * Deletes a pending maternal record from Dexie.js (IndexedDB) by its ID
 */
export async function deletePendingMaternalRecordFromDexie(id: number): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const db = await getIndexedDB();
    if (db) {
      const tx = db.transaction("pendingMaternalRecords", "readwrite");
      tx.objectStore("pendingMaternalRecords").delete(id);
      console.log("[Dexie.js] Deleted pending maternal record from IndexedDB:", id);
    }
  } catch (err) {
    console.error("[Dexie.js] Failed to delete pending maternal record:", err);
  }
}

