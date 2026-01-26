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
                downloadBtn.innerHTML = '<span class="loading-spinner"></span> 生成中...';
            }

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
            let yPosition = margin;
            const pageContentHeight = pdfHeight - (margin * 2);

            if (scaledHeight <= pageContentHeight) {
                // Single page
                pdf.addImage(imgData, 'PNG', margin, yPosition, contentWidth, scaledHeight);
            } else {
                // Multi-page - split the canvas
                let currentY = 0;
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

                    currentY += sliceHeight;
                }
            }

            // Save the PDF
            pdf.save(filename);

            // Reset button state
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '📄 下载 PDF';
            }

        } catch (error) {
            console.error('PDF export failed:', error);

            // Reset button state
            const downloadBtn = document.getElementById('downloadPdfBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = '📄 下载 PDF';
            }

            alert('PDF 导出失败，请重试。');
        }
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
