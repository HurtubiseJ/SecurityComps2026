import { useState } from "react";
import { Resizer } from "./Resizer";
import { useDragResize } from "../hooks/useDragResize";

export default function DashboardLayout() {
  const [leftWidth, setLeftWidth] = useState(240);
  const [rightWidth, setRightWidth] = useState(280);
  const [bottomHeight, setBottomHeight] = useState(220);
  const [bottomLeftWidth, setBottomLeftWidth] = useState(200)

  const leftResize = useDragResize(dx => setLeftWidth(w => Math.max(160, w + dx)));
  const rightResize = useDragResize(dx => setRightWidth(w => Math.min(500, Math.max(10, w - dx))));
  const bottomResize = useDragResize((_, dy) =>
    setBottomHeight(h => Math.max(120, h - dy))
  );

  const bottomLeftResize = useDragResize(dx => 
    setBottomLeftWidth(w => Math.max(leftWidth, Math.min(750, w + dx )))
  );

  return (
    <div className="h-screen w-screen flex bg-zinc-900 text-zinc-100 overflow-hidden">

      {/* LEFT */}
      <div
        className="flex relative bg-zinc-800 border-r border-zinc-700"
        style={{ width: leftWidth }}
      >
        <div className="h-full pb-[220px] p-4">
          Left
        </div>
        <div className="absolute top-0 right-0 h-full">
          <Resizer direction="vertical" onMouseDown={leftResize.onMouseDown} />
        </div>
      </div>

      {/* CENTER */}
      <div className="flex-1 relative bg-zinc-900">
        <div className="h-full p-4">
          Main
        </div>
      </div>

      {/* RIGHT */}
      <div
        className="flex relative bg-zinc-800 z-10 border-l border-zinc-700"
        style={{ width: rightWidth }}
      >
        <div className="h-full p-4">
          Right
        </div>
        <div className="flex absolute top-0 left-0 h-full">
          <Resizer direction="vertical" onMouseDown={rightResize.onMouseDown} />
        </div>
      </div>

      {/* BOTTOM */}
      <div
        className="absolute w-full bottom-0 right-0 bg-zinc-950 border-t border-zinc-700"
        style={{ height: bottomHeight, paddingRight: 0 }}
      >
        <div className="absolute top-0 left-0 right-0">
          <Resizer direction="horizontal" onMouseDown={bottomResize.onMouseDown} />
        </div>

        <div className="flex h-full">
          <div
            className="p-3 border-r border-zinc-700"
            style={{ width: bottomLeftWidth }}
          >
            Left
          </div>

          <Resizer
            direction="vertical"
            onMouseDown={bottomLeftResize.onMouseDown}
          />

          <div className="flex-1 p-3">
            Right
          </div>
        </div>
      </div>

    </div>
  );
}

