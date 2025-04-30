import React from 'react';
import { ChefHat, Sparkles } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-pink-400 mr-2" />;
      default:
        return <ChefHat className="w-5 h-5 text-purple-400 mr-2" />;
    }
  };
  
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-white flex items-center">
        {icon && getIcon()}
        {title}
      </h1>
      {description && (
        <p className="text-purple-300 mt-1">{description}</p>
      )}
    </div>
  );
};

export default PageHeader;