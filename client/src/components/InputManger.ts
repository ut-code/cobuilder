export default class InputManager {
  readonly keyStates: Map<string, boolean>;

  readonly pointerCoordinates: { x: number; y: number } = { x: 0, y: 0 };

  onInputs?: (inputs: Map<string, boolean>) => void;

  constructor() {
    this.keyStates = new Map<string, boolean>();
  }

  processKeyboardInputs(e: KeyboardEvent) {
    this.keyStates.set(e.key, e.type === "keydown");
    this.onInputs?.(this.keyStates);
  }

  processPointerInputs(
    e: PointerEvent,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.pointerCoordinates.x = (e.clientX / canvasWidth) * 2 - 1;
    this.pointerCoordinates.y = -(e.clientY / canvasHeight) * 2 + 1;
  }
}
