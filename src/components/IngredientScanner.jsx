import React, { useState, useRef } from 'react';
import { simulateOCRProcessing } from '../utils/demoOCR';

const IngredientScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setIsScanning(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      // Process image with OCR
      await performOCR(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const performOCR = async (file) => {
    try {
      const result = await simulateOCRProcessing(file);
      
      if (result.success) {
        onScanComplete(result.text);
      } else {
        throw new Error(result.error || 'OCR processing failed');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try again.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetScanner = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <h2>Scan Ingredient Label</h2>
      
      <div 
        className={`scan-area ${dragActive ? 'dragover' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isScanning ? (
          <div>
            <div className="loading"></div>
            <p>Processing image...</p>
          </div>
        ) : previewImage ? (
          <div>
            <img src={previewImage} alt="Preview" className="preview-image" />
            <p>Click to scan another image</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
            <p>Click to upload an image or drag & drop here</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Supports JPG, PNG, GIF formats
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        accept="image/*"
        onChange={handleFileInputChange}
      />

      {previewImage && !isScanning && (
        <div style={{ marginTop: '16px' }}>
          <button onClick={resetScanner} className="button">
            Scan Different Image
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Tips for best results:</strong></p>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Ensure the ingredients list is clearly visible</li>
          <li>Good lighting helps improve text recognition</li>
          <li>Avoid shadows or glare on the label</li>
          <li>Hold the camera steady when taking the photo</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#fff3cd', borderRadius: '8px', fontSize: '14px' }}>
        <p><strong>Demo Mode:</strong> This demo uses simulated OCR results. In a production version, this would connect to Google Cloud Vision API for real text extraction from your images.</p>
      </div>
    </div>
  );
};

export default IngredientScanner;
