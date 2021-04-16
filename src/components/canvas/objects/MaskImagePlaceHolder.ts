import { fabric } from "fabric";
import { times } from "lodash";
import { NormalModuleReplacementPlugin } from "webpack";
import { toObject, FabricElement, FabricObject } from "../utils";

export interface MaskImagePlaceholderObject extends FabricElement {}

const MaskImagePlaceholder = fabric.util.createClass(fabric.Rect, {
  type: "husbleimageplaceholder",
  superType: "element",
  textbox: null,
  image: null,
  maskImage: null,
  clipPath: null,
  textOffsetLeft: 0,
  textOffsetTop: 0,
  _prevObjectStacking: null,
  _prevAngle: 0,
  previousValue: null,
  threading: null,
  deltaTop: 0,
  deltaLeft: 0,
  fillArea: true,
  initialize(options: any) {
    options = Object.assign(options, {
      name: "rect-imgpla",
      fill: "transparent",
      strokeDashArray: [10, 10],
      stroke: "#000",
      strokeWidth: 0,
      borderColor: "#0591EA",
      borderScaleFactor: 2,
      originX: "center",
      originY: "center",
    });

    this.callSuper("initialize", options);

    this.on("moving", () => {
      this.recalcImagePosition();
      this.image.left = this.left + this.deltaLeft;
      this.image.top = this.top + this.deltaTop;

      ///
    });
    this.on("rotating", () => {
      this.image.rotate(this.image.angle + this.angle - this._prevAngle);
      this.clipPath.rotate(this.clipPath.angle + this.angle - this._prevAngle);
      this.recalcImagePosition();
      this._prevAngle = this.angle;
    });
    this.on("scaling", () => {
      this.recalcImagePosition();
      this.deltaLeft = 0;
      this.deltaTop = 0;
      this.image.left = this.left;
      this.image.top = this.top;
      this.image.imageScaled = false;
      this.reScaleImage();
    });

    this.on("scaled", (e: any) => {
      // this.reScaleImage();
      // this.canvas.renderAll();
    });

    this.on("moved", () => {
      console.log("2222");
      // DotNet.invokeMethodAsync("PsnTemplate.Client", "OnZoomCaller", 0.22);
    });

    this.on("added", () => {
      fabric.Image.fromURL(
        "https://s3-ap-southeast-1.amazonaws.com/cdn.husble.com/test/abc.jpg",
        (img: any) => {
          this.image = img;

          fabric.Image.fromURL(
            "https://cdn.husble.com/test/m.png",
            (maskImage: any) => {
              this.maskImage = maskImage; //fabric.util.groupSVGElements(maskImage, options);
              //this.clipPath = maskImage;
              // console.log(this.centerX)
              this.clipPath = this.maskImage.set({
                scaleY: this.getScaledHeight() / this.maskImage.height,
                scaleX: this.getScaledWidth() / this.maskImage.width,
                top: this.top,
                left: this.left,
                absolutePositioned: true,
                originX: "center",
                originY: "center",
              });

              this.clipPath.setCoords();

              this.deltaTop = 0;
              this.deltaLeft = 0;
              this.image.set({
                top: this.top,
                left: this.left,
                originX: "center",
                originY: "center",
                borderColor: "#0591EA",
                borderScaleFactor: 2,
                selectable: false,
                evented: false,
                clipPath: this.clipPath,
                isScaled: false,
              });

              this.image.setControlVisible("ml", false);
              this.image.setControlVisible("mb", false);
              this.image.setControlVisible("mr", false);
              this.image.setControlVisible("mt", false);

              this.image.on("selected", () => {});

              this.image.on("deselected", () => {
                this.image.selectable = false;
                this.image.evented = false;
                this.selectable = true;
                this.evented = true;
                this.strokeWidth = 1;
                this.stroke = "#000";
              });

              this.image.on("moving", () => {
                this.deltaTop = this.image.top - this.top;
                this.deltaLeft = this.image.left - this.left;
              });

              this.image.on("removed", () => {
                this.canvas.remove(this);
              });

              this.image.on("scaling", () => {
                this.image.isScaled = true;
              });
              this.image.on("scaled", () => {
                this.deltaTop = this.image.top - this.top;
                this.deltaLeft = this.image.left - this.left;
              });

              this.image.on("rotating", () => {
              });

              //this.canvas.add(this.clipPath);
              this.canvas.add(this.image);

              this.reScaleImage();
              // this.canvas.sent
              // this.canvas.bringToFront(this.image);
              this.canvas.bringToFront(this);
              this.canvas.renderAll();
            },
            { crossOrigin: "anonymous" }
          );

          // this.clipPath = new fabric.Rect({
          //   width: this.getScaledWidth(),
          //   height: this.getScaledHeight(),
          //   top: this.top,
          //   left: this.left,
          //   absolutePositioned: true,
          //   originX: "center",
          //   originY: "center",
          // });
        },
        { crossOrigin: "anonymous" }
      );

      // this.canvas.renderAll();
    });
    this.on("removed", () => {
      this.canvas.remove(this.image);
    });

    this.on("selected", () => {
      this.strokeWidth = 0;
    });

    this.on("mousedown:before", () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });
    this.on("mousedblclick", () => {
      this.image.selectable = true;
      this.image.evented = true;
      this.selectable = false;
      this.evented = false;
      this.canvas.setActiveObject(this.image);
      this.strokeWidth = 3;
      this.stroke = "red";
      this.canvas.renderAll();
    });
    this.on("deselected", () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;

      if (this.image.selectable === false) {
        this.strokeWidth = 0;
        this.stroke = "#000";
      } else {
        this.strokeWidth = 3;
        this.stroke = "red";
      }
      // this.strokeWidth = 2;
      // this.stroke = "red";
    });
  },
  reScaleImage: function () {
    this.image.angle = 0;
    this.image.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
    this.image.scaleToHeight(this.getScaledHeight() * this.canvas.getZoom());
    if (this.fillArea === true) {
      if (this.image.getScaledWidth() < this.getScaledWidth()) {
        this.image.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
      }
      if (this.image.getScaledHeight() < this.getScaledHeight()) {
        this.image.scaleToHeight(
          this.getScaledHeight() * this.canvas.getZoom()
        );
      }
    } else {
      if (this.image.getScaledWidth() > this.getScaledWidth()) {
        this.image.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
      }
      if (this.image.getScaledHeight() > this.getScaledHeight()) {
        this.image.scaleToHeight(
          this.getScaledHeight() * this.canvas.getZoom()
        );
      }
    }
    this.image.angle = this.angle;
  },
  recalcImagePosition: function () {
    if (this.maskImage === null) {
      this.clipPath = new fabric.Rect({
        width: this.getScaledWidth(),
        height: this.getScaledHeight(),
        top: this.top,
        left: this.left,
        absolutePositioned: true,
        originX: "center",
        originY: "center",
      });
    } else {
      this.clipPath = this.maskImage.set({
        top: this.top,
        left: this.left,
        scaleY: this.getScaledHeight() / this.maskImage.height,
        scaleX: this.getScaledWidth() / this.maskImage.width,
        absolutePositioned: true,
        originX: "center",
        originY: "center",
      });
    }
    // this.image.set({
    //   clipPath: this.clipPath,
    // });
  },
  setSource(source: any) {
    this.setSrc(source);
  },
  setSrc(src: string) {
    this.set({
      src,
    });
    this.iframeElement.src = src;
  },
  toObject(propertiesToInclude: string[]) {
    return toObject(this, propertiesToInclude, {
      src: this.get("src"),
      container: this.get("container"),
      editable: this.get("editable"),
    });
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper("_render", ctx);
    ctx.save();
  },
});

MaskImagePlaceholder.fromObject = (
  options: MaskImagePlaceholderObject,
  callback: (obj: MaskImagePlaceholderObject) => any
) => {
  return callback(new MaskImagePlaceholder(options));
};

window.fabric.MaskImagePlaceholder = MaskImagePlaceholder;

export default MaskImagePlaceholder;
