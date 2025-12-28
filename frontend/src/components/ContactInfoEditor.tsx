import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Mail, Linkedin } from 'lucide-react';

interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  linkedin: string;
}

interface ContactInfoEditorProps {
  contactInfo: ContactInfo;
  onContactInfoChange: (info: ContactInfo) => void;
}

const ContactInfoEditor: React.FC<ContactInfoEditorProps> = ({ contactInfo, onContactInfoChange }) => {
  const handleChange = (field: keyof ContactInfo, value: string) => {
    onContactInfoChange({
      ...contactInfo,
      [field]: value
    });
  };

  return (
    <div className="floating-card p-6 max-w-4xl mx-auto">
      <h3 className="font-sora font-semibold text-lg text-foreground mb-4 flex items-center">
        <User className="h-5 w-5 mr-2" />
        Contact Information
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        This information will be preserved across all generated resumes but can be edited as needed.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-1" />
            Full Name
          </Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Your full name"
            className="rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            Phone Number
          </Label>
          <Input
            id="phone"
            value={contactInfo.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center">
            <Mail className="h-4 w-4 mr-1" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="your.email@example.com"
            className="rounded-xl"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-sm font-medium flex items-center">
            <Linkedin className="h-4 w-4 mr-1" />
            LinkedIn URL
          </Label>
          <Input
            id="linkedin"
            value={contactInfo.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfoEditor;