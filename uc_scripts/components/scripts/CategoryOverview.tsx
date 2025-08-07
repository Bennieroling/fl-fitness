import React, { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { ScriptCategory, Script } from '../../types/script';
import SearchBar from '../common/SearchBar';
import { Search } from 'lucide-react';



interface CategoryOverviewProps {
  scripts: Script[];
  onCategoryClick: (categoryId: string) => void;
  API_BASE_URL: string;
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ scripts, onCategoryClick, API_BASE_URL }) => {
  const [categories, setCategories] = useState<ScriptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
const [filteredCategories, setFilteredCategories] = useState<ScriptCategory[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);
useEffect(() => {
  if (!searchQuery.trim()) {
    setFilteredCategories(categories);
    return;
  }

  useEffect(() => {
  setFilteredCategories(categories);
}, [categories]);

  // Filter categories that have scripts matching the search
  const filtered = categories.filter(category => {
    // Check if category name matches
    if (category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return true;
    }
    
    // Check if any scripts in this category match
    const categoryScripts = scripts.filter(script => 
      script.category.toLowerCase().replace(/\s+/g, '-') === category.id
    );
    
    return categoryScripts.some(script => 
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  setFilteredCategories(filtered);
}, [searchQuery, categories, scripts]);
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories');
        // Fallback to counting from scripts
        generateCategoriesFromScripts();
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      generateCategoriesFromScripts();
    } finally {
      setLoading(false);
    }
  };

  const generateCategoriesFromScripts = () => {
    // Fallback: generate categories from scripts if API fails
    const categoryMap: { [key: string]: ScriptCategory } = {};
    
    scripts.forEach(script => {
      const categoryId = script.category.toLowerCase().replace(/\s+/g, '-');
      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          id: categoryId,
          name: script.category,
          description: `${script.category} scripts and utilities`,
          icon: getCategoryIcon(categoryId),
          color: getCategoryColor(categoryId),
          scriptCount: 0
        };
      }
      categoryMap[categoryId].scriptCount++;
    });

    setCategories(Object.values(categoryMap));
  };

  const getCategoryIcon = (categoryId: string): string => {
    const iconMap: { [key: string]: string } = {
      'data-collection': 'database',
      'monitoring': 'monitor',
      'reporting': 'file-text',
      'maintenance': 'wrench',
      'troubleshooting': 'alert-triangle'
    };
    return iconMap[categoryId] || 'settings';
  };

  const getCategoryColor = (categoryId: string): string => {
    const colorMap: { [key: string]: string } = {
      'data-collection': 'blue',
      'monitoring': 'green',
      'reporting': 'purple',
      'maintenance': 'orange',
      'troubleshooting': 'red'
    };
    return colorMap[categoryId] || 'gray';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading categories...</p>
      </div>
    );
  }

  return (
  <div>
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Script Categories</h2>
      <p className="text-gray-600 mb-4">Choose a category to view and run scripts</p>
      
      {/* Search Bar */}
      <SearchBar 
        placeholder="Search scripts and categories..."
        onSearch={setSearchQuery}
        className="max-w-md"
      />
    </div>
    
    {searchQuery && (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Showing {filteredCategories.length} categories matching "{searchQuery}"
        </p>
      </div>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCategories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onClick={onCategoryClick}
        />
      ))}
    </div>

    {filteredCategories.length === 0 && searchQuery && (
      <div className="text-center py-8 text-gray-500">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No scripts or categories found matching "{searchQuery}"</p>
        <button 
          onClick={() => setSearchQuery('')}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Clear search
        </button>
      </div>
    )}

    {categories.length === 0 && !searchQuery && (
      <div className="text-center py-8 text-gray-500">
        <p>No script categories found.</p>
      </div>
    )}
  </div>
);
}; 
export default CategoryOverview;