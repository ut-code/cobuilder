import { Server, Socket } from "socket.io";
import { RoomManager, User } from "../roomManager";

export default function roomHandler(
  socket: Socket,
  io: Server,
  roomManager: RoomManager
) {
  socket.on("createRoom", (user: User) => {
    roomManager.createRoom(user);
  });
  socket.on("joinRoom", (roomId: number, user: User) => {
    roomManager.joinRoom(roomId, user);
  });
}
