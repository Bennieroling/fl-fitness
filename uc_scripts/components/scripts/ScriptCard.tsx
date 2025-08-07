import React from 'react';
import { Play, Square, Download, File, Folder, Star } from 'lucide-react';
import TableOutput from '../../application/UI/TableOutput';
import { User } from '../../types/auth';

interface InputConfig {
  key: string;
  label: string;
  type: string;
  options?: string[];
  placeholder?: string;
  default?: string;
}

interface Script {
  id: number;
  name: string;
  file: string;
  description: string;
  category: string;
  inputs?: InputConfig[];
}

interface ScriptCardProps {
  script: Script;
  currentUser: User;
  isRunning: boolean;
  scriptOutput?: string;
  scriptFiles: any[];
  hasTableOutput: boolean;
  scriptInputs: { [key: string]: string };
  onRun: (scriptId: number, scriptName: string) => void;
  onStop: (scriptId: number, scriptName: string) => void;
  onInputChange: (scriptId: number, key: string, value: string) => void;
  onDownloadFile: (fileName: string, filePath: string) => void;
  formatFileSize: (bytes: number) => string;
  isFileRecent: (modifiedDate: string) => boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (scriptId: number) => void;
}

const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  isRunning,
  scriptOutput,
  scriptFiles,
  hasTableOutput,
  scriptInputs,
  onRun,
  onStop,
  onInputChange,
  onDownloadFile,
  formatFileSize,
  isFileRecent,
  isFavorite,
  onToggleFavorite
}) => {
  const scriptInputValues = scriptInputs || {};
  const missingRequiredInputs = Array.isArray(script.inputs) && 
    script.inputs.some(input => !scriptInputValues[input.key]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{script.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{script.description}</p>
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {script.category}
            </span>
          </div>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(script.id)}
              className={`ml-2 p-1 transition-colors ${
                isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-300 hover:text-yellow-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Input fields section */}
      {Array.isArray(script.inputs) && script.inputs.length > 0 && (
        <div className="mb-4 border-b border-gray-200 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Script Parameters</h4>
          <div className="space-y-3">
            {script.inputs.map((input) => {
              if (input.type === 'dropdown' && Array.isArray(input.options)) {
                return (
                  <div key={input.key} className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {input.label}
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={scriptInputValues[input.key] || ''}
                      onChange={(e) => onInputChange(script.id, input.key, e.target.value)}
                    >
                      <option value="">Select {input.label}</option>
                      {input.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              
              if (input.type === 'text') {
                return (
                  <div key={input.key} className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {input.label}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={input.placeholder || `Enter ${input.label}`}
                      value={scriptInputValues[input.key] || ''}
                      onChange={(e) => onInputChange(script.id, input.key, e.target.value)}
                    />
                  </div>
                );
              }
              
              if (input.type === 'number') {
                return (
                  <div key={input.key} className="space-y-1">
                    <label className="block text-xs font-medium text-gray-700">
                      {input.label}
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={input.placeholder || `Enter ${input.label}`}
                      value={scriptInputValues[input.key] || input.default || ''}
                      onChange={(e) => onInputChange(script.id, input.key, e.target.value)}
                    />
                  </div>
                );
              }
              
              return null;
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
          {script.file}
        </code>
        <div className="flex space-x-2">
          {isRunning ? (
            <button
              onClick={() => onStop(script.id, script.name)}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => onRun(script.id, script.name)}
              disabled={missingRequiredInputs}
              className={`flex items-center space-x-2 px-3 py-1 border border-green-500 text-green-500 rounded hover:bg-green-50 transition-colors text-sm font-medium ${
                missingRequiredInputs ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
          )}
        </div>
      </div>

      {isRunning && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-blue-700">Script is running...</span>
          </div>
        </div>
      )}

      {/* Terminal Output */}
      {scriptOutput && (
        <div className="mb-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Terminal Output</h4>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap">
              {scriptOutput}
            </div>
          </div>
          
          {/* Table Output (if available) */}
          {hasTableOutput && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Table View</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <TableOutput tableData={scriptOutput || ''} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Files */}
      {scriptFiles && scriptFiles.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <Folder className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Recent Files (Last 24h) ({scriptFiles.filter(file => isFileRecent(file.modified)).length})
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {scriptFiles
              .filter(file => isFileRecent(file.modified))
              .slice(0, 5)
              .map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.modified).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDownloadFile(file.name, file.path)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptCard;