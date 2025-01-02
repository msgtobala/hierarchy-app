import React, { useState, useEffect } from 'react';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileInput } from './FileInput';
import { Level } from '../types';
import { MultiSelect } from './MultiSelect';
import { processAndUploadImage } from '../lib/imageUtils';
import { useLevelData } from '../hooks/useLevelData';
import { findExistingLevel } from '../lib/levelUtils';
import { ErrorPopup } from './ErrorPopup';
import { Snackbar } from './Snackbar';
import { useRef } from 'react';

interface LevelFormProps {
  level: number;
}

export function LevelForm({ level }: LevelFormProps) {
  const [name, setName] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const fileInputRef = useRef<{ reset: () => void }>(null);
  const [selectedFile, setSelectedFile] = useState<{ file: File | null; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { parentLevels } = useLevelData(level);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileSelect = (fileInfo: { file: File | null; preview: string } | null) => {
    setSelectedFile(fileInfo);
    if (error === 'Please upload an image before adding the level') {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!selectedFile) {
        setError('Please upload an image before adding the level');
        setIsSubmitting(false);
        return;
      }

      // Process and upload image
      const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const timestamp = Date.now();
      const path = `levels/level${level}/${timestamp}_${sanitizedName}.png`;

      const imageUrl = await processAndUploadImage(selectedFile, path);
      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Check if an item with this name already exists
      const existingLevel = await findExistingLevel(level, name);

      if (existingLevel) {
        // Update existing level with additional parentIds
        const updatedParentIds = [...new Set([...existingLevel.parentIds, ...selectedParents])];
        await updateDoc(doc(db, `level${level}`, existingLevel.id), {
          parentIds: updatedParentIds,
          image: imageUrl
        });
      } else {
        // Create new level
        const levelData = {
          name,
          parentIds: selectedParents,
          isVerified: false, // Set initial verification status to false
          image: imageUrl,
          level,
        };

        const docRef = await addDoc(collection(db, `level${level}`), levelData);
        await updateDoc(docRef, {
          id: docRef.id
        });
      }

      setSuccess(`Added to Level ${level} successfully`);
      setName('');
      setSelectedParents([]);
      fileInputRef.current?.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error('Level form error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}
      {success && <Snackbar message={success} onClose={() => setSuccess(null)} />}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name <span className="text-coral-500">(required)</span>
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-coral-500 focus:ring-coral-500 focus:ring-opacity-50 transition duration-200"
            placeholder="Enter level name"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-400 text-sm">Required</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Enter a unique name for this level
        </p>
      </div>

      <FileInput 
        label="Upload Icon" 
        required 
        levelName={name}
        ref={fileInputRef}
        onFileSelect={handleFileSelect} />

      {level > 1 && (
        <MultiSelect
          label={`L${level - 1} Levels`}
          options={parentLevels}
          value={selectedParents}
          onChange={setSelectedParents}
          required
          className="relative z-[1]"
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Adding...
          </>
        ) : (
          `Add to L${level}`
        )}
      </button>
    </form>
  );
}