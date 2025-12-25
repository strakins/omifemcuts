'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Upload, X} from 'lucide-react';
import toast from 'react-hot-toast';

const styleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['casual', 'official', 'traditional', 'party', 'native']),
  priceWithoutFabrics: z.string().optional(),
  priceWithFabrics: z.string().optional(),
  deliveryTime: z.string().optional(),
  tags: z.string().optional(),
});

type StyleFormData = z.infer<typeof styleSchema>;

interface StyleUploadFormProps {
  onUploadComplete: () => void;
}

export default function StyleUploadForm({ onUploadComplete }: StyleUploadFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StyleFormData>({
    resolver: zodResolver(styleSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'omifemcuts'); // Optional: organize in folder

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `Upload failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  };

  // Alternative: Upload to Firebase Storage
  const uploadToFirebase = async (file: File): Promise<string> => {
    try {
      // This requires Firebase Storage setup
      // For now, we'll use a placeholder
      return 'https://via.placeholder.com/600x800?text=Style+Image';
    } catch (error) {
      throw new Error('Firebase Storage upload failed');
    }
  };

  const onSubmit = async (data: StyleFormData) => {
    if (!imageFile) {
      toast.error('Please select an image');
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string;

      // Try Cloudinary first, fallback to Firebase/placeholder
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        imageUrl = await uploadToCloudinary(imageFile);
      } else {
        // Use placeholder or Firebase Storage
        imageUrl = await uploadToFirebase(imageFile);
      }

      // Prepare style data
      const styleData = {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl,
        priceWithoutFabrics: data.priceWithoutFabrics,
        priceWithFabrics : data.priceWithFabrics,
        deliveryTime: data.deliveryTime || '7-14 days',
        likes: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'upload' as const,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      // Save to Firestore
      await addDoc(collection(db, 'styles'), styleData);

      toast.success('Style uploaded successfully!');
      reset();
      setImageFile(null);
      setImagePreview('');
      onUploadComplete();
    } catch (error: any) {
      console.error('Error uploading style:', error);
      toast.error(`Failed to upload style: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Style</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style Image *
          </label>
          <div className="mt-1">
            {imagePreview ? (
              <div className="relative">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto max-h-64 object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            type="text"
            {...register('title')}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter style title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            rows={3}
            {...register('description')}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe this style..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Category and Delivery Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              {...register('category')}
              className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              <option value="casual">Casual Wear</option>
              <option value="official">Official Wear</option>
              <option value="traditional">Traditional Wear</option>
              <option value="party">Party Wear</option>
              <option value="native">Native Wear</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Time
            </label>
            <input
              type="text"
              {...register('deliveryTime')}
              placeholder="e.g., 7-10 days"
              className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prices (₦) 
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                {...register('priceWithoutFabrics')}
                placeholder="Price Without Fabrics"
                className="block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <input
                type="number"
                {...register('priceWithFabrics')}
                placeholder="Price With Fabrics"
                className="block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags (comma separated) - Optional
          </label>
          <input
            type="text"
            {...register('tags')}
            placeholder="e.g., agbada, suit, ankara, wedding"
            className="mt-1 block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Separate tags with commas
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              'Upload Style'
            )}
          </button>
          {!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && (
            <p className="mt-2 text-sm text-yellow-600 text-center">
              Note: Using placeholder image. Configure Cloudinary for actual image upload.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}