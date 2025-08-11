import React, { useState, useRef } from 'react';

const SimpleOCR = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Dead simple OCR - just Google Vision API
  const scanImage = async (file) => {
    const apiKey = 'AIzaSyCRv_lsVH6ifiugXvH5A_myonkFNkzb89A';
    
    try {
      setIsScanning(true);
      
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });

      // Call Google Vision
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
          }]
        })
      });

      const result = await response.json();
      
      if (result.responses?.[0]?.textAnnotations?.[0]) {
        const text = result.responses[0].textAnnotations[0].description;
        onScanComplete(text);
      } else {
        alert('No text found in image. Try a clearer photo.');
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      alert(`OCR failed: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file?.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);
    
    // Scan it
    scanImage(file);
  };

  return (
    <div className="card">
      <h2>📸 OCR Scanner</h2>
      
      <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '6px', marginBottom: '20px' }}>
        <strong>📝 Simple OCR:</strong> Take photo of ingredient text, get text back
      </div>

      <div 
        className="scan-area"
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#f8f9fa'
        }}
      >
        {isScanning ? (
          <div>
            <div className="loading"></div>
            <p>Reading text from image...</p>
          </div>
        ) : previewImage ? (
          <div>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px' }} />
            <p>Click to scan another image</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
            <p>Click to upload ingredient photo</p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Works best with clear, well-lit text
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {previewImage && !isScanning && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            onClick={() => {
              setPreviewImage(null);
              fileInputRef.current.value = '';
            }}
            className="button"
          >
            Clear & Scan New Image
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleOCR;
