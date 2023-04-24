/* eslint-disable no-restricted-syntax */
import * as THREE from "three";
import * as math from "mathjs";
import { SceneRenderer, GameObject, Vector3 } from "./models";

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

class Player implements GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }

  move(vector: Vector3, delta: number) {
    this.position.x += vector.x * delta;
    this.position.y += vector.y * delta;
    this.position.z += vector.z * delta;
  }
}

export class MainScene {
  gameObjects: GameObject[] = [];

  userPlayer: Player;

  Players: Player[] = [];

  constructor() {
    this.userPlayer = new Player(1, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    this.Players.push(this.userPlayer);
  }

  executeUserAction(keyStates: Map<string, boolean>, delta: number) {
    if (keyStates.get("ArrowUp")) {
      this.userPlayer.move(
        rotateVector3({ x: 0.001, y: 0, z: 0 }, this.userPlayer.rotation),
        delta
      );
    }
    if (keyStates.get("ArrowDown")) {
      this.userPlayer.move(
        rotateVector3({ x: -0.001, y: 0, z: 0 }, this.userPlayer.rotation),
        delta
      );
    }
    if (keyStates.get("ArrowLeft")) {
      this.userPlayer.move(
        rotateVector3({ x: 0, y: -0.001, z: 0 }, this.userPlayer.rotation),
        delta
      );
    }
    if (keyStates.get("ArrowRight")) {
      this.userPlayer.move(
        rotateVector3({ x: 0, y: 0.001, z: 0 }, this.userPlayer.rotation),
        delta
      );
    }
  }
}

interface Renderer {
  render(): void;
}

class PlayerRenderer implements Renderer {
  player: Player;

  playerObject: THREE.Object3D;

  threeScene: THREE.Scene;

  constructor(player: Player, threeScene: THREE.Scene) {
    this.player = player;
    this.threeScene = threeScene;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.playerObject = new THREE.Mesh(geometry, material);
    const { x, y, z } = player.position;
    this.playerObject.position.set(x, y, z);
    this.threeScene.add(this.playerObject);
    const geometrySub = new THREE.BoxGeometry(1, 1, 1);
    const materialSub = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const object = new THREE.Mesh(geometrySub, materialSub);
    object.position.set(x + 10, y + 10, z);
    this.threeScene.add(object);
  }

  render() {
    const { x, y, z } = this.player.position;
    this.playerObject.position.set(x, y, z);
  }

  destroy() {
    this.threeScene.remove(this.playerObject);
  }
}

export class MainSceneRenderer extends SceneRenderer {
  scene: MainScene;

  playerRenderers: Map<Player, PlayerRenderer>;

  constructor(scene: MainScene, canvas: HTMLCanvasElement) {
    super(canvas);
    this.scene = scene;
    this.camera.fov = 75;
    this.camera.aspect = canvas.width / canvas.height;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    const { x, y, z } = this.scene.userPlayer.position;
    this.camera.position.set(x + 5, y, z + 5);
    this.playerRenderers = new Map();
    for (const player of this.scene.Players) {
      this.playerRenderers.set(
        player,
        new PlayerRenderer(player, this.threeScene)
      );
    }
  }

  render() {
    for (const playerRenderer of this.playerRenderers.values()) {
      playerRenderer.render();
    }
    this.camera.position.set(1, 0, 5);
    this.webGLRenderer.render(this.threeScene, this.camera);
  }

  destroy() {
    this.webGLRenderer.dispose();
  }
}
