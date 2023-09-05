import * as THREE from "three";
import * as math from "mathjs";
import { Vector3, GameData, rotateVector3 } from "shared";
import {
  GameObject,
  Scene,
  Renderer,
  SceneRenderer,
  CameraRenderer,
} from "../models";
import upSky from "../../../resources/clouds1_up.png";
import downSky from "../../../resources/clouds1_down.png";
import eastSky from "../../../resources/clouds1_east.png";
import westSky from "../../../resources/clouds1_west.png";
import southSky from "../../../resources/clouds1_south.png";
import northSky from "../../../resources/clouds1_north.png";
import dryGround from "../../../resources/ground.png";
import brick from "../../../resources/brick_wall-red.png";

const STAGE_WIDTH = 800;

export class Player implements GameObject {
  id: number;

  HP = 3;

  score = 0;

  position: Vector3;

  rotation: Vector3;

  isDead = false;

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }
}

export class Bullet implements GameObject {
  id: number;

  position: Vector3;

  rotation: Vector3;

  constructor(ownerId: number, position: Vector3, rotation: Vector3) {
    this.id = ownerId;
    this.position = position;
    this.rotation = rotation;
  }
}

export class MainScene extends Scene {
  obstacles: GameObject[] = [];

  userPlayerId: number;

  players: Player[] = [];

  bullets: Bullet[] = [];

  constructor(userPlayerId: number, onSceneDestroyed: () => void) {
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

  addPlayer(player: Player) {
    this.players.push(player);
  }

  removePlayer(player: Player) {
    this.players.splice(this.players.indexOf(player), 1);
  }

  getBullet(id: number) {
    return this.bullets.find((bullet) => bullet.id === id);
  }

  addBullet(bullet: Bullet) {
    this.bullets.push(bullet);
  }

  removeBullet(bullet: Bullet) {
    this.bullets.splice(this.bullets.indexOf(bullet), 1);
  }

  updateScene(gameData: GameData) {
    const { playerStatuses, bulletStatuses } = gameData;
    // player の更新
    for (const playerStatus of playerStatuses) {
      const { id, HP, score, position, rotation } = playerStatus;
      const existingPlayer = this.getPlayer(id);
      if (!existingPlayer) {
        this.addPlayer(new Player(id, position, rotation));
      } else if (!playerStatus.isDead) {
        if (existingPlayer.position !== position) {
          existingPlayer.position = position;
        }
        if (existingPlayer.rotation !== rotation) {
          existingPlayer.rotation = rotation;
        }
        if (existingPlayer.HP !== HP) {
          existingPlayer.HP = HP;
        }
        if (existingPlayer.score !== score) {
          existingPlayer.score = score;
        }
      } else {
        existingPlayer.isDead = true;
      }
    }

    // bulletの更新
    const unusedBullets = new Set(this.bullets);
    for (const bulletStatus of bulletStatuses) {
      const { id: ownerId, position, rotation } = bulletStatus;
      const existingBullet = this.getBullet(ownerId);
      if (!existingBullet) {
        this.addBullet(new Bullet(ownerId, position, rotation));
      } else {
        unusedBullets.delete(existingBullet);
        if (existingBullet.position !== position) {
          existingBullet.position = position;
        }
        if (existingBullet.rotation !== rotation) {
          existingBullet.rotation = rotation;
        }
      }
    }
    for (const unusedBullet of unusedBullets) {
      this.removeBullet(unusedBullet);
    }
  }
}

class PlayerRenderer implements Renderer {
  player: Player;

  playerObject: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>;

  threeScene: THREE.Scene;

  constructor(player: Player, threeScene: THREE.Scene) {
    this.player = player;
    this.threeScene = threeScene;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x87cefa });
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
    if (this.player.HP === 2) {
      this.playerObject.material.color.set(0xffff00);
    } else if (this.player.HP === 1) {
      this.playerObject.material.color.set(0xff4500);
    }
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

class MainSceneCameraRenderer extends CameraRenderer {
  userPlayer: Player;

  constructor(aspect: number, threeScene: THREE.Scene, userPlayer: Player) {
    super(aspect, threeScene);
    this.userPlayer = userPlayer;
    this.camera.lookAt(0, 1, 0);
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
}

export class MainSceneRenderer extends SceneRenderer {
  protected cameraRenderer: MainSceneCameraRenderer;

  protected scene: MainScene;

  playerRenderers: Map<Player, PlayerRenderer>;

  bulletRenderers: Map<Bullet, BulletRenderer>;

  constructor(scene: MainScene, canvas: HTMLCanvasElement) {
    super(scene, canvas);
    this.scene = scene;

    // カメラ作成
    const userPlayer = scene.getPlayer(scene.userPlayerId);
    if (!userPlayer) throw new Error();
    this.cameraRenderer = new MainSceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene,
      userPlayer
    );

    // PlayerRendererとScoreRenderers作成
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

    // 以下ステージ作成
    const stage = new THREE.Group();

    // 地面作成
    const geometry = new THREE.PlaneGeometry(STAGE_WIDTH, STAGE_WIDTH);
    const groundTexture = new THREE.TextureLoader().load(dryGround);
    const plane = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ map: groundTexture, side: THREE.FrontSide })
    );
    stage.add(plane);

    // 背景作成
    const textureArray = [
      new THREE.TextureLoader().load(eastSky),
      new THREE.TextureLoader().load(westSky),
      new THREE.TextureLoader().load(upSky),
      new THREE.TextureLoader().load(downSky),
      new THREE.TextureLoader().load(northSky),
      new THREE.TextureLoader().load(southSky),
    ];
    const materialArray = textureArray.map((texture) => {
      return new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
    });
    const skyboxGeo = new THREE.BoxGeometry(
      STAGE_WIDTH,
      STAGE_WIDTH,
      STAGE_WIDTH
    );
    const skybox = new THREE.Mesh(skyboxGeo, materialArray);
    skybox.rotateX(math.pi / 2);
    stage.add(skybox);

    // 障害物作成
    for (const obstacle of this.scene.obstacles) {
      const obstacleGeometry = new THREE.CylinderGeometry(20, 40, 40);
      const texture = new THREE.TextureLoader().load(brick);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide,
      });
      const obstacleObject = new THREE.Mesh(obstacleGeometry, material);
      const { x, y, z } = obstacle.position;
      obstacleObject.position.set(x, y, z);
      obstacleObject.rotateX(math.pi / 2);
      stage.add(obstacleObject);
    }

    this.threeScene.add(stage);
  }

  render() {
    // Player の描画
    const unusedPlayerRenderers = new Set(this.playerRenderers.values());
    for (const player of this.scene.players) {
      if (!player.isDead) {
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
    super.render();
  }

  destroy() {
    this.cameraRenderer.destroy();
    for (const playerRenderer of this.playerRenderers.values()) {
      playerRenderer.destroy();
    }
    for (const bulletRenderer of this.bulletRenderers.values()) {
      bulletRenderer.destroy();
    }
    this.threeScene.removeFromParent();
    this.webGLRenderer.dispose();
  }
}
