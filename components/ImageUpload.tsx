"use client";

import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
}

export function ImageUpload({ onImageSelect, previewUrl }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? "ここにドロップしてください"
            : "クリックまたはドラッグ&ドロップで画像をアップロード"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          対応フォーマット: JPG, PNG
        </p>
      </div>

      {previewUrl && (
        <Card className="p-4">
          <img
            src={previewUrl}
            alt="プレビュー"
            className="max-h-[300px] mx-auto rounded-lg object-contain"
          />
        </Card>
      )}
    </div>
  );
}