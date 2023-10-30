import { GameData, User, serverEmitEvent, serverOnEvent } from "shared";
import { WebSocket } from "ws";
import { Room } from "./RoomManager";

export default class NetworkManager {
  socket: WebSocket;

  onRoomCreate: () => void;

  onRoomJoin: (roomId: number) => void;

  onFighterCreate: () => void;

  onKeyboardInputsUpdate: (keyboardInputs: string) => void;

  onClose: () => void;

  constructor(
    socket: WebSocket,
    onRoomCreate: () => void,
    onRoomJoin: (roomId: number) => void,
    onFighterCreate: () => void,
    onKeyboardInputsUpdate: (keyboardInputs: string) => void,
    onClose: () => void
  ) {
    this.socket = socket;
    this.onRoomCreate = onRoomCreate;
    this.onRoomJoin = onRoomJoin;
    this.onFighterCreate = onFighterCreate;
    this.onKeyboardInputsUpdate = onKeyboardInputsUpdate;
    this.onClose = onClose;
    this.registerEvent();
  }

  registerEvent() {
    serverOnEvent(this.socket, "message", (data) => {
      switch (data.event) {
        case "room:create": {
          this.onRoomCreate();
          break;
        }
        case "room:join": {
          this.onRoomJoin(data.roomId);
          break;
        }
        case "fighter:create": {
          console.log("fighter:create");
          this.onFighterCreate();
          break;
        }
        case "keyboard-inputs:update": {
          this.onKeyboardInputsUpdate(data.keyboardInputs);
          break;
        }
        default: {
          throw new Error(`Unexpected event: ${data.event}`);
        }
      }
    });
    serverOnEvent(this.socket, "close", () => {
      this.onClose();
    });
  }

  sendLobbyDataUpdate(rooms: Room[]) {
    serverEmitEvent(this.socket, {
      event: "lobby-data:update",
      lobbyData: {
        rooms: rooms
          .filter((room) => !room.isPlaying)
          .map((room: Room) => {
            return {
              id: room.id,
              users: room.users.map((userInRoom: User) => {
                return {
                  id: userInRoom.id,
                  name: userInRoom.name,
                  status: userInRoom.status,
                };
              }),
            };
          }),
      },
    });
  }

  sendGameDataUpdate(gameData: GameData) {
    serverEmitEvent(this.socket, {
      event: "game-data:update",
      gameData,
    });
  }

  sendGameStart() {
    serverEmitEvent(this.socket, {
      event: "game:start",
    });
  }
}
