// Extract ingredients from OCR text
export const extractIngredients = (ocrText) => {
  console.log('🔍 Raw OCR text:', ocrText);
  
  if (!ocrText) return null;
  
  // Clean up the text first
  const cleanText = ocrText
    .replace(/\n/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  console.log('📝 Cleaned text:', cleanText);
  
  // Find "INGREDIENTS:" (case insensitive)
  const ingredientsMatch = cleanText.match(/ingredients?\s*:?\s*(.*?)(?=nutrition|facts|allergen|contains|net\s*wt|serving|calories|$)/i);
  
  if (!ingredientsMatch) {
    console.log('❌ No "INGREDIENTS:" section found');
    return null;
  }
  
  let ingredientsText = ingredientsMatch[1].trim();
  console.log('📋 Raw ingredients text:', ingredientsText);
  
  // Clean up common OCR artifacts
  ingredientsText = ingredientsText
    .replace(/[|{}[\]]/g, '')  // Remove OCR artifacts
    .replace(/\s*\.\s*$/, '')  // Remove trailing period
    .replace(/\s+/g, ' ')      // Clean up spaces
    .trim();
  
  console.log('✅ Final ingredients:', ingredientsText);
  return ingredientsText;
};
