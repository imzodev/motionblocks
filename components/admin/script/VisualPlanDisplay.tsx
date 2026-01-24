import React from "react";
import { type VideoVisualPlan, type BRollType } from "@/lib/admin/script-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Image as ImageIcon, Type, Sparkles, Code } from "lucide-react";

interface VisualPlanDisplayProps {
  plan: VideoVisualPlan;
}

const VisualTypeIcon = ({ type }: { type: BRollType }) => {
  switch (type) {
    case "video":
      return <Video className="h-4 w-4 text-blue-500" />;
    case "image":
      return <ImageIcon className="h-4 w-4 text-green-500" />;
    case "animation":
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    case "text_overlay":
      return <Type className="h-4 w-4 text-orange-500" />;
    default:
      return <Video className="h-4 w-4" />;
  }
};

export function VisualPlanDisplay({ plan }: VisualPlanDisplayProps) {
  return (
    <Card className="h-full flex flex-col min-h-0 border-l-0 rounded-l-none shadow-none bg-muted/10">
      <CardHeader className="py-3 px-4 border-b bg-background/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Visual Plan (B-Roll)
        </CardTitle>
      </CardHeader>
      <div className="absolute top-3 right-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Code className="h-3.5 w-3.5" />
              View JSON
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Raw Visual Plan JSON</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-1 rounded-md border bg-muted/50 p-4 font-mono text-xs min-h-0" >
              <pre>{JSON.stringify(plan, null, 2)}</pre>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="h-full min-h-0">
        <CardContent className="p-0">
          <div className="divide-y">
            {plan.map((segment, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr] gap-4 p-4 hover:bg-muted/50 transition-colors">
                {/* Audio/Narration Side */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Audio / Narration
                  </span>
                  <p className="text-sm leading-relaxed">{segment.segmentText}</p>
                </div>

                {/* Visual Side */}
                <div className="space-y-2 border-l pl-4 border-muted">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Visual
                    </span>
                    <div className="flex gap-2">
                      {segment.matchType === "global_asset" && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-500/10 text-indigo-500 border-indigo-200">
                          Global Asset
                        </Badge>
                      )}
                      
                      <Badge variant="outline" className="text-xs capitalize flex items-center gap-1">
                        <VisualTypeIcon type={segment.visualType} />
                        {segment.visualType.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  
                  {segment.matchType === "global_asset" ? (
                    <div className="bg-indigo-500/5 border border-indigo-200/50 rounded-md p-3 space-y-1">
                      <div className="flex items-center gap-2 font-medium text-indigo-700 dark:text-indigo-300">
                        {segment.visualType === "video" && <Video className="h-4 w-4" />}
                        {segment.visualType === "image" && <ImageIcon className="h-4 w-4" />}
                        {segment.assetName}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {segment.visualDescription}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-primary/90">
                      {segment.visualDescription}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
