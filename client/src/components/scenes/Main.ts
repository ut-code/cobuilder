import * as THREE from "three";
import * as math from "mathjs";
import { GameObject, Vector3, Scene, SceneType, Renderer } from "./models";

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
    this.players.push(
      new Player(userPlayerId, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })
    );
  }

  getPlayer(id: number) {
    return this.players.find((player) => player.id === id);
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
    this.playerObject.rotation.set(rotationX, rotationY, rotationZ);
    this.playerObject.scale.set(10, 10, 10);
    this.threeScene.add(this.playerObject);
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

class CameraRenderer implements Renderer {
  userPlayer: Player;

  private camera: THREE.PerspectiveCamera;

  threeScene: THREE.Scene;

  constructor(aspect: number, threeScene: THREE.Scene, userPlayer: Player) {
    this.userPlayer = userPlayer;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.lookAt(new THREE.Vector3(0, 1, 0));
    this.threeScene = threeScene;
  }

  getCamera() {
    return this.camera;
  }

  render(): void {
    const { x, y, z } = this.userPlayer.position;
    const vector = rotateVector3(
      { x: 0, y: -20, z: 5 },
      this.userPlayer.rotation
    );
    const { x: deltaX, y: deltaY, z: deltaZ } = vector;
    this.camera.position.set(x + deltaX, y + deltaY, z + deltaZ);
  }

  destroy(): void {
    this.threeScene.remove(this.camera);
  }
}

export class MainSceneRenderer implements Renderer {
  private webGLRenderer: THREE.WebGLRenderer;

  private cameraRenderer;

  threeScene: THREE.Scene;

  private scene: MainScene;

  playerRenderers: Map<Player, PlayerRenderer>;

  constructor(scene: MainScene, canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.scene = scene;

    // カメラ作成
    const userPlayer = scene.getPlayer(scene.userPlayerId);
    if (!userPlayer) throw new Error();
    this.cameraRenderer = new CameraRenderer(
      canvas.width / canvas.height,
      this.threeScene,
      userPlayer
    );

    // PlayerRenderer作成
    this.playerRenderers = new Map();
    for (const player of this.scene.players) {
      this.playerRenderers.set(
        player,
        new PlayerRenderer(player, this.threeScene)
      );
    }

    // 地面作成
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.threeScene.add(plane);
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
    this.cameraRenderer.render();
    this.webGLRenderer.render(this.threeScene, this.cameraRenderer.getCamera());
  }

  destroy() {
    this.cameraRenderer.destroy();
    for (const playerRenderer of this.playerRenderers.values()) {
      playerRenderer.destroy();
    }
    this.webGLRenderer.dispose();
  }
}
