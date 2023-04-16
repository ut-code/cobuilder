/* eslint-disable no-restricted-syntax */
import * as THREE from "three";

interface GameObject {
  position: { x: number; y: number; z: number };

  rotation: number;
}

class World {
  gameObjects: GameObject[] = [];

  constructor() {
    const newObject: GameObject = {
      position: { x: 1, y: 1, z: 1 },
      rotation: 0,
    };
    this.gameObjects.push(newObject);
  }
}

class WorldRenderer {
  world: World;

  #webGLRenderer: THREE.WebGLRenderer;

  #camera: THREE.PerspectiveCamera;

  #scene: THREE.Scene;

  constructor(world: World, canvas: HTMLCanvasElement) {
    this.world = world;
    this.#camera = new THREE.PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000
    );
    this.#scene = new THREE.Scene();
    this.#webGLRenderer = new THREE.WebGLRenderer({ canvas });
    for (const gameObject of this.world.gameObjects) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { x, y, z } = gameObject.position;
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      this.#scene.add(cube);
    }
    this.#camera.position.z += 5;
  }

  render() {
    this.#webGLRenderer.render(this.#scene, this.#camera);
  }

  destroy() {
    this.#webGLRenderer.dispose();
  }
}

export default class Game {
  world: World;

  worldRenderer: WorldRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.world = new World();
    this.worldRenderer = new WorldRenderer(this.world, canvas);
  }

  run() {
    const callBack = () => {
      this.worldRenderer.render();
      requestAnimationFrame(callBack);
    };
    callBack();
  }

  destroy() {
    this.worldRenderer.destroy();
  }
}
