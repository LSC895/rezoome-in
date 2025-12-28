import React from 'react';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: 'modern' | 'classic' | 'creative';
  onTemplateChange: (template: 'modern' | 'classic' | 'creative') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  const templates = [
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Clean lines with blue accents',
      preview: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/30',
      accent: 'border-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'classic' as const,
      name: 'Classic',
      description: 'Professional with green touches',
      preview: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/30',
      accent: 'border-green-500',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'creative' as const,
      name: 'Creative',
      description: 'Bold design with purple elements',
      preview: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/30',
      accent: 'border-purple-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-sora font-semibold text-lg text-foreground">
        Choose Resume Template
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`
              relative cursor-pointer rounded-xl p-4 border-2 transition-all hover:scale-105
              ${selectedTemplate === template.id 
                ? `${template.accent} bg-opacity-10` 
                : 'border-border hover:border-muted-foreground'
              }
            `}
          >
            {selectedTemplate === template.id && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <div className={`${template.preview} rounded-lg h-24 mb-3 flex items-center justify-center`}>
              <div className="space-y-1 w-full px-2">
                <div className="h-2 bg-foreground/30 rounded w-3/4"></div>
                <div className="h-1 bg-foreground/20 rounded w-full"></div>
                <div className="h-1 bg-foreground/20 rounded w-5/6"></div>
                <div className="h-1 bg-foreground/15 rounded w-4/5"></div>
              </div>
            </div>
            
            <h4 className={`font-semibold ${template.textColor}`}>
              {template.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {template.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;