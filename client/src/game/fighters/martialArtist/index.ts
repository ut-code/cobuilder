import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { BaseFighter, BaseFighterRenderer } from "../base";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stickman from "../../../../resources/stickman.gltf";

export class MartialArtist extends BaseFighter {
  HP = 100;
}

export class MartialArtistRenderer extends BaseFighterRenderer {
  constructor(fighter: MartialArtist, threeScene: THREE.Scene) {
    super(fighter, threeScene);
    const loader = new GLTFLoader();
    loader.load(stickman, (gltf) => {
      const model = gltf.scene;
      this.animationMixer = new THREE.AnimationMixer(model);
      const clips = gltf.animations;
      const runningClip = THREE.AnimationClip.findByName(clips, "running");
      const runningAction = this.animationMixer.clipAction(runningClip);
      runningAction.play();
      const { x, y, z } = fighter.position;
      const { x: rotationX, y: rotationY, z: rotationZ } = fighter.rotation;
      model.position.set(x, y, z);
      model.rotation.set(rotationX, rotationY, rotationZ);
      this.threeScene.add(model);
      this.fighterObject = model;
    });
  }

  render(): void {
    super.render();
    this.animationMixer?.update(0.01);
  }
}
