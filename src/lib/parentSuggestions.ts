import { functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import { Level } from '../types';

export async function getSuggestedParents(
  currentLevelName: string,
  existingParents: Level[],
  allParentLevels: Level[]
): Promise<Level[]> {
  try {
    const suggestParentLevelsFn = httpsCallable(functions, 'suggestParentLevels');
    const result = await suggestParentLevelsFn({
      currentLevelName,
      existingParents: existingParents.map(p => p.name),
      allParentLevels: allParentLevels.map(p => p.name)
    });
    
    const suggestedNames = (result.data as { suggestedParents: string[] }).suggestedParents;
    
    // Filter allParentLevels to only include suggested parents that aren't already parents
    const existingParentIds = new Set(existingParents.map(p => p.id));
    return allParentLevels.filter(p => 
      suggestedNames.includes(p.name) && !existingParentIds.has(p.id)
    );
  } catch (error) {
    console.error('Parent suggestion error:', error);
    throw error;
  }
}