"use client";

import { useEffect, useMemo, useState } from 'react';

interface ImageUploaderProps {
  imageFile: File | null;
  onFileChange: (file: File | null) => void;
  errorMessage?: string;
}

export default function ImageUploader({ imageFile, onFileChange, errorMessage }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const acceptedFileTypes = useMemo(() => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], []);

  return (
    <div className="image-uploader">
      <div className="image-uploader__preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Selected item preview" />
        ) : (
          <div className="image-uploader__placeholder">Select an image</div>
        )}
      </div>

      <div className="image-uploader__controls">
        <label className="image-upload-button">
          {imageFile ? 'Change image' : 'Upload image'}
          <input
            type="file"
            accept={acceptedFileTypes.join(',')}
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
        </label>

        {imageFile && (
          <button type="button" className="secondary-link" onClick={() => onFileChange(null)}>
            Remove image
          </button>
        )}
      </div>

      {errorMessage && <p className="validation-message">{errorMessage}</p>}
    </div>
  );
}
