import React, { useState, useRef, useEffect } from 'react';

const BarcodeScanner = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanProgress, setScanProgress] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Simple barcode lookup using OpenFoodFacts API (free database)
  const lookupProduct = async (barcode) => {
    try {
      setScanProgress('Looking up product...');
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        
        // Extract ingredients
        let ingredients = '';
        if (product.ingredients_text) {
          ingredients = product.ingredients_text;
        } else if (product.ingredients_text_en) {
          ingredients = product.ingredients_text_en;
        } else {
          throw new Error('No ingredients found for this product');
        }
        
        setScanProgress('Found product!');
        
        // Format the ingredients text nicely
        const formattedText = `PRODUCT: ${product.product_name || 'Unknown Product'}\n\nINGREDIENTS: ${ingredients}`;
        
        onScanComplete(formattedText);
        
      } else {
        throw new Error('Product not found in database');
      }
      
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert(`Could not find product: ${error.message}\n\nTry:\n• Manual entry\n• Different barcode\n• OCR scanner for ingredient text`);
    }
  };

  // Manual barcode entry
  const handleManualLookup = async () => {
    if (!manualBarcode.trim()) {
      alert('Please enter a barcode');
      return;
    }
    
    setIsScanning(true);
    await lookupProduct(manualBarcode.trim());
    setIsScanning(false);
    setScanProgress('');
  };

  // Start camera for barcode scanning
  const startCamera = async () => {
    try {
      setScanProgress('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setScanProgress('Point camera at barcode...');
      
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please use manual entry.');
      setScanProgress('');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="card">
      <h2>📱 Barcode Scanner</h2>
      
      <div style={{ padding: '12px', background: '#d4edda', borderRadius: '6px', marginBottom: '20px' }}>
        <strong>✅ Smart Lookup:</strong> Scan barcode to get product ingredients from database
      </div>

      {/* Manual Barcode Entry */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Manual Entry</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Enter barcode (e.g., 123456789)"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '16px'
            }}
            disabled={isScanning}
          />
          <button 
            onClick={handleManualLookup}
            disabled={isScanning || !manualBarcode.trim()}
            className="button"
            style={{ padding: '12px 20px' }}
          >
            {isScanning ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
      </div>

      {/* Camera Scanner */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Camera Scanner</h3>
        
        {!streamRef.current ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
            <p>Click to start camera scanner</p>
            <button 
              onClick={startCamera}
              className="button"
              disabled={isScanning}
            >
              Start Camera
            </button>
          </div>
        ) : (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                maxWidth: '400px',
                border: '1px solid #ccc',
                borderRadius: '8px'
              }}
            />
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button 
                onClick={stopCamera}
                className="button"
                style={{ background: '#dc3545', marginRight: '10px' }}
              >
                Stop Camera
              </button>
              <button 
                onClick={() => {
                  // Simple manual trigger - in a real app you'd use a barcode detection library
                  const testBarcode = prompt('Enter barcode from image:');
                  if (testBarcode) {
                    setIsScanning(true);
                    lookupProduct(testBarcode).finally(() => {
                      setIsScanning(false);
                      setScanProgress('');
                    });
                  }
                }}
                className="button"
              >
                Manual Capture
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      {scanProgress && (
        <div style={{
          padding: '15px',
          background: '#e7f3ff',
          border: '1px solid #b3d9ff',
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <div className="loading" style={{ marginBottom: '10px' }}></div>
          <p style={{ margin: 0 }}>{scanProgress}</p>
        </div>
      )}

      {/* Info */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>💡 How it works:</strong>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
          <li>Enter barcode manually or scan with camera</li>
          <li>Looks up product in OpenFoodFacts database</li>
          <li>Gets ingredients automatically</li>
          <li>Much more accurate than OCR!</li>
        </ul>
      </div>
    </div>
  );
};

export default BarcodeScanner;
