import React, { useState, useEffect } from 'react';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileInput } from './FileInput';
import { Level } from '../types';

export function CategoryForm() {
  const [name, setName] = useState('');
  const [superCategories, setSuperCategories] = useState<Level[]>([]);
  const [selectedSuperCategories, setSelectedSuperCategories] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'superCategories'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Level[];
        setSuperCategories(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'categories'), {
        name,
        parentIds: selectedSuperCategories,
        isVerified: false,
        image: '',
      });
      setName('');
      setSelectedSuperCategories([]);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name <span className="text-coral-500">(required)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-coral-300 shadow-sm focus:border-coral-500 focus:ring-coral-500"
          required
        />
      </div>

      <FileInput label="Upload Icon" required />

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Super Categories
        </label>
        <select
          multiple
          value={selectedSuperCategories}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedSuperCategories(selected);
          }}
          className="mt-1 block w-full rounded-md border-coral-300 shadow-sm focus:border-coral-500 focus:ring-coral-500"
        >
          {superCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
      >
        Add
      </button>
    </form>
  );
}