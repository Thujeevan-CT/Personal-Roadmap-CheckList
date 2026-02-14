import type { Roadmap } from "@/types";
import { RoadmapCard } from "./roadmap-card";

interface RoadmapGridProps {
  roadmaps: Roadmap[];
  onDelete?: (roadmap: Roadmap & { progress?: number }) => void;
}

export function RoadmapGrid({ roadmaps, onDelete }: RoadmapGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {roadmaps.map((r) => (
        <RoadmapCard key={r._id} roadmap={r} onDelete={onDelete} />
      ))}
    </div>
  );
}
