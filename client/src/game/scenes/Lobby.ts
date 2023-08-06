import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";
import * as THREE from "three";
import {
  Scene,
  SceneRenderer,
  CameraRenderer,
  Renderer,
} from "../commons/models";

export class Room {
  id: number;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class LobbyScene extends Scene {
  rooms: Room[] = [];

  constructor(onSceneDestroyed: () => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
    for (let i = 0; i < 10; i += 1) {
      this.rooms.push(new Room(i, `Room ${i}`));
    }
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }

  deleteRoom(roomId: number) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }
}

class LobbySceneCameraRenderer extends CameraRenderer {
  render(): void {
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  }
}

class DOMRenderer implements Renderer {
  private css2dRenderer: CSS2DRenderer;

  private css2dObjects: CSS2DObject[] = [];

  scene: LobbyScene;

  threeScene: THREE.Scene;

  cameraRenderer: CameraRenderer;

  display: HTMLDivElement;

  onSceneDestroyed: () => void;

  constructor(
    display: HTMLDivElement,
    threeScene: THREE.Scene,
    cameraREnderer: CameraRenderer,
    scene: LobbyScene,
    onSceneDestroyed: () => void,
    onRoomAdded: () => void
  ) {
    this.display = display;
    this.threeScene = threeScene;
    this.cameraRenderer = cameraREnderer;
    this.scene = scene;
    this.onSceneDestroyed = onSceneDestroyed;
    this.css2dRenderer = new CSS2DRenderer({ element: display });
    this.css2dRenderer.domElement.style.position = "absolute";
    this.css2dRenderer.domElement.style.width = "600px";
    this.css2dRenderer.domElement.style.height = "400px";
    const background = document.createElement("div");
    background.style.width = "100%";
    background.style.height = "100%";
    background.style.backgroundColor = "yellow";
    const table = document.createElement("table");
    for (const room of this.scene.rooms) {
      const row = document.createElement("tr");
      const roomName = document.createElement("td");
      roomName.className = "room";
      roomName.textContent = room.name;
      const joinTd = document.createElement("td");
      const joinButton = document.createElement("button");
      joinButton.textContent = "Join";
      joinButton.onclick = onSceneDestroyed;
      joinTd.appendChild(joinButton);
      row.appendChild(roomName);
      row.appendChild(joinTd);
      table.appendChild(row);
    }
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.onclick = onRoomAdded;
    background.appendChild(table);
    const css2dObject = new CSS2DObject(background);
    this.threeScene.add(css2dObject);
    this.css2dObjects.push(css2dObject);
  }

  render(): void {
    this.css2dRenderer.render(this.threeScene, this.cameraRenderer.Camera);
  }

  destroy(): void {
    for (const css2dObject of this.css2dObjects) {
      this.threeScene.remove(css2dObject);
    }
  }
}
export class LobbySceneRenderer extends SceneRenderer {
  protected scene: LobbyScene;

  protected cameraRenderer: LobbySceneCameraRenderer;

  protected domRenderer: DOMRenderer;

  constructor(
    scene: LobbyScene,
    canvas: HTMLCanvasElement,
    display: HTMLDivElement,
    onAddClicked: () => void
  ) {
    super(scene, canvas);
    this.scene = scene;
    this.cameraRenderer = new LobbySceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    if (!this.scene.onSceneDestroyed) throw new Error();
    this.domRenderer = new DOMRenderer(
      display,
      this.threeScene,
      this.cameraRenderer,
      this.scene,
      this.scene.onSceneDestroyed,
      onAddClicked
    );
  }

  render(): void {
    this.domRenderer.render();
    this.cameraRenderer.render();
    super.render();
  }

  destroy(): void {
    this.domRenderer.destroy();
    this.cameraRenderer.destroy();
    super.destroy();
  }
}
