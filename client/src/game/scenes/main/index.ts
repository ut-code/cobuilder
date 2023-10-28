import * as THREE from "three";
import * as math from "mathjs";
import {
  BulletStatus,
  ObstacleStatus,
  FighterStatus,
  Vector3,
  rotateVector3,
} from "shared";
import { GameObject, Renderer } from "../../models";
import { BaseCameraRenderer, BaseScene, BaseSceneRenderer } from "../base";
import {
  MartialArtist,
  MartialArtistRenderer,
} from "../../fighters/martialArtist";
import upSky from "../../../../resources/clouds1_up.png";
import downSky from "../../../../resources/clouds1_down.png";
import eastSky from "../../../../resources/clouds1_east.png";
import westSky from "../../../../resources/clouds1_west.png";
import southSky from "../../../../resources/clouds1_south.png";
import northSky from "../../../../resources/clouds1_north.png";
import dryGround from "../../../../resources/ground.png";
import brick from "../../../../resources/brick_wall-red.png";
import { BaseFighter, BaseFighterRenderer } from "../../fighters/base";

const STAGE_WIDTH = 800;

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

export class MainScene extends BaseScene {
  obstacles: GameObject[] = [];

  userFighterId: number;

  fighters: BaseFighter[] = [];

  bullets: Bullet[] = [];

  constructor(userFighterId: number, onSceneDestroyed: () => void) {
    super();
    this.userFighterId = userFighterId;
    this.onSceneDestroyed = onSceneDestroyed;
    this.fighters.push(
      new MartialArtist(
        userFighterId,
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 0 }
      )
    );
  }

  getFighter(id: number) {
    return this.fighters.find((fighter) => fighter.id === id);
  }

  addFighter(fighter: BaseFighter) {
    this.fighters.push(fighter);
  }

  removeFighter(fighter: BaseFighter) {
    this.fighters.splice(this.fighters.indexOf(fighter), 1);
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

  updateScene(gameData: {
    fighterStatuses: FighterStatus[];
    bulletStatuses: BulletStatus[];
    obstacleStatuses: ObstacleStatus[];
  }) {
    const { fighterStatuses, bulletStatuses } = gameData;
    // fighter の更新
    for (const fighterStatus of fighterStatuses) {
      const { id, HP, position, rotation } = fighterStatus;
      const existingFighter = this.getFighter(id);
      if (!existingFighter) {
        this.addFighter(new MartialArtist(id, position, rotation));
      } else if (!fighterStatus.isDead) {
        if (existingFighter.position !== position) {
          existingFighter.position = position;
        }
        if (existingFighter.rotation !== rotation) {
          existingFighter.rotation = rotation;
        }
        if (existingFighter.HP !== HP) {
          existingFighter.HP = HP;
        }
        if (existingFighter.currentAction !== fighterStatus.currentAction) {
          existingFighter.currentAction = fighterStatus.currentAction;
        }
      } else {
        existingFighter.isDead = true;
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

class MainSceneCameraRenderer extends BaseCameraRenderer {
  userFighter: BaseFighter;

  constructor(
    aspect: number,
    threeScene: THREE.Scene,
    userFighter: BaseFighter
  ) {
    super(aspect, threeScene);
    this.userFighter = userFighter;
    this.camera.lookAt(0, 1, 0);
  }

  render(): void {
    const { x, y, z } = this.userFighter.position;
    const vector = rotateVector3(
      { x: 0, y: -30, z: 15 },
      this.userFighter.rotation
    );
    const { x: deltaX, y: deltaY, z: deltaZ } = vector;
    this.camera.position.set(x + deltaX, y + deltaY, z + deltaZ);
    this.camera.rotation.y = -math.atan2(-vector.x, -vector.y);
  }
}

export class MainSceneRenderer extends BaseSceneRenderer {
  protected cameraRenderer: MainSceneCameraRenderer;

  protected scene: MainScene;

  fighterRenderers: Map<BaseFighter, BaseFighterRenderer>;

  bulletRenderers: Map<Bullet, BulletRenderer>;

  constructor(scene: MainScene, canvas: HTMLCanvasElement) {
    super(scene, canvas);
    this.scene = scene;

    // カメラ作成
    const userFighter = scene.getFighter(scene.userFighterId);
    if (!userFighter) throw new Error();
    this.cameraRenderer = new MainSceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene,
      userFighter
    );

    // FighterRendererとScoreRenderers作成
    this.fighterRenderers = new Map();
    for (const fighter of this.scene.fighters) {
      this.fighterRenderers.set(
        fighter,
        new MartialArtistRenderer(fighter, this.threeScene)
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
    // Fighter の描画
    const unusedFighterRenderers = new Set(this.fighterRenderers.values());
    for (const fighter of this.scene.fighters) {
      if (!fighter.isDead) {
        const existingRenderer = this.fighterRenderers.get(fighter);
        if (!existingRenderer) {
          this.fighterRenderers.set(
            fighter,
            new MartialArtistRenderer(fighter, this.threeScene)
          );
        } else {
          existingRenderer.render();
          unusedFighterRenderers.delete(existingRenderer);
        }
      }
    }
    for (const renderer of unusedFighterRenderers) {
      renderer.destroy();
      this.fighterRenderers.delete(renderer.fighter);
    }

    // Fighter

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
    for (const fighterRenderer of this.fighterRenderers.values()) {
      fighterRenderer.destroy();
    }
    for (const bulletRenderer of this.bulletRenderers.values()) {
      bulletRenderer.destroy();
    }
    this.threeScene.removeFromParent();
    this.webGLRenderer.dispose();
  }
}
