"use client";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PDFReport({ assessment }: any) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
      title: `Genius Factor Assessment - ${assessment.userId}`,
      subject: "Assessment Results",
      author: "Genius Factor System",
    });

    // Add title
    doc.setFontSize(20);
    doc.text("Genius Factor Assessment Report", 105, 20, { align: "center" });

    // Add assessment date
    doc.setFontSize(12);
    doc.text(
      `Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}`,
      105,
      30,
      { align: "center" }
    );

    // Add score
    doc.setFontSize(16);
    doc.text(
      `Overall Genius Score: ${assessment.geniusFactorScore}/100`,
      105,
      45,
      { align: "center" }
    );

    // Add primary genius factor
    doc.setFontSize(14);
    doc.text(
      `Primary Genius Factor: ${assessment.geniusFactorProfileJson.primary_genius_factor}`,
      20,
      60
    );

    // Add description
    doc.setFontSize(12);
    const descriptionLines = doc.splitTextToSize(
      assessment.geniusFactorProfileJson.description,
      170
    );
    doc.text(descriptionLines, 20, 70);

    // Add key strengths
    doc.setFontSize(14);
    doc.text("Key Strengths:", 20, 90);
    doc.setFontSize(12);
    let yPosition = 100;

    assessment.geniusFactorProfileJson.key_strengths.forEach(
      (strength: any, index: any) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${strength}`, 25, yPosition);
        yPosition += 7;
      }
    );

    // Add more sections as needed...
    // You can continue adding all the assessment data to the PDF

    // Save the PDF
    doc.save(
      `Genius-Factor-Assessment-${assessment.userId}-${assessment.createdAt}.pdf`
    );
  };

  return (
    <Button
      className="btn-gradient"
      onClick={generatePDF}
      disabled={!assessment}
    >
      <Download className="w-4 h-4 mr-2" />
      Download PDF
    </Button>
  );
}
