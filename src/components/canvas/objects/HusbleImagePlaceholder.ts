import { fabric } from 'fabric';
import { times } from 'lodash';
import { toObject, FabricElement, FabricObject } from '../utils';

export interface HusbleImagePlaceholderObject extends FabricElement {}

const HusbleImagePlaceholder = fabric.util.createClass(fabric.Rect, {
  type: 'husbleimageplaceholder',
  superType: 'element',
  textbox: null,
  image: null,
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
      fill: 'transparent',
      strokeDashArray: [10, 10],
      stroke: '#000',
      strokeWidth: 1,
      borderColor: '#0591EA',
      borderScaleFactor: 2,
      originX: 'center',
      originY: 'center',
    });

    this.callSuper('initialize', options);

    this.on('moving', () => {
      this.recalcImagePosition();
      this.image.left = this.left + this.deltaLeft;
      this.image.top = this.top + this.deltaTop;
    });
    this.on('rotating', () => {
      this.image.rotate(this.image.angle + this.angle - this._prevAngle);
      this.clipPath.rotate(this.clipPath.angle + this.angle - this._prevAngle);
      this.recalcImagePosition();
      this._prevAngle = this.angle;
    });
    this.on('scaling', () => {
      this.recalcImagePosition();
      this.deltaLeft = 0;
      this.deltaTop = 0;
      this.image.left = this.left;
      this.image.top = this.top;
      if (this.fillArea === true) {
        let bounds = this.getBoundingRect();
        if (bounds.height / bounds.width >= this.image.height / this.image.width) {
          this.image.scaleToHeight(this.getScaledHeight());
        } else {
          this.image.scaleToWidth(this.getScaledWidth());
        }
      } else {
        if (this.getScaledHeight() > this.getScaledWidth()) {
          this.clipPath.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
          this.image.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
        } else {
          this.clipPath.scaleToHeight(this.getScaledHeight() * this.canvas.getZoom());
          this.image.scaleToHeight(this.getScaledHeight() * this.canvas.getZoom());
        }
      }
    });

    this.on('scaled', (e: any) => {
      // this.recalcImagePosition();
    });

    this.on('added', () => {
      fabric.Image.fromURL('https://cdn.husble.com/sim.jpg', (img: any) => {
        this.image = img;

        this.clipPath = new fabric.Rect({
          width: this.getScaledWidth(),
          height: this.getScaledHeight(),
          top: this.top,
          left: this.left,
          absolutePositioned: true,
          originX: 'center',
          originY: 'center',
        });

        this.deltaTop = 0;
        this.deltaLeft = 0;
        this.image.set({
          top: this.top,
          left: this.left,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
          borderColor: '#0591EA',
          borderScaleFactor: 2,
          clipPath: this.clipPath,
        });

        this.image.setControlVisible('ml', false);
        this.image.setControlVisible('mb', false);
        this.image.setControlVisible('mr', false);
        this.image.setControlVisible('mt', false);

        if (img.height > img.width) {
          img.scaleToHeight(this.getScaledHeight());
        } else {
          img.scaleToWidth(this.getScaledWidth());
        }

        this.image.on('selected', () => {});

        this.image.on('deselected', () => {
          this.image.selectable = false;
          this.image.evented = false;
          this.selectable = true;
          this.strokeWidth = 1;
          this.stroke = '#000';
        });

        this.image.on('moving', () => {
          this.deltaTop = this.image.top - this.top;
          this.deltaLeft = this.image.left - this.left;
        });

        this.image.on('removed', () => {
          this.canvas.remove(this);
        });

        this.image.on('scaled', () => {});

        this.canvas.add(this.image);

        this.canvas.renderAll();
      });
    });
    this.on('removed', () => {
      this.canvas.remove(this.image);
    });

    this.on('selected', () => {
      this.strokeWidth = 0;
    });

    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });
    this.on('mousedblclick', () => {
      this.image.selectable = true;
      this.image.evented = true;
      this.selectable = false;
      this.canvas.setActiveObject(this.image);
      this.strokeWidth = 2;
      this.stroke = 'red';
      this.canvas.renderAll();
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;

      if (this.image.selectable === false) {
        this.strokeWidth = 1;
        this.stroke = '#000';
      } else {
        this.strokeWidth = 2;
        this.stroke = 'red';
      }
      // this.strokeWidth = 2;
      // this.stroke = "red";
    });
  },

  recalcImagePosition: function () {
    this.clipPath = new fabric.Rect({
      width: this.getScaledWidth(),
      height: this.getScaledHeight(),
      top: this.top,
      left: this.left,
      absolutePositioned: true,
      originX: 'center',
      originY: 'center',
    });
    this.image.set({
      clipPath: this.clipPath,
    });
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
      src: this.get('src'),
      container: this.get('container'),
      editable: this.get('editable'),
    });
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper('_render', ctx);
    ctx.save();
  },
});

HusbleImagePlaceholder.fromObject = (
  options: HusbleImagePlaceholderObject,
  callback: (obj: HusbleImagePlaceholderObject) => any,
) => {
  return callback(new HusbleImagePlaceholder(options));
};

window.fabric.HusbleImagePlaceholder = HusbleImagePlaceholder;

export default HusbleImagePlaceholder;
