import * as THREE from "three";
import * as math from "mathjs";
import { GameObject, Vector3, Scene, SceneType, Renderer } from "./models";
import { BulletStatus, PlayerStatus } from "../NetworkManger";

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

export class Bullet implements GameObject {
  ownerId: number;

  position: Vector3;

  rotation: Vector3;

  constructor(ownerId: number, position: Vector3, rotation: Vector3) {
    this.ownerId = ownerId;
    this.position = position;
    this.rotation = rotation;
  }
}

export class MainScene extends Scene {
  gameObjects: GameObject[] = [];

  userPlayerId: number;

  players: Player[] = [];

  bullets: Bullet[] = [];

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

  updateGameObjects(
    playerStatuses: PlayerStatus[],
    bulletStatuses: BulletStatus[]
  ) {
    // player の更新
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

    // bulletの更新
    for (const bulletStatus of bulletStatuses) {
      const { ownerId, position, rotation } = bulletStatus;
      const existingBullet = this.bullets.find(
        (bullet) => bullet.ownerId === ownerId
      );
      if (!existingBullet) {
        this.bullets.push(new Bullet(ownerId, position, rotation));
      } else {
        if (existingBullet.position !== position) {
          existingBullet.position = position;
        }
        if (existingBullet.rotation !== rotation) {
          existingBullet.rotation = rotation;
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
    this.playerObject.scale.set(10, 10, 5);
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

class BulletRenderer implements Renderer {
  bullet: Bullet;

  bulletObject: THREE.Object3D;

  threeScene: THREE.Scene;

  constructor(bullet: Bullet, threeScene: THREE.Scene) {
    this.bullet = bullet;
    this.threeScene = threeScene;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.bulletObject = new THREE.Mesh(geometry, material);
    const { x, y, z } = bullet.position;
    const { x: rotationX, y: rotationY, z: rotationZ } = bullet.rotation;
    this.bulletObject.position.set(x, y, z);
    this.bulletObject.rotation.set(rotationX, rotationY, rotationZ);
    this.bulletObject.scale.set(1, 1, 1);
    this.threeScene.add(this.bulletObject);
  }

  render(): void {
    const { x, y, z } = this.bullet.position;
    this.bulletObject.position.set(x, y, z);
  }

  destroy(): void {
    this.threeScene.remove(this.bulletObject);
  }
}

class CameraRenderer implements Renderer {
  userPlayer: Player;

  private camera: THREE.PerspectiveCamera;

  threeScene: THREE.Scene;

  constructor(aspect: number, threeScene: THREE.Scene, userPlayer: Player) {
    this.userPlayer = userPlayer;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.lookAt(0, 1, 0);
    this.threeScene = threeScene;
  }

  getCamera() {
    return this.camera;
  }

  render(): void {
    const { x, y, z } = this.userPlayer.position;
    const vector = rotateVector3(
      { x: 0, y: -30, z: 15 },
      this.userPlayer.rotation
    );
    const { x: deltaX, y: deltaY, z: deltaZ } = vector;
    this.camera.position.set(x + deltaX, y + deltaY, z + deltaZ);
    this.camera.rotation.y = -math.atan2(-vector.x, -vector.y);
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

  bulletRenderers: Map<Bullet, BulletRenderer>;

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

    // BulletRenderers作成
    this.bulletRenderers = new Map();
    for (const bullet of this.scene.bullets) {
      this.bulletRenderers.set(
        bullet,
        new BulletRenderer(bullet, this.threeScene)
      );
    }

    // 地面作成
    const geometry = new THREE.PlaneGeometry(200, 200);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.threeScene.add(plane);
  }

  render() {
    // Player の描画
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
      this.playerRenderers.delete(renderer.player);
    }

    // Bulletの描画
    const unusedBulletRenderers = new Set(this.bulletRenderers.values());
    for (const bullet of this.scene.bullets) {
      const existingRenderer = this.bulletRenderers.get(bullet);
      if (!existingRenderer) {
        this.bulletRenderers.set(
          bullet,
          new BulletRenderer(bullet, this.threeScene)
        );
      } else {
        existingRenderer.render();
        unusedBulletRenderers.delete(existingRenderer);
      }
    }
    for (const renderer of unusedBulletRenderers) {
      renderer.destroy();
      this.bulletRenderers.delete(renderer.bullet);
    }

    // cameraの描画
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
