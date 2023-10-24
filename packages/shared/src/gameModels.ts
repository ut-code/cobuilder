export interface User {
  id: number;
  name: string;
  status: "login" | "mode-select" | "lobby" | "waiting" | "game";
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type PlayerStatus = {
  id: number;
  HP: number;
  score: number;
  position: Vector3;
  rotation: Vector3;
  isDead: boolean;
};

export type BulletStatus = {
  id: number;
  position: Vector3;
  rotation: Vector3;
};

export type ObstacleStatus = {
  id: number;
  position: Vector3;
  rotation: Vector3;
};

export type RoomData = {
  id: number;
  users: User[];
};
