"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  addGearCategory,
  changeMerchOrderStatus,
  changeOrderStatus,
  createEnquiry,
  createGearProduct,
  createMerchOrder,
  createMerchProduct,
  createOrder,
  createPackageProduct,
  createPortfolioProject,
  deleteGearProduct,
  deleteMerchProduct,
  deletePackageProduct,
  deletePortfolioProject,
  findAdminByEmail,
  movePortfolioProject,
  resolveImageList,
  saveUploadedImage,
  saveUploadedVideo,
  searchCatalog,
  updateBanner,
  updateEnquiry,
  updateGearProduct,
  updateMerchOrder,
  updateMerchProduct,
  updateNotificationSettings,
  updateOrder,
  updatePackageProduct,
  updatePaymentSettings,
  updatePortfolioProject,
  type BannerContent,
  type Enquiry,
  type MerchOrder,
  type MerchOrderStatus,
  type OrderItem,
  type OrderRequest,
  type OrderStatus,
  type PaymentMethod,
} from "./db";
import type { PackageSpecSection, WorkItem } from "@/lib/data";
import {
  sendCustomerConfirmationEmail,
  sendMerchCustomerConfirmationEmail,
  sendMerchOrderNotificationEmail,
  sendOrderNotificationEmail,
} from "./mailer";
import { verifyPassword } from "./passwords";
import {
  createPaymentUnlockToken,
  createSessionToken,
  PAYMENT_UNLOCK_COOKIE,
  PAYMENT_UNLOCK_SECONDS,
  SESSION_COOKIE,
  SESSION_COOKIE_MAX_AGE,
  verifyPaymentUnlockToken,
} from "./session";
import { checkPaymentOtp, issuePaymentOtp, type OtpRequestResult } from "./payment-otp";
import { verifyAdminSession } from "./dal";

export async function submitOrderRequest(input: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  companyName: string;
  rentalStartDate: string;
  rentalEndDate: string;
  customerNotes?: string;
  items: OrderItem[];
}): Promise<{ ok: boolean; orderNumber?: string }> {
  try {
    if (!input.customerName?.trim() || !input.customerPhone?.trim() || input.items.length === 0) {
      return { ok: false };
    }
    const order = await createOrder(input);
    // after(): lets the emails finish sending after the response goes out. A bare un-awaited call is
    // cut off on serverless hosts (Vercel), so the emails never left.
    after(async () => {
      await Promise.allSettled([sendOrderNotificationEmail(order), sendCustomerConfirmationEmail(order)]);
    });
    return { ok: true, orderNumber: order.orderNumber };
  } catch (err) {
    console.error("Failed to save order request", err);
    return { ok: false };
  }
}

export async function searchCatalogAction(query: string) {
  return searchCatalog(query);
}

export async function submitEnquiry(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ ok: boolean }> {
  try {
    if (!input.name?.trim() || !input.message?.trim()) {
      return { ok: false };
    }
    await createEnquiry(input);
    return { ok: true };
  } catch (err) {
    console.error("Failed to save enquiry", err);
    return { ok: false };
  }
}

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const admin = await findAdminByEmail(email);
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  const token = createSessionToken(admin.email);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function updateOrderAction(
  id: string,
  patch: Parameters<typeof updateOrder>[1]
): Promise<OrderRequest | null> {
  await verifyAdminSession();
  const order = await updateOrder(id, patch);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return order;
}

export async function changeOrderStatusAction(
  id: string,
  status: OrderStatus,
  note: string
): Promise<OrderRequest | null> {
  await verifyAdminSession();
  const order = await changeOrderStatus(id, status, note);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return order;
}

export async function updateEnquiryAction(
  id: string,
  patch: Parameters<typeof updateEnquiry>[1]
): Promise<Enquiry | null> {
  await verifyAdminSession();
  const enquiry = await updateEnquiry(id, patch);
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin/enquiries");
  return enquiry;
}

// ---------------------------------------------------------------------------
// Catalog actions: rental gear, packages, portfolio
// ---------------------------------------------------------------------------

type ActionResult = { ok: boolean; error?: string; id?: string };

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/rental");
  revalidatePath("/packages");
  revalidatePath("/our-work");
  revalidatePath("/merchandise");
  revalidatePath("/admin/products");
  revalidatePath("/admin/merchandise");
  revalidatePath("/admin/portfolio");
  revalidatePath("/admin/availability");
}

export async function addGearCategoryAction(name: string): Promise<string[]> {
  await verifyAdminSession();
  const categories = await addGearCategory(name);
  revalidatePath("/admin/products");
  return categories;
}

// One spec per line. "Mount: PL" becomes label "Mount" / value "PL"; a line
// without a colon is kept as a plain label-only line.
function parseSpecSections(value: FormDataEntryValue | null): PackageSpecSection[] {
  try {
    const raw = JSON.parse(String(value || "[]")) as { title?: string; items?: string[] }[];
    return raw
      .map((s) => ({
        title: String(s.title || "").trim(),
        items: (s.items ?? []).map((i) => String(i).trim()).filter(Boolean),
      }))
      .filter((s) => s.title);
  } catch {
    return [];
  }
}

async function resolveVideo(
  formData: FormData,
  folder: "gear" | "packages",
  existingVideoUrl: string | null
): Promise<string | null> {
  if (formData.get("removeVideo") === "1") return null;
  const file = formData.get("video") as File | null;
  if (file && file.size > 0) return saveUploadedVideo(file, folder);
  return existingVideoUrl;
}

export async function saveGearProductAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    let category = String(formData.get("category") || "CAMERA").trim();
    const brand = String(formData.get("brand") || "").trim();
    const dailyRate = Number(formData.get("dailyRate") || 0);
    const isNew = formData.get("isNew") === "on";
    const featuredOnHome = formData.get("featuredOnHome") === "on";
    const isEnabled = formData.get("isEnabled") === "on";
    const description = String(formData.get("description") || "").trim();
    const specSections = parseSpecSections(formData.get("specSections"));

    if (category === "__new__") {
      const newCategory = String(formData.get("newCategory") || "").trim().toUpperCase();
      if (!newCategory) return { ok: false, error: "Please name the new category." };
      await addGearCategory(newCategory);
      category = newCategory;
    }

    if (!name) return { ok: false, error: "Product name is required." };
    if (!Number.isFinite(dailyRate) || dailyRate < 0) {
      return { ok: false, error: "Daily rate must be a valid number." };
    }

    const images = await resolveImageList(formData, "images", "gear");
    if (images.length === 0) return { ok: false, error: "Please upload at least one product image." };
    const existingVideoUrl = String(formData.get("existingVideoUrl") || "") || null;
    const videoUrl = await resolveVideo(formData, "gear", existingVideoUrl);

    const patch = {
      name,
      category,
      brand,
      dailyRate,
      isNew,
      featuredOnHome,
      isEnabled,
      description,
      specSections,
      images,
      image: images[0],
      videoUrl,
    };

    let newId: string | undefined;
    if (id) {
      const updated = await updateGearProduct(id, patch);
      if (!updated) return { ok: false, error: "Product not found." };
    } else {
      const created = await createGearProduct(patch);
      newId = created.id;
    }

    revalidateCatalog();
    return { ok: true, id: newId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteGearProductAction(id: string): Promise<void> {
  await verifyAdminSession();
  await deleteGearProduct(id);
  revalidateCatalog();
}

export async function saveMerchProductAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const priceNumber = String(formData.get("price") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const shippingInfo = String(formData.get("shippingInfo") || "").trim();
    const isEnabled = formData.get("isEnabled") === "on";

    if (!name) return { ok: false, error: "Product name is required." };
    if (!priceNumber || Number.isNaN(Number(priceNumber)) || Number(priceNumber) < 0) {
      return { ok: false, error: "Price must be a valid number." };
    }
    if (!description) return { ok: false, error: "Description is required." };

    const images = await resolveImageList(formData, "images", "merch");
    if (images.length === 0) return { ok: false, error: "Please upload at least one product image." };

    const patch = {
      name,
      price: Number(priceNumber),
      description,
      shippingInfo,
      isEnabled,
      images,
      image: images[0],
    };

    let newId: string | undefined;
    if (id) {
      const updated = await updateMerchProduct(id, patch);
      if (!updated) return { ok: false, error: "Product not found." };
    } else {
      const created = await createMerchProduct(patch);
      newId = created.id;
    }

    revalidateCatalog();
    return { ok: true, id: newId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deleteMerchProductAction(id: string): Promise<void> {
  await verifyAdminSession();
  await deleteMerchProduct(id);
  revalidateCatalog();
}

export async function savePackageProductAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const id = String(formData.get("id") || "");
    const name = String(formData.get("name") || "").trim();
    const tagline = String(formData.get("tagline") || "").trim();
    const priceNumber = String(formData.get("price") || "").trim();
    const period = String(formData.get("period") || "/day").trim();
    const featured = formData.get("featured") === "on";
    const featuredOnHome = formData.get("featuredOnHome") === "on";
    const isEnabled = formData.get("isEnabled") === "on";
    const description = String(formData.get("description") || "").trim();
    const features = linesToArray(formData.get("features")).slice(0, 5);
    const specSections = parseSpecSections(formData.get("specSections"));

    if (!name) return { ok: false, error: "Package name is required." };
    if (!priceNumber || Number.isNaN(Number(priceNumber))) {
      return { ok: false, error: "Price must be a valid number." };
    }
    const price = `RM ${Number(priceNumber).toLocaleString()}`;

    const images = await resolveImageList(formData, "images", "packages");
    if (images.length === 0) return { ok: false, error: "Please upload at least one package image." };
    const existingVideoUrl = String(formData.get("existingVideoUrl") || "") || null;
    const videoUrl = await resolveVideo(formData, "packages", existingVideoUrl);

    const patch = {
      name,
      tagline,
      price,
      period,
      featured,
      featuredOnHome,
      isEnabled,
      description,
      features,
      specSections,
      images,
      image: images[0],
      videoUrl,
    };

    let newId: string | undefined;
    if (id) {
      const updated = await updatePackageProduct(id, patch);
      if (!updated) return { ok: false, error: "Package not found." };
    } else {
      const created = await createPackageProduct(patch);
      newId = created.id;
    }

    revalidateCatalog();
    return { ok: true, id: newId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deletePackageProductAction(id: string): Promise<void> {
  await verifyAdminSession();
  await deletePackageProduct(id);
  revalidateCatalog();
}

export async function savePortfolioProjectAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "").trim();
    const client = String(formData.get("client") || "").trim();
    const year = String(formData.get("year") || "").trim();
    const orientation = String(formData.get("orientation") || "landscape") as WorkItem["orientation"];
    const embedUrl = String(formData.get("embedUrl") || "").trim();
    const tags = formData.getAll("tags").map((t) => String(t).trim().toUpperCase()).filter(Boolean);
    const isEnabled = formData.get("isEnabled") === "on";
    const file = formData.get("image") as File | null;

    if (!title) return { ok: false, error: "Project title is required." };

    let image: string | undefined;
    if (file && file.size > 0) {
      image = await saveUploadedImage(file, "portfolio");
    }

    const patch = { title, client, year, orientation, embedUrl, tags, isEnabled, ...(image ? { image } : {}) };

    let newId: string | undefined;
    if (id) {
      const updated = await updatePortfolioProject(id, patch);
      if (!updated) return { ok: false, error: "Project not found." };
    } else {
      if (!image) return { ok: false, error: "Please upload a cover image." };
      const created = await createPortfolioProject({ ...patch, image });
      newId = created.id;
    }

    revalidateCatalog();
    return { ok: true, id: newId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function deletePortfolioProjectAction(id: string): Promise<void> {
  await verifyAdminSession();
  await deletePortfolioProject(id);
  revalidateCatalog();
}

export async function movePortfolioProjectAction(id: string, direction: "up" | "down"): Promise<void> {
  await verifyAdminSession();
  await movePortfolioProject(id, direction);
  revalidateCatalog();
}

function linesToArray(value: FormDataEntryValue | null): string[] {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Merchandise checkout
// ---------------------------------------------------------------------------

export async function submitMerchOrder(
  formData: FormData
): Promise<{ ok: boolean; orderNumber?: string; error?: string }> {
  try {
    const productId = String(formData.get("productId") || "");
    const productName = String(formData.get("productName") || "").trim();
    const productImage = String(formData.get("productImage") || "") || null;
    const unitPrice = Number(formData.get("unitPrice") || 0);
    const size = String(formData.get("size") || "").trim();
    const quantity = Math.max(1, Number(formData.get("quantity") || 1));
    const customerName = String(formData.get("customerName") || "").trim();
    const customerPhone = String(formData.get("customerPhone") || "").trim();
    const customerEmail = String(formData.get("customerEmail") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const paymentMethod = String(formData.get("paymentMethod") || "") as PaymentMethod;
    const notes = String(formData.get("notes") || "").trim();
    const slipFile = formData.get("paymentSlip") as File | null;

    if (!productName || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return { ok: false, error: "Missing product details." };
    }
    if (!customerName || !customerPhone) {
      return { ok: false, error: "Name and phone are required." };
    }
    if (paymentMethod !== "BANK_TRANSFER" && paymentMethod !== "QR_PAYMENT") {
      return { ok: false, error: "Please select a payment method." };
    }
    if (!slipFile || slipFile.size === 0) {
      return { ok: false, error: "Please upload your payment slip." };
    }

    const paymentSlipUrl = await saveUploadedImage(slipFile, "payment-slips");

    const order = await createMerchOrder({
      productId: productId || null,
      productName,
      productImage,
      size,
      quantity,
      unitPrice,
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      paymentMethod,
      paymentSlipUrl,
      notes,
    });

    after(async () => {
      await Promise.allSettled([
        sendMerchOrderNotificationEmail(order),
        sendMerchCustomerConfirmationEmail(order),
      ]);
    });

    revalidatePath("/admin/merch-orders");
    return { ok: true, orderNumber: order.orderNumber };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function updateMerchOrderAction(
  id: string,
  patch: Parameters<typeof updateMerchOrder>[1]
): Promise<MerchOrder | null> {
  await verifyAdminSession();
  const order = await updateMerchOrder(id, patch);
  revalidatePath(`/admin/merch-orders/${id}`);
  revalidatePath("/admin/merch-orders");
  return order;
}

export async function changeMerchOrderStatusAction(
  id: string,
  status: MerchOrderStatus,
  note: string
): Promise<MerchOrder | null> {
  await verifyAdminSession();
  const order = await changeMerchOrderStatus(id, status, note);
  revalidatePath(`/admin/merch-orders/${id}`);
  revalidatePath("/admin/merch-orders");
  revalidatePath("/admin");
  return order;
}

export async function saveBannerAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const page = String(formData.get("page") || "") as "home" | "rental";
    if (page !== "home" && page !== "rental") return { ok: false, error: "Unknown banner." };

    const subtitle = String(formData.get("subtitle") || "").trim();
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const clamp = (n: number) => (Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50);
    const focusX = clamp(Number(formData.get("focusX")));
    const focusY = clamp(Number(formData.get("focusY")));
    const removeImage = formData.get("removeImage") === "1";
    const existingImage = String(formData.get("existingImage") || "") || null;
    const file = formData.get("image") as File | null;

    let image: string | null = existingImage;
    if (removeImage) {
      image = null;
    } else if (file && file.size > 0) {
      image = await saveUploadedImage(file, "banners");
    }

    const patch: Partial<BannerContent> = { subtitle, title, description, image, focusX, focusY };
    await updateBanner(page, patch);

    revalidatePath("/");
    revalidatePath("/rental");
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function requestPaymentOtpAction(): Promise<OtpRequestResult> {
  await verifyAdminSession();
  return issuePaymentOtp();
}

export async function verifyPaymentOtpAction(code: string): Promise<ActionResult> {
  await verifyAdminSession();
  const result = await checkPaymentOtp(code);
  if (!result.ok) return result;
  (await cookies()).set(PAYMENT_UNLOCK_COOKIE, createPaymentUnlockToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PAYMENT_UNLOCK_SECONDS,
  });
  return { ok: true };
}

export async function updatePaymentSettingsAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  const jar = await cookies();
  if (!verifyPaymentUnlockToken(jar.get(PAYMENT_UNLOCK_COOKIE)?.value)) {
    return { ok: false, error: "OTP_REQUIRED" };
  }
  try {
    const bankName = String(formData.get("bankName") || "").trim();
    const accountName = String(formData.get("accountName") || "").trim();
    const accountNumber = String(formData.get("accountNumber") || "").trim();
    const removeQr = formData.get("removeQr") === "1";
    const file = formData.get("qrImage") as File | null;

    let qrImage: string | null | undefined;
    if (file && file.size > 0) {
      qrImage = await saveUploadedImage(file, "payment-settings");
    } else if (removeQr) {
      qrImage = null;
    }

    await updatePaymentSettings({
      bankName,
      accountName,
      accountNumber,
      ...(qrImage !== undefined ? { qrImage } : {}),
    });

    jar.delete(PAYMENT_UNLOCK_COOKIE); // each edit needs a fresh code
    revalidatePath("/admin/settings");
    revalidatePath("/merchandise/checkout");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function updateNotificationSettingsAction(formData: FormData): Promise<ActionResult> {
  await verifyAdminSession();
  try {
    const emailEnabled = formData.get("emailEnabled") === "on";
    const notifyEmail = String(formData.get("notifyEmail") || "").trim();
    const pushEnabled = formData.get("pushEnabled") === "on";

    await updateNotificationSettings({ emailEnabled, notifyEmail, pushEnabled });

    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

// ---------------------------------------------------------------------------
// Enable/disable toggles for catalog list pages
// ---------------------------------------------------------------------------

export async function toggleGearEnabledAction(id: string, isEnabled: boolean): Promise<ActionResult> {
  await verifyAdminSession();
  await updateGearProduct(id, { isEnabled });
  revalidateCatalog();
  return { ok: true };
}

export async function togglePackageEnabledAction(id: string, isEnabled: boolean): Promise<ActionResult> {
  await verifyAdminSession();
  await updatePackageProduct(id, { isEnabled });
  revalidateCatalog();
  return { ok: true };
}

export async function toggleMerchEnabledAction(id: string, isEnabled: boolean): Promise<ActionResult> {
  await verifyAdminSession();
  await updateMerchProduct(id, { isEnabled });
  revalidateCatalog();
  return { ok: true };
}

export async function togglePortfolioEnabledAction(id: string, isEnabled: boolean): Promise<ActionResult> {
  await verifyAdminSession();
  await updatePortfolioProject(id, { isEnabled });
  revalidateCatalog();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Admin-entered (offline) orders
// ---------------------------------------------------------------------------

type ManualOrderResult = { ok: boolean; error?: string; orderNumber?: string };

export async function createOrderManualAction(formData: FormData): Promise<ManualOrderResult> {
  await verifyAdminSession();
  try {
    const customerName = String(formData.get("customerName") || "").trim();
    const customerPhone = String(formData.get("customerPhone") || "").trim();
    const customerEmail = String(formData.get("customerEmail") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const rentalStartDate = String(formData.get("rentalStartDate") || "");
    const rentalEndDate = String(formData.get("rentalEndDate") || "");

    if (!customerName || !customerPhone || !customerEmail) {
      return { ok: false, error: "Customer name, phone and email are required." };
    }

    let items: OrderItem[];
    try {
      items = JSON.parse(String(formData.get("items") || "[]"));
    } catch {
      items = [];
    }
    if (!Array.isArray(items) || items.length === 0) {
      return { ok: false, error: "Add at least one item." };
    }

    const order = await createOrder({
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      rentalStartDate,
      rentalEndDate,
      items,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true, orderNumber: order.orderNumber };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function uploadMerchPaymentSlipAction(
  id: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string; url?: string }> {
  await verifyAdminSession();
  try {
    const file = formData.get("paymentSlip") as File | null;
    if (!file || file.size === 0) return { ok: false, error: "Please choose an image." };
    const url = await saveUploadedImage(file, "payment-slips");
    const updated = await updateMerchOrder(id, { paymentSlipUrl: url });
    if (!updated) return { ok: false, error: "Order not found." };
    revalidatePath(`/admin/merch-orders/${id}`);
    return { ok: true, url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}

export async function createMerchOrderManualAction(formData: FormData): Promise<ManualOrderResult> {
  await verifyAdminSession();
  try {
    const productId = String(formData.get("productId") || "");
    const productName = String(formData.get("productName") || "").trim();
    const productImage = String(formData.get("productImage") || "") || null;
    const unitPrice = Number(formData.get("unitPrice") || 0);
    const size = String(formData.get("size") || "").trim();
    const quantity = Math.max(1, Number(formData.get("quantity") || 1));
    const customerName = String(formData.get("customerName") || "").trim();
    const customerPhone = String(formData.get("customerPhone") || "").trim();
    const customerEmail = String(formData.get("customerEmail") || "").trim();
    const companyName = String(formData.get("companyName") || "").trim();
    const slipFile = formData.get("paymentSlip") as File | null;

    if (!productName || !Number.isFinite(unitPrice) || unitPrice < 0) {
      return { ok: false, error: "Please choose a product." };
    }
    if (!customerName || !customerPhone || !customerEmail) {
      return { ok: false, error: "Customer name, phone and email are required." };
    }

    const order = await createMerchOrder({
      productId: productId || null,
      productName,
      productImage,
      size,
      quantity,
      unitPrice,
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      paymentMethod: "BANK_TRANSFER",
      paymentSlipUrl: slipFile && slipFile.size > 0 ? await saveUploadedImage(slipFile, "payment-slips") : null,
      notes: "Entered manually by admin (offline order).",
    });

    revalidatePath("/admin/merch-orders");
    revalidatePath("/admin");
    return { ok: true, orderNumber: order.orderNumber };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }
}
