import { useState, useEffect } from 'react';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}

export const useContactExtraction = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    linkedin: ''
  });

  const extractContactInfo = (resumeText: string): ContactInfo => {
    const extracted: ContactInfo = {
      name: '',
      phone: '',
      email: '',
      linkedin: ''
    };

    console.log('Extracting contact info from resume text...');

    // Enhanced email extraction - multiple patterns
    const emailPatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      /email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /e-mail:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i
    ];
    
    for (const pattern of emailPatterns) {
      const matches = resumeText.match(pattern);
      if (matches) {
        extracted.email = matches[0].replace(/^(email|e-mail):\s*/i, '');
        break;
      }
    }

    // Enhanced phone extraction - international and US formats
    const phonePatterns = [
      /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/,
      /(?:\+?91[-.\s]?)?[0-9]{10}/,
      /phone:\s*((?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
      /mobile:\s*((?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i,
      /cell:\s*((?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/i
    ];
    
    for (const pattern of phonePatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        extracted.phone = match[0].replace(/^(phone|mobile|cell):\s*/i, '');
        break;
      }
    }

    // Enhanced LinkedIn extraction
    const linkedinPatterns = [
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/i,
      /linkedin:\s*((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?)/i,
      /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i
    ];
    
    for (const pattern of linkedinPatterns) {
      const match = resumeText.match(pattern);
      if (match) {
        let linkedinUrl = match[0].replace(/^linkedin:\s*/i, '');
        if (!linkedinUrl.startsWith('http')) {
          linkedinUrl = `https://${linkedinUrl}`;
        }
        extracted.linkedin = linkedinUrl;
        break;
      }
    }

    // Enhanced name extraction with multiple strategies
    const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Strategy 1: Look for explicit name labels
    const nameLabels = ['name:', 'full name:', 'candidate:', 'applicant:'];
    for (const line of lines) {
      for (const label of nameLabels) {
        if (line.toLowerCase().startsWith(label)) {
          const potentialName = line.substring(label.length).trim();
          if (potentialName && /^[A-Z][a-zA-Z\s]{2,49}$/.test(potentialName)) {
            extracted.name = potentialName;
            break;
          }
        }
      }
      if (extracted.name) break;
    }
    
    // Strategy 2: Look for name-like patterns in first 15 lines
    if (!extracted.name) {
      for (const line of lines.slice(0, 15)) {
        // Skip obvious non-name content
        if (line.toLowerCase().includes('resume') || 
            line.toLowerCase().includes('cv') || 
            line.toLowerCase().includes('curriculum') ||
            line.toLowerCase().includes('professional') ||
            line.toLowerCase().includes('summary') ||
            line.toLowerCase().includes('objective') ||
            line.toLowerCase().includes('experience') ||
            line.toLowerCase().includes('education') ||
            line.toLowerCase().includes('skills') ||
            line.includes('@') ||
            /^\+?[\d\s\-\(\)]+$/.test(line) ||
            line.length > 50 ||
            line.length < 5) {
          continue;
        }
        
        // Enhanced name pattern - 2-4 words, proper capitalization
        const namePattern = /^[A-Z][a-zA-Z''-]*(?:\s+[A-Z][a-zA-Z''-]*){1,3}$/;
        if (namePattern.test(line)) {
          extracted.name = line;
          break;
        }
      }
    }

    console.log('Extracted contact info:', extracted);
    return extracted;
  };

  const updateContactInfo = (info: Partial<ContactInfo>) => {
    setContactInfo(prev => ({ ...prev, ...info }));
  };

  return {
    contactInfo,
    setContactInfo,
    extractContactInfo,
    updateContactInfo
  };
};