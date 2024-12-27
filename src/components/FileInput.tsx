import React from 'react';
import { Bot } from 'lucide-react';
import { AIImageModal } from './AIImageModal';

interface FileInputHandle {
  reset: () => void;
}

interface FileInputProps {
  label: string;
  required?: boolean;
  levelName?: string;
  onFileSelect: (fileInfo: { file: File; preview: string } | null) => void;
}

export const FileInput = React.forwardRef<FileInputHandle, FileInputProps>(function FileInput(
  { label, required, levelName, onFileSelect }, 
  ref
) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showAIModal, setShowAIModal] = React.useState(false);

  const handleAIImageSelect = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
      const preview = URL.createObjectURL(file);
      
      setSelectedFile({ file, preview });
      onFileSelect({ file, preview });
      setShowAIModal(false);
    } catch (err) {
      setError('Failed to load AI generated image');
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedFile(null);
    onFileSelect(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please select a valid image file (JPG, JPEG, or PNG)');
      resetFileInput();
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      resetFileInput();
      return;
    }

    const preview = URL.createObjectURL(file);
    const fileInfo = { file, preview };
    setSelectedFile(fileInfo);
    onFileSelect(fileInfo);
    setError(null);
  };

  React.useEffect(() => {
    return () => {
      // Cleanup preview URL when component unmounts
      if (selectedFile?.preview) {
        URL.revokeObjectURL(selectedFile.preview);
      }
    };
  }, [selectedFile]);

  // Expose reset method to parent
  React.useImperativeHandle(ref, () => ({
    reset: resetFileInput
  }));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-coral-500">(required)</span>}
      </label>
      <div className="mt-1 space-y-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 flex items-center space-x-2 transition duration-200"
            >
              <span>Choose Image</span>
            </button>
            {selectedFile && (
              <div className="flex items-center space-x-2">
                <img src={selectedFile.preview} alt="Preview" className="w-8 h-8 rounded object-cover" />
                <span className="text-sm text-gray-600">1 image selected</span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500">JPG, JPEG, PNG (max 5MB)</span>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
        <div className="text-center">
          <span className="text-sm text-gray-500">Or</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAIModal(true)}
          disabled={!levelName}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition duration-200"
        >
          <Bot className="w-5 h-5 mr-2" />
          AI (Sugg)
        </button>
        {!levelName && (
          <p className="text-xs text-gray-500 text-center mt-1">
            Enter a name first to enable AI suggestions
          </p>
        )}
      </div>
      
      {showAIModal && levelName && (
        <AIImageModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onImageSelect={handleAIImageSelect}
          levelName={levelName}
        />
      )}
    </div>
  );
});