import React, { useState, useEffect } from 'react';
import { useActionDispatch } from '../../engine/hooks/useActionDispatch';
import type { ActionDispatcher } from '../../engine/ActionDispatcher';

interface Mapping {
  sectionId: string;
  suggestedComponent: string;
  confidence: number;
  originalTitle: string;
  isNew: boolean;
  selected?: boolean;
}

interface WizardImplementationSelectionProps {
  dispatcher?: ActionDispatcher;
  state?: any;
}

const WizardImplementationSelection: React.FC<WizardImplementationSelectionProps> = ({
  dispatcher,
  state
}) => {
  const { dispatchWithLoading } = useActionDispatch(dispatcher);
  const analysisResult = state?.wizard_analysisResult;
  const [mappings, setMappings] = useState<Mapping[]>([]);

  useEffect(() => {
    if (analysisResult?.mappings) {
      setMappings(analysisResult.mappings.map((m: any) => ({ ...m, selected: true })));
    }
  }, [analysisResult]);

  const toggleSelection = (id: string) => {
    setMappings(prev => prev.map(m => 
      m.sectionId === id ? { ...m, selected: !m.selected } : m
    ));
  };

  const toggleIsNew = (id: string) => {
    setMappings(prev => prev.map(m => 
      m.sectionId === id ? { ...m, isNew: !m.isNew } : m
    ));
  };

  const handleGenerate = async () => {
    if (!dispatcher) return;

    const selection = mappings.filter(m => m.selected);
    
    await dispatchWithLoading('generate', {
      type: 'chain',
      actions: [
        {
          type: 'setState',
          key: 'wizard_finalSelection',
          value: selection,
          merge: false
        },
        {
          type: 'navigate',
          url: 'generation'
        }
      ]
    } as any);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Review Section Mappings</h3>
        <span className="text-sm text-gray-500">
          {mappings.filter(m => m.selected).length} sections selected
        </span>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {mappings.map((mapping) => (
            <li key={mapping.sectionId} className={`p-4 hover:bg-gray-50 transition-colors ${!mapping.selected ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={mapping.selected}
                    onChange={() => toggleSelection(mapping.sectionId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-xs">
                      {mapping.originalTitle || 'Untitled Section'}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-tight">
                      {mapping.sectionId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      mapping.isNew ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {mapping.isNew ? 'Generate New' : mapping.suggestedComponent}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {Math.round(mapping.confidence * 100)}% AI confidence
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleIsNew(mapping.sectionId)}
                    className="text-gray-400 hover:text-blue-600"
                    title={mapping.isNew ? "Map to existing component" : "Force new component generation"}
                  >
                    <span className="material-icons text-sm">
                      {mapping.isNew ? 'settings_backup_restore' : 'add_circle_outline'}
                    </span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm"
        >
          Generate Landing Page
        </button>
      </div>
    </div>
  );
};

export default WizardImplementationSelection;
