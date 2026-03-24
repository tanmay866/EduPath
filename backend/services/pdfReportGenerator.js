import PDFDocument from 'pdfkit';

/**
 * Generate professional ATS Analysis PDF Report
 */
export const generateATSReport = (analysisData, userInfo = {}) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation...');

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        console.log('PDF generation completed successfully');
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.on('error', (error) => {
        console.error('PDF Document Error:', error);
        reject(error);
      });

      // Colors
      const primaryColor = '#2563eb';
      const secondaryColor = '#64748b';
      const successColor = '#10b981';
      const warningColor = '#f59e0b';
      const errorColor = '#ef4444';

      // Helper function to get color based on score
      const getScoreColor = (score) => {
        if (score >= 80) return successColor;
        if (score >= 60) return primaryColor;
        if (score >= 40) return warningColor;
        return errorColor;
      };

      console.log('Rendering PDF header...');

      // Header
      doc.fillColor(primaryColor)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('ATS ANALYSIS REPORT', 50, 70, { align: 'center' });

      doc.fillColor(secondaryColor)
         .fontSize(12)
         .font('Helvetica')
         .text('Professional Resume Analysis by EduPath', 50, 110, { align: 'center' });

      // Add horizontal line
      doc.moveTo(50, 140)
         .lineTo(545, 140)
         .strokeColor('#e2e8f0')
         .stroke();

      // Report metadata
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fillColor('#374151')
         .fontSize(10)
         .text(`Generated: ${currentDate}`, 450, 150, { align: 'right' });

      console.log('Rendering score section...');

      // Score Section - Main highlight
      let yPosition = 180;

      // Score background
      doc.fillColor('#f8fafc')
         .roundedRect(50, yPosition, 495, 120, 10)
         .fill();

      // Score circle
      const centerX = 150;
      const centerY = yPosition + 60;
      const radius = 40;

      doc.circle(centerX, centerY, radius)
         .fillColor(getScoreColor(analysisData.score))
         .fill();

      // Score text
      doc.fillColor('white')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(`${Math.round(analysisData.score || 0)}%`, centerX - 20, centerY - 12);

      // Score details
      doc.fillColor('#1f2937')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('ATS Compatibility Score', 220, yPosition + 20);

      doc.fillColor(getScoreColor(analysisData.score))
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(analysisData.status || 'N/A', 220, yPosition + 50);

      doc.fillColor('#4b5563')
         .fontSize(12)
         .font('Helvetica')
         .text(`Similarity Score: ${analysisData.similarity || 'N/A'}`, 220, yPosition + 80);

      yPosition += 150;

      console.log('Rendering analysis summary...');

      // Analysis Summary
      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('ANALYSIS SUMMARY', 50, yPosition);

      yPosition += 30;

      // Summary box
      doc.fillColor('#f1f5f9')
         .roundedRect(50, yPosition, 495, 80, 8)
         .fill();

      doc.fillColor('#334155')
         .fontSize(11)
         .font('Helvetica')
         .text(analysisData.message || 'No analysis message available.', 70, yPosition + 20, {
           width: 455,
           align: 'left',
           lineGap: 4
         });

      yPosition += 110;

      console.log('Rendering recommendations...');

      // Recommendations Section
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('RECOMMENDATIONS', 50, yPosition);

      yPosition += 30;

      const recommendations = [
        {
          title: 'Keyword Optimization',
          description: 'Include more specific terms and phrases from the job description to improve ATS compatibility.'
        },
        {
          title: 'Skills Alignment',
          description: 'Emphasize relevant technical and soft skills that match the job requirements.'
        },
        {
          title: 'Experience Highlighting',
          description: 'Quantify achievements and highlight relevant work experience with specific results.'
        },
        {
          title: 'Industry Terminology',
          description: 'Incorporate industry-standard terminology and acronyms from the job posting.'
        }
      ];

      recommendations.forEach((rec, index) => {
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }

        // Recommendation box
        doc.fillColor('#ffffff')
           .roundedRect(50, yPosition, 495, 70, 8)
           .fill();

        doc.strokeColor('#e5e7eb')
           .roundedRect(50, yPosition, 495, 70, 8)
           .stroke();

        // Simple bullet point
        doc.fillColor(primaryColor)
           .circle(85, yPosition + 25, 4)
           .fill();

        // Recommendation content
        doc.fillColor('#1f2937')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(rec.title, 110, yPosition + 15);

        doc.fillColor('#4b5563')
           .fontSize(10)
           .font('Helvetica')
           .text(rec.description, 110, yPosition + 35, {
             width: 415,
             lineGap: 3
           });

        yPosition += 85;
      });

      console.log('Rendering score guide...');

      // Score Interpretation Guide
      if (yPosition > 550) {
        doc.addPage();
        yPosition = 50;
      } else {
        yPosition += 20;
      }

      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('SCORE INTERPRETATION', 50, yPosition);

      yPosition += 30;

      const scoreGuide = [
        { range: '80-100%', level: 'Excellent', color: successColor, description: 'Outstanding match! Resume aligns excellently with job requirements.' },
        { range: '60-79%', level: 'Good', color: primaryColor, description: 'Strong match with room for minor improvements.' },
        { range: '40-59%', level: 'Fair', color: warningColor, description: 'Moderate match. Consider optimizing keywords and skills.' },
        { range: '0-39%', level: 'Needs Work', color: errorColor, description: 'Significant improvements needed to match job requirements.' }
      ];

      scoreGuide.forEach((guide, index) => {
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }

        // Score guide item
        doc.fillColor(guide.color)
           .circle(70, yPosition + 15, 8)
           .fill();

        doc.fillColor('#1f2937')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(`${guide.range} - ${guide.level}`, 90, yPosition + 10);

        doc.fillColor('#4b5563')
           .fontSize(10)
           .font('Helvetica')
           .text(guide.description, 90, yPosition + 28, {
             width: 400
           });

        yPosition += 50;
      });

      console.log('Rendering footer...');

      // Footer
      yPosition = 750;
      doc.moveTo(50, yPosition)
         .lineTo(545, yPosition)
         .strokeColor('#e2e8f0')
         .stroke();

      doc.fillColor(secondaryColor)
         .fontSize(9)
         .font('Helvetica')
         .text('Generated by EduPath ATS Analyzer | For questions, contact support@edupath.com', 50, yPosition + 10, {
           align: 'center'
         });

      doc.fillColor('#9ca3af')
         .fontSize(8)
         .text('This report is computer-generated and provides analysis based on AI-powered algorithms.', 50, yPosition + 25, {
           align: 'center'
         });

      console.log('Finalizing PDF...');
      doc.end();

    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

/**
 * Generate filename for the PDF report
 */
export const generateReportFilename = (userInfo = {}) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const username = userInfo.username || 'user';
  return `ATS-Report-${username}-${timestamp}.pdf`;
};