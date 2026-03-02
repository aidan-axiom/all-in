"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExtractedBetData } from "@/lib/ocr-parser";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onExtracted?: (data: ExtractedBetData) => void;
}

export function ImageUpload({ value, onChange, onExtracted }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        onChange(data.url);

        // Trigger OCR scanning if callback provided
        if (onExtracted && data.url) {
          setIsScanning(true);
          try {
            const ocrResponse = await fetch("/api/ocr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: data.url }),
            });
            if (ocrResponse.ok) {
              const ocrData = await ocrResponse.json();
              onExtracted(ocrData.extracted);
              toast.success("Ticket scanned — review the pre-filled fields");
            } else {
              toast.warning("Could not scan ticket — fill in the fields manually");
            }
          } catch {
            toast.warning("Could not scan ticket — fill in the fields manually");
          } finally {
            setIsScanning(false);
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onExtracted]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
          <Image
            src={value}
            alt="Ticket image"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 448px"
          />
          {isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                Scanning ticket...
              </p>
            </div>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleRemove} disabled={isScanning}>
          Remove Image
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isUploading || isScanning ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
          <p className="text-sm text-muted-foreground">
            {isScanning ? "Scanning ticket..." : "Uploading..."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, or HEIC (max 10MB)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            Select Image
          </Button>
        </div>
      )}
      <Input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
