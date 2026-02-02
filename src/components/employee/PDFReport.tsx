"use client";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function PDFReport({
  assessment,
  employee,
}: any) {
  const [isExporting, setIsExporting] = useState(false);
  const { theme, resolvedTheme } = useTheme();

  const generatePDF = async () => {
    const element = document.getElementById("assessment-report-content");
    if (!element) {
      toast.error("Report content not found");
      return;
    }

    try {
      setIsExporting(true);
      const toastId = toast.loading("Preparing your assessment report...");

      // Determine current mode for background color
      const currentTheme = theme === 'system' ? resolvedTheme : theme;
      const isDark = currentTheme === 'dark';

      // Select appropriate background color
      // #030712 matches typical dark mode backgrounds, #ffffff for light
      const bgColor = isDark ? "#030712" : "#ffffff";

      // Give images and layout time to settle
      await new Promise((r) => setTimeout(r, 800));

      // Capture the element using html-to-image
      // We use a fixed width of 1200px to "increase the size" and ensure a consistent professional look
      const captureWidth = 1200;
      const originalWidth = element.offsetWidth;
      const originalHeight = element.offsetHeight;
      const aspectRatio = originalHeight / originalWidth;
      const captureHeight = captureWidth * aspectRatio;

      const imgData = await toPng(element, {
        pixelRatio: 2, // High resolution
        width: captureWidth,
        height: captureHeight,
        backgroundColor: bgColor,
        style: {
          transform: `scale(${captureWidth / originalWidth})`,
          transformOrigin: "top left",
          width: `${originalWidth}px`,
          height: `${originalHeight}px`,
        },
      });

      // Create PDF with the increased dimensions
      const pdf = new jsPDF({
        orientation: captureWidth > captureHeight ? "landscape" : "portrait",
        unit: "px",
        format: [captureWidth, captureHeight],
        hotfixes: ["px_scaling"],
      });

      pdf.addImage(imgData, "PNG", 0, 0, captureWidth, captureHeight, undefined, "FAST");

      const fileName = `Genius-Factor-Report-${employee?.replace(/\s+/g, "-") || "Assessment"}.pdf`;
      pdf.save(fileName);

      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
      onClick={generatePDF}
      disabled={!assessment || isExporting}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {isExporting ? "Capturing..." : "Download Assessment Report"}
    </Button>
  );
}
