export default class InputManager {
  readonly keyStates: Map<string, boolean>;

  readonly pointerCoordinates: { x: number; y: number } = { x: 0, y: 0 };

  onInputsProcessed?: (inputs: Map<string, boolean>) => void;

  constructor(onInputsProcessed?: (inputs: Map<string, boolean>) => void) {
    this.keyStates = new Map<string, boolean>();
    this.onInputsProcessed = onInputsProcessed;
  }

  processKeyboardInputs(e: KeyboardEvent) {
    this.keyStates.set(e.key, e.type === "keydown");
    this.onInputsProcessed?.(this.keyStates);
  }

  processPointerInputs(
    e: PointerEvent,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.pointerCoordinates.x = (e.clientX / canvasWidth) * 2 - 1;
    this.pointerCoordinates.y = -(e.clientY / canvasHeight) * 2 + 1;
  }

  destroy() {
    this.keyStates.clear();
  }
}
