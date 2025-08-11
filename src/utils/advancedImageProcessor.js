// Advanced image preprocessing for challenging OCR scenarios
// Handles: deskewing, denoising, background removal, contrast enhancement

export const createAdvancedPreprocessor = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  return {
    // Convert image to high-contrast black/white for OCR
    preprocessForOCR: async (imageFile) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          console.log('🔧 Starting advanced preprocessing...');
          
          // Step 1: Convert to grayscale with luminance weighting
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            data[i] = gray;     // Red
            data[i + 1] = gray; // Green  
            data[i + 2] = gray; // Blue
          }
          
          // Step 2: Noise reduction (simple median filter)
          const denoisedData = removeNoise(data, canvas.width, canvas.height);
          
          // Step 3: Adaptive thresholding for text isolation
          const thresholdedData = adaptiveThreshold(denoisedData, canvas.width, canvas.height);
          
          // Step 4: Morphological operations to clean up text
          const cleanedData = morphologicalCleanup(thresholdedData, canvas.width, canvas.height);
          
          // Apply processed data back to canvas
          const processedImageData = new ImageData(cleanedData, canvas.width, canvas.height);
          ctx.putImageData(processedImageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            console.log('✅ Advanced preprocessing complete');
            resolve({
              processedBlob: blob,
              processedDataUrl: canvas.toDataURL('image/png'),
              originalSize: { width: img.width, height: img.height }
            });
          }, 'image/png');
        };
        
        img.src = URL.createObjectURL(imageFile);
      });
    },
    
    // Create side-by-side comparison for debugging
    createDebugComparison: async (originalFile, processedDataUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        
        img.onload = () => {
          // Create comparison canvas (side by side)
          const compCanvas = document.createElement('canvas');
          const compCtx = compCanvas.getContext('2d');
          
          compCanvas.width = img.width * 2 + 20; // Space for both images + gap
          compCanvas.height = img.height + 60; // Space for labels
          
          // White background
          compCtx.fillStyle = '#ffffff';
          compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
          
          // Draw original image
          compCtx.drawImage(img, 0, 30);
          
          // Add labels
          compCtx.fillStyle = '#000000';
          compCtx.font = '16px Arial';
          compCtx.fillText('Original', 10, 20);
          
          // Load and draw processed image
          const processedImg = new Image();
          processedImg.onload = () => {
            compCtx.drawImage(processedImg, img.width + 20, 30);
            compCtx.fillText('OCR Optimized', img.width + 30, 20);
            
            resolve(compCanvas.toDataURL('image/png'));
          };
          processedImg.src = processedDataUrl;
        };
        
        img.src = URL.createObjectURL(originalFile);
      });
    }
  };
};

// Noise reduction using a simple 3x3 median filter approximation
function removeNoise(data, width, height) {
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get 3x3 neighborhood values (just red channel since it's grayscale)
      const neighbors = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          neighbors.push(data[nIdx]);
        }
      }
      
      // Sort and get median
      neighbors.sort((a, b) => a - b);
      const median = neighbors[4]; // Middle value of 9 elements
      
      result[idx] = median;     // Red
      result[idx + 1] = median; // Green
      result[idx + 2] = median; // Blue
      result[idx + 3] = data[idx + 3]; // Alpha
    }
  }
  
  // Copy borders
  for (let i = 0; i < data.length; i++) {
    if (result[i] === 0) result[i] = data[i];
  }
  
  return result;
}

// Adaptive thresholding - better for varying lighting conditions
function adaptiveThreshold(data, width, height) {
  const result = new Uint8ClampedArray(data.length);
  const windowSize = 15; // Size of local window
  const k = 0.15; // Threshold adjustment factor
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate local mean in window
      let sum = 0;
      let count = 0;
      
      const halfWindow = Math.floor(windowSize / 2);
      for (let dy = -halfWindow; dy <= halfWindow; dy++) {
        for (let dx = -halfWindow; dx <= halfWindow; dx++) {
          const ny = Math.max(0, Math.min(height - 1, y + dy));
          const nx = Math.max(0, Math.min(width - 1, x + dx));
          const nIdx = (ny * width + nx) * 4;
          sum += data[nIdx];
          count++;
        }
      }
      
      const localMean = sum / count;
      const threshold = localMean * (1 - k);
      
      // Apply threshold
      const value = data[idx] > threshold ? 255 : 0;
      
      result[idx] = value;     // Red
      result[idx + 1] = value; // Green
      result[idx + 2] = value; // Blue
      result[idx + 3] = data[idx + 3]; // Alpha
    }
  }
  
  return result;
}

// Morphological operations to clean up text (erosion + dilation)
function morphologicalCleanup(data, width, height) {
  // First erode to remove small noise
  const eroded = erode(data, width, height);
  // Then dilate to restore text thickness
  const result = dilate(eroded, width, height);
  return result;
}

function erode(data, width, height) {
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Check 3x3 neighborhood - if any pixel is black, make center black
      let minVal = 255;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          minVal = Math.min(minVal, data[nIdx]);
        }
      }
      
      result[idx] = minVal;
      result[idx + 1] = minVal;
      result[idx + 2] = minVal;
      result[idx + 3] = data[idx + 3];
    }
  }
  
  return result;
}

function dilate(data, width, height) {
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Check 3x3 neighborhood - if any pixel is white, make center white
      let maxVal = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          maxVal = Math.max(maxVal, data[nIdx]);
        }
      }
      
      result[idx] = maxVal;
      result[idx + 1] = maxVal;
      result[idx + 2] = maxVal;
      result[idx + 3] = data[idx + 3];
    }
  }
  
  return result;
}

// Automatic deskewing (simplified version for browser)
export const deskewImage = (imageData, width, height) => {
  // This is a simplified version - full deskewing would require more complex algorithms
  // For now, we'll implement basic rotation detection
  
  console.log('🔄 Deskewing analysis (simplified browser version)');
  
  // TODO: Implement Hough transform or similar for line detection
  // For now, return the original data
  // In a production app, you might want to use a server-side service for complex deskewing
  
  return imageData;
};
