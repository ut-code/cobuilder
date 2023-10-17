import { WebSocket } from "ws";
import { serverEmitEvent, serverOnEvent } from "shared";
import { Room, RoomManager, UserInLobby } from "../roomManager";

export default function roomHandler(
  socket: WebSocket,
  roomManager: RoomManager,
  user: UserInLobby
) {
  roomManager.addUser(new UserInLobby(user.id, user.name));
  setInterval(() => {
    serverEmitEvent(socket, {
      event: "lobby-data:update",
      lobbyData: {
        rooms: roomManager.rooms.map((room: Room) => {
          return {
            id: room.id,
            users: room.users.map((userInLobby: UserInLobby) => {
              return { id: userInLobby.id, name: userInLobby.name };
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
        if (userInLobby && !userInLobby.isWaiting) {
          roomManager.createRoom("new room", userInLobby);
          userInLobby.isWaiting = true;
        }
        break;
      }
      case "room:join": {
        const userInLobby = roomManager.getUser(user.id);
        if (userInLobby && !userInLobby.isWaiting) {
          roomManager.joinRoom(data.roomId, userInLobby);
          userInLobby.isWaiting = true;
        }
        break;
      }
      default: {
        throw new Error(`Unexpected event: ${data.event}`);
      }
    }
  });
  socket.on("joinRoom", (roomId: number, userInLobby: UserInLobby) => {
    roomManager.joinRoom(roomId, userInLobby);
  });
  socket.on("close", () => {
    roomManager.removeUser(user.id);
  });
}
