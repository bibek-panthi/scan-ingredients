import React, { useState, useRef } from 'react';
import { simulateOCRProcessing, googleCloudVisionOCR } from '../utils/demoOCR';

const IngredientScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const fileInputRef = useRef(null);

  const performOCR = async (file) => {
    console.log('🔍 === OCR DEBUG START ===');
    
    // Check environment
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    console.log('🔑 Environment variables:', Object.keys(import.meta.env));
    console.log('🔑 API Key exists:', !!apiKey);
    console.log('🔑 API Key length:', apiKey ? apiKey.length : 0);
    console.log('🔑 API Key preview:', apiKey ? `${apiKey.substring(0, 12)}...` : 'NONE');
    
    if (!apiKey || apiKey === "demo-mode") {
      console.log('❌ USING DEMO MODE - NO API KEY FOUND');
      setOcrResult({ mode: 'DEMO', reason: 'No API key' });
      
      const result = await simulateOCRProcessing(file);
      console.log('📝 Demo result:', result);
      
      if (result.success) {
        onScanComplete(result.text);
      }
      return;
    }

    console.log('✅ USING REAL GOOGLE VISION API');
    setOcrResult({ mode: 'REAL_API', apiKeyLength: apiKey.length });
    
    try {
      console.log('📡 Calling Google Vision API...');
      const result = await googleCloudVisionOCR(file, apiKey);
      
      console.log('📡 API Response:', result);
      console.log('📝 Extracted text preview:', result.text ? result.text.substring(0, 200) + '...' : 'NO TEXT');
      
      if (result.success) {
        console.log('✅ REAL OCR SUCCESSFUL!');
        setOcrResult({ 
          mode: 'REAL_API', 
          success: true, 
          textLength: result.text.length,
          preview: result.text.substring(0, 100)
        });
        onScanComplete(result.text);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ REAL OCR FAILED:', error);
      console.log('🔄 Falling back to demo mode');
      
      setOcrResult({ 
        mode: 'FALLBACK_TO_DEMO', 
        error: error.message 
      });
      
      const demoResult = await simulateOCRProcessing(file);
      if (demoResult.success) {
        onScanComplete(demoResult.text);
      }
    }
    
    console.log('🔍 === OCR DEBUG END ===');
  };

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    console.log('📁 File selected:', file.name, file.size, 'bytes');
    setIsScanning(true);
    setOcrResult(null);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
      await performOCR(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsScanning(false);
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
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <h2>🐛 Debug Ingredient Scanner</h2>
      
      {/* Debug Info */}
      <div style={{ 
        padding: '12px', 
        background: '#e7f3ff', 
        borderRadius: '6px', 
        marginBottom: '20px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>🔍 Debug Info:</strong><br/>
        API Key: {import.meta.env.VITE_GOOGLE_CLOUD_API_KEY ? '✅ Found' : '❌ Missing'}<br/>
        Environment: {import.meta.env.MODE}<br/>
        {ocrResult && (
          <>
            OCR Mode: <strong>{ocrResult.mode}</strong><br/>
            {ocrResult.preview && <>Text Preview: {ocrResult.preview}...<br/></>}
            {ocrResult.error && <>Error: {ocrResult.error}<br/></>}
          </>
        )}
      </div>
      
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
            <p>🔍 Processing with {import.meta.env.VITE_GOOGLE_CLOUD_API_KEY ? 'REAL' : 'DEMO'} OCR...</p>
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
              Debug mode - check console (F12) for detailed logs
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
    </div>
  );
};

export default IngredientScanner;
