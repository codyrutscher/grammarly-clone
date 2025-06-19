import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import type { AnalysisReport } from './advancedAnalysis';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { HeadingLevel, AlignmentType } from 'docx';
import html2canvas from 'html2canvas';

// Extend Window interface for Google API
declare global {
  interface Window {
    gapi?: any;
  }
}

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

// Google Docs integration types
interface GoogleDocsConfig {
  clientId: string;
  apiKey: string;
  discoveryDocs: string[];
  scopes: string;
}

// Rich text content types
export interface RichTextContent {
  html: string;
  plainText: string;
  title: string;
}

// Export format options
export type ExportFormat = 'word' | 'pdf' | 'html' | 'txt' | 'google-docs';

// Google Docs integration class
export class GoogleDocsIntegration {
  private gapi: any;
  private isInitialized = false;
  private isSignedIn = false;
  private config: GoogleDocsConfig;

  constructor(config: GoogleDocsConfig) {
    this.config = config;
  }

  async initialize(): Promise<boolean> {
    try {
      // Load Google API
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2:client', resolve);
      });

      await window.gapi.client.init({
        apiKey: this.config.apiKey,
        clientId: this.config.clientId,
        discoveryDocs: this.config.discoveryDocs,
        scope: this.config.scopes
      });

      this.gapi = window.gapi;
      this.isInitialized = true;
      this.isSignedIn = this.gapi.auth2.getAuthInstance().isSignedIn.get();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Docs integration:', error);
      return false;
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Google Docs integration not initialized');
    }

    try {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (this.isInitialized && this.isSignedIn) {
      const authInstance = this.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.isSignedIn = false;
    }
  }

  async createDocument(content: RichTextContent): Promise<string | null> {
    if (!this.isSignedIn) {
      throw new Error('User not signed in to Google');
    }

    try {
      // Create a new Google Doc
      const response = await this.gapi.client.docs.documents.create({
        resource: {
          title: content.title || 'StudyWrite Document'
        }
      });

      const documentId = response.result.documentId;

      // Insert content into the document
      await this.insertContent(documentId, content);

      return documentId;
    } catch (error) {
      console.error('Failed to create Google Doc:', error);
      return null;
    }
  }

  private async insertContent(documentId: string, content: RichTextContent): Promise<void> {
    // Convert HTML to Google Docs format
    const requests = this.htmlToGoogleDocsRequests(content.html);

    if (requests.length > 0) {
      await this.gapi.client.docs.documents.batchUpdate({
        documentId,
        resource: { requests }
      });
    }
  }

  private htmlToGoogleDocsRequests(html: string): any[] {
    // Basic HTML to Google Docs conversion
    // This is a simplified version - a full implementation would need more comprehensive parsing
    const requests = [];
    const plainText = this.stripHtml(html);

    if (plainText.trim()) {
      requests.push({
        insertText: {
          location: { index: 1 },
          text: plainText
        }
      });
    }

    return requests;
  }

  private stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  getDocumentUrl(documentId: string): string {
    return `https://docs.google.com/document/d/${documentId}/edit`;
  }
}

// Export functions
export class DocumentExporter {
  private googleDocs: GoogleDocsIntegration | null = null;

  constructor() {
    // Initialize Google Docs integration if API keys are available
    const googleConfig = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
      discoveryDocs: ['https://docs.googleapis.com/$discovery/rest?version=v1'],
      scopes: 'https://www.googleapis.com/auth/documents'
    };

    if (googleConfig.clientId && googleConfig.apiKey) {
      this.googleDocs = new GoogleDocsIntegration(googleConfig);
    }
  }

  async initializeGoogleDocs(): Promise<boolean> {
    if (this.googleDocs) {
      return await this.googleDocs.initialize();
    }
    return false;
  }

  async exportToWord(content: RichTextContent): Promise<void> {
    try {
      // Parse HTML content and convert to Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: this.htmlToWordElements(content.html)
        }]
      });

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      const fileName = `${content.title || 'document'}.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to export to Word:', error);
      throw new Error('Failed to export document to Word format');
    }
  }

  async exportToPDF(content: RichTextContent): Promise<void> {
    try {
      // Create a temporary container for rendering
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        padding: 20mm;
        background: white;
        font-family: Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: black;
      `;
      container.innerHTML = content.html;
      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Clean up
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${content.title || 'document'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Failed to export to PDF:', error);
      throw new Error('Failed to export document to PDF format');
    }
  }

  async exportToHTML(content: RichTextContent): Promise<void> {
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title || 'Document'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            color: #2c3e50;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        p {
            margin-bottom: 1em;
        }
        .export-info {
            border-top: 1px solid #eee;
            margin-top: 2em;
            padding-top: 1em;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    ${content.html}
    <div class="export-info">
        <p>Exported from StudyWrite on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const fileName = `${content.title || 'document'}.html`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to export to HTML:', error);
      throw new Error('Failed to export document to HTML format');
    }
  }

  async exportToText(content: RichTextContent): Promise<void> {
    try {
      const textContent = content.plainText + `\n\n---\nExported from StudyWrite on ${new Date().toLocaleDateString()}`;
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const fileName = `${content.title || 'document'}.txt`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Failed to export to text:', error);
      throw new Error('Failed to export document to text format');
    }
  }

  async exportToGoogleDocs(content: RichTextContent): Promise<string | null> {
    if (!this.googleDocs) {
      throw new Error('Google Docs integration not available. Please configure API keys.');
    }

    try {
      // Initialize if not already done
      if (!await this.googleDocs.initialize()) {
        throw new Error('Failed to initialize Google Docs integration');
      }

      // Sign in user if not already signed in
      if (!await this.googleDocs.signIn()) {
        throw new Error('Failed to sign in to Google account');
      }

      // Create the document
      const documentId = await this.googleDocs.createDocument(content);
      
      if (documentId) {
        // Open the document in a new tab
        const documentUrl = this.googleDocs.getDocumentUrl(documentId);
        window.open(documentUrl, '_blank');
        return documentUrl;
      }

      return null;
    } catch (error) {
      console.error('Failed to export to Google Docs:', error);
      throw error;
    }
  }

  private htmlToWordElements(html: string): Paragraph[] {
    // Parse HTML and convert to Word elements
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const paragraphs: Paragraph[] = [];
    const elements = div.children;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const paragraph = this.elementToParagraph(element);
      if (paragraph) {
        paragraphs.push(paragraph);
      }
    }

    // If no structured content, convert as plain text
    if (paragraphs.length === 0) {
      const plainText = div.textContent || div.innerText || '';
      const lines = plainText.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        paragraphs.push(new Paragraph({
          children: [new TextRun(line.trim())]
        }));
      });
    }

    return paragraphs.length > 0 ? paragraphs : [new Paragraph({
      children: [new TextRun('')]
    })];
  }

  private elementToParagraph(element: Element): Paragraph | null {
    const tagName = element.tagName.toLowerCase();
    const text = element.textContent || '';

    if (!text.trim()) return null;

    const textRun = new TextRun({
      text: text.trim(),
      bold: this.hasStyle(element, 'font-weight', 'bold') || ['b', 'strong'].includes(tagName),
      italics: this.hasStyle(element, 'font-style', 'italic') || ['i', 'em'].includes(tagName),
      underline: this.hasStyle(element, 'text-decoration', 'underline') || tagName === 'u' ? {} : undefined
    });

    let heading: typeof HeadingLevel[keyof typeof HeadingLevel] | undefined;
    let alignment: typeof AlignmentType[keyof typeof AlignmentType] | undefined;

    // Handle headings
    switch (tagName) {
      case 'h1':
        heading = HeadingLevel.HEADING_1;
        break;
      case 'h2':
        heading = HeadingLevel.HEADING_2;
        break;
      case 'h3':
        heading = HeadingLevel.HEADING_3;
        break;
      case 'h4':
        heading = HeadingLevel.HEADING_4;
        break;
      case 'h5':
        heading = HeadingLevel.HEADING_5;
        break;
      case 'h6':
        heading = HeadingLevel.HEADING_6;
        break;
    }

    // Handle alignment
    const textAlign = window.getComputedStyle(element).textAlign;
    switch (textAlign) {
      case 'center':
        alignment = AlignmentType.CENTER;
        break;
      case 'right':
        alignment = AlignmentType.RIGHT;
        break;
      case 'justify':
        alignment = AlignmentType.JUSTIFIED;
        break;
      default:
        alignment = AlignmentType.LEFT;
    }

    return new Paragraph({
      children: [textRun],
      heading,
      alignment
    });
  }

  private hasStyle(element: Element, property: string, value: string): boolean {
    const style = window.getComputedStyle(element);
    return style.getPropertyValue(property).includes(value);
  }

  // Import functions
  async importFromFile(file: File): Promise<RichTextContent | null> {
    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return await this.importFromText(file);
      } else if (fileType === 'text/html' || fileName.endsWith('.html')) {
        return await this.importFromHTML(file);
      } else if (fileName.endsWith('.docx')) {
        // For Word documents, we'd need additional libraries like mammoth.js
        throw new Error('Word document import not yet implemented. Please export as HTML or plain text.');
      } else {
        throw new Error('Unsupported file format. Supported formats: TXT, HTML');
      }
    } catch (error) {
      console.error('Failed to import file:', error);
      throw error;
    }
  }

  private async importFromText(file: File): Promise<RichTextContent> {
    const text = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    return {
      html: text.split('\n').map(line => `<p>${this.escapeHtml(line.trim())}</p>`).join(''),
      plainText: text,
      title
    };
  }

  private async importFromHTML(file: File): Promise<RichTextContent> {
    const html = await file.text();
    const title = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Extract plain text from HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    const plainText = div.textContent || div.innerText || '';
    
    return {
      html,
      plainText,
      title
    };
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Utility function to get content from rich text editor
export function getRichTextContent(editorElement: HTMLElement, title: string = ''): RichTextContent {
  const html = editorElement.innerHTML;
  const plainText = editorElement.textContent || editorElement.innerText || '';
  
  return {
    html,
    plainText,
    title
  };
}

// Create singleton instance
export const documentExporter = new DocumentExporter(); 