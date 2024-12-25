import React, { useState } from 'react';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileInput } from './FileInput';

export function SuperCategoryForm() {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const q = query(collection(db, 'superCategories'), where('name', '==', name));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        alert('A super category with this name already exists');
        return;
      }

      await addDoc(collection(db, 'superCategories'), {
        name,
        isVerified: false,
        image: '',
      });
      setName('');
    } catch (error) {
      console.error('Error adding super category:', error);
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

      <button
        type="submit"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500"
      >
        Add
      </button>
    </form>
  );
}