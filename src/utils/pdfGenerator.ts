import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export const generatePdfBlob = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Ensure element is visible before capturing
  const originalDisplay = element.style.display;
  const originalVisibility = element.style.visibility;
  
  try {
    // Generate JPEG data URL directly from the DOM using html-to-image
    // This avoids html2canvas CSS parsing errors for modern features like oklch
    const imgData = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2, // Higher resolution
      style: {
        // Temporarily reset transforms or styles if needed for capture
        transform: 'none',
      }
    });
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Maintain aspect ratio based on element dimensions
    const pdfHeight = (element.scrollHeight * pdfWidth) / element.scrollWidth;

    let heightLeft = pdfHeight;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if content exceeds A4 height
    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    
    return pdf.output('blob');
  } finally {
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
  }
};
