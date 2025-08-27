import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useExport } from "@/hooks/useExport";
import { useToast } from "@/hooks/use-toast";

export const ExportButtons = () => {
  const { loading, exportToCSV, exportToPDF } = useExport();
  const { toast } = useToast();

  const handleExportCSV = async () => {
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
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={handleExportPDF}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};