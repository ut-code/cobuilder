import { WebSocket } from "ws";
import { Room, RoomManager, UserInLobby } from "../roomManager";

export default function roomHandler(
  socket: WebSocket,
  roomManager: RoomManager,
  user: UserInLobby
) {
  roomManager.addUser(new UserInLobby(user.id, user.name));
  setInterval(() => {
    socket.emit("lobbyData", {
      rooms: roomManager.rooms.map((room: Room) => {
        return {
          id: room.id,
          users: room.users.map((userInLobby: UserInLobby) => {
            return { id: userInLobby.id, name: userInLobby.name };
          }),
        };
      }),
    });
  }, 10);
  socket.on("createRoom", () => {
    const userInLobby = roomManager.getUser(user.id);
    if (userInLobby && !userInLobby.isWaiting) {
      roomManager.createRoom("new room", userInLobby);
      userInLobby.isWaiting = true;
    }
  });
  socket.on("joinRoom", (roomId: number, userInLobby: UserInLobby) => {
    roomManager.joinRoom(roomId, userInLobby);
  });
  socket.on("disconnect", () => {
    roomManager.removeUser(user.id);
  });
}
