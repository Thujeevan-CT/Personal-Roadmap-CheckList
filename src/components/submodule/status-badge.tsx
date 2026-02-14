import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import type { SubModuleStatus } from "@/types";

const statusConfig: Record<SubModuleStatus, { label: string; variant: BadgeVariant }> = {
  not_started: { label: "Not Started", variant: "not_started" },
  in_progress: { label: "In Progress", variant: "in_progress" },
  completed: { label: "Completed", variant: "completed" },
  blocked: { label: "Blocked", variant: "blocked" },
};

const STATUSES: SubModuleStatus[] = ["not_started", "in_progress", "completed", "blocked"];

interface StatusBadgeProps {
  status: SubModuleStatus;
  onStatusChange?: (status: SubModuleStatus) => void;
}

export function StatusBadge({ status, onStatusChange }: StatusBadgeProps) {
  const config = statusConfig[status];
  if (!onStatusChange) {
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }
  return (
    <Dropdown
      trigger={<Badge variant={config.variant} className="cursor-pointer">{config.label}</Badge>}
    >
      {STATUSES.map((s) => (
        <DropdownItem
          key={s}
          onClick={() => onStatusChange(s)}
        >
          {statusConfig[s].label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
