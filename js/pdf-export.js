/**
 * PDF Export Module
 * Exports transcript to PDF using html2canvas and jsPDF
 */

const PDFExporter = {
    // Export transcript element to PDF
    async exportToPDF(elementId, filename = 'transcript.pdf') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error('Element not found:', elementId);
            return;
        }

        try {
            // Show loading state
            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.innerHTML = '<span class="loading-spinner"></span> Generating...';
            }

            // Get watermark text
            const watermarkEl = document.getElementById('schoolWatermark');
            const watermarkText = watermarkEl ? watermarkEl.textContent : '';

            // Wait for html2canvas and jsPDF to be available
            await this.loadDependencies();

            // Convert element to canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Calculate PDF dimensions (Letter size: 8.5 x 11 inches)
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'letter'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pdfWidth - (margin * 2);

            // Calculate image dimensions maintaining aspect ratio
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = contentWidth / imgWidth;
            const scaledHeight = imgHeight * ratio;

            // Add image to PDF
            const imgData = canvas.toDataURL('image/png');

            // Handle multi-page if content is too long
            const pageContentHeight = pdfHeight - (margin * 2);

            if (scaledHeight <= pageContentHeight) {
                // Single page
                pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, scaledHeight);
                // Add watermark to single page
                this.addWatermark(pdf, watermarkText, pdfWidth, pdfHeight);
            } else {
                // Multi-page - split the canvas
                let currentY = 0;
                let pageNum = 0;
                while (currentY < imgHeight) {
                    if (currentY > 0) {
                        pdf.addPage();
                    }

                    const sliceHeight = Math.min(pageContentHeight / ratio, imgHeight - currentY);

                    // Create a temporary canvas for this slice
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = imgWidth;
                    tempCanvas.height = sliceHeight;
                    const ctx = tempCanvas.getContext('2d');
                    ctx.drawImage(canvas, 0, -currentY);

                    const sliceData = tempCanvas.toDataURL('image/png');
                    pdf.addImage(sliceData, 'PNG', margin, margin, contentWidth, sliceHeight * ratio);

                    // Add watermark to each page
                    this.addWatermark(pdf, watermarkText, pdfWidth, pdfHeight);

                    currentY += sliceHeight;
                    pageNum++;
                }
            }

            // Save the PDF
            pdf.save(filename);

            // Reset button state
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '📄 Download PDF';
            }

        } catch (error) {
            console.error('PDF export failed:', error);

            // Reset button state
            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '📄 Download PDF';
            }

            alert('PDF export failed. Please try again.');
        }
    },

    // Add watermark to a PDF page
    addWatermark(pdf, text, pageWidth, pageHeight) {
        if (!text) return;

        pdf.saveGraphicsState();

        // Set watermark style
        pdf.setTextColor(200, 200, 200); // Light gray
        pdf.setFontSize(48);
        pdf.setFont('helvetica', 'bold');

        // Calculate center position
        const centerX = pageWidth / 2;
        const centerY = pageHeight / 2;

        // Rotate and draw watermark
        const angle = -45 * Math.PI / 180;

        // Draw watermark text at center, rotated
        pdf.text(text, centerX, centerY, {
            align: 'center',
            angle: -45
        });

        pdf.restoreGraphicsState();
    },

    // Load external dependencies
    async loadDependencies() {
        // Check if already loaded
        if (typeof html2canvas !== 'undefined' && typeof jspdf !== 'undefined') {
            return;
        }

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        };

        // Load html2canvas
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }

        // Load jsPDF
        if (typeof jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFExporter;
}
