// src/components/profile/ImageUploadField.jsx
import { useState, useRef } from 'react';
import { Button, Spinner } from '@heroui/react';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import contentApi from '../../api/contentApi';

export default function ImageUploadField({ value, onChange, disabled }) {
  const [preview, setPreview] = useState(value?.secureUrl || null);
  const [contentId, setContentId] = useState(value?.id || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File too large (max 10MB)');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Show local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Upload
      const contentDto = await contentApi.uploadImage(file);
      
      setPreview(contentDto.secureUrl);
      setContentId(contentDto.id);
      onChange({ id: contentDto.id, secureUrl: contentDto.secureUrl });
    } catch (err) {
      setError(err.message || 'Upload failed');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setContentId(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Uploaded"
            className="w-32 h-32 object-cover rounded-lg border"
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <Button
          variant="bordered"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || isUploading}
          startContent={isUploading ? <Spinner size="sm" /> : <CloudArrowUpIcon className="w-4 h-4" />}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}