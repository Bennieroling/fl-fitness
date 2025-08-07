import React, { useState, useEffect } from 'react';
import { Star, Play, FileText, Heart } from 'lucide-react';
import { Script } from '../../types/script';
import { User } from '../../types/auth';

interface FavoriteScriptsProps {
  currentUser: User;
  scripts: Script[];
  onRunScript: (scriptId: number, scriptName: string) => void;
  onViewScript: (categoryId: string, scriptId: number) => void;
}

const FavoriteScripts: React.FC<FavoriteScriptsProps> = ({ 
  currentUser, 
  scripts, 
  onRunScript, 
  onViewScript 
}) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    loadFavorites();
  }, [currentUser]);

  const loadFavorites = () => {
    const key = `favorites_${currentUser.username}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setFavoriteIds(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavoriteIds([]);
      }
    }
  };

  const saveFavorites = (newFavorites: number[]) => {
    const key = `favorites_${currentUser.username}`;
    localStorage.setItem(key, JSON.stringify(newFavorites));
    setFavoriteIds(newFavorites);
  };

  const toggleFavorite = (scriptId: number) => {
    const newFavorites = favoriteIds.includes(scriptId)
      ? favoriteIds.filter(id => id !== scriptId)
      : [...favoriteIds, scriptId];
    saveFavorites(newFavorites);
  };

  const favoriteScripts = scripts.filter(script => favoriteIds.includes(script.id));

  const getCategoryId = (script: Script) => {
    return script.category.toLowerCase().replace(/\s+/g, '-');
  };

  if (favoriteScripts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Favorite Scripts</h3>
        </div>
        <div className="text-center py-6 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No favorite scripts yet</p>
          <p className="text-sm">Star scripts to add them to your favorites for quick access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">Favorite Scripts</h3>
        </div>
        <span className="text-sm text-gray-500">{favoriteScripts.length} favorite{favoriteScripts.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteScripts.map((script) => (
          <div key={script.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{script.name}</h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{script.description}</p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {script.category}
                </span>
              </div>
              <button
                onClick={() => toggleFavorite(script.id)}
                className="ml-2 p-1 text-yellow-500 hover:text-yellow-600 transition-colors"
                title="Remove from favorites"
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewScript(getCategoryId(script), script.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>View</span>
              </button>
              <button
                onClick={() => onRunScript(script.id, script.name)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteScripts;