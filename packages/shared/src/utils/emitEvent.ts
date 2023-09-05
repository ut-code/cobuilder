import { Socket as ClientSocket } from "socket.io-client";
import { Socket as ServerSocket } from "socket.io";
import {
  createPlayer,
  NewUserData,
  updateGameData,
  GameData,
  LobbyData,
  TypistData,
  createRoom,
  joinRoom,
  leaveRoom,
  updateLobbyData,
  updateKeyboardInputs,
  KeyboardInputs,
} from "../schema";

// client -> server

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof createPlayer,
  typistData: TypistData,
  keyboardInputs: KeyboardInputs
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof createPlayer,
  userData: NewUserData
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof updateKeyboardInputs,
  keyboardInputs: KeyboardInputs
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof createRoom
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof joinRoom
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: typeof leaveRoom
): void;

export function emitEventFromClient(
  socket: ClientSocket,
  event: string,
  ...args: unknown[]
) {
  socket.emit(event, ...args);
}

// server -> client

export function emitEventFromServer(
  socket: ServerSocket,
  event: typeof updateGameData,
  gameData: GameData
): void;

export function emitEventFromServer(
  socket: ServerSocket,
  event: typeof updateLobbyData,
  lobbyData: LobbyData
): void;

export function emitEventFromServer(
  socket: ServerSocket,
  event: string,
  ...args: unknown[]
) {
  socket.emit(event, ...args);
}
