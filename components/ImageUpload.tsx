"use client";

import { Upload } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  previewUrl: string | null;
  dishName: string;
  onDishNameChange: (name: string) => void;
}

export function ImageUpload({ onImageSelect, previewUrl, dishName, onDishNameChange }: ImageUploadProps) {
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
          <Image
            src={previewUrl}
            alt="プレビュー"
            width={500}
            height={500}
            className="w-auto h-auto max-w-[300px] max-h-[300px] mx-auto rounded-lg object-contain"
          />
        </Card>
      )}

      <div className="mt-4">
        <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 mb-1">
          料理名（任意）
        </label>
        <input
          type="text"
          id="dishName"
          value={dishName}
          onChange={(e) => onDishNameChange(e.target.value)}
          placeholder="例：サラダ、カレーライスなど"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          ※画像認識が難しい場合の補助として使用されます
        </p>
      </div>
    </div>
  );
}