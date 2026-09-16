import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import api from '../../api/client';

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Cloudinary Multi-Image Management Component for Studio Admin
 * Supports drag-and-drop, validation, preview, reordering, primary selection, and removal.
 */
export const ProductImageUploader = ({
  images = [],
  onChange,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Validate and upload files
  const handleFiles = async (fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadError(null);

    // 1. Validate max number of images
    if (images.length + files.length > MAX_IMAGES) {
      setUploadError(`Maximum ${MAX_IMAGES} images allowed per product. Currently have ${images.length}.`);
      return;
    }

    // 2. Validate file types & sizes
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        setUploadError(`"${file.name}" is not a supported image format. Only JPEG, PNG, WebP, and AVIF are allowed.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
        return;
      }
    }

    // 3. Upload to backend
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedList = res?.data || res || [];
      if (!Array.isArray(uploadedList)) {
        throw new Error('Unexpected response format from upload server.');
      }

      // Combine with existing images
      const nextImages = [...images, ...uploadedList];

      // Ensure at least one primary image exists
      const hasPrimary = nextImages.some((img) => img.isPrimary);
      if (!hasPrimary && nextImages.length > 0) {
        nextImages[0].isPrimary = true;
      }

      onChange(nextImages);
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError(err.message || 'Failed to upload images to cloud storage. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!disabled && !uploading && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Set selected image as primary cover
  const handleSetPrimary = (index) => {
    const nextImages = images.map((img, idx) => ({
      ...img,
      isPrimary: idx === index,
    }));
    onChange(nextImages);
  };

  // Remove image
  const handleRemove = async (index) => {
    const target = images[index];
    const nextImages = images.filter((_, idx) => idx !== index);

    // If removed image was primary, make the first remaining image primary
    if (target.isPrimary && nextImages.length > 0) {
      nextImages[0].isPrimary = true;
    }

    onChange(nextImages);

    // Asynchronously notify cloud storage to remove image if it has a publicId
    if (target.publicId) {
      try {
        await api.delete('/upload/images', { data: { publicId: target.publicId } });
      } catch (err) {
        console.warn('Could not remove image from cloud:', err.message);
      }
    }
  };

  // Reorder images (move left/up)
  const handleMoveLeft = (index) => {
    if (index === 0) return;
    const nextImages = [...images];
    const temp = nextImages[index - 1];
    nextImages[index - 1] = nextImages[index];
    nextImages[index] = temp;
    onChange(nextImages);
  };

  // Reorder images (move right/down)
  const handleMoveRight = (index) => {
    if (index === images.length - 1) return;
    const nextImages = [...images];
    const temp = nextImages[index + 1];
    nextImages[index + 1] = nextImages[index];
    nextImages[index] = temp;
    onChange(nextImages);
  };

  // Update alt text
  const handleAltChange = (index, newAlt) => {
    const nextImages = images.map((img, idx) => {
      if (idx === index) {
        return { ...img, alt: newAlt };
      }
      return img;
    });
    onChange(nextImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-artisan-earthBrown uppercase tracking-wider">
          Product Images ({images.length} / {MAX_IMAGES})
        </label>
        <span className="text-[11px] text-artisan-softBrown">
          JPEG, PNG, WebP, AVIF &bull; Up to 5MB each
        </span>
      </div>

      {/* Upload Dropzone */}
      {images.length < MAX_IMAGES && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-artisan-terracotta bg-artisan-terracotta/5 scale-[1.01]'
              : 'border-artisan-heather hover:border-artisan-softBrown bg-artisan-cream/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ALLOWED_TYPES.join(',')}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={disabled || uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-8 h-8 text-artisan-terracotta animate-spin" />
                <span className="text-xs font-semibold text-artisan-earthBrown">
                  Streaming images to Cloudinary...
                </span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-artisan-sandstone/60 flex items-center justify-center text-artisan-terracotta">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-artisan-earthBrown">
                    Click to browse or drag & drop product photos
                  </p>
                  <p className="text-[11px] text-artisan-softBrown">
                    Upload multiple angles, stitch close-ups, and yarn textures
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Image Previews & Management Grid */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-artisan-softBrown font-medium">
            Use the arrows to reorder. Click ★ to select the primary cover image.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, index) => {
              const isPrimary = !!img.isPrimary || index === 0;

              return (
                <div
                  key={img.publicId || img.url || index}
                  className={`group relative rounded-2xl overflow-hidden border bg-white flex flex-col justify-between transition-all ${
                    isPrimary
                      ? 'border-artisan-terracotta ring-2 ring-artisan-terracotta/30 shadow-subtle'
                      : 'border-artisan-heather hover:border-artisan-softBrown'
                  }`}
                >
                  {/* Image Frame */}
                  <div className="relative aspect-[4/3] bg-artisan-cream overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.alt || `Product Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Primary Badge */}
                    {isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-artisan-terracotta text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                        <span>Primary</span>
                      </div>
                    )}

                    {/* Quick Action Overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition shadow-xs"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Controls & Alt Text */}
                  <div className="p-2 space-y-1.5 bg-artisan-cream/50 text-xs">
                    {/* Make Primary & Reorder Buttons */}
                    <div className="flex items-center justify-between gap-1">
                      {!isPrimary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="text-[10px] font-bold text-artisan-terracotta hover:underline flex items-center gap-1"
                          title="Set as primary catalog cover"
                        >
                          <Star className="w-3 h-3" />
                          <span>Make Cover</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-artisan-softBrown">
                          Cover Photo
                        </span>
                      )}

                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleMoveLeft(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-artisan-sandstone disabled:opacity-30 transition"
                          title="Move left"
                          aria-label="Move image left"
                        >
                          <ArrowLeft className="w-3 h-3 text-artisan-earthBrown" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRight(index)}
                          disabled={index === images.length - 1}
                          className="p-1 rounded hover:bg-artisan-sandstone disabled:opacity-30 transition"
                          title="Move right"
                          aria-label="Move image right"
                        >
                          <ArrowRight className="w-3 h-3 text-artisan-earthBrown" />
                        </button>
                      </div>
                    </div>

                    {/* Alt Input */}
                    <input
                      type="text"
                      value={img.alt || ''}
                      onChange={(e) => handleAltChange(index, e.target.value)}
                      placeholder="Alt description..."
                      className="w-full px-2 py-1 text-[10px] rounded-lg border border-artisan-heather bg-white text-artisan-earthBrown placeholder:text-artisan-softBrown/60 focus:outline-none focus:border-artisan-terracotta"
                      title="Accessible image description"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageUploader;
