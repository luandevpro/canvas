import { fabric } from 'fabric';
import { times } from 'lodash';
import { toObject, FabricElement, FabricObject } from '../utils';

export interface HusbleTextBoxObject extends FabricElement {
  setSource: (source: string) => void;
  setSrc: (src: string) => void;
  src: string;
  iframeElement: HTMLIFrameElement;
}

const HusbleTextBox = fabric.util.createClass(fabric.Rect, {
  type: 'husbletextbox',
  superType: 'element',
  textbox: null,
  textOffsetLeft: 0,
  textOffsetTop: 0,
  _prevObjectStacking: null,
  _prevAngle: 0,
  previousValue: null,
  threading: null,
  initialize(src: string = '2323', options: any) {
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
      globalCompositeOperation: 'source-atop',
    });
    this.on('moving', () => {
      this.recalcTextPosition();
      // this.strokeWidth = 1;
      // this.stroke = "#bbb";
    });
    this.on('rotating', () => {
      this.textbox.rotate(this.textbox.angle + this.angle - this._prevAngle);
      this.recalcTextPosition();
      this._prevAngle = this.angle;
    });
    this.on('scaling', () => {
      this.recalcTextPosition();
      this.recalcTextFontSize();
    });
    this.on('scaled', (e: any) => {
      // this.strokeWidth = 1;
      // this.stroke = "#000";
      this.textbox.width = this.getScaledWidth();
      // this.recalcTextPosition();
      // this.recalcTextFontSize();
    });
    this.on('added', () => {
      this.canvas.add(this.textbox);
      this.textbox.width = this.getScaledWidth() - 1;
      this.canvas.centerObject(this.textbox);
    });
    this.on('removed', () => {
      this.canvas.remove(this.textbox);
    });

    this.on('selected', () => {
      this.strokeWidth = 0;
    });

    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });

    this.on('mousedblclick', () => {
      this.textbox.selectable = true;
      this.textbox.evented = true;
      this.canvas.setActiveObject(this.textbox);
      this.textbox.enterEditing();
      this.selectable = false;
      this.strokeWidth = 2;
      this.stroke = 'red';
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;

      if (this.textbox.selectable === false) {
        this.strokeWidth = 1;
        this.stroke = '#000';
      } else {
        this.strokeWidth = 2;
        this.stroke = 'red';
      }
      // this.strokeWidth = 2;
      // this.stroke = "red";
    });
    this.textbox.on('editing:exited', () => {
      this.textbox.selectable = false;
      this.textbox.evented = false;
      this.selectable = true;
      this.strokeWidth = 1;
      this.stroke = '#000';
    });

    this.textbox.on('changed', () => {
      this.recalcTextFontSize();
    });
  },
  checkTextFontSize: function () {
    var textWidth = this.textbox.width;
    var rectWidth = this.getScaledWidth();
    var fontSizeWidth = (this.textbox.fontSize * rectWidth) / (textWidth + 0);
    var textHeight = this.textbox.height;
    var rectHeight = this.getScaledHeight();
    var fontSizeHeight = (this.textbox.fontSize * rectHeight) / (textHeight + 0);
    var fontSize = Math.min(fontSizeWidth, fontSizeHeight);

    if (fontSize == this.textbox.fontSize && fontSizeHeight <= 208 && rectHeight < rectWidth) {
      this.textbox.fontSize = fontSizeHeight;
      this.canvas.renderAll();
      if (this.textbox.width < rectWidth) {
        fontSize = fontSizeHeight;
      }
    }
    var isOkFontSize = false;
    if (fontSize >= 208) {
      this.textbox.fontSize = 208;
      isOkFontSize = true;
    } else if (fontSize >= 62) {
      this.textbox.fontSize = fontSize;
      isOkFontSize = true;
    } else {
      isOkFontSize = false;
    }
    this.textbox.width = rectWidth;
    if (textHeight >= rectHeight) {
      this.textbox.height = rectHeight;
    }
    this.canvas.renderAll();
    return isOkFontSize;
  },
  recalcTextFontSize: function () {
    if (this.checkTextFontSize()) {
      if (this.textbox.text === '') {
        this.textbox.text = this.previousValue;
      }
      this.previousValue = this.textbox.text;
    } else {
      if (this.previousValue === null) {
        var text = this.textbox.text;
        for (var i = 1; i < text.length; i++) {
          this.previousValue = text.slice(0, i);
          this.textbox.text = this.previousValue;
          this.canvas.renderAll();
          if (!this.checkTextFontSize()) {
            this.previousValue = text.slice(0, i - 1);
            break;
          }
        }
        this.previousValue = this.previousValue !== null ? this.previousValue : text.slice(0, 1);
      } else if (this.textbox.text.length < this.previousValue.length) {
        this.previousValue = this.textbox.text;
      } else if (this.textbox.text === this.previousValue && this.previousValue.length > 1) {
        this.previousValue = this.previousValue.slice(0, -1);
      }
      this.textbox.text = this.previousValue;
      if (this.textbox.hiddenTextarea) {
        this.textbox.hiddenTextarea.value = this.previousValue;
      }
      this.textbox.dirty = true;
    }
  },
  recalcTextPosition: function () {
    this.textbox.left = this.left;
    this.textbox.top = this.top;
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

HusbleTextBox.fromObject = (
  options: HusbleTextBoxObject,
  callback: (obj: HusbleTextBoxObject) => any,
) => {
  return callback(new HusbleTextBox(options.src || options.file, options));
};

window.fabric.HusbleTextBox = HusbleTextBox;

export default HusbleTextBox;
