"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useProjectStore } from "@/lib/stores";
import { TEMPLATE_REGISTRY } from "@/components/Renderer3D";
import {
  exportProjectToSpec,
  importSpecToProject,
  parseProjectSpec,
  serializeProjectSpec,
  type ImportResult,
  type AssetResolver,
} from "@/lib/spec";

interface ProjectSpecActionsProps {
  onProjectImported?: () => void;
}

export function ProjectSpecActions({ onProjectImported }: ProjectSpecActionsProps) {
  const { project, setProject, forceSave } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingSpec, setPendingSpec] = useState<string | null>(null);

  const handleExport = async () => {
    if (!project) return;

    const assetScopeMap = new Map<string, { scope: "global" | "project"; projectId?: string }>();
    for (const asset of project.assets) {
      assetScopeMap.set(asset.id, {
        scope: asset.scope ?? "project",
        projectId: asset.scope === "project" ? project.metadata.id : undefined,
      });
    }

    const spec = exportProjectToSpec(project, TEMPLATE_REGISTRY, assetScopeMap);
    const json = serializeProjectSpec(spec);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.metadata.name.replace(/[^a-zA-Z0-9]/g, "_")}-spec.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setPendingSpec(text);

      const parseResult = parseProjectSpec(text);
      if (!parseResult.success) {
        setImportError(parseResult.error);
        setShowImportDialog(true);
        return;
      }

      const globalAssetsRes = await fetch("/api/assets/global");
      const globalAssetsData = await globalAssetsRes.json();
      const globalAssetIds = new Set<string>(
        (globalAssetsData.assets || []).map((a: { id: string }) => a.id)
      );

      const resolver: AssetResolver = {
        globalAssetIds,
        copyProjectAssets: async (fromProjectId: string, assetIds: string[]) => {
          const newProjectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          const res = await fetch("/api/assets/copy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromProjectId,
              toProjectId: newProjectId,
              assetIds,
            }),
          });

          if (!res.ok) {
            throw new Error("Failed to copy assets");
          }

          const data = await res.json();
          const map = new Map<string, string>();
          for (const result of data.results || []) {
            map.set(result.oldId, result.newId);
          }
          return map;
        },
      };

      const result = await importSpecToProject(parseResult.spec, TEMPLATE_REGISTRY, resolver);
      setImportResult(result);
      setImportError(null);
      setShowImportDialog(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Unknown error");
      setShowImportDialog(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult) return;

    setProject(importResult.project);
    await forceSave();

    setShowImportDialog(false);
    setImportResult(null);
    setPendingSpec(null);

    onProjectImported?.();
  };

  const handleCancelImport = () => {
    setShowImportDialog(false);
    setImportResult(null);
    setImportError(null);
    setPendingSpec(null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleExport}
          title="Export Project Spec"
          disabled={!project}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleImportClick}
          title="Import Project Spec"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {importError ? (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Import Error
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Import Preview
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {importError
                ? "There was an error parsing the project spec."
                : "Review the import results before confirming."}
            </DialogDescription>
          </DialogHeader>

          {importError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive">
              {importError}
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-md p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Name</span>
                  <span className="font-medium">{importResult.project.metadata.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracks Imported</span>
                  <span className="font-medium">{importResult.report.tracksImported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Global Assets Resolved</span>
                  <span className="font-medium text-green-600">
                    {importResult.report.globalAssetsResolved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Assets Copied</span>
                  <span className="font-medium text-blue-600">
                    {importResult.report.projectAssetsCopied}
                  </span>
                </div>
              </div>

              {(importResult.report.missingGlobalAssets.length > 0 ||
                importResult.report.missingProjectAssets.length > 0) && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 text-sm">
                  <p className="font-medium text-amber-600 mb-2">Missing Assets</p>
                  {importResult.report.missingGlobalAssets.length > 0 && (
                    <div className="mb-1">
                      <span className="text-muted-foreground">Global: </span>
                      <span className="text-amber-600">
                        {importResult.report.missingGlobalAssets.join(", ")}
                      </span>
                    </div>
                  )}
                  {importResult.report.missingProjectAssets.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Project: </span>
                      <span className="text-amber-600">
                        {importResult.report.missingProjectAssets.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelImport}>
              Cancel
            </Button>
            {importResult && (
              <Button onClick={handleConfirmImport}>Import Project</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
