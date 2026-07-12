import { useEffect, useRef } from "react";

type Vehicle = {
  x: number;
  y: number;
  speed: number;
  progress: number;
};

type Route = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export default function FleetCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animation: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const ROUTE_COUNT = 10;

    const routes: Route[] = Array.from({ length: ROUTE_COUNT }).map(() => ({
      startX: Math.random() * canvas.width,
      startY: Math.random() * canvas.height,
      endX: Math.random() * canvas.width,
      endY: Math.random() * canvas.height,
    }));

    const vehicles: Vehicle[] = routes.map((r) => ({
      x: r.startX,
      y: r.startY,
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.002,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      routes.forEach((route, index) => {
        ctx.beginPath();
        ctx.moveTo(route.startX, route.startY);
        ctx.lineTo(route.endX, route.endY);

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(route.startX, route.startY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(route.endX, route.endY, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();

        const vehicle = vehicles[index];

        vehicle.progress += vehicle.speed;

        if (vehicle.progress > 1) {
          vehicle.progress = 0;
        }

        vehicle.x =
          route.startX +
          (route.endX - route.startX) * vehicle.progress;

        vehicle.y =
          route.startY +
          (route.endY - route.startY) * vehicle.progress;

        ctx.beginPath();
        ctx.arc(vehicle.x, vehicle.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#E08D2C";
        ctx.shadowColor = "#E08D2C";
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animation = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-60"
    />
  );
}