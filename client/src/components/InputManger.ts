import * as math from "mathjs";
import { MainScene, MoveAction } from "./scenes/Main";
import { Scene, Vector3 } from "./scenes/models";
import { LoginScene } from "./scenes/Login";

function rotateVector3(oldVector: Vector3, rotation: Vector3): Vector3 {
  const { x, y, z } = rotation;
  const rotationMatrixX = math.matrix([
    [1, 0, 0],
    [0, math.cos(x), -math.sin(x)],
    [0, math.sin(x), math.cos(x)],
  ]);
  const rotationMatrixY = math.matrix([
    [math.cos(y), 0, math.sin(y)],
    [0, 1, 0],
    [-math.sin(y), 0, math.cos(y)],
  ]);
  const rotationMatrixZ = math.matrix([
    [math.cos(z), -math.sin(z), 0],
    [math.sin(z), math.cos(z), 0],
    [0, 0, 1],
  ]);
  const oldVectorArray = math.matrix([oldVector.x, oldVector.y, oldVector.z]);
  const newVectorArray = math
    .chain(rotationMatrixX)
    .multiply(rotationMatrixY)
    .multiply(rotationMatrixZ)
    .multiply(oldVectorArray)
    .done();
  return {
    x: newVectorArray.get([0]) as number,
    y: newVectorArray.get([1]) as number,
    z: newVectorArray.get([2]) as number,
  };
}

export default class InputManager {
  private scene: Scene;

  readonly keyStates: Map<string, boolean>;

  readonly pointerCoordinates: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Scene) {
    this.keyStates = new Map<string, boolean>();
    this.scene = scene;
  }

  setKeyStates(e: KeyboardEvent) {
    this.keyStates.set(e.key, e.type === "keydown");
  }

  setPointerCoordinate(
    e: PointerEvent,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.pointerCoordinates.x = (e.clientX / canvasWidth) * 2 - 1;
    this.pointerCoordinates.y = -(e.clientY / canvasHeight) * 2 + 1;
  }

  processInput() {
    if (this.scene instanceof MainScene) {
      if (this.keyStates.get("w")) {
        const moveAction = new MoveAction(
          this.scene.userPlayer,
          rotateVector3(
            { x: 0, y: 0.001, z: 0 },
            this.scene.userPlayer.rotation
          )
        );
        this.scene.addPlayerAction(moveAction);
      }
      if (this.keyStates.get("s")) {
        const moveAction = new MoveAction(
          this.scene.userPlayer,
          rotateVector3(
            { x: 0, y: -0.001, z: 0 },
            this.scene.userPlayer.rotation
          )
        );
        this.scene.addPlayerAction(moveAction);
      }
      if (this.keyStates.get("a")) {
        const moveAction = new MoveAction(
          this.scene.userPlayer,
          rotateVector3(
            { x: -0.001, y: 0, z: 0 },
            this.scene.userPlayer.rotation
          )
        );
        this.scene.addPlayerAction(moveAction);
      }
      if (this.keyStates.get("d")) {
        const moveAction = new MoveAction(
          this.scene.userPlayer,
          rotateVector3(
            { x: 0.001, y: 0, z: 0 },
            this.scene.userPlayer.rotation
          )
        );
        this.scene.addPlayerAction(moveAction);
      }
    } else if (this.scene instanceof LoginScene) {
    }
  }
}
