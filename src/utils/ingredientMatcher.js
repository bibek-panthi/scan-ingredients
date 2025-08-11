import Fuse from 'fuse.js';

// Preprocess text to normalize for matching
export const preprocessText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

// Create fuzzy search instance for ingredients
export const createFuzzyMatcher = (avoidList) => {
  // Flatten all aliases for each ingredient
  const searchData = [];
  
  avoidList.forEach(ingredient => {
    ingredient.aliases.forEach(alias => {
      searchData.push({
        alias: preprocessText(alias),
        ingredient: ingredient
      });
    });
  });

  return new Fuse(searchData, {
    keys: ['alias'],
    threshold: 0.3, // Lower = more strict matching
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 3
  });
};

// Find ingredients in text using fuzzy matching
export const findIngredientsInText = (text, fuzzyMatcher, enabledIngredients) => {
  if (!text || !fuzzyMatcher) return [];
  
  const processedText = preprocessText(text);
  const words = processedText.split(/\s+/);
  const foundIngredients = new Map();
  
  // Check individual words and phrases
  for (let i = 0; i < words.length; i++) {
    // Check single words
    checkWordForMatches(words[i], fuzzyMatcher, foundIngredients, enabledIngredients);
    
    // Check 2-word phrases
    if (i < words.length - 1) {
      const twoWordPhrase = `${words[i]} ${words[i + 1]}`;
      checkWordForMatches(twoWordPhrase, fuzzyMatcher, foundIngredients, enabledIngredients);
    }
    
    // Check 3-word phrases
    if (i < words.length - 2) {
      const threeWordPhrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      checkWordForMatches(threeWordPhrase, fuzzyMatcher, foundIngredients, enabledIngredients);
    }
  }
  
  return Array.from(foundIngredients.values());
};

// Helper function to check word/phrase for matches
const checkWordForMatches = (searchTerm, fuzzyMatcher, foundIngredients, enabledIngredients) => {
  if (searchTerm.length < 3) return;
  
  const results = fuzzyMatcher.search(searchTerm);
  
  results.forEach(result => {
    const ingredient = result.item.ingredient;
    
    // Only include if ingredient is enabled by user
    if (enabledIngredients.has(ingredient.id)) {
      // Check for exact word boundary matches to avoid false positives
      if (isValidMatch(searchTerm, result.item.alias)) {
        foundIngredients.set(ingredient.id, {
          ...ingredient,
          matchedAlias: result.item.alias,
          score: result.score
        });
      }
    }
  });
};

// Validate that the match respects word boundaries
const isValidMatch = (searchTerm, alias) => {
  // For exact matches, always valid
  if (searchTerm === alias) return true;
  
  // For partial matches, ensure we're not matching substrings of larger words
  const aliasWords = alias.split(/\s+/);
  const searchWords = searchTerm.split(/\s+/);
  
  // Check if any word in the alias is contained in the search term
  return aliasWords.some(aliasWord => 
    searchWords.some(searchWord => 
      searchWord.includes(aliasWord) || aliasWord.includes(searchWord)
    )
  );
};

// Extract text that looks like ingredients list from OCR result
export const extractIngredientsText = (ocrText) => {
  if (!ocrText) return '';
  
  // Common patterns for ingredients sections
  const ingredientsPatterns = [
    /ingredients?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is,
    /ingredients?[:\s]+(.*?)(?=nutrition|allergen|contains|directions|storage|$)/is,
    /ingredients?[:\s]+(.*)/is
  ];
  
  const lowerText = ocrText.toLowerCase();
  
  for (const pattern of ingredientsPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // If no explicit ingredients section found, return the whole text
  // as it might be just an ingredients list
  return ocrText;
};
