export {};

type T = Window & typeof globalThis;

declare module "fabric/fabric-impl" {
  // Common
  class Gif {}
  class Arrow {}
  // Element
  class Iframe {}
  class Chart {}
  class Element {}
  class Video {}
  // Node
  class Node {}
  // Link
  class Link {}
  class CurvedLink {}
  class OrthogonalLink {}
  class Cube {}
  // SVG
  class Svg {}

  // Husble component
  class HusbleTextBox {}
  class HusbleRect {}
  class HusbleImagePlaceholder {}
  class MaskImagePlaceholder {}
  class DynamicImage {}

  class TextBox {}
}

declare global {
  interface Window {
    gifler: any;
    canvasFunctions: any;
  }
}

// declare module "*.json" {
//   const value: any;
//   export default value;
// }
