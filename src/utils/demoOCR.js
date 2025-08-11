// Demo OCR functionality with realistic ingredient examples
// In production, this would be replaced with Google Cloud Vision API integration

export const DEMO_INGREDIENTS_SAMPLES = [
  {
    name: "Processed Snack Crackers",
    text: "INGREDIENTS: Enriched flour (wheat flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), soybean oil, sugar, salt, baking soda, high fructose corn syrup, soy lecithin, artificial flavor, yellow #6, red #40."
  },
  {
    name: "Cola Soft Drink",
    text: "Ingredients: Carbonated water, high fructose corn syrup, caramel color, phosphoric acid, natural flavor, caffeine, sodium benzoate (preservative), citric acid."
  },
  {
    name: "Fruit Snacks",
    text: "INGREDIENTS: Corn syrup, sugar, modified corn starch, pear juice concentrate, citric acid, sodium citrate, natural and artificial flavors, red #40, yellow #5, blue #1, carnauba wax."
  },
  {
    name: "Breakfast Cereal",
    text: "Ingredients: Whole grain wheat, sugar, wheat bran, salt, malt flavor, BHT (preservative), vitamins and minerals: Iron, vitamin B6, vitamin B2, vitamin B1, folic acid, vitamin D3, vitamin B12."
  },
  {
    name: "Packaged Bread",
    text: "INGREDIENTS: Enriched wheat flour (flour, malted barley flour, reduced iron, niacin, thiamin mononitrate, riboflavin, folic acid), water, sugar, soybean oil, salt, yeast, calcium propionate (preservative), monoglycerides, sodium stearoyl lactylate, azodicarbonamide."
  },
  {
    name: "Energy Drink",
    text: "Ingredients: Carbonated water, sucrose, glucose, citric acid, taurine, sodium citrate, artificial flavors, caffeine, aspartame, acesulfame potassium, yellow #5, sodium benzoate."
  },
  {
    name: "Frozen Pizza",
    text: "INGREDIENTS: Crust (enriched flour, water, soybean oil, sugar, salt, yeast), sauce (tomatoes, salt, spices), cheese (mozzarella, cheddar), pepperoni (pork, beef, salt, sodium nitrite, BHA, BHT), contains 2% or less of: cornmeal, garlic powder, oregano."
  },
  {
    name: "Salad Dressing",
    text: "Ingredients: Soybean oil, water, vinegar, sugar, salt, contains less than 2% of: egg yolk, natural flavor, phosphoric acid, xanthan gum, potassium sorbate and sodium benzoate (preservatives), calcium disodium EDTA."
  },
  {
    name: "Organic Granola Bar",
    text: "ORGANIC INGREDIENTS: Organic rolled oats, organic brown rice syrup, organic peanut butter, organic dried cranberries, organic sunflower seeds, sea salt, organic vanilla extract."
  },
  {
    name: "Instant Noodles",
    text: "INGREDIENTS: Enriched wheat flour, palm oil, salt, contains less than 2% of: monosodium glutamate, hydrolyzed soy protein, sugar, garlic powder, onion powder, disodium inosinate, disodium guanylate, caramel color, yellow #6, red #40."
  }
];

export const getRandomDemoSample = () => {
  const randomIndex = Math.floor(Math.random() * DEMO_INGREDIENTS_SAMPLES.length);
  return DEMO_INGREDIENTS_SAMPLES[randomIndex];
};

export const simulateOCRProcessing = async (file) => {
  // Simulate realistic processing time
  const processingTime = 1500 + Math.random() * 2000; // 1.5-3.5 seconds
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // In a real implementation, you would:
  // 1. Convert file to base64 or send as FormData
  // 2. Call Google Cloud Vision API
  // 3. Parse the response and extract text
  
  // For demo, return a random sample
  const sample = getRandomDemoSample();
  
  return {
    success: true,
    text: sample.text,
    productName: sample.name,
    confidence: 0.85 + Math.random() * 0.1 // Simulate 85-95% confidence
  };
};

// Google Cloud Vision API integration example (for production)
export const googleCloudVisionOCR = async (imageFile, apiKey) => {
  try {
    // Convert image to base64
    const base64Image = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.readAsDataURL(imageFile);
    });

    // Prepare request
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1
            }
          ]
        }
      ]
    };

    // Call Google Cloud Vision API
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();
    
    if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
      return {
        success: true,
        text: result.responses[0].textAnnotations[0].description,
        confidence: result.responses[0].textAnnotations[0].confidence || 1.0
      };
    } else {
      throw new Error('No text detected in image');
    }

  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
