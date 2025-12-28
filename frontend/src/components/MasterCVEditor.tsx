import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Save, Edit2, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface MasterCVEditorProps {
  initialData: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const MasterCVEditor: React.FC<MasterCVEditorProps> = ({ 
  initialData, 
  onSave, 
  onCancel,
  isSaving = false 
}) => {
  const [formData, setFormData] = useState(initialData);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const updateField = (path: string, value: any) => {
    setFormData((prev: any) => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addArrayItem = (field: string, template: any) => {
    const currentArray = formData[field] || [];
    updateField(field, [...currentArray, template]);
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = formData[field] || [];
    updateField(field, currentArray.filter((_: any, i: number) => i !== index));
  };

  const updateArrayItem = (field: string, index: number, key: string, value: any) => {
    const currentArray = [...(formData[field] || [])];
    currentArray[index] = { ...currentArray[index], [key]: value };
    updateField(field, currentArray);
  };

  const handleSave = async () => {
    await onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Review Your Master CV</h2>
          <p className="text-muted-foreground mt-1">
            AI has extracted your information. Review and edit as needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Master CV
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Contact Information
          </CardTitle>
          <CardDescription>Your personal and professional contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.full_name || ''}
                onChange={(e) => updateField('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1-234-567-8900"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={formData.linkedin_url || ''}
                onChange={(e) => updateField('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={formData.github_url || ''}
                onChange={(e) => updateField('github_url', e.target.value)}
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.professional_summary || ''}
            onChange={(e) => updateField('professional_summary', e.target.value)}
            placeholder="A brief professional summary highlighting your expertise..."
            rows={4}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>
                {formData.work_experience?.length || 0} positions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('work_experience', {
                company: '',
                title: '',
                location: '',
                start_date: '',
                end_date: '',
                is_current: false,
                achievements: []
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.work_experience?.map((exp: any, index: number) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input
                      value={exp.title || ''}
                      onChange={(e) => updateArrayItem('work_experience', index, 'title', e.target.value)}
                      placeholder="Job Title"
                      className="font-semibold"
                    />
                    <Input
                      value={exp.company || ''}
                      onChange={(e) => updateArrayItem('work_experience', index, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                    <Input
                      value={exp.start_date || ''}
                      onChange={(e) => updateArrayItem('work_experience', index, 'start_date', e.target.value)}
                      placeholder="Start Date"
                    />
                    <Input
                      value={exp.end_date || ''}
                      onChange={(e) => updateArrayItem('work_experience', index, 'end_date', e.target.value)}
                      placeholder="End Date or 'Present'"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('work_experience', index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Achievements (one per line)</Label>
                  <Textarea
                    value={exp.achievements?.join('\n') || ''}
                    onChange={(e) => updateArrayItem('work_experience', index, 'achievements', e.target.value.split('\n'))}
                    placeholder="• Led team of 8 engineers&#10;• Increased performance by 40%"
                    rows={3}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Technical Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Languages</Label>
            <Input
              value={formData.technical_skills?.languages?.join(', ') || ''}
              onChange={(e) => updateField('technical_skills.languages', e.target.value.split(',').map((s: string) => s.trim()))}
              placeholder="JavaScript, Python, Java"
            />
          </div>
          <div className="space-y-2">
            <Label>Frameworks</Label>
            <Input
              value={formData.technical_skills?.frameworks?.join(', ') || ''}
              onChange={(e) => updateField('technical_skills.frameworks', e.target.value.split(',').map((s: string) => s.trim()))}
              placeholder="React, Node.js, Django"
            />
          </div>
          <div className="space-y-2">
            <Label>Tools</Label>
            <Input
              value={formData.technical_skills?.tools?.join(', ') || ''}
              onChange={(e) => updateField('technical_skills.tools', e.target.value.split(',').map((s: string) => s.trim()))}
              placeholder="Git, Docker, AWS"
            />
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('education', {
                institution: '',
                degree: '',
                major: '',
                graduation_date: '',
                gpa: ''
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.education?.map((edu: any, index: number) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <Input
                      value={edu.institution || ''}
                      onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                      placeholder="University Name"
                    />
                    <Input
                      value={edu.degree || ''}
                      onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                      placeholder="Bachelor of Science"
                    />
                    <Input
                      value={edu.major || ''}
                      onChange={(e) => updateArrayItem('education', index, 'major', e.target.value)}
                      placeholder="Computer Science"
                    />
                    <Input
                      value={edu.graduation_date || ''}
                      onChange={(e) => updateArrayItem('education', index, 'graduation_date', e.target.value)}
                      placeholder="May 2020"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('education', index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Save Button at Bottom */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MasterCVEditor;
