// Image upload service for company profiles
// This is a basic implementation that can be extended with cloud storage providers

export interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  quality?: number;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export class ImageUploadService {
  private defaultOptions: ImageUploadOptions = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    quality: 80,
  };

  // Validate image file
  validateImage(file: File, options?: ImageUploadOptions): void {
    const opts = { ...this.defaultOptions, ...options };

    if (!opts.allowedTypes?.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${opts.allowedTypes?.join(', ')}`);
    }

    if (file.size > (opts.maxSize || 0)) {
      throw new Error(`File too large. Maximum size: ${(opts.maxSize || 0) / 1024 / 1024}MB`);
    }
  }

  // Convert file to base64 for preview
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Resize image using canvas
  async resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to resize image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // Upload to Supabase Storage (if configured)
  async uploadToSupabase(
    file: File,
    bucket: string,
    path: string
  ): Promise<UploadResult> {
    try {
      // This would integrate with Supabase Storage
      // For now, we'll return a placeholder URL
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('path', path);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload company logo
  async uploadCompanyLogo(file: File, companyId: string): Promise<UploadResult> {
    this.validateImage(file, {
      maxSize: 2 * 1024 * 1024, // 2MB for logos
    });

    // Resize logo to standard size
    const resizedBlob = await this.resizeImage(file, 400, 400, 0.9);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });

    return this.uploadToSupabase(
      resizedFile,
      'company-assets',
      `logos/${companyId}/${Date.now()}-${file.name}`
    );
  }

  // Upload company banner
  async uploadCompanyBanner(file: File, companyId: string): Promise<UploadResult> {
    this.validateImage(file, {
      maxSize: 5 * 1024 * 1024, // 5MB for banners
    });

    // Resize banner to standard size
    const resizedBlob = await this.resizeImage(file, 1200, 400, 0.85);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });

    return this.uploadToSupabase(
      resizedFile,
      'company-assets',
      `banners/${companyId}/${Date.now()}-${file.name}`
    );
  }

  // Upload office photo
  async uploadOfficePhoto(file: File, companyId: string): Promise<UploadResult> {
    this.validateImage(file);

    // Resize office photo
    const resizedBlob = await this.resizeImage(file, 800, 600, 0.8);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });

    return this.uploadToSupabase(
      resizedFile,
      'company-assets',
      `offices/${companyId}/${Date.now()}-${file.name}`
    );
  }

  // Upload employee photo
  async uploadEmployeePhoto(file: File, companyId: string): Promise<UploadResult> {
    this.validateImage(file, {
      maxSize: 1 * 1024 * 1024, // 1MB for employee photos
    });

    // Resize employee photo to square
    const resizedBlob = await this.resizeImage(file, 300, 300, 0.9);
    const resizedFile = new File([resizedBlob], file.name, { type: file.type });

    return this.uploadToSupabase(
      resizedFile,
      'company-assets',
      `employees/${companyId}/${Date.now()}-${file.name}`
    );
  }

  // Generate optimized image variants
  async generateImageVariants(file: File): Promise<{
    thumbnail: Blob;
    medium: Blob;
    large: Blob;
  }> {
    const [thumbnail, medium, large] = await Promise.all([
      this.resizeImage(file, 150, 150, 0.8),
      this.resizeImage(file, 400, 400, 0.85),
      this.resizeImage(file, 800, 800, 0.9),
    ]);

    return { thumbnail, medium, large };
  }

  // Delete image from storage
  async deleteImage(url: string): Promise<void> {
    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete image');
    }
  }
}

// Export singleton instance
export const imageUploadService = new ImageUploadService();