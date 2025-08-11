import { useState, useRef } from "react";
import { Button } from "./button";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  onImageRemove: () => void;
  isRTL?: boolean;
}

export function ImageUpload({ currentImage, onImageChange, onImageRemove, isRTL = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      
      // Create a file reader to convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageChange(e.target.result as string);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Simulate camera capture (in a real app, this would open camera)
  const handleCameraCapture = () => {
    // For demo purposes, we'll use a placeholder
    const demoImages = [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f9ff'/%3E%3Ccircle cx='100' cy='80' r='30' fill='%23fbbf24'/%3E%3Ccircle cx='85' cy='75' r='3' fill='%23000'/%3E%3Ccircle cx='115' cy='75' r='3' fill='%23000'/%3E%3Cpath d='M85 95 Q100 105 115 95' stroke='%23000' stroke-width='2' fill='none'/%3E%3Ctext x='100' y='150' text-anchor='middle' font-family='Arial' font-size='14' fill='%23666'%3EDemo Photo%3C/text%3E%3C/svg%3E",
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23fef3c7'/%3E%3Ccircle cx='100' cy='80' r='30' fill='%23f87171'/%3E%3Ccircle cx='85' cy='75' r='3' fill='%23000'/%3E%3Ccircle cx='115' cy='75' r='3' fill='%23000'/%3E%3Cpath d='M85 95 Q100 105 115 95' stroke='%23000' stroke-width='2' fill='none'/%3E%3Ctext x='100' y='150' text-anchor='middle' font-family='Arial' font-size='14' fill='%23666'%3ESample Kid%3C/text%3E%3C/svg%3E"
    ];
    
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
    onImageChange(randomImage);
  };

  return (
    <div className="space-y-4">
      {/* Current Image Display */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-32 h-32 mx-auto"
          >
            <img
              src={currentImage}
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      {!currentImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="w-12 h-12 mx-auto">
                <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
              </div>
              <p className="text-gray-600">
                {isRTL ? "جاري تحميل الصورة..." : "Uploading image..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">
                  {isRTL ? "أضف صورتك" : "Add Your Photo"}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {isRTL 
                    ? "اسحب وأسقط صورة أو انقر للتحديد"
                    : "Drag & drop an image or click to select"
                  }
                </p>
              </div>

              <div className="flex justify-center space-x-2 rtl:space-x-reverse">
                <Button
                  type="button"
                  onClick={openFileDialog}
                  className="btn-fun bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isRTL ? "اختر صورة" : "Choose Image"}
                </Button>
                
                <Button
                  type="button"
                  onClick={handleCameraCapture}
                  className="btn-fun bg-green-500 hover:bg-green-600 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isRTL ? "كاميرا" : "Camera"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Image Actions */}
      {currentImage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-2 rtl:space-x-reverse"
        >
          <Button
            onClick={openFileDialog}
            variant="outline"
            className="btn-fun bg-white border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {isRTL ? "تغيير الصورة" : "Change Photo"}
          </Button>
        </motion.div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        {isRTL 
          ? "يُقبل: JPG, PNG, GIF (أقصى حجم: 5MB)"
          : "Supported: JPG, PNG, GIF (Max: 5MB)"
        }
      </p>
    </div>
  );
}
