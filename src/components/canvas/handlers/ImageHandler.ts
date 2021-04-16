export interface IFilter {
  type: typeof FILTER_TYPES[number];
  [key: string]: any;
}

export const FILTER_TYPES = [
  "grayscale",
  "invert",
  "remove-color",
  "sepia",
  "brownie",
  "brightness",
  "contrast",
  "saturation",
  "noise",
  "vintage",
  "pixelate",
  "blur",
  "sharpen",
  "emboss",
  "technicolor",
  "polaroid",
  "blend-color",
  "gamma",
  "kodachrome",
  "blackwhite",
  "blend-image",
  "hue",
  "resize",
  "tint",
  "mask",
  "multiply",
  "sepia2",
];
