import { Socket } from "socket.io";
import { Room, RoomManager, User } from "../roomManager";

export default function roomHandler(
  socket: Socket,
  roomManager: RoomManager,
  userId: number,
  userName: string
) {
  roomManager.addUser(new User(userId, userName));
  setInterval(() => {
    socket.emit(
      "roomsData",
      roomManager.rooms.map((room: Room) => {
        return {
          id: room.id,
          users: room.users.map((user: User) => {
            return { id: user.id, name: user.name };
          }),
        };
      })
    );
  }, 10);
  socket.on("createRoom", () => {
    const user = roomManager.getUser(userId);
    if (user && !user.isWaiting) {
      roomManager.createRoom("new room", user);
      user.isWaiting = true;
    }
  });
  socket.on("joinRoom", (roomId: number, user: User) => {
    roomManager.joinRoom(roomId, user);
  });
  socket.on("disconnect", () => {
    roomManager.removeUser(userId);
  });
}
