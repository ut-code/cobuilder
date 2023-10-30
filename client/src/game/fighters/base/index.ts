import * as THREE from "three";
import { FighterActions, Vector3 } from "shared";
import { GameObject, Renderer } from "../../models";

export abstract class BaseFighter implements GameObject {
  id: number;

  HP = 3;

  position: Vector3;

  rotation: Vector3;

  isDead = false;

  currentAction: FighterActions = "idle";

  previousAction: FighterActions = "idle";

  constructor(id: number, position: Vector3, rotation: Vector3) {
    this.id = id;
    this.position = position;
    this.rotation = rotation;
  }
}

export abstract class BaseFighterRenderer implements Renderer {
  fighter: BaseFighter;

  fighterObject: THREE.Object3D = new THREE.Object3D();

  threeScene: THREE.Scene;

  animationMixer?: THREE.AnimationMixer;

  actionAnimations: {
    [key in FighterActions]?: THREE.AnimationAction;
  } = {};

  constructor(fighter: BaseFighter, threeScene: THREE.Scene) {
    this.fighter = fighter;
    this.threeScene = threeScene;
  }

  render(): void {
    const { x, y, z } = this.fighter.position;
    const { x: rotationX, y: rotationY, z: rotationZ } = this.fighter.rotation;
    this.fighterObject.position.set(x, y, z);
    this.fighterObject.rotation.set(rotationX, rotationY, rotationZ);
    this.animationMixer?.update(0.01);
  }

  destroy() {
    this.threeScene.remove(this.fighterObject);
  }
}
