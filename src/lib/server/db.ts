import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import previewSeed from "./preview-seed.json";
import { getSupabase, isSupabaseEnabled, createSupabaseBackend, PUBLIC_BUCKET, SLIP_BUCKET } from "./supabase";
import { createFileStore, createSupabaseStore, type StoreKey } from "./store";
import { hashPassword } from "./passwords";
import { defaultMotionControlProducts, type MotionControlProduct } from "@/lib/motion-control";
import {
  gearItems,
  packages,
  workItems,
  merchItems,
  DEFAULT_GEAR_CATEGORIES,
  type GearItem,
  type PackageItem,
  type WorkItem,
  type MerchItem,
} from "@/lib/data";

// On Vercel the project folder is read-only, so the preview deployment keeps its (temporary) data in the
// OS temp folder and starts from the sanitised catalogue in preview-seed.json. Locally nothing changes.
const ON_VERCEL = Boolean(process.env.VERCEL);
const DB_PATH = ON_VERCEL
  ? path.join(os.tmpdir(), "outtake-db.json")
  : path.join(process.cwd(), "data", "db.json");
// With SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set, data lives in Supabase (Postgres) and uploads in Supabase
// Storage. Without them it falls back to the local JSON file / folder above.
const USE_SUPABASE = isSupabaseEnabled();
const store = USE_SUPABASE
  ? createSupabaseStore(createSupabaseBackend(getSupabase()))
  : createFileStore(DB_PATH);
const UPLOAD_ROOT = ON_VERCEL ? path.join(os.tmpdir(), "uploads") : path.join(process.cwd(), "public", "uploads");

export type OrderItem = {
  productId: string | null;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type OrderStatus = "NEW" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type OrderHistoryEntry = {
  id: string;
  title: string;
  description: string;
  at: string;
};

export type OrderRequest = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  status: OrderStatus;
  customerNotes: string;
  internalNotes: string;
  depositAmount: number | null;
  depositReceived: boolean;
  balanceReceived: boolean;
  discount: number;
  items: OrderItem[];
  orderHistory: OrderHistoryEntry[];
  submittedAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
};

export type EnquiryStatus = "NEW" | "Replied";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  internalNotes: string;
  submittedAt: string;
};

export type AdminUser = { id: string; email: string; passwordHash: string };

export type PaymentOtpState = { hash: string; expiresAt: number; attempts: number; lastSentAt: number };

export type GearProduct = GearItem & { isEnabled: boolean };
export type PackageProduct = PackageItem & { isEnabled: boolean };
export type PortfolioProject = WorkItem & { isEnabled: boolean };
export type MerchProduct = MerchItem & { isEnabled: boolean };

export type PaymentMethod = "BANK_TRANSFER" | "QR_PAYMENT";

export type PaymentSettings = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImage: string | null;
};

export type MerchOrderStatus = "NEW" | "PAYMENT_VERIFIED" | "FULFILLED" | "CANCELLED";

export type MerchOrder = {
  id: string;
  orderNumber: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  shippingOption: "SELF_PICKUP";
  paymentMethod: PaymentMethod;
  paymentSlipUrl: string | null;
  notes: string;
  status: MerchOrderStatus;
  internalNotes: string;
  orderHistory: OrderHistoryEntry[];
  submittedAt: string;
  verifiedAt: string | null;
  fulfilledAt: string | null;
  cancelledAt: string | null;
};

export { SELF_PICKUP_ADDRESS } from "@/lib/constants";

export type BannerContent = {
  image: string | null;
  subtitle: string;
  title: string;
  description: string;
  /** Focus point as % (0-100) of the image: which spot stays centred in the banner frame */
  focusX: number;
  focusY: number;
};

export type NotificationSettings = {
  emailEnabled: boolean;
  notifyEmail: string;
  pushEnabled: boolean;
};

export type SiteSettings = {
  banners: {
    home: BannerContent;
    rental: BannerContent;
  };
  notifications: NotificationSettings;
};

type DbShape = {
  adminUsers: AdminUser[];
  orders: OrderRequest[];
  enquiries: Enquiry[];
  gearProducts: GearProduct[];
  packageProducts: PackageProduct[];
  portfolioProjects: PortfolioProject[];
  merchProducts: MerchProduct[];
  gearCategories: string[];
  paymentSettings: PaymentSettings;
  merchOrders: MerchOrder[];
  siteSettings: SiteSettings;
  motionControlProducts: MotionControlProduct[];
  paymentOtp?: PaymentOtpState | null;
};

// Reads the JSON store, seeding/migrating any missing sections in place —
// safe to call even on a db.json created before the catalog existed.
// `only` lets read-only callers load just the parts they need (Supabase mode); everything else is left alone.
async function ensureDb(only?: readonly StoreKey[]): Promise<DbShape> {
  let db = (await store.load(only)) as Partial<DbShape> | null;
  if (!db) db = ON_VERCEL && !USE_SUPABASE ? (structuredClone(previewSeed) as unknown as Partial<DbShape>) : {};

  let needsWrite = false;

  if ((!only || only.includes("adminUsers")) && (!db.adminUsers || db.adminUsers.length === 0)) {
    const seedEmail = process.env.ADMIN_EMAIL || "admin@outtakestudio.com";
    const seedPassword = process.env.ADMIN_PASSWORD || "changeme123";
    db.adminUsers = [{ id: crypto.randomUUID(), email: seedEmail, passwordHash: hashPassword(seedPassword) }];
    needsWrite = true;
  }
  if (!db.orders) {
    db.orders = [];
    needsWrite = true;
  }
  if (!db.enquiries) {
    db.enquiries = [];
    needsWrite = true;
  }
  if (!db.gearProducts) {
    db.gearProducts = gearItems.map((g) => ({ ...g, isEnabled: true }));
    needsWrite = true;
  }
  if (!db.packageProducts) {
    db.packageProducts = packages.map((p) => ({ ...p, isEnabled: true }));
    needsWrite = true;
  }
  if (!db.portfolioProjects) {
    db.portfolioProjects = workItems.map((w) => ({ ...w, isEnabled: true }));
    needsWrite = true;
  }
  if (!db.motionControlProducts) {
    db.motionControlProducts = structuredClone(defaultMotionControlProducts);
    needsWrite = true;
  }
  if (!db.gearCategories) {
    db.gearCategories = [...DEFAULT_GEAR_CATEGORIES];
    needsWrite = true;
  }
  if (!db.paymentSettings) {
    db.paymentSettings = {
      bankName: "Malayan Banking Berhad (Maybank)",
      accountName: "Out Take Studio Sdn Bhd",
      accountNumber: "1234 5678 9012",
      qrImage: null,
    };
    needsWrite = true;
  }
  if (!db.merchOrders) {
    db.merchOrders = [];
    needsWrite = true;
  }
  if (!db.merchProducts) {
    db.merchProducts = merchItems.map((m) => ({ ...m, isEnabled: true }));
    needsWrite = true;
  }
  if (!db.siteSettings) {
    db.siteSettings = {
      banners: {
        home: {
          image: "/gear/ref-banner-crew.jpg",
          subtitle: "Precision in every frame.",
          title: "Every Frame Starts With The Right Gear",
          description: "",
          focusX: 50,
          focusY: 50,
        },
        rental: {
          image: "/gear/ref-banner-crew.jpg",
          subtitle: "Precision in every frame.",
          title: "Every Frame Starts With The Right Gear",
          description: "",
          focusX: 50,
          focusY: 50,
        },
      },
      notifications: {
        emailEnabled: true,
        notifyEmail: process.env.NOTIFY_EMAIL || "",
        pushEnabled: false,
      },
    };
    needsWrite = true;
  }
  if (db.siteSettings && !db.siteSettings.notifications) {
    db.siteSettings.notifications = {
      emailEnabled: true,
      notifyEmail: process.env.NOTIFY_EMAIL || "",
      pushEnabled: false,
    };
    needsWrite = true;
  }
  if (db.siteSettings) {
    const legacy: Record<string, [number, number]> = {
      top: [50, 0], center: [50, 50], bottom: [50, 100], left: [0, 50], right: [100, 50],
    };
    for (const key of ["home", "rental"] as const) {
      const banner = db.siteSettings.banners?.[key] as
        | (BannerContent & { focusPoint?: string })
        | undefined;
      if (banner && typeof banner.focusX !== "number") {
        const [x, y] = legacy[banner.focusPoint ?? "center"] ?? [50, 50];
        banner.focusX = x;
        banner.focusY = y;
        delete banner.focusPoint;
        needsWrite = true;
      }
    }
  }
  for (const p of db.portfolioProjects as (PortfolioProject & { isEnabled?: boolean })[]) {
    if (p.isEnabled === undefined) {
      p.isEnabled = true;
      needsWrite = true;
    }
  }

  // Backfill fields added after the initial catalog schema, for records
  // saved before images/video/custom-spec support existed.
  for (const g of db.gearProducts as (GearProduct & Record<string, unknown>)[]) {
    if (!g.images) {
      g.images = [g.image];
      needsWrite = true;
    }
    if (g.videoUrl === undefined) {
      g.videoUrl = null;
      needsWrite = true;
    }
    if (g.description === undefined) {
      g.description = "";
      needsWrite = true;
    }
    if (!g.customSpecs) {
      g.customSpecs = [];
      needsWrite = true;
    }
    if (!g.specSections) {
      g.specSections = g.customSpecs.length
        ? [
            {
              title: "Specifications",
              items: g.customSpecs.map((c) => (c.value ? `${c.label}: ${c.value}` : c.label)),
            },
          ]
        : [];
      g.customSpecs = [];
      needsWrite = true;
    }
  }
  for (const m of db.merchProducts as (MerchProduct & Record<string, unknown>)[]) {
    if (!m.images) {
      m.images = [m.image];
      needsWrite = true;
    }
  }
  for (const p of db.packageProducts as (PackageProduct & {
    included?: string[];
    battery?: string[];
    lensControl?: string[];
  })[]) {
    if (!p.images) {
      p.images = [p.image];
      needsWrite = true;
    }
    if (p.videoUrl === undefined) {
      p.videoUrl = null;
      needsWrite = true;
    }
    if (!p.specSections) {
      p.specSections = [
        { title: "What's Included", items: p.included ?? [] },
        { title: "Battery", items: p.battery ?? [] },
        { title: "Lens Control", items: p.lensControl ?? [] },
      ].filter((s) => s.items.length > 0);
      delete p.included;
      delete p.battery;
      delete p.lensControl;
      needsWrite = true;
    }
  }

  // One-time renumber to the simpler sequential INV-R#### / INV-M#### scheme —
  // replaces the old date-based REQ-/MORD- numbers. Preview-data only: real
  // launch data will be reset before go-live anyway.
  if (db.orders.some((o) => !o.orderNumber.startsWith("INV-R"))) {
    const sorted = [...db.orders].sort((a, b) => (a.submittedAt > b.submittedAt ? 1 : -1));
    sorted.forEach((o, i) => {
      o.orderNumber = `INV-R${String(i + 1).padStart(4, "0")}`;
    });
    needsWrite = true;
  }
  if (db.merchOrders.some((o) => !o.orderNumber.startsWith("INV-M"))) {
    const sorted = [...db.merchOrders].sort((a, b) => (a.submittedAt > b.submittedAt ? 1 : -1));
    sorted.forEach((o, i) => {
      o.orderNumber = `INV-M${String(i + 1).padStart(4, "0")}`;
    });
    needsWrite = true;
  }

  // Backfill order request records saved before discount/order-history existed,
  // and drop the old totalOverride field in favour of discount.
  for (const o of db.orders as (OrderRequest & { totalOverride?: number | null })[]) {
    if (o.totalOverride !== undefined) {
      if ((o as { discount?: number }).discount === undefined) {
        o.discount = 0;
      }
      delete o.totalOverride;
      needsWrite = true;
    }
    if (o.discount === undefined) {
      o.discount = 0;
      needsWrite = true;
    }
    if (!o.orderHistory) {
      const history: OrderHistoryEntry[] = [
        {
          id: crypto.randomUUID(),
          title: "New order placed",
          description: "Customer submitted the order request.",
          at: o.submittedAt,
        },
      ];
      if (o.confirmedAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Booking confirmed",
          description: "Booking confirmed.",
          at: o.confirmedAt,
        });
      }
      if (o.completedAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Order completed",
          description: "Order completed.",
          at: o.completedAt,
        });
      }
      if (o.cancelledAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Order cancelled",
          description: "Order cancelled.",
          at: o.cancelledAt,
        });
      }
      o.orderHistory = history;
      needsWrite = true;
    }
  }

  for (const o of db.merchOrders as MerchOrder[]) {
    if (!o.orderHistory) {
      const history: OrderHistoryEntry[] = [
        {
          id: crypto.randomUUID(),
          title: "New order placed",
          description: "Customer submitted the order.",
          at: o.submittedAt,
        },
      ];
      if (o.verifiedAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Awaiting pickup",
          description: "Payment verified — awaiting pickup.",
          at: o.verifiedAt,
        });
      }
      if (o.fulfilledAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Completed",
          description: "Order completed.",
          at: o.fulfilledAt,
        });
      }
      if (o.cancelledAt) {
        history.push({
          id: crypto.randomUUID(),
          title: "Cancelled",
          description: "Order cancelled.",
          at: o.cancelledAt,
        });
      }
      o.orderHistory = history;
      needsWrite = true;
    }
  }

  const full = db as DbShape;
  if (needsWrite) await store.save(full as unknown as Record<string, unknown>);
  return full;
}

// Sequential invoice numbers, e.g. INV-R0001, INV-R0002, ... — 4-digit, never reused.
function nextInvoiceNumber(existingNumbers: string[], prefix: string): string {
  let max = 0;
  for (const n of existingNumbers) {
    if (!n.startsWith(prefix)) continue;
    const num = Number(n.slice(prefix.length));
    if (Number.isFinite(num) && num > max) max = num;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

async function writeDb(db: DbShape): Promise<void> {
  await store.save(db as unknown as Record<string, unknown>);
}

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const db = await ensureDb();
  return db.adminUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export async function listOrders(): Promise<OrderRequest[]> {
  const db = await ensureDb(["orders"]);
  // Oldest first by default, so nothing submitted early gets missed/forgotten.
  return [...db.orders].sort((a, b) => (a.submittedAt > b.submittedAt ? 1 : -1));
}

export async function getOrder(id: string): Promise<OrderRequest | null> {
  const db = await ensureDb(["orders"]);
  return db.orders.find((o) => o.id === id) ?? null;
}

export async function createOrder(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  customerNotes?: string;
  items: OrderItem[];
}): Promise<OrderRequest> {
  const db = await ensureDb();
  const now = new Date();
  const orderNumber = nextInvoiceNumber(db.orders.map((o) => o.orderNumber), "INV-R");

  const order: OrderRequest = {
    id: crypto.randomUUID(),
    orderNumber,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    companyName: input.companyName,
    rentalStartDate: input.rentalStartDate,
    rentalEndDate: input.rentalEndDate,
    status: "NEW",
    customerNotes: input.customerNotes?.trim() || "",
    internalNotes: "",
    depositAmount: null,
    depositReceived: false,
    balanceReceived: false,
    discount: 0,
    items: input.items,
    orderHistory: [
      {
        id: crypto.randomUUID(),
        title: "New order placed",
        description: "Customer submitted the order request.",
        at: now.toISOString(),
      },
    ],
    submittedAt: now.toISOString(),
    confirmedAt: null,
    completedAt: null,
    cancelledAt: null,
  };
  db.orders.push(order);
  await writeDb(db);
  return order;
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      OrderRequest,
      | "internalNotes"
      | "rentalStartDate"
      | "rentalEndDate"
      | "depositAmount"
      | "depositReceived"
      | "balanceReceived"
      | "discount"
      | "customerName"
      | "customerPhone"
      | "customerEmail"
      | "companyName"
    >
  >
): Promise<OrderRequest | null> {
  const db = await ensureDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, patch);
  await writeDb(db);
  return order;
}

const ORDER_STATUS_FLOW: OrderStatus[] = ["NEW", "CONFIRMED", "COMPLETED"];

function orderStatusHistoryTitle(status: OrderStatus, isBackward: boolean): string {
  if (status === "CANCELLED") return "Order cancelled";
  if (status === "NEW") return isBackward ? "Moved back to To process" : "New order placed";
  if (status === "CONFIRMED") return "Booking confirmed";
  if (status === "COMPLETED") return "Order completed";
  return status;
}

const ORDER_HISTORY_DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "New order placed": "Customer submitted the order request.",
  "Moved back to To process": "Status changed back to To process.",
  "Booking confirmed": "Booking confirmed.",
  "Order completed": "Order completed.",
  "Order cancelled": "Order cancelled.",
};

// Note is required (enforced by the caller/UI) for backward moves and cancellations,
// optional for forward moves — falls back to a sensible default description.
export async function changeOrderStatus(
  id: string,
  status: OrderStatus,
  note: string
): Promise<OrderRequest | null> {
  const db = await ensureDb();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return null;
  if (status === order.status) return order;

  const prevIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextIndex = ORDER_STATUS_FLOW.indexOf(status);
  const isBackward = status !== "CANCELLED" && prevIndex !== -1 && nextIndex !== -1 && nextIndex < prevIndex;

  order.status = status;
  const now = new Date().toISOString();
  if (status === "CONFIRMED") order.confirmedAt = now;
  if (status === "COMPLETED") order.completedAt = now;
  if (status === "CANCELLED") order.cancelledAt = now;

  const title = orderStatusHistoryTitle(status, isBackward);
  const description = note.trim() || ORDER_HISTORY_DEFAULT_DESCRIPTIONS[title] || title;
  if (!order.orderHistory) order.orderHistory = [];
  order.orderHistory.push({ id: crypto.randomUUID(), title, description, at: now });

  await writeDb(db);
  return order;
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const db = await ensureDb(["enquiries"]);
  return [...db.enquiries].sort((a, b) => (a.submittedAt > b.submittedAt ? 1 : -1));
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const db = await ensureDb(["enquiries"]);
  return db.enquiries.find((e) => e.id === id) ?? null;
}

export async function createEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<Enquiry> {
  const db = await ensureDb();
  const enquiry: Enquiry = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    status: "NEW",
    internalNotes: "",
    submittedAt: new Date().toISOString(),
  };
  db.enquiries.push(enquiry);
  await writeDb(db);
  return enquiry;
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "internalNotes">>
): Promise<Enquiry | null> {
  const db = await ensureDb();
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return null;
  Object.assign(enquiry, patch);
  await writeDb(db);
  return enquiry;
}

// ---------------------------------------------------------------------------
// Catalog: rental gear, packages, portfolio projects
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "item"
  );
}

function uniqueId(base: string, existingIds: string[]): string {
  const slug = slugify(base);
  if (!existingIds.includes(slug)) return slug;
  let n = 2;
  while (existingIds.includes(`${slug}-${n}`)) n++;
  return `${slug}-${n}`;
}

// Stores an uploaded file and returns the URL the site should use for it.
// Local: public/uploads/<folder>/. Supabase: the public "uploads" bucket; payment slips go to a private bucket and
// are only reachable through /api/payment-slip/<file>, which checks the admin login.
async function storeUpload(folder: string, filename: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!USE_SUPABASE) {
    const dir = path.join(UPLOAD_ROOT, folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buffer);
    return `/uploads/${folder}/${filename}`;
  }
  const storage = getSupabase().storage;
  const isSlip = folder === "payment-slips";
  const bucket = isSlip ? SLIP_BUCKET : PUBLIC_BUCKET;
  const objectPath = isSlip ? filename : `${folder}/${filename}`;
  const { error } = await storage.from(bucket).upload(objectPath, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Could not upload the file: ${error.message}`);
  return isSlip ? `/api/payment-slip/${filename}` : storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
}

export async function saveUploadedImage(
  file: File,
  folder: "gear" | "packages" | "portfolio" | "merch" | "payment-slips" | "payment-settings" | "banners" | "motion-control"
): Promise<string> {
  if (!file || file.size === 0) throw new Error("No file was uploaded.");
  if (!file.type.startsWith("image/")) throw new Error("The uploaded file must be an image.");
  const MAX_SIZE = 8 * 1024 * 1024;
  if (file.size > MAX_SIZE) throw new Error("Images must be smaller than 8MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const extRaw = file.name.split(".").pop() || "jpg";
  const ext = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return storeUpload(folder, filename, buffer, file.type);
}

// Vercel rejects request bodies over 4.5 MB, so a bigger PDF could never reach the server anyway.
export const MAX_PDF_BYTES = 4 * 1024 * 1024;

export async function saveUploadedPdf(file: File, folder: "motion-control"): Promise<string> {
  if (!file || file.size === 0) throw new Error("No PDF was uploaded.");
  if (file.type !== "application/pdf") throw new Error("The rate card must be a PDF file.");
  if (file.size > MAX_PDF_BYTES) throw new Error("The PDF must be smaller than 4MB. Please compress it and try again.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.pdf`;
  return storeUpload(folder, filename, buffer, "application/pdf");
}

// Resolves the final ordered image list from an ImageManager field pair:
// `${field}Order` (JSON array of "existing:<url>" | "new" tokens) plus the
// newly selected files under `${field}`, uploaded here in submission order.
export async function resolveImageList(
  formData: FormData,
  field: string,
  folder: "gear" | "packages" | "portfolio" | "merch"
): Promise<string[]> {
  let order: string[] = [];
  try {
    order = JSON.parse(String(formData.get(`${field}Order`) || "[]"));
  } catch {
    order = [];
  }
  const files = formData.getAll(field).filter((f): f is File => f instanceof File && f.size > 0);
  let fileIndex = 0;
  const result: string[] = [];
  for (const token of order) {
    if (token === "new") {
      const file = files[fileIndex++];
      if (file) result.push(await saveUploadedImage(file, folder));
    } else if (token.startsWith("existing:")) {
      result.push(token.slice("existing:".length));
    }
  }
  return result.slice(0, 9);
}

export async function saveUploadedVideo(
  file: File,
  folder: "gear" | "packages"
): Promise<string> {
  if (!file || file.size === 0) throw new Error("No video file was uploaded.");
  if (file.type !== "video/mp4") throw new Error("Videos must be in MP4 format.");
  const MAX_SIZE = 30 * 1024 * 1024;
  if (file.size > MAX_SIZE) throw new Error("Videos must be smaller than 30MB.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
  return storeUpload(folder, filename, buffer, "video/mp4");
}

export async function listGearCategories(): Promise<string[]> {
  const db = await ensureDb(["gearCategories"]);
  return db.gearCategories;
}

export async function addGearCategory(name: string): Promise<string[]> {
  const db = await ensureDb();
  const normalized = name.trim().toUpperCase();
  if (normalized && !db.gearCategories.includes(normalized)) {
    db.gearCategories.push(normalized);
    await writeDb(db);
  }
  return db.gearCategories;
}

export async function listGearProducts(): Promise<GearProduct[]> {
  const db = await ensureDb(["gearProducts"]);
  return db.gearProducts;
}

export async function getGearProduct(id: string): Promise<GearProduct | null> {
  const db = await ensureDb(["gearProducts"]);
  return db.gearProducts.find((g) => g.id === id) ?? null;
}

export async function createGearProduct(input: Omit<GearProduct, "id">): Promise<GearProduct> {
  const db = await ensureDb();
  const product: GearProduct = { id: uniqueId(input.name, db.gearProducts.map((g) => g.id)), ...input };
  db.gearProducts.push(product);
  await writeDb(db);
  return product;
}

export async function updateGearProduct(
  id: string,
  patch: Partial<Omit<GearProduct, "id">>
): Promise<GearProduct | null> {
  const db = await ensureDb();
  const product = db.gearProducts.find((g) => g.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  await writeDb(db);
  return product;
}

export async function deleteGearProduct(id: string): Promise<void> {
  const db = await ensureDb();
  db.gearProducts = db.gearProducts.filter((g) => g.id !== id);
  await writeDb(db);
}

export async function listMerchProducts(): Promise<MerchProduct[]> {
  const db = await ensureDb(["merchProducts"]);
  return db.merchProducts;
}

export async function getMerchProduct(id: string): Promise<MerchProduct | null> {
  const db = await ensureDb(["merchProducts"]);
  return db.merchProducts.find((m) => m.id === id) ?? null;
}

export async function createMerchProduct(input: Omit<MerchProduct, "id">): Promise<MerchProduct> {
  const db = await ensureDb();
  const product: MerchProduct = { id: uniqueId(input.name, db.merchProducts.map((m) => m.id)), ...input };
  db.merchProducts.push(product);
  await writeDb(db);
  return product;
}

export async function updateMerchProduct(
  id: string,
  patch: Partial<Omit<MerchProduct, "id">>
): Promise<MerchProduct | null> {
  const db = await ensureDb();
  const product = db.merchProducts.find((m) => m.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  await writeDb(db);
  return product;
}

export async function deleteMerchProduct(id: string): Promise<void> {
  const db = await ensureDb();
  db.merchProducts = db.merchProducts.filter((m) => m.id !== id);
  await writeDb(db);
}

export async function listPackageProducts(): Promise<PackageProduct[]> {
  const db = await ensureDb(["packageProducts"]);
  return db.packageProducts;
}

export async function getPackageProduct(id: string): Promise<PackageProduct | null> {
  const db = await ensureDb(["packageProducts"]);
  return db.packageProducts.find((p) => p.id === id) ?? null;
}

export async function createPackageProduct(input: Omit<PackageProduct, "id">): Promise<PackageProduct> {
  const db = await ensureDb();
  const product: PackageProduct = {
    id: uniqueId(input.name, db.packageProducts.map((p) => p.id)),
    ...input,
  };
  db.packageProducts.push(product);
  await writeDb(db);
  return product;
}

export async function updatePackageProduct(
  id: string,
  patch: Partial<Omit<PackageProduct, "id">>
): Promise<PackageProduct | null> {
  const db = await ensureDb();
  const product = db.packageProducts.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  await writeDb(db);
  return product;
}

export async function deletePackageProduct(id: string): Promise<void> {
  const db = await ensureDb();
  db.packageProducts = db.packageProducts.filter((p) => p.id !== id);
  await writeDb(db);
}

export async function listPortfolioProjects(): Promise<PortfolioProject[]> {
  const db = await ensureDb(["portfolioProjects"]);
  return db.portfolioProjects;
}

export async function getPortfolioProject(id: string): Promise<PortfolioProject | null> {
  const db = await ensureDb(["portfolioProjects"]);
  return db.portfolioProjects.find((p) => p.id === id) ?? null;
}

export async function createPortfolioProject(input: Omit<PortfolioProject, "id">): Promise<PortfolioProject> {
  const db = await ensureDb();
  const project: PortfolioProject = {
    id: uniqueId(input.title, db.portfolioProjects.map((p) => p.id)),
    ...input,
  };
  db.portfolioProjects.push(project);
  await writeDb(db);
  return project;
}

export async function updatePortfolioProject(
  id: string,
  patch: Partial<Omit<PortfolioProject, "id">>
): Promise<PortfolioProject | null> {
  const db = await ensureDb();
  const project = db.portfolioProjects.find((p) => p.id === id);
  if (!project) return null;
  Object.assign(project, patch);
  await writeDb(db);
  return project;
}

export async function deletePortfolioProject(id: string): Promise<void> {
  const db = await ensureDb();
  db.portfolioProjects = db.portfolioProjects.filter((p) => p.id !== id);
  await writeDb(db);
}

export async function movePortfolioProject(id: string, direction: "up" | "down"): Promise<void> {
  const db = await ensureDb();
  const index = db.portfolioProjects.findIndex((p) => p.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= db.portfolioProjects.length) return;
  const list = db.portfolioProjects;
  [list[index], list[swapWith]] = [list[swapWith], list[index]];
  await writeDb(db);
}

// ---------------------------------------------------------------------------
// Motion control (rate card products)
// ---------------------------------------------------------------------------

export async function listMotionControlProducts(): Promise<MotionControlProduct[]> {
  const db = await ensureDb(["motionControlProducts"]);
  return db.motionControlProducts;
}

export async function getMotionControlProduct(id: string): Promise<MotionControlProduct | null> {
  const db = await ensureDb(["motionControlProducts"]);
  return db.motionControlProducts.find((p) => p.id === id) ?? null;
}

export async function createMotionControlProduct(input: Omit<MotionControlProduct, "id">): Promise<MotionControlProduct> {
  const db = await ensureDb();
  const product: MotionControlProduct = {
    id: uniqueId(input.name, db.motionControlProducts.map((p) => p.id)),
    ...input,
  };
  db.motionControlProducts.push(product);
  await writeDb(db);
  return product;
}

export async function updateMotionControlProduct(
  id: string,
  patch: Partial<Omit<MotionControlProduct, "id">>
): Promise<MotionControlProduct | null> {
  const db = await ensureDb();
  const product = db.motionControlProducts.find((p) => p.id === id);
  if (!product) return null;
  Object.assign(product, patch);
  await writeDb(db);
  return product;
}

export async function deleteMotionControlProduct(id: string): Promise<void> {
  const db = await ensureDb();
  db.motionControlProducts = db.motionControlProducts.filter((p) => p.id !== id);
  await writeDb(db);
}

export async function moveMotionControlProduct(id: string, direction: "up" | "down"): Promise<void> {
  const db = await ensureDb();
  const list = db.motionControlProducts;
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;
  [list[index], list[swapWith]] = [list[swapWith], list[index]];
  await writeDb(db);
}

// ---------------------------------------------------------------------------
// Payment settings
// ---------------------------------------------------------------------------

export async function getPaymentSettings(): Promise<PaymentSettings> {
  const db = await ensureDb(["paymentSettings"]);
  return db.paymentSettings;
}

export async function getPaymentOtp(): Promise<PaymentOtpState | null> {
  const db = await ensureDb();
  return db.paymentOtp ?? null;
}

export async function setPaymentOtp(state: PaymentOtpState | null): Promise<void> {
  const db = await ensureDb();
  db.paymentOtp = state;
  await writeDb(db);
}

export async function updatePaymentSettings(
  patch: Partial<PaymentSettings>
): Promise<PaymentSettings> {
  const db = await ensureDb();
  Object.assign(db.paymentSettings, patch);
  await writeDb(db);
  return db.paymentSettings;
}

// ---------------------------------------------------------------------------
// Merchandise orders
// ---------------------------------------------------------------------------

export async function listMerchOrders(): Promise<MerchOrder[]> {
  const db = await ensureDb(["merchOrders"]);
  return [...db.merchOrders].sort((a, b) => (a.submittedAt > b.submittedAt ? 1 : -1));
}

export async function getMerchOrder(id: string): Promise<MerchOrder | null> {
  const db = await ensureDb(["merchOrders"]);
  return db.merchOrders.find((o) => o.id === id) ?? null;
}

export async function createMerchOrder(input: {
  productId: string | null;
  productName: string;
  productImage: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  paymentMethod: PaymentMethod;
  paymentSlipUrl: string | null;
  notes: string;
}): Promise<MerchOrder> {
  const db = await ensureDb();
  const now = new Date();
  const orderNumber = nextInvoiceNumber(db.merchOrders.map((o) => o.orderNumber), "INV-M");

  const order: MerchOrder = {
    id: crypto.randomUUID(),
    orderNumber,
    productId: input.productId,
    productName: input.productName,
    productImage: input.productImage,
    size: input.size,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    subtotal: input.unitPrice * input.quantity,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    companyName: input.companyName,
    shippingOption: "SELF_PICKUP",
    paymentMethod: input.paymentMethod,
    paymentSlipUrl: input.paymentSlipUrl,
    notes: input.notes,
    status: "NEW",
    internalNotes: "",
    orderHistory: [
      {
        id: crypto.randomUUID(),
        title: "New order placed",
        description: "Customer submitted the order.",
        at: now.toISOString(),
      },
    ],
    submittedAt: now.toISOString(),
    verifiedAt: null,
    fulfilledAt: null,
    cancelledAt: null,
  };
  db.merchOrders.push(order);
  await writeDb(db);
  return order;
}

// ---------------------------------------------------------------------------
// Site settings: banners
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = await ensureDb(["siteSettings"]);
  return db.siteSettings;
}

export async function updateBanner(
  page: "home" | "rental",
  patch: Partial<BannerContent>
): Promise<BannerContent> {
  const db = await ensureDb();
  Object.assign(db.siteSettings.banners[page], patch);
  await writeDb(db);
  return db.siteSettings.banners[page];
}

export async function updateNotificationSettings(
  patch: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const db = await ensureDb();
  Object.assign(db.siteSettings.notifications, patch);
  await writeDb(db);
  return db.siteSettings.notifications;
}

// ---------------------------------------------------------------------------
// Public catalog search (gear + merchandise, enabled items only)
// ---------------------------------------------------------------------------

export type CatalogSearchResult = {
  type: "gear" | "merch";
  id: string;
  name: string;
  image: string;
  priceLabel: string;
  href: string;
};

export async function searchCatalog(query: string): Promise<CatalogSearchResult[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const db = await ensureDb(["gearProducts", "merchProducts"]);

  const gearMatches: CatalogSearchResult[] = db.gearProducts
    .filter((g) => g.isEnabled)
    .filter(
      (g) =>
        g.name.toLowerCase().includes(needle) ||
        g.category.toLowerCase().includes(needle) ||
        g.brand.toLowerCase().includes(needle)
    )
    .map((g) => ({
      type: "gear" as const,
      id: g.id,
      name: g.name,
      image: g.image,
      priceLabel: `RM ${g.dailyRate.toFixed(2)}/day`,
      href: `/rental/${g.id}`,
    }));

  const merchMatches: CatalogSearchResult[] = db.merchProducts
    .filter((m) => m.isEnabled)
    .filter((m) => m.name.toLowerCase().includes(needle))
    .map((m) => ({
      type: "merch" as const,
      id: m.id,
      name: m.name,
      image: m.image,
      priceLabel: `RM ${m.price.toFixed(2)}`,
      href: `/merchandise/${m.id}`,
    }));

  return [...gearMatches, ...merchMatches].slice(0, 8);
}

export async function updateMerchOrder(
  id: string,
  patch: Partial<
    Pick<
      MerchOrder,
      "internalNotes" | "customerName" | "customerPhone" | "customerEmail" | "companyName" | "paymentSlipUrl"
    >
  >
): Promise<MerchOrder | null> {
  const db = await ensureDb();
  const order = db.merchOrders.find((o) => o.id === id);
  if (!order) return null;
  Object.assign(order, patch);
  await writeDb(db);
  return order;
}

const MERCH_ORDER_STATUS_FLOW: MerchOrderStatus[] = ["NEW", "PAYMENT_VERIFIED", "FULFILLED"];

function merchOrderHistoryTitle(status: MerchOrderStatus, isBackward: boolean): string {
  if (status === "CANCELLED") return "Cancelled";
  if (status === "NEW") return isBackward ? "Moved back to To process" : "New order placed";
  if (status === "PAYMENT_VERIFIED") return "Awaiting pickup";
  if (status === "FULFILLED") return "Completed";
  return status;
}

const MERCH_ORDER_HISTORY_DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "New order placed": "Customer submitted the order.",
  "Moved back to To process": "Status changed back to To process.",
  "Awaiting pickup": "Payment verified — awaiting pickup.",
  "Completed": "Order completed.",
  "Cancelled": "Order cancelled.",
};

export async function changeMerchOrderStatus(
  id: string,
  status: MerchOrderStatus,
  note: string
): Promise<MerchOrder | null> {
  const db = await ensureDb();
  const order = db.merchOrders.find((o) => o.id === id);
  if (!order) return null;
  if (status === order.status) return order;

  const prevIndex = MERCH_ORDER_STATUS_FLOW.indexOf(order.status);
  const nextIndex = MERCH_ORDER_STATUS_FLOW.indexOf(status);
  const isBackward = status !== "CANCELLED" && prevIndex !== -1 && nextIndex !== -1 && nextIndex < prevIndex;

  order.status = status;
  const now = new Date().toISOString();
  if (status === "PAYMENT_VERIFIED") order.verifiedAt = now;
  if (status === "FULFILLED") order.fulfilledAt = now;
  if (status === "CANCELLED") order.cancelledAt = now;

  const title = merchOrderHistoryTitle(status, isBackward);
  const description = note.trim() || MERCH_ORDER_HISTORY_DEFAULT_DESCRIPTIONS[title] || title;
  if (!order.orderHistory) order.orderHistory = [];
  order.orderHistory.push({ id: crypto.randomUUID(), title, description, at: now });

  await writeDb(db);
  return order;
}

/** Everything in the store for a downloadable backup — without the admin logins (password hashes) or payment codes. */
export async function getBackupData() {
  const db = await ensureDb();
  const { adminUsers: _adminUsers, paymentOtp: _paymentOtp, ...data } = db;
  void _adminUsers;
  void _paymentOtp;
  return data;
}
