"use client";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PDFReport({
  assessment,
  genius_factor_score,
  employee,
}: any) {
  // Helper function to check if a field exists and has content
  const isFieldValid = (field: any): boolean => {
    if (field === undefined || field === null) return false;
    if (typeof field === "string") return field.trim() !== "";
    if (Array.isArray(field)) return field.length > 0;
    if (typeof field === "object") return Object.keys(field).length > 0;
    return true;
  };

  // Helper function to safely get nested object properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined
        ? current[key]
        : defaultValue;
    }, obj);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Professional color palette - light and clean
    const primaryBlue = [41, 98, 165];
    const lightBlue = [227, 242, 253];
    const darkGray = [66, 66, 66];
    const mediumGray = [117, 117, 117];
    const lightGray = [245, 245, 245];
    const white = [255, 255, 255];
    const success = [76, 175, 80];
    const warning = [255, 152, 0];
    const danger = [244, 67, 54];
    const borderGray = [224, 224, 224];

    let currentPage = 1;
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Existing helper functions (addNewPage, checkPageBreak, etc.)
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

    const addSectionHeader = (
      title: string,
      isMainSection: boolean = false
    ) => {
      checkPageBreak(30);

      if (isMainSection) {
        if (yPos > 85) yPos += 10;
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.rect(margin, yPos, contentWidth, 20, "F");
        doc.setTextColor(white[0], white[1], white[2]);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin + 10, yPos + 13);
        yPos += 30;
      } else {
        yPos += 5;
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

    const addTextContent = (
      content: string,
      fontSize: number = 10,
      indent: number = 0
    ) => {
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "normal");

      const maxWidth = contentWidth - 20 - indent;
      const lines = doc.splitTextToSize(content, maxWidth);
      const lineHeight = fontSize * 0.35;
      const totalHeight = lines.length * lineHeight + 3;

      checkPageBreak(totalHeight + 5);

      lines.forEach((line: string, index: number) => {
        doc.text(line, margin + 10 + indent, yPos + 3 + index * lineHeight);
      });

      yPos += totalHeight + 8;
    };

    const addBulletList = (items: any, indent: number = 0) => {
      // Ensure items is an array
      const safeItems = Array.isArray(items) ? items : items ? [items] : [];

      safeItems.forEach((item: any, index: number) => {
        // Convert item to string if it's not already
        const itemText =
          typeof item === "string"
            ? item
            : typeof item === "object" && item !== null
            ? item.title || item.name || JSON.stringify(item)
            : String(item);

        const maxWidth = contentWidth - 35 - indent;
        const lines = doc.splitTextToSize(itemText, maxWidth);
        const itemHeight = lines.length * 4 + 6;

        checkPageBreak(itemHeight);

        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.circle(margin + 15 + indent, yPos + 4, 1.5, "F");

        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        lines.forEach((line: string, lineIndex: number) => {
          doc.text(line, margin + 25 + indent, yPos + 6 + lineIndex * 4);
        });

        yPos += itemHeight;
      });

      yPos += 3;
    };

    const addScoreCard = (
      label: string,
      value: string,
      x: number,
      width: number,
      colorType: "success" | "warning" | "danger"
    ) => {
      const colors = {
        success: success,
        warning: warning,
        danger: danger,
      };

      const color = colors[colorType];

      doc.setFillColor(white[0], white[1], white[2]);
      doc.rect(x, yPos, width, 35, "F");

      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.setLineWidth(1);
      doc.rect(x, yPos, width, 35, "S");

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, yPos, width, 4, "F");

      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(value, x + width / 2, yPos + 22, { align: "center" });

      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(label.toUpperCase(), x + width / 2, yPos + 30, {
        align: "center",
      });
    };

    const addFooter = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);

        doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          "Powered by Genius Factor AI, Exclusively Licensed by Genius Factor Academy, LLC © 2026 | All Rights Reserved",
          margin,
          pageHeight - 12
        );
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 12,
          { align: "right" }
        );
        // doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin, pageHeight - 5, { align: "right" });
      }
    };

    // Set document properties
    doc.setProperties({
      title: `Genius Factor Assessment - ${assessment?.userId || "Unknown"}`,
      subject: "Comprehensive Assessment Results",
      author: "Genius Factor System",
    });

    // HEADER SECTION
    doc.setFillColor(white[0], white[1], white[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.rect(0, 0, pageWidth, 82, "F");

    doc.addImage("/logo.png", "PNG", margin, 15, 40, 40);

    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("GENIUS FACTOR AI", margin + 50, 30);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Comprehensive Assessment Report", margin + 50, 42);

    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.setFontSize(10);
    doc.text(
      `Assessment Date: ${
        assessment?.createdAt
          ? new Date(assessment.createdAt).toLocaleDateString()
          : "N/A"
      }`,
      margin + 50,
      52
    );
    doc.text(`Employee: ${employee || "N/A"}`, margin + 50, 62);
    doc.text(
      `Department: ${assessment?.departement || "N/A"}`,
      margin + 50,
      72
    );

    yPos = 95;

    // SCORE CARDS SECTION - Only show if alignment data exists
    // Support both old API format (camelCase with Json suffix) and new format (snake_case)
    const alignmentData =
      safeGet(assessment, "currentRoleAlignmentAnalysisJson") ||
      safeGet(assessment, "current_role_alignment_analysis");
    if (isFieldValid(alignmentData) || isFieldValid(genius_factor_score)) {
      const alignmentScore = safeGet(alignmentData, "alignment_score");
      const riskLevel = safeGet(alignmentData, "retention_risk_level");

      if (
        isFieldValid(alignmentScore) ||
        isFieldValid(riskLevel) ||
        isFieldValid(genius_factor_score)
      ) {
        checkPageBreak(45);

        // Calculate card width for 3 cards with spacing
        const cardWidth = (contentWidth - 20) / 3; // 3 cards with 10px spacing between them

        if (isFieldValid(genius_factor_score)) {
          const geniusScoreColor =
            parseInt(genius_factor_score) >= 80
              ? "success"
              : parseInt(genius_factor_score) >= 60
              ? "warning"
              : "danger";
          addScoreCard(
            "Genius Factor Score",
            `${genius_factor_score}%`,
            margin,
            cardWidth,
            geniusScoreColor
          );
        }

        if (isFieldValid(alignmentScore)) {
          const scoreColor =
            parseInt(alignmentScore) >= 80
              ? "success"
              : parseInt(alignmentScore) >= 60
              ? "warning"
              : "danger";
          addScoreCard(
            "Alignment Score",
            `${alignmentScore}%`,
            margin + cardWidth + 10,
            cardWidth,
            scoreColor
          );
        }

        if (isFieldValid(riskLevel)) {
          const riskColor =
            riskLevel === "Low"
              ? "success"
              : riskLevel === "Medium"
              ? "warning"
              : "danger";
          addScoreCard(
            "Retention Risk",
            riskLevel,
            margin + (cardWidth + 10) * 2,
            cardWidth,
            riskColor
          );
        }

        yPos += 45;
      }
    }

    // EXECUTIVE SUMMARY - Only show if exists (support both formats)
    const executiveSummary =
      assessment?.executiveSummary || assessment?.executive_summary;
    if (isFieldValid(executiveSummary)) {
      addSectionHeader("EXECUTIVE SUMMARY", true);
      addTextContent(executiveSummary);
    }

    // GENIUS FACTOR PROFILE - Only show if exists (support both formats)
    const geniusProfile =
      safeGet(assessment, "geniusFactorProfileJson") ||
      safeGet(assessment, "genius_factor_profile");
    if (isFieldValid(geniusProfile)) {
      addSectionHeader("GENIUS FACTOR PROFILE", true);

      const primaryGenius = safeGet(geniusProfile, "primary_genius_factor");
      if (isFieldValid(primaryGenius)) {
        addSectionHeader(`Primary Genius Factor: ${primaryGenius}`);
        const description = safeGet(geniusProfile, "description");
        if (isFieldValid(description)) {
          addTextContent(description);
        }
      }

      const secondaryGenius = safeGet(geniusProfile, "secondary_genius_factor");
      if (isFieldValid(secondaryGenius)) {
        addSectionHeader(`Secondary Genius Factor: ${secondaryGenius}`);
        const secondaryDescription = safeGet(
          geniusProfile,
          "secondary_description"
        );
        if (isFieldValid(secondaryDescription)) {
          addTextContent(
            secondaryDescription === "None Identified"
              ? "The primary genius factor is more dominant, as response did not indicate a secondary genius factor."
              : secondaryDescription
          );
        }
      }

      const keyStrengths = safeGet(geniusProfile, "key_strengths");
      if (isFieldValid(keyStrengths)) {
        addSectionHeader("Key Strengths");
        addBulletList(keyStrengths);
      }

      const energySources = safeGet(geniusProfile, "energy_sources");
      if (isFieldValid(energySources)) {
        addSectionHeader("Energy Sources");
        addBulletList(energySources);
      }
    }

    // CURRENT ROLE ANALYSIS - Only show if exists (support both formats)
    const roleAlignment =
      safeGet(assessment, "currentRoleAlignmentAnalysisJson") ||
      safeGet(assessment, "current_role_alignment_analysis");
    if (isFieldValid(roleAlignment)) {
      const roleAssessment = safeGet(roleAlignment, "assessment");
      const strengthsUtilized = safeGet(roleAlignment, "strengths_utilized");
      const underutilizedTalents = safeGet(
        roleAlignment,
        "underutilized_talents"
      );

      if (
        isFieldValid(roleAssessment) ||
        isFieldValid(strengthsUtilized) ||
        isFieldValid(underutilizedTalents)
      ) {
        addSectionHeader("CURRENT ROLE ANALYSIS", true);

        if (isFieldValid(roleAssessment)) {
          addTextContent(roleAssessment);
        }

        if (isFieldValid(strengthsUtilized)) {
          addSectionHeader("Strengths Currently Utilized");
          addBulletList(strengthsUtilized);
        }

        if (isFieldValid(underutilizedTalents)) {
          addSectionHeader("Underutilized Talents");
          addBulletList(underutilizedTalents);
        }
      }
    }

    // CAREER DEVELOPMENT - Only show if exists (support both formats)
    const careerOpportunities =
      safeGet(assessment, "internalCareerOpportunitiesJson") ||
      safeGet(assessment, "internal_career_opportunities");
    if (isFieldValid(careerOpportunities)) {
      addSectionHeader("CAREER DEVELOPMENT OPPORTUNITIES", true);

      const careerPathways = safeGet(careerOpportunities, "career_pathways");
      if (isFieldValid(careerPathways)) {
        addSectionHeader("Career Pathways");

        const shortTerm = safeGet(careerPathways, "short_term");
        if (isFieldValid(shortTerm)) {
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Short-term:", margin + 10, yPos + 3);
          yPos += 8;
          addTextContent(shortTerm, 10, 15);
        }

        const longTerm = safeGet(careerPathways, "long_term");
        if (isFieldValid(longTerm)) {
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Long-term:", margin + 10, yPos);
          yPos += 8;
          addTextContent(longTerm, 10, 15);
        }
      }

      const transitionTimeline = safeGet(
        careerOpportunities,
        "transition_timeline"
      );
      if (isFieldValid(transitionTimeline)) {
        addSectionHeader("Transition Timeline");

        const sixMonths = safeGet(transitionTimeline, "six_months");
        if (isFieldValid(sixMonths)) {
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("6 Months:", margin + 10, yPos + 3);
          yPos += 8;
          addTextContent(sixMonths, 10, 15);
        }

        const oneYear = safeGet(transitionTimeline, "one_year");
        if (isFieldValid(oneYear)) {
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFont("helvetica", "bold");
          doc.text("1 Year:", margin + 10, yPos);
          yPos += 8;
          addTextContent(oneYear, 10, 15);
        }

        const twoYears = safeGet(transitionTimeline, "two_years");
        if (isFieldValid(twoYears)) {
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFont("helvetica", "bold");
          doc.text("2 Years:", margin + 10, yPos);
          yPos += 8;
          addTextContent(twoYears, 10, 15);
        }
      }

      const recommendedDepartments = safeGet(
        careerOpportunities,
        "recommended_departments"
      );
      if (isFieldValid(recommendedDepartments)) {
        addSectionHeader("Recommended Departments");
        addBulletList(recommendedDepartments);
      }

      const specificRoles = safeGet(
        careerOpportunities,
        "specific_role_suggestions"
      );
      if (isFieldValid(specificRoles)) {
        addSectionHeader("Specific Role Suggestions");
        addBulletList(specificRoles);
      }

      const skillDevelopment = safeGet(
        careerOpportunities,
        "required_skill_development"
      );
      if (isFieldValid(skillDevelopment)) {
        addSectionHeader("Required Skill Development");
        addBulletList(skillDevelopment);
      }
    }

    // RETENTION & MOBILITY STRATEGIES - Only show if exists (support both formats)
    const retentionStrategies =
      safeGet(assessment, "retentionAndMobilityStrategiesJson") ||
      safeGet(assessment, "retention_and_mobility_strategies");
    if (isFieldValid(retentionStrategies)) {
      const strategies = safeGet(retentionStrategies, "retention_strategies");
      const developmentSupport =
        safeGet(retentionStrategies, "development_support") ||
        safeGet(retentionStrategies, "development_support_needed");
      const mobilityRecommendations =
        safeGet(retentionStrategies, "internal_mobility_recommendations") ||
        safeGet(retentionStrategies, "mobility_recommendations");

      if (
        isFieldValid(strategies) ||
        isFieldValid(developmentSupport) ||
        isFieldValid(mobilityRecommendations)
      ) {
        addSectionHeader("RETENTION & MOBILITY STRATEGIES", true);

        if (isFieldValid(strategies)) {
          addSectionHeader("Retention Strategies");
          addBulletList(strategies);
        }

        if (isFieldValid(developmentSupport)) {
          addSectionHeader("Development Support");
          addBulletList(developmentSupport);
        }

        if (isFieldValid(mobilityRecommendations)) {
          addSectionHeader("Internal Mobility Recommendations");
          addBulletList(mobilityRecommendations);
        }
      }
    }

    // DEVELOPMENT ACTION PLAN - Only show if exists (support both formats)
    const developmentPlan =
      safeGet(assessment, "developmentActionPlanJson") ||
      safeGet(assessment, "development_action_plan");
    if (isFieldValid(developmentPlan)) {
      const thirtyDayGoals = safeGet(developmentPlan, "thirty_day_goals");
      const ninetyDayGoals = safeGet(developmentPlan, "ninety_day_goals");
      const sixMonthGoals = safeGet(developmentPlan, "six_month_goals");
      const networkingStrategy = safeGet(
        developmentPlan,
        "networking_strategy"
      );

      if (
        isFieldValid(thirtyDayGoals) ||
        isFieldValid(ninetyDayGoals) ||
        isFieldValid(sixMonthGoals) ||
        isFieldValid(networkingStrategy)
      ) {
        addSectionHeader("DEVELOPMENT ACTION PLAN", true);

        if (isFieldValid(thirtyDayGoals)) {
          addSectionHeader("30-Day Goals");
          addBulletList(thirtyDayGoals);
        }

        if (isFieldValid(ninetyDayGoals)) {
          addSectionHeader("90-Day Goals");
          addBulletList(ninetyDayGoals);
        }

        if (isFieldValid(sixMonthGoals)) {
          addSectionHeader("6-Month Goals");
          addBulletList(sixMonthGoals);
        }

        if (isFieldValid(networkingStrategy)) {
          addSectionHeader("Networking Strategy");
          // networkingStrategy can be an object with key-value pairs or an array
          if (
            typeof networkingStrategy === "object" &&
            !Array.isArray(networkingStrategy)
          ) {
            // Convert object to array of strings
            const strategyItems = Object.entries(networkingStrategy).flatMap(
              ([key, value]) => {
                if (Array.isArray(value)) {
                  return value.map((v: string) => `${key}: ${v}`);
                }
                return [`${key}: ${value}`];
              }
            );
            addBulletList(strategyItems);
          } else {
            addBulletList(networkingStrategy);
          }
        }
      }
    }

    // PERSONALIZED RESOURCES - Only show if exists (support both formats)
    const personalizedResources =
      safeGet(assessment, "personalizedResourcesJson") ||
      safeGet(assessment, "personalized_resources");
    if (isFieldValid(personalizedResources)) {
      const learningResources = safeGet(
        personalizedResources,
        "learning_resources"
      );
      const affirmations = safeGet(personalizedResources, "affirmations");
      const reflectionQuestions = safeGet(
        personalizedResources,
        "reflection_questions"
      );
      const mindfulnessPractices = safeGet(
        personalizedResources,
        "mindfulness_practices"
      );

      if (
        isFieldValid(learningResources) ||
        isFieldValid(affirmations) ||
        isFieldValid(reflectionQuestions) ||
        isFieldValid(mindfulnessPractices)
      ) {
        addSectionHeader("PERSONALIZED RESOURCES", true);

        if (isFieldValid(learningResources)) {
          addSectionHeader("Recommended Learning Resources");
          // Handle both string arrays and object arrays
          const formattedResources = learningResources.map((resource: any) => {
            if (typeof resource === "string") return resource;
            if (typeof resource === "object" && resource !== null) {
              const title = resource.title || resource.name || "";
              const type = resource.type || "";
              const provider = resource.provider || resource.author || "";
              if (title && (type || provider)) {
                return `${title} (${[type, provider]
                  .filter(Boolean)
                  .join(" - ")})`;
              }
              return title || JSON.stringify(resource);
            }
            return String(resource);
          });
          addBulletList(formattedResources);
        }

        if (isFieldValid(affirmations)) {
          addSectionHeader("Personal Affirmations");
          addBulletList(affirmations);
        }

        if (isFieldValid(reflectionQuestions)) {
          addSectionHeader("Reflection Questions");
          addBulletList(reflectionQuestions);
        }

        if (isFieldValid(mindfulnessPractices)) {
          addSectionHeader("Mindfulness Practices");
          addBulletList(mindfulnessPractices);
        }
      }
    }

    // METHODOLOGY & DATA SOURCES - Only show if exists (support both formats)
    const methodology =
      safeGet(assessment, "dataSourcesAndMethodologyJson") ||
      safeGet(assessment, "data_sources_and_methodology");
    if (isFieldValid(methodology)) {
      const methodologyText = safeGet(methodology, "methodology");

      if (isFieldValid(methodologyText)) {
        addSectionHeader("METHODOLOGY & DATA SOURCES", true);

        if (isFieldValid(methodologyText)) {
          addSectionHeader("Methodology");
          addTextContent(methodologyText);
        }
      }
    }

    // Add copyright notice at the end before footer
    checkPageBreak(60); // Make sure we have enough space for copyright

    // Add some space before copyright
    yPos += 10;

    // Add separator line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Copyright header
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("COPYRIGHT NOTICE", margin, yPos);
    yPos += 10;

    // Copyright text
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const copyrightText =
      "Genius Factor Academy, LLC © 2026 | All Rights Reserved.\n\nThis platform, including all software, algorithms, content, and data reporting outputs, is the exclusive property of Genius Factor Academy, LLC. Unauthorized reproduction, distribution, modification, reverse engineering, or derivative works are strictly prohibited. Use of this platform is subject to license only, and all rights not expressly granted are reserved.";

    const maxWidth = contentWidth - 20;
    const copyrightLines = doc.splitTextToSize(copyrightText, maxWidth);
    const lineHeight = 3.5;

    copyrightLines.forEach((line: string, index: number) => {
      if (line.trim() === "") {
        yPos += lineHeight / 2;
      } else {
        checkPageBreak(lineHeight + 5);
        doc.text(line, margin + 10, yPos);
        yPos += lineHeight;
      }
    });

    yPos += 10; // Add some space after copyright

    addFooter();

    doc.save(
      `Genius-Factor-Assessment-${assessment?.userId || "Unknown"}-${
        assessment?.createdAt
          ? new Date(assessment.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
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
