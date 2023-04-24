import * as THREE from "three";

export abstract class SceneRenderer {
  protected webGLRenderer: THREE.WebGLRenderer;

  protected threeScene: THREE.Scene;

  camera: THREE.PerspectiveCamera;

  constructor(canvas: HTMLCanvasElement) {
    this.webGLRenderer = new THREE.WebGLRenderer({ canvas });
    this.threeScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
  }
}

export interface GameObject {
  position: { x: number; y: number; z: number };

  rotation: Vector3;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}
