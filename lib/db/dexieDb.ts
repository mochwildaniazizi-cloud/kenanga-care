import Dexie, { Table } from "dexie";

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

export class KenangaDexieDatabase extends Dexie {
  pendingChildMeasurements!: Table<PendingMeasurement, number>;
  pendingMaternalRecords!: Table<PendingMaternalRecord, number>;
  offlineChildren!: Table<OfflineChildRecord, string>;
  offlineMothers!: Table<OfflineMotherRecord, string>;

  constructor() {
    super("KenangaCareOfflineDB");
    this.version(1).stores({
      pendingChildMeasurements: "++id, child_id, visit_date, synced, timestamp",
      pendingMaternalRecords: "++id, mother_id, screening_date, synced, timestamp",
      offlineChildren: "child_id, updated_at",
      offlineMothers: "mother_id, updated_at",
    });
  }
}

// Singleton instance for client-side environment
export const dexieDb = typeof window !== "undefined" ? new KenangaDexieDatabase() : (null as any);

/**
 * Enqueues a child anthropometric measurement to Dexie.js (IndexedDB)
 */
export async function saveChildMeasurementToDexie(payload: Omit<PendingMeasurement, "id" | "timestamp" | "synced">) {
  if (typeof window === "undefined" || !dexieDb) return;
  try {
    await dexieDb.pendingChildMeasurements.add({
      ...payload,
      timestamp: new Date().toISOString(),
      synced: false,
    });
    console.log("[Dexie.js] Enqueued offline child measurement to IndexedDB:", payload.child_id);
  } catch (err) {
    console.error("[Dexie.js] Failed to save child measurement to IndexedDB:", err);
  }
}

/**
 * Enqueues a maternal health screening record to Dexie.js (IndexedDB)
 */
export async function saveMaternalRecordToDexie(payload: Omit<PendingMaternalRecord, "id" | "timestamp" | "synced">) {
  if (typeof window === "undefined" || !dexieDb) return;
  try {
    await dexieDb.pendingMaternalRecords.add({
      ...payload,
      timestamp: new Date().toISOString(),
      synced: false,
    });
    console.log("[Dexie.js] Enqueued offline maternal record to IndexedDB:", payload.mother_id);
  } catch (err) {
    console.error("[Dexie.js] Failed to save maternal record to IndexedDB:", err);
  }
}

/**
 * Persists child offline micro-states (Pelayanan Matrix, LiLA, Nakes Logs) to Dexie.js
 */
export async function saveChildOfflineStateToDexie(childId: string, stateData: any) {
  if (typeof window === "undefined" || !dexieDb) return;
  try {
    await dexieDb.offlineChildren.put({
      child_id: childId,
      data: stateData,
      updated_at: new Date().toISOString(),
    });
    console.log("[Dexie.js] Saved offline child state to IndexedDB:", childId);
  } catch (err) {
    console.error("[Dexie.js] Failed to save offline child state:", err);
  }
}

/**
 * Loads child offline micro-states from Dexie.js
 */
export async function getChildOfflineStateFromDexie(childId: string) {
  if (typeof window === "undefined" || !dexieDb) return null;
  try {
    const record = await dexieDb.offlineChildren.get(childId);
    return record ? record.data : null;
  } catch (err) {
    console.error("[Dexie.js] Failed to load offline child state from IndexedDB:", err);
    return null;
  }
}
