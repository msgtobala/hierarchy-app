import React from 'react';
import { Bot } from 'lucide-react';

interface FileInputProps {
  label: string;
  required?: boolean;
}

export function FileInput({ label, required }: FileInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-coral-500">(required)</span>}
      </label>
      <div className="mt-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">File</span>
          <button
            type="button"
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Choose Files
          </button>
          <span className="text-sm text-gray-500">0 File</span>
        </div>
        <div className="text-center">
          <span className="text-sm text-gray-500">Or</span>
        </div>
        <button
          type="button"
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
        >
          <Bot className="w-5 h-5 mr-2" />
          AI (Sugg)
        </button>
      </div>
    </div>
  );
}