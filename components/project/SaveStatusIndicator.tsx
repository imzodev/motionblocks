import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/lib/stores";
import { Save } from "lucide-react";

/**
 * Save Status Indicator
 * 
 * Shows the current save status of the project:
 * - Saving (autosave in progress)
 * - Saved (all changes saved)
 * - Unsaved (changes pending)
 */
export function SaveStatusIndicator() {
  const { isAutosaving, hasUnsavedChanges } = useProjectStore();

  if (isAutosaving) {
    return (
      <Badge variant="outline" className="gap-1.5 animate-pulse">
        <Save className="w-3 h-3" />
        Saving...
      </Badge>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Save className="w-3 h-3" />
        Unsaved
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1.5">
      <Save className="w-3 h-3" />
      Saved
    </Badge>
  );
}
