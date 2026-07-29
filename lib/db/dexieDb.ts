/**
 * Dexie.js / IndexedDB Offline Storage Queue Engine
 * System: Kenanga Care
 */

export interface PendingMeasurement {
  id?: number;
  child_id: string;
  visit_date: string;
  weight_kg?: number;
  height_cm?: number;
  head_circ_cm?: number;
  muac_cm?: number;
  notes?: string;
  timestamp: string;
  synced: boolean;
}

export interface PendingMaternalRecord {
  id?: number;
  mother_id: string;
  screening_date: string;
  weight_kg?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  fundal_height_cm?: number;
  hb_level?: number;
  fetal_heart_rate?: number;
  is_high_risk?: boolean;
  notes?: string;
  timestamp: string;
  synced: boolean;
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
export async function saveChildMeasurementToDexie(payload: Omit<PendingMeasurement, "id" | "timestamp" | "synced">): Promise<void> {
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
export async function saveMaternalRecordToDexie(payload: Omit<PendingMaternalRecord, "id" | "timestamp" | "synced">): Promise<void> {
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
