// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CSS3DRenderer } from "three/examples/jsm/renderers/CSS3DRenderer";
import { Scene, SceneRenderer, CameraRenderer } from "../commons/models";

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
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }

  deleteRoom(roomId: number) {
    const room = this.rooms.find(one => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }
}

class LobbySceneCameraRenderer extends CameraRenderer {
  render(): void {
    this.camera.position.set(0, 10, 0);
  }
}

export class LobbySceneRenderer extends SceneRenderer {
  protected scene: LobbyScene;

  protected cameraRenderer: LobbySceneCameraRenderer;

  constructor(scene: LobbyScene, canvas: HTMLCanvasElement) {
    super(scene, canvas);
    this.scene = scene;
    this.cameraRenderer = new LobbySceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
  }
}
