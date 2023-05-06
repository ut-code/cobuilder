import * as THREE from "three";
import {
  SceneRenderer,
  GameObject,
  Vector3,
  Scene,
  SceneType,
  Renderer,
} from "./models";

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

interface PlayerAction {
  player: Player;

  isCompleted: boolean;

  tick(delta: number): void;
}

export class MoveAction implements PlayerAction {
  player: Player;

  isCompleted = false;

  vector: Vector3;

  constructor(player: Player, vector: Vector3) {
    this.player = player;
    this.vector = vector;
  }

  tick(delta: number) {
    this.player.move(this.vector, delta);
    this.isCompleted = true;
  }
}

export class MainScene extends Scene {
  gameObjects: GameObject[] = [];

  readonly userPlayer: Player;

  Players: Player[] = [];

  private playerActions: PlayerAction[] = [];

  constructor(onSceneDestroyed: (sceneType: SceneType) => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
    this.userPlayer = new Player(1, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    this.Players.push(this.userPlayer);
  }

  addPlayerAction(playerAction: PlayerAction) {
    this.playerActions.push(playerAction);
  }

  removePlayerAction(playerAction: PlayerAction) {
    this.playerActions.splice(this.playerActions.indexOf(playerAction), 1);
  }

  runPlayerAction(delta: number) {
    for (const playerAction of this.playerActions) {
      if (playerAction.isCompleted) {
        this.removePlayerAction(playerAction);
      } else {
        playerAction.tick(delta);
      }
    }
  }
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
  protected scene: MainScene;

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
}
