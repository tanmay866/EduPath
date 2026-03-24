import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  TabStopType,
  BorderStyle,
  ExternalHyperlink,
  convertInchesToTwip
} from 'docx';
import SanitizerUtils from '../utils/sanitizer.js';
import cloudinary from '../config/cloudinaryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Note: Using Cloudinary for storage instead of local files
// const GENERATED_DIR = path.join(__dirname, '../generated');

// Ensure directory exists (Not needed for Cloudinary)
// if (!fs.existsSync(GENERATED_DIR)) {
//   fs.mkdirSync(GENERATED_DIR, { recursive: true });
// }

// Professional color scheme
const COLORS = {
  primary: '212529',
  secondary: '555555',
  link: '0066CC',
  text: '333333'
};

// Helper function to ensure URL has proper protocol
const ensureUrlProtocol = (url) => {
  if (!url) return '';
  url = url.trim();
  url = url.replace(/^(https?:\/\/)+(https?:)?/i, '');

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return 'https://' + url.replace(/^\/+/, '');
};

// Helper function to create professional section heading
const createSectionHeading = (text) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 24,
        color: COLORS.primary,
        allCaps: true
      })
    ],
    spacing: { before: 200, after: 80 },
    border: {
      bottom: {
        color: COLORS.primary,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 8
      }
    }
  });
};

class ResumeGeneratorService {
  async generateDOCX(resumeData, userId) {
    try {
      const { personalInfo, education, experience, projects, skills, certifications, achievements } = resumeData;

      const sections = [];

      // ============ HEADER SECTION ============
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: personalInfo.name,
              bold: true,
              size: 40,
              color: COLORS.primary
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        })
      );

      // Contact Information
      const contactChildren = [];

      if (personalInfo.email) {
        contactChildren.push(new TextRun({ text: personalInfo.email, size: 20, color: COLORS.text }));
      }

      if (personalInfo.phone) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', size: 20, color: COLORS.secondary }));
        contactChildren.push(new TextRun({ text: personalInfo.phone, size: 20, color: COLORS.text }));
      }

      if (personalInfo.location) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', size: 20, color: COLORS.secondary }));
        contactChildren.push(new TextRun({ text: personalInfo.location, size: 20, color: COLORS.text }));
      }

      if (personalInfo.linkedin) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', size: 20, color: COLORS.secondary }));
        contactChildren.push(
          new ExternalHyperlink({
            children: [
              new TextRun({ text: 'LinkedIn', size: 20, color: COLORS.link, underline: { type: UnderlineType.SINGLE } })
            ],
            link: ensureUrlProtocol(personalInfo.linkedin)
          })
        );
      }

      if (personalInfo.github) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', size: 20, color: COLORS.secondary }));
        contactChildren.push(
          new ExternalHyperlink({
            children: [
              new TextRun({ text: 'GitHub', size: 20, color: COLORS.link, underline: { type: UnderlineType.SINGLE } })
            ],
            link: ensureUrlProtocol(personalInfo.github)
          })
        );
      }

      if (personalInfo.website) {
        if (contactChildren.length > 0) contactChildren.push(new TextRun({ text: '  •  ', size: 20, color: COLORS.secondary }));
        contactChildren.push(
          new ExternalHyperlink({
            children: [
              new TextRun({ text: 'Portfolio', size: 20, color: COLORS.link, underline: { type: UnderlineType.SINGLE } })
            ],
            link: ensureUrlProtocol(personalInfo.website)
          })
        );
      }

      sections.push(
        new Paragraph({
          children: contactChildren,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );

      // ============ EDUCATION SECTION ============
      if (education && education.length > 0) {
        sections.push(createSectionHeading('Education'));

        education.forEach(edu => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree,
                  bold: true,
                  size: 22,
                  color: COLORS.primary
                })
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(7.5) }],
              spacing: { after: 40 }
            })
          );

          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.institution,
                  italics: true,
                  size: 22,
                  color: COLORS.text
                }),
                new TextRun({ text: '\t' }),
                new TextRun({
                  text: edu.endDate,
                  size: 22,
                  color: COLORS.secondary
                }),
                ...(edu.cgpa ? [
                  new TextRun({ text: '  |  ', size: 22, color: COLORS.secondary }),
                  new TextRun({
                    text: `CGPA: ${edu.cgpa}`,
                    italics: true,
                    size: 22,
                    color: COLORS.text
                  })
                ] : [])
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(7.5) }],
              spacing: { after: 100 }
            })
          );
        });
      }

      // ============ EXPERIENCE SECTION ============
      if (experience && experience.length > 0) {
        sections.push(createSectionHeading('Experience'));

        experience.forEach(exp => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.position,
                  bold: true,
                  size: 22,
                  color: COLORS.primary
                }),
                new TextRun({ text: '\t' }),
                new TextRun({
                  text: `${exp.startDate} – ${exp.endDate}`,
                  size: 22,
                  color: COLORS.secondary
                })
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(7.5) }],
              spacing: { after: 40 }
            })
          );

          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.company,
                  italics: true,
                  size: 22,
                  color: COLORS.text
                }),
                ...(exp.location ? [
                  new TextRun({ text: '  •  ', size: 22, color: COLORS.secondary }),
                  new TextRun({
                    text: exp.location,
                    size: 22,
                    color: COLORS.text
                  })
                ] : [])
              ],
              spacing: { after: 80 }
            })
          );

          if (exp.responsibilities) {
            exp.responsibilities.forEach(resp => {
              sections.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: resp, size: 21, color: COLORS.text })
                  ],
                  bullet: { level: 0 },
                  spacing: { after: 40 }
                })
              );
            });
          }

          sections.push(new Paragraph({ text: '', spacing: { after: 80 } }));
        });
      }

      // ============ PROJECTS SECTION ============
      if (projects && projects.length > 0) {
        sections.push(createSectionHeading('Projects'));

        projects.forEach(proj => {
          const projChildren = [
            new TextRun({
              text: proj.title,
              bold: true,
              size: 22,
              color: COLORS.primary
            })
          ];

          if (proj.link) {
            projChildren.push(new TextRun({ text: '\t' }));
            projChildren.push(
              new ExternalHyperlink({
                children: [
                  new TextRun({ text: '[View Project]', size: 20, color: COLORS.link, underline: { type: UnderlineType.SINGLE } })
                ],
                link: ensureUrlProtocol(proj.link)
              })
            );
          }

          sections.push(
            new Paragraph({
              children: projChildren,
              tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(7.5) }],
              spacing: { after: 40 }
            })
          );

          if (proj.description) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({ text: proj.description, size: 21, color: COLORS.text })
                ],
                spacing: { after: 40 }
              })
            );
          }

          if (proj.technologies && proj.technologies.length > 0) {
            sections.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Technologies: ',
                    bold: true,
                    italics: true,
                    size: 20,
                    color: COLORS.secondary
                  }),
                  new TextRun({
                    text: proj.technologies.join(', '),
                    italics: true,
                    size: 20,
                    color: COLORS.text
                  })
                ],
                spacing: { after: 120 }
              })
            );
          }
        });
      }

      // ============ SKILLS SECTION ============
      if (skills) {
        sections.push(createSectionHeading('Technical Skills'));

        if (skills.technical && skills.technical.length > 0) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Technical Skills: ', bold: true, size: 22, color: COLORS.primary }),
                new TextRun({ text: skills.technical.join(', '), size: 22, color: COLORS.text })
              ],
              spacing: { after: 60 }
            })
          );
        }

        if (skills.soft && skills.soft.length > 0) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: 'Soft Skills: ', bold: true, size: 22, color: COLORS.primary }),
                new TextRun({ text: skills.soft.join(', '), size: 22, color: COLORS.text })
              ],
              spacing: { after: 60 }
            })
          );
        }
      }

      // ============ CERTIFICATIONS SECTION ============
      if (certifications && certifications.length > 0) {
        sections.push(createSectionHeading('Certifications'));

        certifications.forEach(cert => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cert.name,
                  bold: true,
                  size: 22,
                  color: COLORS.primary
                }),
                ...(cert.issuer ? [
                  new TextRun({ text: ' – ', size: 22, color: COLORS.secondary }),
                  new TextRun({
                    text: cert.issuer,
                    italics: true,
                    size: 22,
                    color: COLORS.text
                  })
                ] : []),
                ...(cert.date ? [
                  new TextRun({ text: '\t' }),
                  new TextRun({
                    text: cert.date,
                    size: 22,
                    color: COLORS.secondary
                  })
                ] : [])
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: convertInchesToTwip(7.5) }],
              spacing: { after: 60 }
            })
          );
        });
      }

      // ============ ACHIEVEMENTS SECTION ============
      if (achievements && achievements.length > 0) {
        sections.push(createSectionHeading('Achievements & Awards'));

        achievements.forEach(ach => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: ach, size: 21, color: COLORS.text })
              ],
              bullet: { level: 0 },
              spacing: { after: 50 }
            })
          );
        });
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: sections
        }]
      });

      const timestamp = Date.now();
      const nameSlug = personalInfo?.name?.toLowerCase().replace(/\s+/g, '_') || 'resume';
      const filename = SanitizerUtils.sanitizeFilename(`${nameSlug}_${timestamp}.docx`);

      // Generate DOCX buffer
      const buffer = await Packer.toBuffer(doc);

      // Upload to Cloudinary
      console.log('Uploading resume to Cloudinary...');
      const uploadResult = await cloudinary.uploader.upload(
        `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString('base64')}`,
        {
          folder: 'edupath/generated-resumes',
          public_id: `${userId}_${timestamp}`,
          resource_type: 'raw',
          overwrite: true,
          type: 'upload',
          access_mode: 'public'
        }
      );

      console.log('Resume uploaded to Cloudinary successfully:', uploadResult.secure_url);

      return {
        filename,
        cloudinaryUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        url: uploadResult.secure_url // For compatibility with existing code
      };
    } catch (error) {
      throw new Error(`DOCX generation failed: ${error.message}`);
    }
  }

  async deleteFile(cloudinaryPublicId) {
    try {
      if (!cloudinaryPublicId) {
        throw new Error('Cloudinary public ID is required for deletion');
      }

      console.log('Deleting file from Cloudinary:', cloudinaryPublicId);
      const result = await cloudinary.uploader.destroy(cloudinaryPublicId, {
        resource_type: 'raw'
      });

      if (result.result === 'ok' || result.result === 'not found') {
        console.log('File deleted from Cloudinary successfully');
        return { success: true, message: 'File deleted successfully' };
      } else {
        throw new Error(`Cloudinary deletion failed: ${result.result}`);
      }
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }
}

export default new ResumeGeneratorService();
