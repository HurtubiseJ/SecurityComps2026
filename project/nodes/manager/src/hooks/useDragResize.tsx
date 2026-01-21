import { useRef } from "react";

export function useDragResize(
  onDrag: (deltaX: number, deltaY: number) => void
) {
  const start = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    start.current = { x: e.clientX, y: e.clientY };

    const onMouseMove = (ev: MouseEvent) => {
      onDrag(
        ev.clientX - start.current.x,
        ev.clientY - start.current.y
      );
      start.current = { x: ev.clientX, y: ev.clientY };
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return { onMouseDown };
}
