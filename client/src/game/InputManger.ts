export type KeyStates = Map<string, boolean>;

export type PointerState = { x: number; y: number; isPointerDown: boolean };

export default class InputManager {
  readonly keyStates: KeyStates;

  readonly pointerState: PointerState = { x: 0, y: 0, isPointerDown: false };

  private canvas: HTMLCanvasElement;

  onInputsProcessed?: () => void;

  constructor(canvas: HTMLCanvasElement, onInputsProcessed?: () => void) {
    this.keyStates = new Map<string, boolean>();
    this.onInputsProcessed = onInputsProcessed;
    this.canvas = canvas;
  }

  processInputs(e: Event) {
    if (e instanceof KeyboardEvent) {
      this.keyStates.set(e.key, e.type === "keydown");
      this.onInputsProcessed?.();
    } else if (e instanceof PointerEvent) {
      this.pointerState.x =
        ((e.clientX - this.canvas.offsetLeft) * 2) / this.canvas.width - 1;
      this.pointerState.y =
        -((e.clientY - this.canvas.offsetTop) * 2) / this.canvas.height + 1;
      if (e.type === "pointerup") {
        this.pointerState.isPointerDown = false;
      } else if (e.type === "pointerdown") {
        this.pointerState.isPointerDown = true;
      }
      this.onInputsProcessed?.();
    }
  }

  destroy() {
    this.keyStates.clear();
  }
}
