import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Archive } from "lucide-react";

interface BatchActionsProps {
  selectedCount: number;
  onSelectAll: (selected: boolean) => void;
  onDelete: () => void;
  onArchive?: () => void;
  totalCount: number;
}

export function BatchActions({ selectedCount, onSelectAll, onDelete, onArchive, totalCount }: BatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4">
      <div className="flex items-center gap-2 flex-1">
        <Checkbox
          checked={selectedCount === totalCount}
          onCheckedChange={onSelectAll}
        />
        <span className="text-sm font-medium">{selectedCount} selected</span>
      </div>
      <div className="flex gap-2">
        {onArchive && (
          <Button variant="outline" size="sm" className="gap-2">
            <Archive className="w-4 h-4" /> Archive
          </Button>
        )}
        <Button variant="destructive" size="sm" className="gap-2" onClick={onDelete}>
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      </div>
    </div>
  );
}
