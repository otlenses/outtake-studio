export type MotionControlProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  /** Rate card PDF shown when the product is opened */
  rateCardUrl: string;
};

// Placeholder content — swap the names, images and PDFs when the real ones are ready.
export const motionControlProducts: MotionControlProduct[] = [
  {
    id: "motion-control-1",
    name: "Motion Control Product 1",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
  },
  {
    id: "motion-control-2",
    name: "Motion Control Product 2",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
  },
  {
    id: "motion-control-3",
    name: "Motion Control Product 3",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
  },
];
