import type { BaseConfig } from "../../types/BaseConfig";

type DashboardRightProps = {
  baseConfig: BaseConfig | null;
  updateNode: (nodeStr: any) => void;
};

export default function DashboardRight({
  baseConfig,
  updateNode,
}: DashboardRightProps) {
  if (!baseConfig) {
    return (
      <div className="flex flex-1 items-center justify-center text-zinc-600 text-sm">
        <div className="flex flex-col items-center gap-y-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-700"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <p className="text-zinc-500">Select a node to configure</p>
        </div>
      </div>
    );
  }

  const stateColor =
    baseConfig.state === "running"
      ? "bg-emerald-500"
      : baseConfig.state === "idle"
        ? "bg-amber-400"
        : "bg-zinc-500";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/60 shrink-0 bg-zinc-800/40">
        <div className="flex items-center gap-x-3">
          <div className={`rounded-full ${stateColor} h-2.5 w-2.5`} />
          <h2 className="text-sm font-semibold text-zinc-200 tracking-tight">
            {(baseConfig.name as string).toUpperCase()}
          </h2>
          <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 border border-zinc-700/60 px-1.5 py-0.5 rounded">
            {baseConfig.type}
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-600">
          {baseConfig.id.slice(0, 8)}…
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {baseConfig.configLayout(updateNode)}
      </div>
    </div>
  );
}