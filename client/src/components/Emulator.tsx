import { useCallback, useEffect, useRef } from "react";
import Game from "./game";

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) throw new Error();
    gameRef.current = new Game(currentCanvas);
    gameRef.current.run();
    return () => {
      if (!gameRef.current) throw new Error();
      gameRef.current.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleKeyAction = useCallback((e: KeyboardEvent) => {
    const currentGame = gameRef.current;
    if (!currentGame) throw new Error();
    currentGame.setKeyStates(e);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyAction);
    window.addEventListener("keyup", handleKeyAction);
    return () => {
      window.removeEventListener("keydown", handleKeyAction);
      window.removeEventListener("keyup", handleKeyAction);
    };
  }, [handleKeyAction]);

  return (
    <canvas ref={canvasRef} width={400} height={300}>
      WebGL描画用キャンバス
    </canvas>
  );
}
