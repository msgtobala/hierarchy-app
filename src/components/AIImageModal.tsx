import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { generateImages } from '../lib/imageGeneration';

interface AIImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (url: string) => void;
  levelName: string;
}

export function AIImageModal({ isOpen, onClose, onImageSelect, levelName }: AIImageModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateImages = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const urls = await generateImages(levelName);
      setImages(urls);
    } catch (err: any) {
      setError(err.message || 'Failed to generate images');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && levelName) {
      handleGenerateImages();
    }
  }, [isOpen, levelName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">
              AI Generated Images for "{levelName}"
            </h3>

            {error && (
              <div className="mb-4 p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[rgb(255,127,80)]" />
                  <p className="text-sm text-gray-500">Generating images...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {images.map((url, index) => (
                  <div 
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => onImageSelect(url)}
                  >
                    <img 
                      src={url} 
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
                    <button
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <span className="bg-[rgb(255,127,80)] text-white px-4 py-2 rounded-full text-sm font-medium">
                        Select Image
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && images.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateImages}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[rgb(255,127,80)] hover:bg-[rgb(255,100,50)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(255,127,80)]"
                >
                  Generate More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}