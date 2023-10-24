import { WebSocket as ServerSocket } from "ws";
import {
  ConnectionEventData,
  CreateUserEventData,
  CreateRoomEventData,
  JoinRoomEventData,
  KeyboardInputsEventData,
  LeaveRoomEventData,
  UpdateGameDataEventData,
  UpdateLobbyDataEventData,
  StartGameEventData,
} from "../schema";

// client -> server
export function clientEmitEvent(
  socket: WebSocket,
  data: CreateUserEventData
): void;
export function clientEmitEvent(
  socket: WebSocket,
  data: KeyboardInputsEventData
): void;
export function clientEmitEvent(
  socket: WebSocket,
  data: CreateRoomEventData
): void;
export function clientEmitEvent(
  socket: WebSocket,
  data: JoinRoomEventData
): void;
export function clientEmitEvent(
  socket: WebSocket,
  data: LeaveRoomEventData
): void;
export function clientEmitEvent(
  socket: WebSocket,
  data: ConnectionEventData
): void;

export function clientEmitEvent(socket: WebSocket, data: unknown) {
  socket.send(JSON.stringify(data));
}

// server -> client
export function serverEmitEvent(
  ws: ServerSocket,
  data: UpdateGameDataEventData
): void;
export function serverEmitEvent(
  ws: ServerSocket,
  data: UpdateLobbyDataEventData
): void;
export function serverEmitEvent(
  ws: ServerSocket,
  data: StartGameEventData
): void;
export function serverEmitEvent(socket: ServerSocket, data: unknown) {
  socket.send(JSON.stringify(data));
}
