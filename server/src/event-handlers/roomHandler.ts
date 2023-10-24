import { WebSocket } from "ws";
import { User, serverEmitEvent, serverOnEvent } from "shared";
import { Room, RoomManager } from "../RoomManager";

export default function roomHandler(
  socket: WebSocket,
  roomManager: RoomManager,
  user: User,
  onClose: () => void
) {
  roomManager.addUser(user);
  setInterval(() => {
    serverEmitEvent(socket, {
      event: "lobby-data:update",
      lobbyData: {
        rooms: roomManager.rooms.map((room: Room) => {
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
  }, 10);
  serverOnEvent(socket, "message", (data) => {
    switch (data.event) {
      case "room:create": {
        const userInLobby = roomManager.getUser(user.id);
        if (userInLobby?.status === "lobby") {
          roomManager.addRoom("new room", userInLobby);
          userInLobby.status = "waiting";
        }
        break;
      }
      case "room:join": {
        const userInLobby = roomManager.getUser(user.id);
        if (userInLobby?.status === "lobby") {
          roomManager.joinRoom(data.roomId, userInLobby);
          userInLobby.status = "waiting";
        }
        break;
      }
      default: {
        throw new Error(`Unexpected event: ${data.event}`);
      }
    }
  });
  serverOnEvent(socket, "close", () => {
    onClose();
  });
}
