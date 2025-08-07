import React from 'react';
import { ChevronRight, Database, Monitor, FileText, Settings, AlertTriangle, Wrench } from 'lucide-react';
import { ScriptCategory } from '../../types/script';

interface CategoryCardProps {
  category: ScriptCategory;
  onClick: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const getIcon = (iconName: string) => {
    const iconMap = {
      'database': Database,
      'monitor': Monitor,
      'file-text': FileText,
      'settings': Settings,
      'alert-triangle': AlertTriangle,
      'wrench': Wrench
    };
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Database;
    return <IconComponent className="w-8 h-8" />;
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      'blue': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      'green': 'bg-green-50 border-green-200 hover:bg-green-100',
      'purple': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      'orange': 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      'red': 'bg-red-50 border-red-200 hover:bg-red-100',
      'gray': 'bg-gray-50 border-gray-200 hover:bg-gray-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      'blue': 'text-blue-600',
      'green': 'text-green-600',
      'purple': 'text-purple-600',
      'orange': 'text-orange-600',
      'red': 'text-red-600',
      'gray': 'text-gray-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div
      onClick={() => onClick(category.id)}
      className={`${getColorClasses(category.color)} border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-md group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`${getIconColor(category.color)} group-hover:scale-110 transition-transform duration-200`}>
            {getIcon(category.icon)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{category.description}</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700">
              {category.scriptCount} {category.scriptCount === 1 ? 'script' : 'scripts'}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </div>
  );
};

export default CategoryCard;