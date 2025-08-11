// Local storage utilities for persisting user preferences

export const STORAGE_KEYS = {
  ENABLED_INGREDIENTS: 'cleanscan_enabled_ingredients',
  CUSTOM_INGREDIENTS: 'cleanscan_custom_ingredients'
};

// Get enabled ingredients from localStorage
export const getEnabledIngredients = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ENABLED_INGREDIENTS);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (error) {
    console.error('Error loading enabled ingredients:', error);
  }
  return new Set(); // Return empty set if nothing stored or error
};

// Save enabled ingredients to localStorage
export const saveEnabledIngredients = (enabledSet) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.ENABLED_INGREDIENTS, 
      JSON.stringify(Array.from(enabledSet))
    );
  } catch (error) {
    console.error('Error saving enabled ingredients:', error);
  }
};

// Get custom ingredients from localStorage
export const getCustomIngredients = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_INGREDIENTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading custom ingredients:', error);
  }
  return [];
};

// Save custom ingredients to localStorage
export const saveCustomIngredients = (customIngredients) => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.CUSTOM_INGREDIENTS, 
      JSON.stringify(customIngredients)
    );
  } catch (error) {
    console.error('Error saving custom ingredients:', error);
  }
};

// Initialize default enabled ingredients (all ingredients enabled by default)
export const initializeEnabledIngredients = (allIngredients) => {
  const stored = getEnabledIngredients();
  if (stored.size === 0) {
    // First time user - enable all ingredients by default
    const defaultEnabled = new Set(allIngredients.map(ing => ing.id));
    saveEnabledIngredients(defaultEnabled);
    return defaultEnabled;
  }
  return stored;
};
