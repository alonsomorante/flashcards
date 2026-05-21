import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      const maxWidth = 1024;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressed = canvas.toDataURL("image/jpeg", 0.7);
      resolve(compressed);
    };

    img.onerror = reject;
  });
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (imageFiles.length === 0) return;

      const remainingSlots = maxImages - images.length;
      const filesToProcess = imageFiles.slice(0, remainingSlots);

      if (filesToProcess.length === 0) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      const compressedImages = await Promise.all(
        filesToProcess.map(compressImage)
      );

      onImagesChange([...images, ...compressedImages].slice(0, maxImages));
    },
    [images, onImagesChange, maxImages]
  );

  const removeImage = useCallback(
    (index: number) => {
      onImagesChange(images.filter((_, i) => i !== index));
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? "border-primary/40 bg-primary/5"
            : "border-border hover:border-primary/30 hover:bg-cream-dark"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={24} className="mb-2 text-dark-muted/50" />
        <p className="text-sm text-dark-muted">
          Click to upload or drag images here
        </p>
        <p className="mt-1 text-xs text-dark-muted/60">
          Max {maxImages} images · JPEG/PNG
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((src, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
            >
              <img
                src={src}
                alt={`Page ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="cursor-pointer absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              >
                <X size={12} />
              </button>
              <div className="cursor-pointer absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
