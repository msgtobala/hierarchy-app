import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Level } from '../../types';
import { SwapLevelFilters } from './SwapLevelFilters';
import { EditSwapLevelModal } from './EditSwapLevelModal';
import { DeleteModal } from '../common/DeleteModal';
import { SwapLevelCard } from './SwapLevelCard';
import { useSwapLevelData } from '../../hooks/useSwapLevelData';
import { performSetOperation } from '../../lib/setOperations';

interface SwapHierarchyViewProps {
  currentLevel: number;
}

export function SwapHierarchyView({ currentLevel }: SwapHierarchyViewProps) {
  const {
    groupedLevels,
    loading,
    availableChildren,
    levelItems,
    handleDelete,
    handleSaveEdit,
    handleToggleVerification,
  } = useSwapLevelData(currentLevel);

  const [showVerified, setShowVerified] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);
  const [selectedLevelItems, setSelectedLevelItems] = useState<Record<number, string[]>>({});
  const [selectedOperation, setSelectedOperation] = useState<'union' | 'intersection' | 'difference' | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [deletingLevel, setDeletingLevel] = useState<Level | null>(null);
  const [noRecordsMessage, setNoRecordsMessage] = useState('');

  // Reset filters when changing levels
  useEffect(() => {
    setSelectedLevelItems({});
    setShowVerified(false);
    setShowUnverified(false);
    setSelectedOperation(null);
  }, [currentLevel]);

  const filteredLevels = useMemo(() => {
    let filtered = [...groupedLevels];

    // Apply level filters
    Object.entries(selectedLevelItems).forEach(([levelStr, selectedIds]) => {
      const level = parseInt(levelStr);
      if (selectedIds.length > 0) {
        filtered = filtered.filter(item => {
          if (level === currentLevel) {
            return selectedIds.includes(item.id);
          }
          
          // For previous levels, check the hierarchy
          const findParentAtLevel = (currentItem: Level, targetLevel: number): boolean => {
            if (currentItem.level === targetLevel) {
              return selectedIds.includes(currentItem.id);
            }
            
            if (!currentItem.parentIds?.length || currentItem.level <= targetLevel) {
              return false;
            }
            
            return currentItem.parentIds.some(parentId => {
              const parent = levelItems[currentItem.level - 1]?.find(p => p.id === parentId);
              return parent ? findParentAtLevel(parent, targetLevel) : false;
            });
          };
          
          return findParentAtLevel(item, level);
        });
      }
    });

    // Apply verification filters
    if (showVerified || showUnverified) {
      filtered = filtered.filter(level => 
        (showVerified && level.isVerified) || (showUnverified && !level.isVerified)
      );
    }

    // Apply set operations if selected
    if (selectedOperation && selectedLevelItems[currentLevel]?.length > 0) {
      const selectedNames = selectedLevelItems[currentLevel].map(id => 
        groupedLevels.find(item => item.id === id)?.name || ''
      ).filter(Boolean);

      filtered = filtered.filter(level => {
        const levelChildNames = level.children.map(child => child.name);
        return performSetOperation(selectedOperation, selectedNames, levelChildNames);
      });
    }

    if (filtered.length === 0) {
      setNoRecordsMessage(
        showVerified ? 'No verified records found' :
        showUnverified ? 'No unverified records found' :
        'No records found'
      );
    } else {
      setNoRecordsMessage('');
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [groupedLevels, showVerified, showUnverified, selectedLevelItems, currentLevel, levelItems, selectedOperation]);

  const handleLevelItemsChange = (level: number, items: string[]) => {
    setSelectedLevelItems(prev => ({
      ...prev,
      [level]: items
    }));
  };

  return (
    <div>
      <div className="mb-6">
        <SwapLevelFilters
          currentLevel={currentLevel}
          showVerified={showVerified}
          showUnverified={showUnverified}
          onVerifiedChange={setShowVerified}
          onUnverifiedChange={setShowUnverified}
          levelItems={levelItems}
          selectedLevelItems={selectedLevelItems}
          onLevelItemsChange={handleLevelItemsChange}
          selectedOperation={selectedOperation}
          onOperationChange={setSelectedOperation}
        />
      </div>

      <div className="space-y-4 min-h-[200px]">
        {loading && (
          <div className="flex items-center justify-center h-[200px] bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-coral-500 border-t-transparent"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        )}

        {!loading && filteredLevels.length === 0 && (
          <div className="flex items-center justify-center h-[200px] bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500">{noRecordsMessage}</p>
          </div>
        )}

        {!loading && filteredLevels.length > 0 && (
          filteredLevels.map((level) => (
            <SwapLevelCard
              key={level.id}
              level={level}
              onEdit={() => setEditingLevel(level)}
              onDelete={() => setDeletingLevel(level)}
              onToggleVerification={() => handleToggleVerification(level)}
            />
          ))
        )}
      </div>

      {editingLevel && (
        <EditSwapLevelModal
          isOpen={true}
          onClose={() => setEditingLevel(null)}
          onSave={handleSaveEdit}
          currentName={editingLevel.name}
          levelId={editingLevel.id}
          children={editingLevel.children}
          availableChildren={availableChildren}
        />
      )}

      {deletingLevel && (
        <DeleteModal
          isOpen={true}
          onClose={() => setDeletingLevel(null)}
          onConfirm={() => {
            handleDelete(deletingLevel.id);
            setDeletingLevel(null);
          }}
        />
      )}
    </div>
  );
}