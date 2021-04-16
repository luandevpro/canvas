import { fabric } from "fabric";
import { Textbox } from "fabric/fabric-impl";
import lodash, { pick, times } from "lodash";
import { toObject, FabricElement, FabricObject } from "../utils";

export interface TextBoxObject extends FabricElement {
  setText: (value: string) => void;
  value: string;
  fontSize: number;
  top: number;
  left: number;
  angle: number;
  skewH: number;
  skewV: number;
  width: number;
  height: number;
  minSize: number;
  maxSize: number;
  characterOption: number;
  textAlign: string;
  fontFamily: string;
  tracking: number;
  lineSpacing: number;
  automaticMultiline: boolean;
  allCaps: boolean;
  fillOption: number;
  fill: string;
  strokeWidth: number;
  stroke: string;
  borderWidth: number;
}

const TextBox = fabric.util.createClass(fabric.Rect, {
  type: "TextBox",
  superType: "element",
  textbox: null,
  itext: null,
  _prevObjectStacking: null,
  rectStroke: "#808080",
  previousValue: "",
  initialize(options: TextBoxObject) {
    const rectOptions = Object.assign({}, options, {
      fill: "transparent",
      strokeDashArray: [10, 10],
      stroke: this.rectStroke,
      strokeWidth: options.borderWidth,
      borderColor: "#fa6900",
      borderScaleFactor: 2,
      originX: "center",
      originY: "center",
    });

    this.callSuper("initialize", rectOptions);

    // create new textbox
    const {
      id,
      type,
      scaleX,
      scaleY,
      top,
      left,
      width,
      height,
      ...textOptions
    } = options;

    this.itext = new fabric.IText(textOptions.value, {
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      opacity: 0,
      ...textOptions,
    });
    this.textbox = new fabric.Textbox(textOptions.value, {
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
      editingBorderColor: "transparent",
      // charSpacing: 0,
      ...textOptions,
    });

    // Rect added event
    this.on("added", () => {
      this.canvas.add(this.textbox);
      this.canvas.add(this.itext);
      this.itext.opacity = 0;
      this.textbox.width = this.getScaledWidth();
      this.recalcTextPosition();
      console.log(this.textbox);
    });

    // Rectangle selected event
    this.on("selected", () => {
      //this.getBoudingRect()
    });

    // Rectangle deselected event
    this.on("deselected", () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;
    });

    // Rect moving event
    this.on("moving", () => {
      this.recalcTextPosition();
    });

    // Rect scaling event
    this.on("scaling", () => {
      this.recalcTextPosition();
      this.recalcITextFontSize();
    });

    // Rect scaled event
    this.on("scaled", (e: any) => {});

    // Rect rotating event
    this.on("rotating", () => {
      this.textbox.angle = this.angle;
    });

    // Rect mousedown beforevent
    this.on("mousedown:before", () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });

    // Rect moused double click event
    this.on("mousedblclick", () => {
      this.textbox.selectable = true;
      this.textbox.evented = true;
      this.canvas.setActiveObject(this.textbox);
      this.textbox.enterEditing();
      this.textbox.setSelectionStart(this.textbox.text.length);
      this.textbox.setSelectionEnd(this.textbox.text.length);
      this.selectable = false;
      this.strokeWidth = 2;
      this.stroke = "#9900FF";
    });

    // Rect removed event
    this.on("removed", () => {
      this.canvas.remove(this.textbox);
      this.canvas.remove(this.itext);
    });

    // Textbox exited event
    this.textbox.on("editing:exited", () => {
      this.textbox.selectable = false;
      this.textbox.evented = false;
      this.selectable = true;
      this.strokeWidth = -1;
      this.stroke = this.rectStroke;
    });

    // Textbox changed event
    this.textbox.on("changed", () => {
      this.setIText(this.textbox.text);

      this.recalcITextFontSize();
    });
  },
  recalcTextPosition: function () {
    if (this.left !== 0 && this.top !== 0) {
      this.textbox.left = this.left;
      this.textbox.top = this.top;
    } else {
      this.canvas.centerObject(this.textbox);
    }
    this.textbox.width = this.getScaledWidth();
  },
  setText: function (value: string) {
    this.textbox.text = value;
    if (this.textbox.hiddenTextarea) {
      this.textbox.hiddenTextarea.value = value;
    }
    this.textbox.dirty = true;
  },
  setIText: function (value: string) {
    let newText = value;
    if (this.textbox.automaticMultiline) {
      newText = this.textbox._splitTextIntoLines(value).lines.join(" \n");
    }
    this.itext.text = newText;
    if (this.itext.hiddenTextarea) {
      this.itext.hiddenTextarea.value = newText;
    }
    this.itext.dirty = true;
    this.canvas.renderAll();
  },
  checkITextFontSize: function (loop: number = 1) {
    var textWidth = this.itext.width;
    var rectWidth = this.getScaledWidth() - 2;
    var fontSizeWidth = (this.itext.fontSize * rectWidth) / textWidth;
    var textHeight = this.itext.height;

    var rectHeight = this.getScaledHeight();
    var fontSizeHeight = (this.itext.fontSize * rectHeight) / textHeight;
    var fontSize = Math.min(fontSizeWidth, fontSizeHeight);

    if (
      fontSize == this.itext.fontSize &&
      fontSizeHeight <= this.itext.maxSize &&
      rectHeight < rectWidth
    ) {
      this.itext.fontSize = fontSizeHeight;
      this.canvas.renderAll();
      if (this.itext.width < rectWidth) {
        fontSize = fontSizeHeight;
      }
    }

    var okSize = false;
    var currentSize = this.itext.fontSize;

    if (fontSize >= this.itext.maxSize) {
      currentSize = this.itext.maxSize;
      okSize = true;
    } else if (fontSize >= this.itext.minSize) {
      currentSize = fontSize;
      okSize = true;
    } else {
      okSize = false;
    }

    if (!okSize) {
      if (
        this.textbox.automaticMultiline &&
        this.textbox._splitTextIntoLines(this.textbox.text).lines.length > 1
      ) {
        this.setIText(this.textbox.text);
        if (loop > 0) {
          return this.checkITextFontSize(0);
        }
        return okSize;
      }
    }

    this.itext.fontSize = currentSize;
    this.textbox.fontSize = currentSize;
    // this.canvas.renderAll();
    this.textbox.width = this.getScaledWidth();
    //this.itext.width >= rectWidth ? this.itext.width : rectWidth;
    // this.canvas.renderAll();
    return okSize;
  },
  recalcITextFontSize: function () {
    if (this.checkITextFontSize()) {
      this.previousValue = this.textbox.text;
    } else {
      if (this.previousValue === null) {
        var text = this.textbox.text;
        for (var i = 1; i < text.length; i++) {
          this.previousValue = text.slice(0, i);
          this.setText(this.previousValue);
          this.canvas.renderAll();
          if (!this.checkTextFontSize()) {
            this.previousValue = text.slice(0, i - 1);
            break;
          }
        }
        this.previousValue =
          this.previousValue !== null ? this.previousValue : text.slice(0, 1);
      } else if (this.textbox.text.length < this.previousValue.length) {
        this.previousValue = this.textbox.text;
      } else if (
        this.textbox.text === this.previousValue &&
        this.previousValue.length > 0
      ) {
        this.previousValue = this.previousValue.slice(0, -1);
      }
      this.setText(this.previousValue);
      this.setIText(this.previousValue);
    }
    this.recalcTextPosition();
  },
  toObject(propertiesToInclude: string[]) {
    return toObject(this, propertiesToInclude, {
      fill: this.textbox.get("fill"),
      strokeDashArray: this.textbox.get("strokeDashArray"),
      stroke: this.textbox.get("stroke"),
      strokeWidth: this.textbox.get("strokeWidth"),
      borderColor: this.textbox.get("borderColor"),
      borderScaleFactor: this.textbox.get("borderScaleFactor"),
      borderWidth: this.borderWidth,
      container: this.get("container"),
      editable: this.get("editable"),

      value: this.textbox.get("text"),
      fontSize: this.textbox.get("fontSize"),
      minSize: this.textbox.get("minSize"),
      maxSize: this.textbox.get("maxSize"),
      fontFamily: this.textbox.get("fontFamily"),
      textAlign: this.textbox.get("textAlign"),
      automaticMultiline: this.textbox.get("automaticMultiline"),
    });
  },
  _render(ctx: CanvasRenderingContext2D) {
    this.callSuper("_render", ctx);
    ctx.save();
  },
});

TextBox.fromObject = (
  options: TextBoxObject,
  callback: (obj: TextBoxObject) => any
) => {
  return callback(new TextBox(options.value, options));
};

window.fabric.TextBox = TextBox;

export default TextBox;
