import { useEffect, useRef } from "react";
import * as THREE from "three";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const scene = new THREE.Scene();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const WebGLRendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const currentCanvasRef = canvasRef.current;
    if (!currentCanvasRef) throw new Error();
    const renderer = new THREE.WebGLRenderer({ canvas: currentCanvasRef });
    WebGLRendererRef.current = renderer;
    return () => {
      renderer.dispose();
    };
  });

  return <canvas ref={canvasRef}>WebGL描画用キャンバス</canvas>;
}

export default App;
