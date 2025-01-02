import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Level } from '../types';
import { Bot, Edit2, Trash2 } from 'lucide-react';
import { EditLevelModal } from './EditLevelModal';
import { getMaxLevel } from '../lib/maxLevelService';
import { LevelFilters } from './LevelFilters';
import { performSetOperation } from '../lib/setOperations';
import { FloatingAIButton } from './FloatingAIButton';
import { AIParentSuggestionsModal } from './AIParentSuggestionsModal';
import { getSuggestedParents } from '../lib/parentSuggestions';
import { DeleteModal } from './DeleteModal';

interface HierarchyViewProps {
  currentLevel: number;
}

interface GroupedLevel {
  id: string;
  name: string;
  level: number;
  isVerified: boolean;
  image: string;
  parents: Level[];
}
export function HierarchyView({ currentLevel }: HierarchyViewProps) {
  const [groupedLevels, setGroupedLevels] = useState<GroupedLevel[]>([]);
  const [showVerified, setShowVerified] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);
  const [selectedLevelFilter, setSelectedLevelFilter] = useState(1);
  const [maxLevel, setMaxLevel] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [noRecordsMessage, setNoRecordsMessage] = useState('');
  const [levelItems, setLevelItems] = useState<Record<number, Level[]>>({});
  const [filteredLevelItems, setFilteredLevelItems] = useState<Record<number, Level[]>>({});
  const [selectedLevelItems, setSelectedLevelItems] = useState<Record<number, string[]>>({});
  const [editingLevel, setEditingLevel] = useState<GroupedLevel | null>(null);
  const [levelRelationships, setLevelRelationships] = useState<Record<string, string[]>>({});
  const [availableParents, setAvailableParents] = useState<Level[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<'union' | 'intersection' | 'difference' | null>(null); 
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedLevelForAI, setSelectedLevelForAI] = useState<GroupedLevel | null>(null);
  const [showParentSuggestionsModal, setShowParentSuggestionsModal] = useState(false);
  const [suggestedParents, setSuggestedParents] = useState<Level[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [deletingLevel, setDeletingLevel] = useState<GroupedLevel | null>(null);

  const handleGetParentSuggestions = async (level: GroupedLevel) => {
    setLoadingSuggestions(true);
    setSuggestionsError(null);
    setSelectedLevelForAI(level);
    setShowParentSuggestionsModal(true);

    try {
      const suggestions = await getSuggestedParents(
        level.name,
        level.parents,
        availableParents
      );
      setSuggestedParents(suggestions);
      if (suggestions.length === 0) {
        setSuggestionsError('No additional parent suggestions found for this level.');
      }
    } catch (error) {
      console.error('Error getting parent suggestions:', error);
      setSuggestionsError(
        error.code === 'not-found' 
          ? 'No additional parent suggestions found for this level.'
          : 'Failed to get AI suggestions. Please try again.'
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSaveNewParents = async (newParentIds: string[]) => {
    if (!selectedLevelForAI) return;

    try {
      const docRef = doc(db, `level${selectedLevelForAI.level}`, selectedLevelForAI.id);
      const existingParentIds = selectedLevelForAI.parents.map(p => p.id);
      const updatedParentIds = [...new Set([...existingParentIds, ...newParentIds])];
      
      await updateDoc(docRef, { 
        parentIds: updatedParentIds
      });

      // Update local state
      const newParents = availableParents.filter(p => newParentIds.includes(p.id));
      setGroupedLevels(prevLevels =>
        prevLevels.map(level =>
          level.id === selectedLevelForAI.id
            ? { ...level, parents: [...level.parents, ...newParents] }
            : level
        )
      );

      setShowParentSuggestionsModal(false);
      setSelectedLevelForAI(null);
    } catch (error) {
      console.error('Error saving new parents:', error);
      setSuggestionsError('Failed to save new parents. Please try again.');
    }
  };

  const handleImageSelect = async (url: string, levelId: string) => {
    try {
      const docRef = doc(db, `level${currentLevel}`, levelId);
      await updateDoc(docRef, { image: url });
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  };

  const isMaxLevel = useMemo(() => currentLevel === maxLevel, [currentLevel, maxLevel]);

  useEffect(() => {
    getMaxLevel().then(level => setMaxLevel(level));
  }, []);

  useEffect(() => {
    // Reset filters when changing levels
    setSelectedLevelItems({});
    setShowVerified(false);
    setShowUnverified(false);
    setFilteredLevelItems({});
  }, [currentLevel]);

  // Update filtered level items when selections change
  useEffect(() => {
    const newFilteredItems: Record<number, Level[]> = { ...levelItems };

    // Process each level sequentially
    for (let level = 2; level <= currentLevel; level++) {
      const parentLevel = level - 1;
      const selectedParentIds = selectedLevelItems[parentLevel] || [];
      
      if (selectedParentIds.length > 0) {
        // Get all items at current level that have selected parents
        newFilteredItems[level] = levelItems[level]?.filter(item => {
          const itemParents = levelRelationships[item.id] || [];
          return itemParents.some(parentId => selectedParentIds.includes(parentId));
        }) || [];
      } else {
        // If no parent selected, show all items for this level
        newFilteredItems[level] = levelItems[level] || [];
      }
    }

    setFilteredLevelItems(newFilteredItems);
  }, [selectedLevelItems, levelItems, levelRelationships, currentLevel]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // Fetch items for all levels up to current level
        const newLevelItems: Record<number, Level[]> = {};
        const relationships: Record<string, string[]> = {};

        for (let i = 1; i <= currentLevel; i++) {
          const levelSnapshot = await getDocs(collection(db, `level${i}`));
          const levelData = levelSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            level: i
          })) as Level[];
          newLevelItems[i] = levelData;
          
          // Store parent-child relationships for each item
          levelData.forEach(item => {
            relationships[item.id] = item.parentIds || [];
          });
        }
        
        setLevelItems(newLevelItems);
        setLevelRelationships(relationships);

        if (isMaxLevel) {
          // For max level, show current level items without parents
          const currentLevelSnapshot = await getDocs(collection(db, `level${currentLevel}`));
          const items = currentLevelSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            level: currentLevel,
            isVerified: doc.data().isVerified,
            image: doc.data().image,
            parents: []
          }));
          setGroupedLevels(items);
        } else {
          const parentLevelSnapshot = await getDocs(collection(db, `level${currentLevel}`));
          const parentLevelItems = parentLevelSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            level: currentLevel
          })) as Level[];
          setAvailableParents(parentLevelItems); // Keep this for the edit modal

          const currentLevelSnapshot = await getDocs(collection(db, `level${currentLevel + 1}`));
          const currentLevelItems = currentLevelSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            level: currentLevel + 1
          })) as Level[];
        
          // Group items by name and combine their parents
          const groupedItems = currentLevelItems.reduce((acc, item) => {
            const existingItem = acc.find(i => i.name === item.name);
            const itemParents = parentLevelItems.filter(parent => item.parentIds.includes(parent.id));
            
            if (existingItem) {
              // Merge parents without duplicates
              existingItem.parents = [...new Set([...existingItem.parents, ...itemParents])];
            } else {
              acc.push({
                id: item.id,
                name: item.name,
                level: item.level,
                isVerified: item.isVerified,
                image: item.image,
                parents: itemParents
              });
            }
            return acc;
          }, [] as GroupedLevel[]);

          setGroupedLevels(groupedItems);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLevel, isMaxLevel]);

  const handleEdit = (level: GroupedLevel) => {
    setEditingLevel(level);
  };

  const handleDelete = async (id: string) => {
    try {
      // Delete from the correct level collection
      const collectionName = isMaxLevel ? `level${currentLevel}` : `level${currentLevel + 1}`;
      await deleteDoc(doc(db, collectionName, id));
      
      // Update local state
      setGroupedLevels(prevLevels => prevLevels.filter(level => level.id !== id));
    } catch (error) {
      console.error('Error deleting level:', error);
      throw new Error('Failed to delete level');
    } finally {
      setDeletingLevel(null);
    }
  };

  const handleSaveEdit = async (newName: string, parentIds: string[]) => {
    if (!editingLevel) return;

    try {
      const docRef = doc(db, `level${editingLevel.level}`, editingLevel.id);
      await updateDoc(docRef, { 
        name: newName,
        parentIds: parentIds
      });
      
      setGroupedLevels(prevLevels =>
        prevLevels.map(level =>
          level.id === editingLevel.id ? { 
            ...level, 
            name: newName,
            parents: availableParents.filter(p => parentIds.includes(p.id))
          } : level
        )
      );
    } catch (error) {
      console.error('Error updating level:', error);
      throw error;
    }
  };

  const handleToggleVerification = async (level: GroupedLevel) => {
    try {
      const docRef = doc(db, `level${level.level}`, level.id);
      await updateDoc(docRef, {
        isVerified: !level.isVerified
      });
      
      // Update local state
      setGroupedLevels(prevLevels => 
        prevLevels.map(l => 
          l.id === level.id ? { ...l, isVerified: !l.isVerified } : l
        )
      );
    } catch (error) {
      console.error('Error toggling verification:', error);
      alert('Failed to update verification status');
    }
  };

  const handleVerifiedChange = (checked: boolean) => {
    setShowVerified(checked);
    if (checked) {
      setShowUnverified(false);
    }
  };

  const handleUnverifiedChange = (checked: boolean) => {
    setShowUnverified(checked);
    if (checked) {
      setShowVerified(false);
    }
  };

  const filteredLevels = useMemo(() => {
    let filtered = groupedLevels;
    
    // Get selected items for current level
    const selectedIds = selectedLevelItems[currentLevel] || [];
    
    // Helper function to get all ancestors of an item up to a specific level
    const getAncestors = (itemId: string, targetLevel: number): Set<string> => {
      const ancestors = new Set<string>();
      const visited = new Set<string>();
      
      const traverse = (currentId: string, currentLevel: number) => {
        if (visited.has(currentId) || currentLevel < targetLevel) return;
        visited.add(currentId);
        
        const parentIds = levelRelationships[currentId] || [];
        parentIds.forEach(parentId => {
          const parent = Object.values(levelItems)
            .flat()
            .find(item => item.id === parentId);
            
          if (parent && parent.level === targetLevel) {
            ancestors.add(parentId);
          }
          traverse(parentId, parent?.level || 0);
        });
      };
      
      traverse(itemId, currentLevel);
      return ancestors;
    };
    const selectedNames = selectedIds.map(id => 
      levelItems[currentLevel]?.find(item => item.id === id)?.name || ''
    ).filter(Boolean);
    
    // Get all items at the current level
    filtered = groupedLevels;
    
    // Only apply set operations if we have selected items and an operation
    if (selectedOperation && selectedIds.length > 0) {
      const selectedParentNames = selectedIds.map(id => 
        levelItems[currentLevel]?.find(item => item.id === id)?.name || ''
      ).filter(Boolean);
      
      filtered = groupedLevels.filter(level => {
        const levelParentNames = level.parents.map(p => p.name);
        return performSetOperation(selectedOperation, selectedParentNames, levelParentNames);
      });
    } else if (selectedIds.length > 0) {
      // Default behavior - show items with any selected parent
      filtered = filtered.filter(level =>
        level.parents.some(parent => selectedIds.includes(parent.id))
      );
    }

    // Apply filters for each level
    Object.entries(selectedLevelItems).forEach(([levelStr, selectedIds]) => {
      const level = parseInt(levelStr);
      if (selectedIds.length > 0) {
        filtered = filtered.filter(item => {
          if (level === currentLevel) {
            // For current level, check direct matches
            if (isMaxLevel) {
              return selectedIds.includes(item.id);
            }
            return item.parents.some(parent => selectedIds.includes(parent.id));
          } else if (level < currentLevel) {
            // For previous levels, check ancestors
            const ancestors = new Set();
            item.parents.forEach(parent => {
              getAncestors(parent.id, level).forEach(id => ancestors.add(id));
            });
            return selectedIds.some(id => ancestors.has(id));
          }
          return true;
        });
      }
    });

    // Apply verification filters after level filtering
    if ((showVerified || showUnverified) && filtered.length > 0) {
      filtered = filtered.filter(level => 
        (showVerified && level.isVerified) || (showUnverified && !level.isVerified)
      );
    }
    
    // Set appropriate message when no records are found
    if (filtered.length === 0 && (showVerified || showUnverified)) {
      setNoRecordsMessage(
        showVerified ? 'No verified records found' :
        showUnverified ? 'No unverified records found' :
        'No records found'
      );
    } else if (filtered.length === 0) {
      setNoRecordsMessage('No records found');
    }
    else {
      setNoRecordsMessage('');
    }
    
    return filtered;
  }, [groupedLevels, showVerified, showUnverified, selectedLevelItems, currentLevel, levelRelationships, isMaxLevel, levelItems, selectedOperation]);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold hidden">L{currentLevel + 1} Mapping</h2>
            <h2 className="text-lg font-semibold text-gray-500">
              {isMaxLevel 
                ? `Showing L${currentLevel} items`
                : `Showing L${currentLevel + 1} to L${currentLevel} relationships`}
            </h2>
          </div>
        </div>
        
        <LevelFilters
          currentLevel={currentLevel}
          maxLevel={maxLevel}
          showVerified={showVerified}
          showUnverified={showUnverified}
          filteredLevelItems={filteredLevelItems}
          onVerifiedChange={handleVerifiedChange}
          onUnverifiedChange={handleUnverifiedChange}
          levelItems={levelItems}
          selectedLevelItems={selectedLevelItems}
          onLevelItemsChange={(level: number, items: string[]) => {
            if (level === currentLevel) {
              // Reset set operation when changing current level filter
              setSelectedOperation(null);
            }
            setSelectedLevelItems(prev => ({ ...prev, [level]: items }));
          }}
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
            <div key={level.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                {level.image ? (
                  <img 
                    src={level.image} 
                    alt={level.name}
                    className="w-8 h-8 object-cover rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMiAyMmM1LjUyMyAwIDEwLTQuNDc3IDEwLTEwUzE3LjUyMyAyIDEyIDIgMiA2LjQ3NyAyIDEyczQuNDc3IDEwIDEwIDEweiIvPjxwYXRoIGQ9Ik0xMiAxNmEzIDMgMCAxIDAgMC02IDMgMyAwIDAgMCAwIDZ6Ii8+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                    <Bot className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{level.name}</h3>
                  <p className="text-sm text-gray-500">Level {currentLevel + 1}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {level.parents.map((parent) => (
                  <div key={parent.id} className="inline-flex items-center px-3 py-1 bg-[rgb(255,127,80)] text-white rounded-full">
                    <span className="text-sm font-medium">{parent.name}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-end mt-4 space-x-2">
                <button
                  onClick={() => handleToggleVerification(level)}
                  className={`inline-flex items-center p-1.5 hover:bg-gray-100 rounded-full transition-colors mr-2 ${
                    level.isVerified ? 'text-coral-600' : 'text-gray-400'
                  }`}
                  title="Verify"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                    {level.isVerified && <path d="m9 12 2 2 4-4"/>}
                  </svg>
                  <span className="ml-1 text-sm">{level.isVerified ? 'Verified' : 'Verify'}</span>
                </button>
                {!isMaxLevel && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleGetParentSuggestions(level)}
                      className={`inline-flex items-center p-1.5 hover:bg-gray-100 rounded-full text-gray-400 ${
                        level.isVerified ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={level.isVerified}
                      title={level.isVerified ? 'Cannot get suggestions for verified records' : 'Get AI suggestions for parent levels'}
                    >
                      <Bot className="w-5 h-5" />
                      <span className="ml-1 text-sm">AI (Sugg)</span>
                    </button>
                    <button
                      onClick={() => handleEdit(level)}
                      className={`p-1.5 rounded-full transition-colors ${
                        level.isVerified 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      disabled={level.isVerified}
                      title={level.isVerified ? 'Cannot edit verified records' : 'Edit'}
                    >
                      <Edit2 className={`w-5 h-5 ${level.isVerified ? 'text-gray-400' : 'text-gray-500'}`} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setDeletingLevel(level)}
                  className={`p-1.5 rounded-full transition-colors ${
                    level.isVerified 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  disabled={level.isVerified}
                  title={level.isVerified ? 'Cannot delete verified records' : 'Delete'}>
                  <Trash2 className={`w-5 h-5 ${level.isVerified ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <FloatingAIButton
        levelName={selectedLevelForAI?.name || ''}
        onImageSelect={(url) => selectedLevelForAI && handleImageSelect(url, selectedLevelForAI.id)} 
      />
      
      {showAIModal && selectedLevelForAI && (
        <AIImageModal
          isOpen={showAIModal}
          onClose={() => {
            setShowAIModal(false);
            setSelectedLevelForAI(null);
          }}
          onImageSelect={(url) => handleImageSelect(url, selectedLevelForAI.id)}
          levelName={selectedLevelForAI.name}
        />
      )}
      
      {showParentSuggestionsModal && selectedLevelForAI && (
        <AIParentSuggestionsModal
          isOpen={showParentSuggestionsModal}
          onClose={() => {
            setShowParentSuggestionsModal(false);
            setSelectedLevelForAI(null);
            setSuggestedParents([]);
            setSuggestionsError(null);
          }}
          onSave={handleSaveNewParents}
          suggestedParents={suggestedParents}
          loading={loadingSuggestions}
          error={suggestionsError}
        />
      )}
      
      {editingLevel && (
        <EditLevelModal
          isOpen={true}
          onClose={() => setEditingLevel(null)}
          onSave={handleSaveEdit}
          currentName={editingLevel.name}
          parents={editingLevel.parents}
          availableParents={availableParents}
        />
      )}
      
      {deletingLevel && (
        <DeleteModal
          isOpen={true}
          onClose={() => setDeletingLevel(null)} 
          onConfirm={() => handleDelete(deletingLevel.id)} 
        />
      )}
    </div>
  );
}