"use client";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PDFReport({ assessment }: any) {
  const generatePDF = () => {
    const doc = new jsPDF();

    // Professional color palette - light and clean
    const primaryBlue = [41, 98, 165]; // #2962A5 - Professional blue
    const lightBlue = [227, 242, 253]; // #E3F2FD - Light blue background
    const darkGray = [66, 66, 66]; // #424242 - Professional dark gray for text
    const mediumGray = [117, 117, 117]; // #757575 - Medium gray for secondary text
    const lightGray = [245, 245, 245]; // #F5F5F5 - Very light gray for backgrounds
    const white = [255, 255, 255]; // #FFFFFF
    const success = [76, 175, 80]; // #4CAF50 - Professional green
    const warning = [255, 152, 0]; // #FF9800 - Professional orange
    const danger = [244, 67, 54]; // #F44336 - Professional red
    const borderGray = [224, 224, 224]; // #E0E0E0 - Light border

    let currentPage = 1;
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);

    const addNewPage = () => {
      doc.addPage();
      currentPage++;
      yPos = 20;
    };

    const checkPageBreak = (requiredHeight: number) => {
      if (yPos + requiredHeight > pageHeight - 35) {
        addNewPage();
      }
    };

    const addSectionHeader = (title: string, isMainSection: boolean = false) => {
      checkPageBreak(30);

      if (isMainSection) {
        // Add some space before main sections
        if (yPos > 85) yPos += 10;

        // Main section with blue background
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.rect(margin, yPos, contentWidth, 20, "F");

        doc.setTextColor(white[0], white[1], white[2]);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 10, yPos + 13);
        yPos += 30;
      } else {
        // Add space before subsections
        yPos += 5;

        // Subsection with light background
        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.rect(margin, yPos, contentWidth, 16, "F");

        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.5);
        doc.rect(margin, yPos, contentWidth, 16, "S");

        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 10, yPos + 11);
        yPos += 22;
      }
    };

    const addTextContent = (content: string, fontSize: number = 10, indent: number = 0) => {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "normal");

      const maxWidth = contentWidth - 20 - indent;
      const lines = doc.splitTextToSize(content, maxWidth);
      const lineHeight = fontSize * 0.35;
      const totalHeight = lines.length * lineHeight + 3;

      checkPageBreak(totalHeight + 5);

      lines.forEach((line: string, index: number) => {
        doc.text(line, margin + 10 + indent, yPos + 3 + (index * lineHeight));
      });

      yPos += totalHeight + 8;
    };

    const addBulletList = (items: string[], indent: number = 0) => {
      items.forEach((item: string, index: number) => {
        const maxWidth = contentWidth - 35 - indent;
        const lines = doc.splitTextToSize(item, maxWidth);
        const itemHeight = lines.length * 4 + 6;

        checkPageBreak(itemHeight);

        // Add bullet point
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.circle(margin + 15 + indent, yPos + 4, 1.5, "F");

        // Add text with proper alignment
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        lines.forEach((line: string, lineIndex: number) => {
          doc.text(line, margin + 25 + indent, yPos + 6 + (lineIndex * 4));
        });

        yPos += itemHeight;
      });

      // Add spacing after bullet list
      yPos += 3;
    };

    const addScoreCard = (label: string, value: string, x: number, width: number, colorType: 'success' | 'warning' | 'danger') => {
      const colors = {
        success: success,
        warning: warning,
        danger: danger
      };

      const color = colors[colorType];

      // Card background
      doc.setFillColor(white[0], white[1], white[2]);
      doc.rect(x, yPos, width, 35, "F");

      // Card border
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(1);
      doc.rect(x, yPos, width, 35, "S");

      // Colored top border
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, yPos, width, 4, "F");

      // Value
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + width / 2, yPos + 22, { align: "center" });

      // Label
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(label.toUpperCase(), x + width / 2, yPos + 30, { align: "center" });
    };

    const addFooter = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        // Footer line
        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        // Footer text
        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text("Generated by Genius Factor Assessment System", margin, pageHeight - 12);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 12, { align: "right" });

        // Date
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }
    };

    // Set document properties
    doc.setProperties({
      title: `Genius Factor Assessment - ${assessment.userId}`,
      subject: "Comprehensive Assessment Results",
      author: "Genius Factor System",
    });

    // HEADER SECTION
    doc.setFillColor(white[0], white[1], white[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Header background
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.rect(0, 0, pageWidth, 70, "F");

    // Company logo area (placeholder)
    doc.addImage('/logo.png', 'PNG', margin, 15, 40, 40);
    // doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    // doc.rect(margin, 15, 40, 40, "F");
    // doc.setTextColor(white[0], white[1], white[2]);
    // doc.setFontSize(16);
    // doc.setFont("helvetica", "bold");
    // doc.text("GF", margin + 20, 38, { align: "center" });

    // Title
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("GENIUS FACTOR", margin + 50, 30);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Assessment Report", margin + 50, 42);

    // Assessment info
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.setFontSize(10);
    doc.text(`Assessment Date: ${new Date(assessment.createdAt).toLocaleDateString()}`, margin + 50, 52);
    doc.text(`Department: ${assessment.departement}`, margin + 50, 62);

    yPos = 85;

    // SCORE CARDS SECTION
    const alignmentScore = assessment.currentRoleAlignmentAnalysisJson.alignment_score;
    const riskLevel = assessment.currentRoleAlignmentAnalysisJson.retention_risk_level;

    const scoreColor = parseInt(alignmentScore) >= 80 ? 'success' : parseInt(alignmentScore) >= 60 ? 'warning' : 'danger';
    const riskColor = riskLevel === 'Low' ? 'success' : riskLevel === 'Medium' ? 'warning' : 'danger';

    checkPageBreak(45);
    addScoreCard("Alignment Score", `${alignmentScore}%`, margin, 85, scoreColor);
    addScoreCard("Retention Risk", riskLevel, margin + 95, 85, riskColor);

    yPos += 45;

    // EXECUTIVE SUMMARY
    addSectionHeader("EXECUTIVE SUMMARY", true);
    addTextContent(assessment.executiveSummary);

    // GENIUS FACTOR PROFILE
    addSectionHeader("GENIUS FACTOR PROFILE", true);

    const primaryGenius = assessment.geniusFactorProfileJson.primary_genius_factor;
    const secondaryGenius = assessment.geniusFactorProfileJson.secondary_genius_factor;

    addSectionHeader(`Primary Genius Factor: ${primaryGenius}`);
    addTextContent(assessment.geniusFactorProfileJson.description);

    addSectionHeader(`Secondary Genius Factor: ${secondaryGenius}`);
    addTextContent(assessment.geniusFactorProfileJson.secondary_description);

    addSectionHeader("Key Strengths");
    addBulletList(assessment.geniusFactorProfileJson.key_strengths);

    addSectionHeader("Energy Sources");
    addBulletList(assessment.geniusFactorProfileJson.energy_sources);

    // CURRENT ROLE ANALYSIS
    addSectionHeader("CURRENT ROLE ANALYSIS", true);
    addTextContent(assessment.currentRoleAlignmentAnalysisJson.assessment);

    addSectionHeader("Strengths Currently Utilized");
    addBulletList(assessment.currentRoleAlignmentAnalysisJson.strengths_utilized);

    addSectionHeader("Underutilized Talents");
    addBulletList(assessment.currentRoleAlignmentAnalysisJson.underutilized_talents);

    // CAREER DEVELOPMENT
    addSectionHeader("CAREER DEVELOPMENT OPPORTUNITIES", true);

    addSectionHeader("Career Pathways");

    // Short-term pathway
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Short-term:", margin + 10, yPos + 3);
    yPos += 8;
    addTextContent(assessment.internalCareerOpportunitiesJson.career_pathways.short_term, 10, 15);

    // Long-term pathway
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Long-term:", margin + 10, yPos);
    yPos += 8;
    addTextContent(assessment.internalCareerOpportunitiesJson.career_pathways.long_term, 10, 15);

    addSectionHeader("Transition Timeline");

    // 6 Months timeline
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("6 Months:", margin + 10, yPos + 3);
    yPos += 8;
    addTextContent(assessment.internalCareerOpportunitiesJson.transition_timeline.six_months, 10, 15);

    // 1 Year timeline
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.text("1 Year:", margin + 10, yPos);
    yPos += 8;
    addTextContent(assessment.internalCareerOpportunitiesJson.transition_timeline.one_year, 10, 15);

    // 2 Years timeline
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.text("2 Years:", margin + 10, yPos);
    yPos += 8;
    addTextContent(assessment.internalCareerOpportunitiesJson.transition_timeline.two_years, 10, 15);

    addSectionHeader("Recommended Departments");
    addBulletList(assessment.internalCareerOpportunitiesJson.recommended_departments);

    addSectionHeader("Specific Role Suggestions");
    addBulletList(assessment.internalCareerOpportunitiesJson.specific_role_suggestions);

    addSectionHeader("Required Skill Development");
    addBulletList(assessment.internalCareerOpportunitiesJson.required_skill_development);

    // RETENTION & MOBILITY STRATEGIES
    addSectionHeader("RETENTION & MOBILITY STRATEGIES", true);

    addSectionHeader("Retention Strategies");
    addBulletList(assessment.retentionAndMobilityStrategiesJson.retention_strategies);

    addSectionHeader("Development Support");
    addBulletList(assessment.retentionAndMobilityStrategiesJson.development_support);

    addSectionHeader("Internal Mobility Recommendations");
    addBulletList(assessment.retentionAndMobilityStrategiesJson.internal_mobility_recommendations);

    // DEVELOPMENT ACTION PLAN
    addSectionHeader("DEVELOPMENT ACTION PLAN", true);

    addSectionHeader("30-Day Goals");
    addBulletList(assessment.developmentActionPlanJson.thirty_day_goals);

    addSectionHeader("90-Day Goals");
    addBulletList(assessment.developmentActionPlanJson.ninety_day_goals);

    addSectionHeader("6-Month Goals");
    addBulletList(assessment.developmentActionPlanJson.six_month_goals);

    addSectionHeader("Networking Strategy");
    addBulletList(assessment.developmentActionPlanJson.networking_strategy);

    // PERSONALIZED RESOURCES
    addSectionHeader("PERSONALIZED RESOURCES", true);

    addSectionHeader("Recommended Learning Resources");
    addBulletList(assessment.personalizedResourcesJson.learning_resources);

    addSectionHeader("Personal Affirmations");
    addBulletList(assessment.personalizedResourcesJson.affirmations);

    addSectionHeader("Reflection Questions");
    addBulletList(assessment.personalizedResourcesJson.reflection_questions);

    addSectionHeader("Mindfulness Practices");
    addBulletList(assessment.personalizedResourcesJson.mindfulness_practices);

    // METHODOLOGY & DATA SOURCES
    addSectionHeader("METHODOLOGY & DATA SOURCES", true);

    addSectionHeader("Methodology");
    addTextContent(assessment.dataSourcesAndMethodologyJson.methodology);

    addSectionHeader("Data Sources");
    addBulletList(assessment.dataSourcesAndMethodologyJson.data_sources);

    // Add footers to all pages
    addFooter();

    // Save the PDF
    doc.save(
      `Genius-Factor-Assessment-${assessment.userId}-${new Date(assessment.createdAt).toISOString().split("T")[0]
      }.pdf`
    );
  };

  return (
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
      onClick={generatePDF}
      disabled={!assessment}
    >
      <Download className="w-4 h-4" />
      Download Assessment Report
    </Button>
  );
}