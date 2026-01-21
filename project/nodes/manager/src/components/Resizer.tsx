type ResizerProps = {
    direction: "vertical" | "horizontal";
    onMouseDown: (e: React.MouseEvent) => void;
  };
  
  export function Resizer({ direction, onMouseDown }: ResizerProps) {
    return (
      <div
        onMouseDown={onMouseDown}
        className={`
          ${direction === "vertical" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"}
          bg-transparent hover:bg-blue-500/50
          transition-colors
          z-50
        `}
      />
    );
  }
  