import React, { useEffect, useState } from 'react';

interface TableOutputProps {
  tableData: string;
}

interface ParsedTable {
  headers: string[];
  rows: string[][];
}

const TableOutput: React.FC<TableOutputProps> = ({ tableData }) => {
  const [parsedTable, setParsedTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  
  useEffect(() => {
    // Parse table data
    const tableMatch = tableData.match(/### TABLE_OUTPUT_BEGIN ###([\s\S]*?)### TABLE_OUTPUT_END ###/);
    const jsonMatch = tableData.match(/### JSON_OUTPUT_BEGIN ###([\s\S]*?)### JSON_OUTPUT_END ###/);
    
    if (tableMatch && tableMatch[1]) {
      const tableContent = tableMatch[1].trim();
      setParsedTable(parseTable(tableContent));
    }
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const jsonContent = jsonMatch[1].trim();
        setJsonData(JSON.parse(jsonContent));
      } catch (e) {
        console.error('Failed to parse JSON data:', e);
      }
    }
  }, [tableData]);
  
  // Function to parse table data from tabulate output
  const parseTable = (tableData: string): { headers: string[], rows: string[][] } => {
    const lines = tableData.trim().split('\n');
    
    if (lines.length < 3) {
      return { headers: [], rows: [] };
    }

    // Get headers - they're in the first row after the first separator line
    let headerIndex = 1;
    while (headerIndex < lines.length && !lines[headerIndex].includes('│')) {
      headerIndex++;
    }
    
    if (headerIndex >= lines.length) {
      return { headers: [], rows: [] };
    }
    
    const headerLine = lines[headerIndex];
    const headers = headerLine
      .split('│')
      .map(header => header.trim())
      .filter(header => header !== '');

    // Parse data rows
    const rows: string[][] = [];
    for (let i = headerIndex + 2; i < lines.length; i++) {
      // Skip separator lines
      if (!lines[i].includes('│') || lines[i].includes('═') || lines[i].includes('─')) {
        continue;
      }
      
      const rowData = lines[i]
        .split('│')
        .map(cell => cell.trim())
        .filter(cell => cell !== '');
      
      if (rowData.length > 0) {
        rows.push(rowData);
      }
    }

    return { headers, rows };
  };

  if ((parsedTable.headers.length === 0 || parsedTable.rows.length === 0) && !jsonData) {
    return <div className="text-gray-500 italic p-4">No table data found</div>;
  }

  return (
    <div>
      {/* Toggle between table and JSON view if JSON data is available */}
      {jsonData && (
        <div className="flex justify-end mb-2 px-4 pt-3">
          <div className="flex p-1 bg-gray-100 rounded-md">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                viewMode === 'json' 
                  ? 'bg-white text-gray-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              JSON
            </button>
          </div>
        </div>
      )}

      {viewMode === 'table' && parsedTable.headers.length > 0 && (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {parsedTable.headers.map((header, index) => {
                  // Assign different widths based on column type
                  let columnWidth = "25%"; // Default width
                  
                  // Adjust column widths based on content type
                  if (header.includes("Number")) {
                    columnWidth = "30%";
                  } else if (header.includes("Language")) {
                    columnWidth = "35%"; // Language often has longer content
                  } else if (header.includes("Brand ID") || header.includes("Country")) {
                    columnWidth = "15%"; // IDs and country codes are usually shorter
                  }
                  
                  return (
                    <th
                      key={index}
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      style={{ width: columnWidth }}
                    >
                      {header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parsedTable.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIndex) => {
                    // Get the corresponding header for this cell
                    const columnHeader = parsedTable.headers[cellIndex] || '';
                    
                    // Apply different styling based on column type
                    if (columnHeader.includes('Language')) {
                      // Format language column with wrapping
                      return (
                        <td key={cellIndex} className="px-3 py-3 text-sm text-gray-500 break-words">
                          {cell.includes(',') ? (
                            <div className="flex flex-wrap gap-1">
                              {cell.split(',').map((lang, i) => (
                                <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                  {lang.trim()}
                                </span>
                              ))}
                            </div>
                          ) : cell}
                        </td>
                      );
                    } else if (columnHeader.includes('Number')) {
                      // Keep phone number on one line
                      return (
                        <td key={cellIndex} className="px-3 py-3 text-sm text-gray-500 whitespace-nowrap font-medium">
                          {cell}
                        </td>
                      );
                    } else {
                      // Default styling for other columns
                      return (
                        <td key={cellIndex} className="px-3 py-3 text-sm text-gray-500">
                          {cell}
                        </td>
                      );
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'json' && jsonData && (
        <div className="p-4">
          <pre className="bg-gray-50 rounded-md p-4 text-xs overflow-x-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TableOutput;