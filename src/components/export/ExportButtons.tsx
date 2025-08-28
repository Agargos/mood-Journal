import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet, Crown } from "lucide-react";
import { useExport } from "@/hooks/useExport";
import { useToast } from "@/hooks/use-toast";
import { usePremium } from "@/hooks/usePremium";

export const ExportButtons = () => {
  const { loading, exportToCSV, exportToPDF } = useExport();
  const { toast } = useToast();
  const { isPremium } = usePremium();

  const handleExportCSV = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to Premium to export your journal entries.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToCSV();
      toast({
        title: "Export Successful",
        description: "Your journal entries have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export entries. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportPDF = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Please upgrade to Premium to export your journal entries.",
        variant: "destructive",
      });
      return;
    }

    try {
      await exportToPDF();
      toast({
        title: "Export Successful", 
        description: "Your journal entries have been exported to PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export entries. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Your Data
          {!isPremium && <Crown className="h-4 w-4 text-primary" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download your journal entries and mood data
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={loading || !isPremium}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            disabled={loading || !isPremium}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
        {!isPremium && (
          <p className="text-xs text-muted-foreground">
            Upgrade to Premium to export your data
          </p>
        )}
      </CardContent>
    </Card>
  );
};