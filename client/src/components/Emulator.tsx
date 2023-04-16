import { useEffect, useRef } from "react";
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
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={600}>
      WebGL描画用キャンバス
    </canvas>
  );
}
