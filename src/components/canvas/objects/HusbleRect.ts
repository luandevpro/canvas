import { fabric } from 'fabric';
import { times } from 'lodash';
import { toObject, FabricElement, FabricObject } from '../utils';

export interface HusbleRectObject extends FabricElement {}

const HusbleRect = fabric.util.createClass(fabric.Rect, {
  type: 'husblerect',
  textbox: null,
  textOffsetLeft: 0,
  textOffsetTop: 0,
  _prevObjectStacking: null,
  _prevAngle: 0,
  previousValue: null,
  initialize(options: any) {
    options = Object.assign(options, {
      // fill: "transparent",
      // strokeDashArray: [10, 10],
      // stroke: "#000",
      // strokeWidth: 1,
      // borderColor: "#0591EA",
      // borderScaleFactor: 2,
      // originX: "center",
      // originY: "center",
    });
    this.callSuper('initialize', options);

    this.textbox = new fabric.IText('A', {
      name: 'Text Element Id',
      width: 260,
      selectable: false,
      evented: false,
      fontSize: 208,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    this.on('added', () => {
      this.canvas.add(this.textbox);
      this.textbox.width = this.getScaledWidth() - 1;
      this.canvas.centerObject(this.textbox);
    });

    // this.on("selected", () => {
    //   this.strokeWidth = 0;
    // });
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

HusbleRect.fromObject = (options: HusbleRectObject, callback: (obj: HusbleRectObject) => any) => {
  return callback(new HusbleRect(options));
};

window.fabric.HusbleRect = HusbleRect;

export default HusbleRect;
