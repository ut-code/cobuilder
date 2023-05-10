import { useCallback, useEffect, useRef } from "react";
import GameManager from "./GameManager";

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameRef = useRef<GameManager | null>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) throw new Error();
    const gameManager = new GameManager(currentCanvas);
    gameRef.current = gameManager;
    gameRef.current.run();
    return () => {
      if (!gameRef.current) throw new Error();
      gameManager.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleUserInput = useCallback((e: KeyboardEvent | PointerEvent) => {
    if (!gameRef.current) throw new Error();
    gameRef.current.handleUserInput(e);
  }, []);

  useEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) throw new Error();
    window.addEventListener("keydown", handleUserInput);
    window.addEventListener("keyup", handleUserInput);
    currentCanvas.addEventListener("pointermove", handleUserInput);
    return () => {
      window.removeEventListener("keydown", handleUserInput);
      window.removeEventListener("keyup", handleUserInput);
      currentCanvas.removeEventListener("pointermove", handleUserInput);
    };
  }, [handleUserInput]);

  return (
    <canvas ref={canvasRef} width={800} height={450}>
      WebGL描画用キャンバス
    </canvas>
  );
}
