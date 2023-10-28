import * as THREE from "three";
import { LobbyData, Vector3 } from "shared";
import { BaseScene, BaseSceneRenderer, BaseCameraRenderer } from "../base";
import { PointerState } from "../../InputManger";
import joinButtonImage from "../../../../resources/join.png";
import createRoomButtonImage from "../../../../resources/create-room.png";

export class Room {
  id: number;

  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class LobbyScene extends BaseScene {
  rooms: Room[] = [];

  pointerState: PointerState = { x: 0, y: 0, isPointerDown: false };

  constructor(onSceneDestroyed: () => void) {
    super();
    this.onSceneDestroyed = onSceneDestroyed;
  }

  getRoom(roomId: number) {
    return this.rooms.find((one) => one.id === roomId);
  }

  addRoom(room: Room) {
    this.rooms.push(room);
  }

  removeRoom(roomId: number) {
    const room = this.rooms.find((one) => one.id === roomId);
    if (!room) throw new Error();
    this.rooms.splice(this.rooms.indexOf(room), 1);
  }

  destroy(): void {
    this.onSceneDestroyed?.();
  }

  updateScene(lobbyData: LobbyData) {
    const unusedRooms = new Set(this.rooms);
    for (const roomData of lobbyData.rooms) {
      const existingRoom = this.getRoom(roomData.id);
      if (!existingRoom) {
        this.addRoom(new Room(roomData.id, "new room"));
      } else {
        unusedRooms.delete(existingRoom);
      }
    }
    for (const room of unusedRooms) {
      this.removeRoom(room.id);
    }
  }

  updatePointerState(pointerState: PointerState) {
    this.pointerState.x = pointerState.x;
    this.pointerState.y = pointerState.y;
    this.pointerState.isPointerDown = pointerState.isPointerDown;
  }
}

class LobbySceneCameraRenderer extends BaseCameraRenderer {
  render(): void {
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  }
}

abstract class UI {
  object: THREE.Object3D = new THREE.Object3D();

  protected threeScene: THREE.Scene;

  constructor(threeScene: THREE.Scene) {
    this.threeScene = threeScene;
  }

  destroy(): void {
    this.threeScene.remove(this.object);
  }
}

class Button extends UI {
  object: THREE.Sprite;

  onClick: () => void;

  constructor(
    threeScene: THREE.Scene,
    onClick: () => void,
    sprite: THREE.Sprite,
    position?: Vector3,
    scale?: Vector3
  ) {
    super(threeScene);
    this.onClick = onClick;
    const buttonSprite = sprite;
    this.object = buttonSprite;
    threeScene.add(buttonSprite);
    if (position) {
      const { x, y, z } = position;
      this.setPosition(x, y, z);
    }
    if (scale) {
      const { x: scaleX, y: scaleY, z: scaleZ } = scale;
      this.setScale(scaleX, scaleY, scaleZ);
    }
  }

  setPosition(x: number, y: number, z: number) {
    this.object.position.set(x, y, z);
  }

  setScale(x: number, y: number, z: number) {
    this.object.scale.set(x, y, z);
  }
}

class RoomRenderer extends UI {
  object: THREE.Group;

  room: Room;

  button: Button;

  constructor(threeScene: THREE.Scene, room: Room, button: Button) {
    super(threeScene);
    this.object = new THREE.Group();
    this.room = room;
    this.button = button;
    this.object.add(button.object);
    this.threeScene.add(this.object);
  }

  setPosition(x: number, y: number, z: number) {
    this.object.position.set(x, y, z);
  }

  setScale(x: number, y: number, z: number) {
    this.object.scale.set(x, y, z);
  }
}

type OnButtonClicks = {
  onAddButtonClick: () => void;
  onJoinButtonClick: (roomId: number) => void;
};

export class LobbySceneRenderer extends BaseSceneRenderer {
  protected scene: LobbyScene;

  protected cameraRenderer: LobbySceneCameraRenderer;

  private raycaster = new THREE.Raycaster();

  private buttons = new Set<Button>();

  private roomRenderers = new Map<Room, RoomRenderer>();

  private onButtonClicks: OnButtonClicks;

  constructor(
    scene: LobbyScene,
    canvas: HTMLCanvasElement,
    onButtonClicks: OnButtonClicks
  ) {
    super(scene, canvas);
    this.threeScene.background = new THREE.Color(0xffffff);
    this.scene = scene;
    this.cameraRenderer = new LobbySceneCameraRenderer(
      canvas.width / canvas.height,
      this.threeScene
    );
    this.onButtonClicks = onButtonClicks;
    if (!this.scene.onSceneDestroyed) throw new Error();
    // + ボタン作成
    const createButtonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(createRoomButtonImage),
      })
    );
    createButtonSprite.scale.set(4.44, 1.01, 1);
    const createRoomButton = new Button(
      this.threeScene,
      onButtonClicks.onAddButtonClick,
      createButtonSprite,
      { x: 0, y: 0, z: 0 }
    );
    this.buttons.add(createRoomButton);
  }

  private createRow(room: Room) {
    const joinButtonSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: new THREE.TextureLoader().load(joinButtonImage),
      })
    );
    joinButtonSprite.scale.set(2.25, 1.01, 1);
    const joinButton = new Button(
      this.threeScene,
      () => {
        this.onButtonClicks.onJoinButtonClick(room.id);
      },
      joinButtonSprite
    );
    this.buttons.add(joinButton);
    const row = new RoomRenderer(this.threeScene, room, joinButton);
    this.roomRenderers.set(room, row);
  }

  render(): void {
    // マッチの行を作成
    const unusedRows = new Set(this.roomRenderers.values());
    for (const room of this.scene.rooms) {
      const row = this.roomRenderers.get(room);
      if (!row) {
        this.createRow(room);
      } else {
        unusedRows.delete(row);
      }
    }
    for (const row of unusedRows) {
      this.threeScene.remove(row.object);
    }
    // マッチの行を配置
    const rows = Array.from(this.roomRenderers.values());
    rows.forEach((row, index) => {
      row.setPosition(5, 6 - index, 0);
    });
    this.detectClick();
    this.cameraRenderer.render();
    super.render();
  }

  detectClick() {
    const { x, y } = this.scene.pointerState;
    const pointer = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(pointer, this.cameraRenderer.Camera);
    for (const button of this.buttons) {
      const intersects = this.raycaster.intersectObject(button.object);
      if (intersects.length > 0) {
        if (this.scene.pointerState.isPointerDown) {
          button.onClick();
        }
      }
    }
  }

  destroy(): void {
    this.cameraRenderer.destroy();
    for (const button of this.buttons) {
      button.destroy();
    }
    for (const renderer of this.roomRenderers.values()) {
      renderer.destroy();
    }
    super.destroy();
  }
}
