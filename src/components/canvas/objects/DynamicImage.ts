import { fabric } from 'fabric';
import { times } from 'lodash';
import { toObject, FabricElement, FabricObject } from '../utils';

export interface DynamicImageObject extends FabricElement {}

const DynamicImage = fabric.util.createClass(fabric.Rect, {
  type: 'dynamicimage',
  superType: 'element',
  image: null,
  _prevObjectStacking: null,
  _prevAngle: 0,
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
      // this.image.left = this.left;
      // this.image.top = this.top;
      this.recalcImagePosition();
    });
    this.on('rotating', () => {
      this.image.rotate(this.image.angle + this.angle - this._prevAngle);
      this._prevAngle = this.angle;
    });
    this.on('scaling', () => {
      this.recalcImagePosition();
    });

    this.on('scaled', (e: any) => {
      // this.recalcImagePosition();
    });

    this.on('added', () => {
      fabric.Image.fromURL(
        'https://s3-ap-southeast-1.amazonaws.com/cdn.husble.com/test/front.png',
        (img: any) => {
          this.image = img;

          this.image.set({
            top: this.top,
            left: this.left,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            borderColor: '#0591EA',
            borderScaleFactor: 2,
          });

          if (img.height > img.width) {
            img.scaleToHeight(this.getScaledHeight());
          } else {
            img.scaleToWidth(this.getScaledWidth());
          }

          this.canvas.add(this.image);

          this.canvas.renderAll();
        },
        { crossOrigin: 'anonymous' },
      );
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
      // this.image.selectable = true;
      // this.image.evented = true;
      // this.selectable = false;
      // this.canvas.setActiveObject(this.image);
      // this.strokeWidth = 2;
      // this.stroke = "red";
      // this.canvas.renderAll();
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;

      this.strokeWidth = 1;
      this.stroke = '#000';
    });
  },
  recalcImagePosition: function () {
    this.image.left = this.left;
    this.image.top = this.top;
    this.image.angle = 0;
    if (this.getScaledHeight() > this.getScaledWidth()) {
      this.image.scaleToWidth(this.getScaledWidth() * this.canvas.getZoom());
    } else {
      this.image.scaleToHeight(this.getScaledHeight() * this.canvas.getZoom());
    }
    this.image.angle = this.angle;
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

DynamicImage.fromObject = (
  options: DynamicImageObject,
  callback: (obj: DynamicImageObject) => any,
) => {
  return callback(new DynamicImage(options));
};

window.fabric.DynamicImage = DynamicImage;

export default DynamicImage;
