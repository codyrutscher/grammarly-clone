import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { AnalysisReport } from './advancedAnalysis';

export function exportDocumentAsPDF(title: string, content: string): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Add title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += lineHeight * 2;

  // Add content
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
  
  for (let i = 0; i < lines.length; i++) {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(lines[i], margin, yPosition);
    yPosition += lineHeight;
  }

  pdf.save(`${title}.pdf`);
}

export function exportAnalysisReport(title: string, analysis: AnalysisReport): void {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const lineHeight = 6;
  let yPosition = margin;

  // Helper function to check page break
  const checkPageBreak = (neededSpace: number = 20) => {
    if (yPosition > pdf.internal.pageSize.getHeight() - margin - neededSpace) {
      pdf.addPage();
      yPosition = margin;
    }
  };

  // Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Writing Analysis Report: ${title}`, margin, yPosition);
  yPosition += lineHeight * 2;

  // Overall Score
  checkPageBreak();
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall Score', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(24);
  const scoreColor = getScoreColor(analysis.score.overall);
  pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  pdf.text(`${analysis.score.overall}/100`, margin, yPosition);
  pdf.setTextColor(0, 0, 0); // Reset to black
  yPosition += lineHeight * 2;

  // Detailed Scores
  checkPageBreak();
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Breakdown', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const scores = [
    { label: 'Correctness', value: analysis.score.correctness },
    { label: 'Clarity', value: analysis.score.clarity },
    { label: 'Engagement', value: analysis.score.engagement },
    { label: 'Delivery', value: analysis.score.delivery }
  ];

  scores.forEach(score => {
    checkPageBreak();
    pdf.text(`${score.label}: ${score.value}/100`, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Text Statistics
  checkPageBreak();
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Text Statistics', margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const stats = [
    `Words: ${analysis.textStats.words}`,
    `Characters: ${analysis.textStats.characters}`,
    `Sentences: ${analysis.textStats.sentences}`,
    `Paragraphs: ${analysis.textStats.paragraphs}`,
    `Avg Words/Sentence: ${analysis.textStats.avgWordsPerSentence}`,
    `Readability Level: ${analysis.readabilityLevel}`,
    `Tone: ${analysis.toneAnalysis.tone} (${analysis.toneAnalysis.confidence}% confidence)`
  ];

  stats.forEach(stat => {
    checkPageBreak();
    pdf.text(stat, margin, yPosition);
    yPosition += lineHeight;
  });

  yPosition += lineHeight;

  // Strengths
  if (analysis.strengths.length > 0) {
    checkPageBreak();
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Strengths', margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    analysis.strengths.forEach(strength => {
      checkPageBreak();
      pdf.text(`• ${strength}`, margin, yPosition);
      yPosition += lineHeight;
    });

    yPosition += lineHeight;
  }

  // Improvements
  if (analysis.improvements.length > 0) {
    checkPageBreak();
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Areas for Improvement', margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    analysis.improvements.forEach(improvement => {
      checkPageBreak();
      const lines = pdf.splitTextToSize(`• ${improvement}`, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    });
  }

  // Tone Analysis Suggestions
  if (analysis.toneAnalysis.suggestions.length > 0) {
    yPosition += lineHeight;
    checkPageBreak();
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tone Suggestions', margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    analysis.toneAnalysis.suggestions.forEach(suggestion => {
      checkPageBreak();
      const lines = pdf.splitTextToSize(`• ${suggestion}`, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
    });
  }

  pdf.save(`${title}_analysis_report.pdf`);
}

export function exportDocumentAsWord(title: string, content: string): void {
  // Create a simple HTML structure that can be saved as .docx
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
        h1 { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20pt; }
        p { margin-bottom: 12pt; text-align: justify; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content.split('\n').map(paragraph => 
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
      ).join('')}
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  saveAs(blob, `${title}.doc`);
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 85) return [0, 128, 0]; // Green
  if (score >= 70) return [255, 165, 0]; // Orange
  return [255, 0, 0]; // Red
}

export function exportPlainText(title: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${title}.txt`);
} 