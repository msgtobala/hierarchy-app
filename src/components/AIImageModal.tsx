import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { generateImages } from '../lib/imageGeneration';
import { ImageShimmer } from './ImageShimmer';

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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

  const handleImageSelect = async (url: string, index: number) => {
    setSelectedImageIndex(index);
    try {
      await onImageSelect(url);
      onClose();
    } catch (error) {
      console.error('Error downloading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to download selected image');
      setSelectedImageIndex(null);
    }
  };
  React.useEffect(() => {
    if (isOpen && levelName) {
      handleGenerateImages();
    }
    return () => {
      // Cleanup images when modal closes
      setImages([]);
      setSelectedImageIndex(null);
    };
  }, [isOpen]);

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
                    className={`relative group cursor-pointer ${
                      selectedImageIndex === index ? 'ring-2 ring-[rgb(255,127,80)]' : ''
                    }`}
                    onClick={() => handleImageSelect(url, index)}
                  >
                    <div className="relative w-full h-48">
                      <ImageShimmer />
                      <img 
                        src={url} 
                        alt={`Generated image ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0 transition-opacity duration-300"
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.classList.remove('opacity-0');
                        }}
                      />
                    </div>
                    <div className={`absolute inset-0 bg-black ${
                      selectedImageIndex === index ? 'bg-opacity-5' : 'bg-opacity-0 group-hover:bg-opacity-10'
                    } transition-all duration-200 rounded-lg`} />
                    <button
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <span className="bg-[rgb(255,127,80)] text-white px-4 py-2 rounded-full text-sm font-medium">
                        {selectedImageIndex === index ? 'Selected' : 'Select Image'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}