import Dexie, { type Table } from "dexie";

// Offline interfaces represent the data structure before it is synced to the server.

export interface OfflineIbu {
  id?: number;
  name: string;
  nik: string;
  synced: boolean;
  posyanduId?: string;
  lastUpdated: string;
}

export interface OfflineAnak {
  id?: number;
  ibuId?: number; // local foreign key
  name: string;
  birthDate: string;
  synced: boolean;
  lastUpdated: string;
}

export class KenangaCareDB extends Dexie {
  ibus!: Table<OfflineIbu>;
  anaks!: Table<OfflineAnak>;

  constructor() {
    super("KenangaCareDatabase");

    // Define table schemas (only indexes!)
    // indexed fields allow faster queries.
    this.version(1).stores({
      ibus: "++id, name, nik, synced, posyanduId",
      anaks: "++id, ibuId, name, synced"
    });
  }
}

export const db = new KenangaCareDB();
