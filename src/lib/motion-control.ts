export type MotionControlProduct = {
  id: string;
  name: string;
  description: string;
  image: string;
  /** Rate card PDF shown when the product is opened (empty = none uploaded yet) */
  rateCardUrl: string;
  isEnabled: boolean;
};

// Starting content for a new database — the client replaces these in Admin > Motion control.
export const defaultMotionControlProducts: MotionControlProduct[] = [
  {
    id: "motion-control-1",
    name: "Motion Control Product 1",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
    isEnabled: true,
  },
  {
    id: "motion-control-2",
    name: "Motion Control Product 2",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
    isEnabled: true,
  },
  {
    id: "motion-control-3",
    name: "Motion Control Product 3",
    description: "Placeholder description.",
    image: "/packages/camera-pkg.jpg",
    rateCardUrl: "/rate-cards/motion-control-sample.pdf",
    isEnabled: true,
  },
];
