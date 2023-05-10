import * as THREE from "three";
import {
  SceneRenderer,
  GameObject,
  Vector3,
  Scene,
  SceneType,
  Renderer,
} from "./models";

export class Player implements GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }
}

export class MainScene extends Scene {
  gameObjects: GameObject[] = [];

  userPlayerId: number;

  players: Player[] = [];

  constructor(
    userPlayerId: number,
    onSceneDestroyed: (sceneType: SceneType) => void
  ) {
    super();
    this.userPlayerId = userPlayerId;
    this.onSceneDestroyed = onSceneDestroyed;
  }

  updatePlayers(
    playerStatuses: { id: number; position: Vector3; rotation: Vector3 }[]
  ) {
    for (const playerStatus of playerStatuses) {
      const { id, position, rotation } = playerStatus;
      const existingPlayer = this.players.find((player) => player.id === id);
      if (!existingPlayer) {
        this.players.push(new Player(id, position, rotation));
      } else {
        if (existingPlayer.position !== position) {
          existingPlayer.position = position;
        }
        if (existingPlayer.rotation !== rotation) {
          existingPlayer.rotation = rotation;
        }
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
    const { x: rotationX, y: rotationY, z: rotationZ } = player.rotation;
    this.playerObject.position.set(x, y, z);
    this.threeScene.add(this.playerObject);
    const geometrySub = new THREE.BoxGeometry(1, 1, 1);
    const materialSub = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const object = new THREE.Mesh(geometrySub, materialSub);
    object.position.set(x + 10, y + 10, z);
    object.rotation.set(rotationX, rotationY, rotationZ);
    this.threeScene.add(object);
  }

  render() {
    const { x, y, z } = this.player.position;
    const { x: rotationX, y: rotationY, z: rotationZ } = this.player.rotation;
    this.playerObject.position.set(x, y, z);
    this.playerObject.rotation.set(rotationX, rotationY, rotationZ);
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
    this.playerRenderers = new Map();
    for (const player of this.scene.players) {
      this.playerRenderers.set(
        player,
        new PlayerRenderer(player, this.threeScene)
      );
    }
  }

  render() {
    const unusedPlayerRenderers = new Set(this.playerRenderers.values());
    for (const player of this.scene.players) {
      const existingRenderer = this.playerRenderers.get(player);
      if (!existingRenderer) {
        this.playerRenderers.set(
          player,
          new PlayerRenderer(player, this.threeScene)
        );
      } else {
        existingRenderer.render();
        unusedPlayerRenderers.delete(existingRenderer);
      }
    }
    for (const renderer of unusedPlayerRenderers) {
      renderer.destroy();
    }
    this.camera.position.set(0, 0, 5);
    super.render();
  }
}
