export const WHATSAPP_NUMBER = "601126860255";

export type MerchItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  shippingInfo: string;
};

export const MERCH_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const merchItems: MerchItem[] = [
  {
    id: "merch-1",
    name: "Out Take Studio Classic Tee",
    price: 89,
    image: "/merch/merch-shirt-2.jpg",
    description:
      "Heavyweight cotton tee with the Out Take Studio wordmark. A simple everyday layer for anyone on set or off.",
    shippingInfo:
      "Orders ship within 3-5 business days across Malaysia. International shipping available on request. Unworn, unwashed items with tags attached may be exchanged within 14 days of delivery — reach out to us on WhatsApp to arrange an exchange.",
  },
];

export function getMerchItem(id: string): MerchItem | undefined {
  return merchItems.find((item) => item.id === id);
}

export function getMerchGallery(item: MerchItem): string[] {
  return item.images && item.images.length > 0 ? item.images : [item.image];
}

export const services = [
  {
    code: "01",
    title: "Commercial Videography",
    blurb: "Brand films and ad campaigns shot to perform across broadcast and social.",
    details:
      "From concept development through final delivery, we produce commercial films built to perform across broadcast, streaming, and paid social. Our team handles casting, locations, and full crew logistics, with a colour and sound finish tailored to each platform's spec.",
  },
  {
    code: "02",
    title: "Corporate Videography",
    blurb: "Culture films, internal comms, and executive interviews with a polished, honest tone.",
    details:
      "We help companies tell their own story — culture and recruitment films, internal communications, town halls, and executive interviews — shot with a documentary sensibility and finished to a broadcast-grade polish that still feels human.",
  },
  {
    code: "03",
    title: "Photography + Digital Imaging",
    blurb: "Editorial, product, and campaign stills with full retouch and colour pipeline.",
    details:
      "Our stills team covers editorial, product, and campaign photography with an in-house retouch and colour pipeline, so every image ships consistent with your brand guidelines and ready for print or digital use straight out of delivery.",
  },
  {
    code: "04",
    title: "Cinematography",
    blurb: "DP services for music videos, features, and narrative work — camera to colour.",
    details:
      "We provide dedicated DP services for music videos, short and feature films, and narrative commercial work — from camera and lighting design on set through to the final colour grade, keeping one consistent creative eye across the whole image pipeline.",
  },
  {
    code: "05",
    title: "Equipment Rental",
    blurb: "Cinema cameras, glass, lighting, and grip — professionally maintained, ready to ship.",
    details:
      "Our rental floor stocks cinema camera bodies, cine and photo lenses, lighting, and grip — every unit professionally serviced and calibrated between bookings. Browse the full catalogue or talk to us about a custom package for your next shoot.",
  },
];

export type WorkItem = {
  id: string;
  title: string;
  tags: string[];
  image: string;
  video?: string;
  orientation: "landscape" | "portrait";
  /** YouTube/Vimeo embed URL shown on the project's detail page */
  embedUrl?: string;
  client?: string;
  year?: string;
};

// Placeholder embed used until each project has its own real YouTube/Vimeo link.
const PLACEHOLDER_EMBED = "https://www.youtube.com/embed/aqz-KE-bpKQ";

export const workItems: WorkItem[] = [
  { id: "w1", title: "Midnight Runners", tags: ["MV"], image: "/work/ref-mv-dance.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Neon Wave Records", year: "2025" },
  { id: "w2", title: "Field Notes", tags: ["COMMERCIAL"], image: "/work/ref-ikea-commercial.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "IKEA Malaysia", year: "2025" },
  { id: "w3", title: "Halcyon", tags: ["FASHION"], image: "/work/ref-red-car-portrait.png", orientation: "portrait", embedUrl: PLACEHOLDER_EMBED, client: "Halcyon Studio", year: "2024" },
  { id: "w4", title: "Static & Noise", tags: ["FILM"], image: "/work/ref-mv-dance.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Independent", year: "2024" },
  { id: "w5", title: "Second Skin", tags: ["FASHION", "MV"], image: "/work/ref-ikea-commercial.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Second Skin Collective", year: "2025" },
  { id: "w6", title: "Glasshouse", tags: ["COMMERCIAL"], image: "/work/ref-mv-dance.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Glasshouse Interiors", year: "2024" },
  { id: "w7", title: "Ember", tags: ["FEATURE"], image: "/work/ref-ikea-commercial.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Ember Films", year: "2023" },
  { id: "w8", title: "Overdrive", tags: ["COMMERCIAL"], image: "/work/ref-mv-dance.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Overdrive Motors", year: "2025" },
  { id: "w9", title: "Loewe SS26", tags: ["FASHION"], image: "/work/ref-red-car-portrait.png", orientation: "portrait", embedUrl: PLACEHOLDER_EMBED, client: "Loewe", year: "2026" },
  { id: "w10", title: "Paper Trail", tags: ["MV"], image: "/work/ref-ikea-commercial.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Paper Trail", year: "2024" },
  { id: "w11", title: "Homecoming", tags: ["FEATURE", "FILM"], image: "/work/ref-mv-dance.png", orientation: "landscape", embedUrl: PLACEHOLDER_EMBED, client: "Homecoming Productions", year: "2023" },
];

export function getWorkItem(id: string): WorkItem | undefined {
  return workItems.find((item) => item.id === id);
}

export const DEFAULT_GEAR_CATEGORIES = ["CAMERA", "LENS", "LIGHT", "GRIP"];

export type GearSpecField = { label: string; value: string };

export type GearItem = {
  id: string;
  name: string;
  category: string;
  brand: string;
  dailyRate: number;
  image: string;
  images?: string[];
  videoUrl?: string | null;
  description?: string;
  /** @deprecated replaced by specSections (migrated automatically) */
  customSpecs?: GearSpecField[];
  /** Admin-editable spec sections (title + one item per line) */
  specSections?: PackageSpecSection[];
  isNew?: boolean;
  /** Show this item in the home page rental carousel */
  featuredOnHome?: boolean;
};

export const gearItems: GearItem[] = [
  { id: "g1", name: "Canon EOS R5 C Body", category: "CAMERA", brand: "Canon", dailyRate: 63.33, image: "/gear/ref-lens.jpg" },
  { id: "g2", name: "Sony FX6 Body", category: "CAMERA", brand: "Sony", dailyRate: 75.0, image: "/gear/ref-lens.jpg" },
  { id: "g3", name: "ARRI Alexa Mini LF", category: "CAMERA", brand: "ARRI", dailyRate: 210.0, image: "/gear/ref-lens.jpg" },
  { id: "g4", name: "Zeiss Supreme Prime 35mm", category: "LENS", brand: "Zeiss", dailyRate: 45.0, image: "/gear/ref-lens.jpg" },
  { id: "g5", name: "ARRI SkyPanel S60-C", category: "LIGHT", brand: "ARRI", dailyRate: 55.0, image: "/gear/ref-lens.jpg" },
  { id: "g6", name: "DJI RS 3 Pro Gimbal", category: "GRIP", brand: "DJI", dailyRate: 30.0, image: "/gear/ref-lens.jpg" },
  { id: "g7", name: "Laowa 8-15mm Fisheye Zoom", category: "LENS", brand: "Laowa", dailyRate: 48.0, image: "/gear/ref-lens.jpg" },
  { id: "g8", name: "RED V-Raptor 8K", category: "CAMERA", brand: "RED", dailyRate: 265.0, image: "/gear/ref-lens.jpg", isNew: true },
  { id: "g9", name: "Aputure 600d Pro", category: "LIGHT", brand: "Aputure", dailyRate: 62.0, image: "/gear/ref-lens.jpg" },
  { id: "g10", name: "Sachtler Fluid Head Tripod", category: "GRIP", brand: "Sachtler", dailyRate: 25.0, image: "/gear/ref-lens.jpg" },
  { id: "g11", name: "Canon CN-E 24mm T1.5", category: "LENS", brand: "Canon", dailyRate: 52.0, image: "/gear/ref-lens.jpg" },
  { id: "g12", name: "DJI Ronin 4D", category: "CAMERA", brand: "DJI", dailyRate: 180.0, image: "/gear/ref-lens.jpg", isNew: true },
  { id: "g13", name: "Sony A7S III Body", category: "CAMERA", brand: "Sony", dailyRate: 58.0, image: "/gear/ref-lens.jpg" },
  { id: "g14", name: "Canon C300 Mark III", category: "CAMERA", brand: "Canon", dailyRate: 145.0, image: "/gear/ref-lens.jpg" },
  { id: "g15", name: "Zeiss Otus 55mm f/1.4", category: "LENS", brand: "Zeiss", dailyRate: 40.0, image: "/gear/ref-lens.jpg" },
  { id: "g16", name: "Aputure Nova P600c", category: "LIGHT", brand: "Aputure", dailyRate: 70.0, image: "/gear/ref-lens.jpg", isNew: true },
  { id: "g17", name: "Freefly MoVI Pro Gimbal", category: "GRIP", brand: "Freefly", dailyRate: 95.0, image: "/gear/ref-lens.jpg" },
  { id: "g18", name: "Litepanels Gemini 2x1", category: "LIGHT", brand: "Litepanels", dailyRate: 58.0, image: "/gear/ref-lens.jpg" },
  { id: "g19", name: "Sony FE 24-70mm f/2.8 GM", category: "LENS", brand: "Sony", dailyRate: 44.0, image: "/gear/ref-lens.jpg" },
  { id: "g20", name: "Canon RF 50mm f/1.2L", category: "LENS", brand: "Canon", dailyRate: 46.0, image: "/gear/ref-lens.jpg" },
  { id: "g21", name: "ARRI Trinity Stabilizer", category: "GRIP", brand: "ARRI", dailyRate: 320.0, image: "/gear/ref-lens.jpg", isNew: true },
  { id: "g22", name: "DJI Inspire 3 Drone", category: "CAMERA", brand: "DJI", dailyRate: 250.0, image: "/gear/ref-lens.jpg", isNew: true },
  { id: "g23", name: "Zeiss CP.3 25mm T2.1", category: "LENS", brand: "Zeiss", dailyRate: 38.0, image: "/gear/ref-lens.jpg" },
  { id: "g24", name: "Aputure Amaran 300x", category: "LIGHT", brand: "Aputure", dailyRate: 35.0, image: "/gear/ref-lens.jpg" },
  { id: "g25", name: "Sachtler Video 20 Tripod", category: "GRIP", brand: "Sachtler", dailyRate: 32.0, image: "/gear/ref-lens.jpg" },
  { id: "g26", name: "Sony FX3 Body", category: "CAMERA", brand: "Sony", dailyRate: 68.0, image: "/gear/ref-lens.jpg" },
  { id: "g27", name: "Litepanels Astra 6X", category: "LIGHT", brand: "Litepanels", dailyRate: 44.0, image: "/gear/ref-lens.jpg" },
  { id: "g28", name: "Canon EOS C70 Body", category: "CAMERA", brand: "Canon", dailyRate: 88.0, image: "/gear/ref-lens.jpg" },
];

export function getGearItem(id: string): GearItem | undefined {
  return gearItems.find((item) => item.id === id);
}

export type GalleryItem =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster: string };

export function getGearGallery(item: GearItem): GalleryItem[] {
  const images = item.images && item.images.length > 0 ? item.images : [item.image];
  const gallery: GalleryItem[] = images.map((src) => ({ type: "image", src }));
  if (item.videoUrl) {
    gallery.push({ type: "video", src: item.videoUrl, poster: images[0] });
  }
  return gallery;
}

const CATEGORY_OVERVIEWS: Record<string, string> = {
  CAMERA:
    "A professional-grade camera body trusted on commercial, narrative, and broadcast sets. Fully serviced and calibrated between every rental, with all standard accessories included.",
  LENS:
    "A precision optic built for consistent, cinematic results. Housing, glass, and mount are inspected before every checkout to guarantee smooth focus pulls and clean image quality.",
  LIGHT:
    "A reliable lighting fixture for controlled, repeatable output on location or in studio. Includes stand mount compatibility and standard power accessories.",
  GRIP:
    "Production-tested support gear built for long shoot days. Maintained to studio standards so it performs the same on set as it does in the shop.",
};

const DEFAULT_OVERVIEW =
  "Professionally serviced and calibrated between every rental, ready to perform on set at Out Take Studio.";

export function getGearOverview(item: GearItem): string {
  if (item.description?.trim()) return item.description;
  const overview = CATEGORY_OVERVIEWS[item.category] ?? DEFAULT_OVERVIEW;
  return `The ${item.name} is part of our ${item.brand} lineup, available for daily rental at Out Take Studio. ${overview}`;
}

export function getGearSpecs(item: GearItem): GearSpecField[] {
  const base: GearSpecField[] = [
    { label: "Brand", value: item.brand },
    { label: "Category", value: toTitleCase(item.category) },
    { label: "Daily Rate", value: `RM ${item.dailyRate.toFixed(2)} / day` },
  ];
  return base;
}

export const categories = [
  { id: "cameras", title: "Cameras", image: "/category/cameras.jpg" },
  { id: "photo-lenses", title: "Photo Lenses", image: "/category/lenses.jpg" },
  { id: "cine-lenses", title: "Cine Lenses", image: "/category/cine.jpg" },
  { id: "light", title: "Light", image: "/category/light.jpg" },
];

export type PackageSpecSection = { title: string; items: string[] };

export type PackageItem = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period: string;
  image: string;
  images?: string[];
  videoUrl?: string | null;
  featured?: boolean;
  /** Show this package in the home page's curated carousel */
  featuredOnHome?: boolean;
  /** Short spec bullets shown on the card */
  features: string[];
  /** Longer marketing paragraph shown on the detail page */
  description: string;
  /** Admin-editable spec sections, e.g. What's Included, Battery, Lens Control */
  specSections: PackageSpecSection[];
};

export const packages: PackageItem[] = [
  {
    id: "nikon-zr-6k",
    name: "Nikon ZR 6K Full Camera Package",
    tagline: "Compact 6K cinema body for lean crews",
    price: "RM 1,500",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    featuredOnHome: true,
    features: [
      "Dual Native ISO 800 & 4000",
      "14 Stops Dynamic Range",
      "R3D RAW Recording",
      "4inch LCD Screen",
      "E-mount option available",
    ],
    description:
      "The Nikon ZR 6K Full Camera Package pairs a compact 6K cinema body with dual native ISO and R3D RAW recording, caged and ready to shoot. A lean, lightweight setup built for run-and-gun crews and one-camera productions that still need a full cinema pipeline.",
    specSections: [
      { title: "What's Included", items: [
      "1x Nikon ZR 6K Cinema Camera Kit",
      "1x Tilta Cage",
      "2x 512GB CFAST Type B Card",
      "3x Battery w/ 1x dual charger",
      "1x E-mount Adapter",
      "1x EF-Mount Adapter or PL-Mount Adapter",
    ] },
      { title: "Battery", items: [
      "4x SWIT 135wh Compact V-Mount",
      "4x SWIT 99wh Compact V-Mount",
      "1x 2-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "sony-fx5",
    name: "Sony FX5 Full Camera Package",
    tagline: "Versatile full-frame body for commercial & MV work",
    price: "RM 2,000",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: true,
    featuredOnHome: true,
    features: [
      "5K 3:2 Open Gate",
      "5K 120fps, 4K 240fps",
      "15 Stops Dynamic Range",
      "Three Native ISO 800, 4000 & 12800",
      "16-bit color depth linear RAW",
    ],
    description:
      "The Sony FX5 Full Camera Package delivers full-frame 5K open-gate recording with triple native ISO and 15 stops of dynamic range. A go-to setup for commercial, corporate, and music video shoots that need high frame rates without sacrificing low-light performance.",
    specSections: [
      { title: "What's Included", items: [
      "1x Sony FX5 Cinema Camera Kit",
      "1x Tilta Full Cage w/ Top Handle, Dovetail plate",
      "2x 240GB CFA Card",
      "1x 512GB CFA Card",
      "3x Sony NP-SA100 Battery w/ 1x Dual Charger",
      "1x V-mount Battery Plate",
      "1x Mofage Poco II Drop-in Filter Adapter w/ V-ND (PL & EF)",
    ] },
      { title: "Battery", items: [
      "4x SWIT 140wh Compact V-Mount",
      "6x SWIT 99wh Compact V-Mount",
      "1x 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "kinefinity-mavo-lf",
    name: "Kinefinity Mavo LF Full Camera Package",
    tagline: "Lightweight large-format cinema body",
    price: "RM 1,500",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    features: [
      "6K 3:2 Open Gate",
      "4k 110fps, 2k 290fps",
      "14 Stops Dynamic Range",
      "Arri Alexa Color Science",
      "ProRes 4444XQ",
      "1kg light weight body",
      "Adaptable to all mounts",
      "E-mount option available",
    ],
    description:
      "The Kinefinity Mavo LF Full Camera Package brings large-format 6K imaging into a body weighing just over a kilogram. Arri Alexa colour science and ProRes 4444XQ make it a favourite for narrative and documentary crews who need cinema-grade colour in a mount-agnostic, travel-friendly form factor.",
    specSections: [
      { title: "What's Included", items: [
      "1x Kinefinity Mavo Edge 6K Cinema Camera",
      "3x 1TB SSD Card",
      "1x Movcam KineKIT Edge Kit and Sliding Dove Plate Kit",
      "1x 10' Compact Dovetail",
      "1x KineMON-7U2 Ultra-Bright Monitor 2200 nits (7inch On-board Touch Screen Monitor)",
      "1x E-Mount",
      "1x PL-Mount",
      "1x EF-Mount",
    ] },
      { title: "Battery", items: [
      "6x SWIT 135wh Compact V-Mount",
      "6x SWIT 99wh Compact V-Mount",
      "1x 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "kinefinity-mavo-edge-6k",
    name: "Kinefinity Mavo Edge 6K Full Camera Package",
    tagline: "Modular 6K body with internal ND",
    price: "RM 2,200",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    features: [
      "6K 3:2 Open Gate",
      "4k 110fps, 2k 290fps",
      "14 Stops Dynamic Range",
      "Arri Alexa Color Science",
      "ProRes 4444XQ / CDNG RAW",
      "Internal ND",
      "1.5kg light weight body",
      "Adaptable to all mounts",
      "E-mount option available",
    ],
    description:
      "The Kinefinity Mavo Edge 6K Full Camera Package adds built-in ND to the Mavo platform's large-format 6K sensor and Arri-matched colour science. A modular, mount-adaptable body suited to narrative, commercial, and gimbal-heavy productions alike.",
    specSections: [
      { title: "What's Included", items: [
      "1x Kinefinity Mavo Edge 6K Cinema Camera",
      "3x 1TB SSD Card",
      "1x Movcam KineKIT Edge Kit and Sliding Dove Plate Kit",
      "1x 10' Compact Dovetail",
      "1x KineMON-7U2 Ultra-Bright Monitor 2200 nits (7inch On-board Touch Screen Monitor)",
      "1x E-Mount",
      "1x PL-Mount",
      "1x EF-Mount",
    ] },
      { title: "Battery", items: [
      "6x SWIT 140wh Compact V-Mount",
      "6x SWIT 99wh Compact V-Mount",
      "1x 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "dji-ronin-4d",
    name: "DJI Ronin 4D 8K Full Camera Package",
    tagline: "Gimbal-integrated 8K system, no external stabilizer needed",
    price: "RM 2,500",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    featuredOnHome: true,
    features: [
      "4k 120fps in full frame",
      "14 Stops Dynamic Range",
      "ProRes RAW",
      "Internal ND",
      "4D Flex option available",
      "Adaptable to all mounts",
      "E-mount option available",
    ],
    description:
      "The DJI Ronin 4D 8K Full Camera Package is a fully integrated gimbal-camera system — no external stabilizer rigging required. With 4K120 full-frame capture, internal ND, and the 4D Flex head option, it's built for run-and-gun operators who need smooth, cinema-grade footage fast.",
    specSections: [
      { title: "What's Included", items: [
      "1x DJI Ronin 4D-8K Cinema Camera Full Eco System Package",
      "3x 1TB PRO SSD",
      "1x DJI Ronin 4D Video Transmitter",
      "1x DJI Ronin 4D Expansion Plate",
      "1x DJI Zenmuse X9 Focus Motor w/ Focus Gear",
      "1x DJI High Bright Monitor w/ V-Mount Plate & Expansion Plate",
      "1x DJI 3-Channel Follow Focus Hand Unit w/ Control Link",
      "1x Zenmuse X9 Counterweight",
      "1x Ronin 4D Hand Grips Combo",
      "1x E-Mount Adapter, 1x PL Adapter, 1x EF Adapter",
      "1x DJI D-Tap to DC-IN Power Cable (0.5m)",
      "1x DJI Ronin 4D Hand Grips Mount Universal Adapter",
      "1x V-Mount Battery Plate",
    ] },
      { title: "Battery", items: [
      "4x DJI TB50 Battery",
      "1x DJI TB50 Quad Charger",
      "6x SWIT 140wh Compact V-Mount",
      "6x SWIT 99wh Compact V-Mount",
      "1x 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "sony-venice-6k",
    name: "Sony Venice 6K Full Camera Package",
    tagline: "Flagship large-format cinema camera",
    price: "RM 2,800",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    featuredOnHome: true,
    features: [
      "6K 3:2 Open Gate",
      "14 Stops Dynamic Range",
      "Dual Native ISO 500 & 2500",
      "16-bit color depth linear RAW",
      "Built-in mechanical ND",
      "Rialto extension system available",
    ],
    description:
      "The Sony Venice 6K Full Camera Package is a flagship large-format cinema system built-in mechanical ND, dual native ISO, and full 16-bit linear RAW. The industry-standard choice for broadcast, feature, and high-end commercial productions.",
    specSections: [
      { title: "What's Included", items: [
      "1x Sony Venice 6K Cinema Camera Kit",
      "1x Sony DVF-EL200 OLED Viewfinder",
      "1x Sony Venice EVF Cable - 21in/54cm",
      "3x Sony AXSM 512GB S48 Memory Cards",
      "1x Sony AXS-R7 4K Raw Recorder",
      "1x Sony CR-1 Card Reader",
      "1x Sony Venice PL Mount",
      "1x EF to Sony E-mount",
      "1x Wooden Camera D-Box V-Mount",
      "1x Wooden Camera A-Box",
      "1x AC Power Supply",
    ] },
      { title: "Battery", items: [
      "4x SWIT 200wh Compact V-Mount",
      "8x SWIT 140wh Compact V-Mount",
      "1x SWIT 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "sony-venice-6k-rialto",
    name: "Sony Venice 6K with Rialto Full Camera Package",
    tagline: "Venice 6K plus the extension system for tight spaces",
    price: "RM 3,200",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    features: [
      "6K 3:2 Open Gate",
      "14 Stops Dynamic Range",
      "Dual Native ISO 500 & 2500",
      "16-bit color depth linear RAW",
      "Built-in mechanical ND",
      "Rialto extension system available",
    ],
    description:
      "The Sony Venice 6K with Rialto Full Camera Package extends the flagship Venice 6K sensor block up to 5.5 metres from the camera body — ideal for gimbal, car, and tight-space setups where a full-size body can't fit, without giving up any large-format image quality.",
    specSections: [
      { title: "What's Included", items: [
      "1x Sony Venice 6K Cinema Camera Kit",
      "1x Sony DVF-EL200 OLED Viewfinder",
      "1x Sony Venice EVF Cable - 21in/54cm",
      "3x Sony AXSM 512GB S48 Memory Cards",
      "1x Sony AXS-R7 4K Raw Recorder",
      "1x Sony CR-1 Card Reader",
      "1x Sony Venice PL Mount",
      "1x EF to Sony E-mount",
      "1x Wooden Camera D-Box V-Mount",
      "1x Wooden Camera A-Box",
      "1x AC Power Supply",
      "1x Sony Rialto System with Tilta Cage",
      "1x Rialto Extension Cable",
    ] },
      { title: "Battery", items: [
      "4x SWIT 200wh Compact V-Mount",
      "8x SWIT 140wh Compact V-Mount",
      "1x SWIT 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "arri-alexa-mini-lf",
    name: "ARRI Alexa Mini LF Full Camera Package",
    tagline: "The industry benchmark for cinema colour",
    price: "RM 4,000",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    features: [
      "4.5K 3:2 Open Gate",
      "14 Stops Dynamic Range",
      "ARRIRAW / PRORES 4444XQ",
      "Built-in mechanical ND",
      "Arri Alexa Color Science",
    ],
    description:
      "The ARRI Alexa Mini LF Full Camera Package is the industry benchmark for large-format cinema colour and dynamic range. ARRIRAW and ProRes 4444XQ recording, built-in mechanical ND, and a compact LF body make it the top-tier choice for feature films and premium commercial work.",
    specSections: [
      { title: "What's Included", items: [
      "1x ARRI Alexa Mini LF Kit",
      "3x Arri Codex Compact drive 1TB",
      "1x V-mount Power Splitting Box",
      "1x Arri EVF-2",
      "2x EVF Cable",
      "1x PL to LPL Mount",
      "1x EF-Mount",
      "1x M-Mount",
      "1x PL to LPL Mount w/ built-in Speed Booster",
      "1x Power Cable",
      "4x Arri 19mm Stainless Steel Rod",
    ] },
      { title: "Battery", items: [
      "6x SWIT 200wh Compact V-Mount",
      "8x SWIT 140wh Compact V-Mount",
      "1x SWIT 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M mark II Wireless Follow Focus kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
  {
    id: "red-v-raptor-8k",
    name: "RED V-Raptor 8K Full Camera Package",
    tagline: "8K large-format body built for high frame rates",
    price: "RM 2,600",
    period: "/day",
    image: "/packages/camera-pkg.jpg",
    featured: false,
    featuredOnHome: true,
    features: [
      "8K 3:2 Full Frame",
      "8K 120fps, 4K 240fps",
      "17+ Stops Dynamic Range",
      "R3D RAW & ProRes Recording",
      "Built-in ND filter",
    ],
    description:
      "The RED V-Raptor 8K Full Camera Package pairs a full-frame 8K sensor with 17+ stops of dynamic range and built-in ND — ideal for high-speed commercial work, action sequences, and productions that need to reframe or deliver in multiple formats from a single 8K master.",
    specSections: [
      { title: "What's Included", items: [
      "1x RED V-Raptor 8K VV Cinema Camera Kit",
      "1x RED Cage w/ Top Handle",
      "3x RED PRO 1TB SSD",
      "1x RED Station SSD Reader",
      "3x V-Lock Battery w/ 1x Dual Charger",
      "1x RF Mount",
      "1x PL Mount",
    ] },
      { title: "Battery", items: [
      "6x SWIT 140wh Compact V-Mount",
      "6x SWIT 99wh Compact V-Mount",
      "1x 4-Channel Fast Charge V-Mount Charger",
    ] },
      { title: "Lens Control", items: [
      "1x Tilta Nucleus-M Wireless Follow Focus Partial Kit",
      "with 1x Motor, 1x Hand Unit",
    ] },
    ],
  },
];

export function getPackage(id: string): PackageItem | undefined {
  return packages.find((pkg) => pkg.id === id);
}

export function getPackageGallery(pkg: PackageItem): string[] {
  return pkg.images && pkg.images.length > 0 ? pkg.images : [pkg.image, pkg.image, pkg.image];
}

/**
 * Title-cases a string so acronyms display as words too:
 * "Canon EOS R5 C Body" -> "Canon Eos R5 C Body".
 */
/** Product names: capitalise words that are all lowercase, leave ones that already have capitals (ZR, 6K, EOS) alone. */
export function formatName(str: string): string {
  return str.replace(/(^|[\s\-/(])([^\s\-/()]+)/g, (_m, sep: string, word: string) =>
    sep + (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
  );
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(^|[\s\-/(])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}
