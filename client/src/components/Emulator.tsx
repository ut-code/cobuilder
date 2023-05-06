import { useCallback, useEffect, useRef } from "react";
import GameManager from "./GameManager";

export default function Emulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const gameRef = useRef<GameManager | null>(null);

  useEffect(() => {
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) throw new Error();
    gameRef.current = new GameManager(currentCanvas);
    gameRef.current.run();
    return () => {
      if (!gameRef.current) throw new Error();
      gameRef.current.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleUserInput = useCallback((e: KeyboardEvent | PointerEvent) => {
    if (!gameRef.current) throw new Error();
    gameRef.current.handleUserInput(e);
    if (e instanceof KeyboardEvent) console.log(e.key);
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
    <canvas ref={canvasRef} width={400} height={300}>
      WebGL描画用キャンバス
    </canvas>
  );
}
