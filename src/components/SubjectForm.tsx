import React, { useState, useEffect } from 'react';
import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileInput } from './FileInput';
import { Level } from '../types';

export function SubjectForm() {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<Level[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Level[];
        setCategories(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subjects'), {
        name,
        parentIds: selectedCategories,
        isVerified: false,
        image: '',
      });
      setName('');
      setSelectedCategories([]);
    } catch (error) {
      console.error('Error adding subject:', error);
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
          Categories
        </label>
        <select
          multiple
          value={selectedCategories}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedCategories(selected);
          }}
          className="mt-1 block w-full rounded-md border-coral-300 shadow-sm focus:border-coral-500 focus:ring-coral-500"
        >
          {categories.map((category) => (
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