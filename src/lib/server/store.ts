/**
 * Persistence for the app's data. db.ts works on one in-memory object (DbShape); this module loads and saves it.
 *
 *  - File store:     data/db.json on disk (local development; temp folder on Vercel without Supabase).
 *  - Supabase store: one row per record in Postgres. Saving writes only what changed since the load, so two
 *    people saving different orders / products at the same moment no longer overwrite each other.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export const ARRAY_COLLECTIONS = [
  "adminUsers",
  "orders",
  "enquiries",
  "gearProducts",
  "packageProducts",
  "portfolioProjects",
  "merchProducts",
  "merchOrders",
] as const;
// motionControlProducts is a setting (one row holding the whole short list) so an existing database picks up its
// starting content on first load without a migration.
export const SETTING_KEYS = ["gearCategories", "paymentSettings", "siteSettings", "paymentOtp", "motionControlProducts"] as const;

export type CollectionKey = (typeof ARRAY_COLLECTIONS)[number];
type SettingKey = (typeof SETTING_KEYS)[number];
export type StoreKey = CollectionKey | SettingKey;

type AnyDb = Record<string, unknown>;

export interface Store {
  /** Returns null when nothing has been saved yet. `only` limits which parts are loaded (Supabase store). */
  load(only?: readonly StoreKey[]): Promise<AnyDb | null>;
  save(db: AnyDb): Promise<void>;
}

// ---------------------------------------------------------------- file store

export function createFileStore(filePath: string): Store {
  return {
    async load() {
      try {
        return JSON.parse(await fs.readFile(filePath, "utf-8")) as AnyDb;
      } catch {
        return null;
      }
    },
    async save(db) {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(db, null, 2));
    },
  };
}

// ------------------------------------------------------------ Supabase store

export type RecordRow = { collection: string; id: string; position: number; data: unknown };
export type SettingRow = { key: string; data: { v: unknown } };

/** The few database calls the store needs — implemented with supabase-js, or faked in tests. */
export interface Backend {
  fetchRecords(collections: string[]): Promise<RecordRow[]>;
  fetchSettings(keys: string[]): Promise<SettingRow[]>;
  upsertRecords(rows: RecordRow[]): Promise<void>;
  deleteRecords(collection: string, ids: string[]): Promise<void>;
  upsertSettings(rows: SettingRow[]): Promise<void>;
}

type Snapshot = {
  records: Map<string, Map<string, { json: string; position: number }>>;
  settings: Map<string, string>;
  collections: Set<string>;
  settingKeys: Set<string>;
};

const META_KEY = "meta";
const CHUNK = 500;

function chunks<T>(items: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += CHUNK) out.push(items.slice(i, i + CHUNK));
  return out;
}

export function createSupabaseStore(backend: Backend): Store {
  // what each loaded object looked like when it was loaded/saved, so save() can send only the differences
  const snapshots = new WeakMap<object, Snapshot>();

  return {
    async load(only) {
      const wantCollections = ARRAY_COLLECTIONS.filter((c) => !only || only.includes(c));
      const wantSettings = SETTING_KEYS.filter((k) => !only || only.includes(k));

      // two requests, in parallel: the settings rows (incl. the "meta" marker) and the records
      const [settingsAndMeta, recordRows] = await Promise.all([
        backend.fetchSettings([META_KEY, ...wantSettings]),
        backend.fetchRecords([...wantCollections]),
      ]);
      if (!settingsAndMeta.some((r) => r.key === META_KEY)) return null; // brand-new database
      const settingRows = settingsAndMeta.filter((r) => r.key !== META_KEY);

      const db: AnyDb = {};
      const snap: Snapshot = {
        records: new Map(),
        settings: new Map(),
        collections: new Set(wantCollections),
        settingKeys: new Set(wantSettings),
      };

      for (const collection of wantCollections) {
        const rows = recordRows
          .filter((r) => r.collection === collection)
          .sort((a, b) => a.position - b.position);
        db[collection] = rows.map((r) => r.data);
        const map = new Map<string, { json: string; position: number }>();
        rows.forEach((r, i) => map.set(r.id, { json: JSON.stringify(r.data), position: i }));
        snap.records.set(collection, map);
      }
      for (const row of settingRows) {
        db[row.key] = row.data.v;
        snap.settings.set(row.key, JSON.stringify(row.data.v));
      }
      snapshots.set(db, snap);
      return db;
    },

    async save(db) {
      let snap = snapshots.get(db);
      const fresh = !snap; // first ever save (new database): write everything
      if (!snap) {
        snap = {
          records: new Map(),
          settings: new Map(),
          collections: new Set(ARRAY_COLLECTIONS),
          settingKeys: new Set(SETTING_KEYS),
        };
      }

      const upserts: RecordRow[] = [];
      const deletes: { collection: string; ids: string[] }[] = [];

      for (const collection of snap.collections) {
        const items = db[collection];
        if (!Array.isArray(items)) continue;
        const before = snap.records.get(collection) ?? new Map();
        const after = new Map<string, { json: string; position: number }>();
        items.forEach((item, position) => {
          const id = (item as { id?: unknown })?.id;
          if (typeof id !== "string" || !id) throw new Error(`Cannot save a ${collection} record without an id.`);
          const json = JSON.stringify(item);
          after.set(id, { json, position });
          const prev = before.get(id);
          if (!prev || prev.json !== json || prev.position !== position) {
            upserts.push({ collection, id, position, data: item });
          }
        });
        const removed = [...before.keys()].filter((id) => !after.has(id));
        if (removed.length) deletes.push({ collection, ids: removed });
        snap.records.set(collection, after);
      }

      const settingUpserts: SettingRow[] = [];
      for (const key of snap.settingKeys) {
        const value = db[key];
        if (value === undefined) continue;
        const json = JSON.stringify(value);
        if (snap.settings.get(key) !== json) {
          settingUpserts.push({ key, data: { v: value } });
          snap.settings.set(key, json);
        }
      }
      if (fresh) settingUpserts.push({ key: META_KEY, data: { v: { initialized: true } } });

      for (const group of chunks(upserts)) await backend.upsertRecords(group);
      for (const d of deletes) {
        for (const group of chunks(d.ids)) await backend.deleteRecords(d.collection, group);
      }
      if (settingUpserts.length) await backend.upsertSettings(settingUpserts);

      snapshots.set(db, snap);
    },
  };
}
