import React, { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';

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
      console.log('Looking up barcode:', barcode);
      
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      console.log('API Response:', data);
      
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
      setScanProgress('');
      alert(`Could not find product: ${error.message}\n\nTry:\n• Different barcode (like: 737628064502)\n• OCR scanner for ingredient text`);
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

  // Start camera barcode scanning
  const startCamera = async () => {
    try {
      setScanProgress('Starting camera...');
      
      // Initialize Quagga barcode scanner
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment" // Back camera
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader", 
            "ean_8_reader",
            "code_39_reader"
          ]
        }
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          alert('Could not access camera. Please use manual entry.');
          setScanProgress('');
          return;
        }
        
        console.log("Barcode scanner initialized");
        Quagga.start();
        setScanProgress('Point camera at barcode...');
        
        // Listen for barcode detection
        Quagga.onDetected(onBarcodeDetected);
      });
      
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please use manual entry.');
      setScanProgress('');
    }
  };

  // Handle barcode detection
  const onBarcodeDetected = (result) => {
    const barcode = result.codeResult.code;
    console.log('Barcode detected:', barcode);
    
    // Stop scanning
    stopCamera();
    
    // Look up the product
    setIsScanning(true);
    lookupProduct(barcode).finally(() => {
      setIsScanning(false);
      setScanProgress('');
    });
  };

  // Stop camera
  const stopCamera = () => {
    Quagga.stop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
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
            placeholder="Enter barcode (try: 737628064502)"
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
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          💡 Test with: 737628064502 (Coca Cola) or 3017620422003 (Nutella) or 0016000275263 (M&Ms)
        </div>
      </div>

      {/* Camera Scanner */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Camera Scanner</h3>
        
        {!streamRef.current ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            border: '2px dashed #28a745',
            borderRadius: '8px',
            background: '#d4edda'
          }}>
            <p style={{ fontSize: '48px', margin: '0' }}>📷</p>
            <p><strong>Click to start barcode scanner</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Will automatically detect and scan barcodes
            </p>
            <button 
              onClick={startCamera}
              className="button"
              disabled={isScanning}
              style={{ background: '#28a745', marginTop: '10px' }}
            >
              Start Camera Scanner
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div 
              ref={videoRef}
              style={{
                width: '100%',
                maxWidth: '400px',
                height: '300px',
                border: '2px solid #28a745',
                borderRadius: '8px',
                background: '#000',
                margin: '0 auto 10px'
              }}
            />
            <div>
              <button 
                onClick={stopCamera}
                className="button"
                style={{ background: '#dc3545' }}
              >
                Stop Scanner
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              Point camera at barcode - it will scan automatically
            </p>
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
