import React, { useState, useRef } from 'react';
import { uploadOrdersFile } from '@/lib/api';

interface FileUploaderProps {
  onFileUploaded: (success: boolean, message: string) => void;
}

export function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      handleFile(file);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      handleFile(file);
    }
  };
  
  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      onFileUploaded(false, 'Please upload a JSON file');
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await uploadOrdersFile(file);
      onFileUploaded(result.success, result.message);
      if (result.success) {
        setFileName(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      onFileUploaded(false, 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
        <h3 className="text-lg font-medium text-yellow-700 dark:text-yellow-400">
          Upload Orders
        </h3>
      </div>
      <div className="p-4">
        <div 
          className={`max-w-full mx-auto border-2 border-dashed rounded-lg p-6 text-center
            ${dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
            ${isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden" 
            disabled={isUploading}
          />
          
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {fileName ? (
              <p className="font-semibold">Selected: {fileName}</p>
            ) : (
              <>
                <p className="font-medium">Drag and drop your orders.json file here</p>
                <p className="text-xs mt-1">or click to select a file</p>
              </>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-blue-500 border-blue-500/20"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>Upload your orders.json file to process with the trading engine.</p>
        </div>
      </div>
    </div>
  );
} 