import React, { useState, useEffect, useMemo } from 'react';
import IngredientScanner from './components/IngredientScanner';
import ScanResults from './components/ScanResults';
import AvoidListManager from './components/AvoidListManager';
import IngredientModal from './components/IngredientModal';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import { 
  createFuzzyMatcher, 
  findIngredientsInText, 
  extractIngredientsText 
} from './utils/ingredientMatcher';
import { 
  getEnabledIngredients, 
  saveEnabledIngredients, 
  getCustomIngredients, 
  saveCustomIngredients, 
  initializeEnabledIngredients 
} from './utils/storage';
import avoidListData from './data/avoidList.json';

function App() {
  const [currentView, setCurrentView] = useState('scanner'); // 'scanner', 'results', 'settings', 'profile'
  const [scanResults, setScanResults] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [customIngredients, setCustomIngredients] = useState([]);
  const [enabledIngredients, setEnabledIngredients] = useState(new Set());
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  // Combine default and custom ingredients
  const allIngredients = useMemo(() => {
    return [...avoidListData, ...customIngredients];
  }, [customIngredients]);

  // Create fuzzy matcher when ingredients change
  const fuzzyMatcher = useMemo(() => {
    return createFuzzyMatcher(allIngredients);
  }, [allIngredients]);

  // Load saved data on component mount
  useEffect(() => {
    const savedCustom = getCustomIngredients();
    setCustomIngredients(savedCustom);
    
    // Load scan history
    const savedHistory = localStorage.getItem('cleanscan_scan_history');
    if (savedHistory) {
      setScanHistory(JSON.parse(savedHistory));
    }
    
    // Load user session
    const savedUser = localStorage.getItem('cleanscan_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Initialize enabled ingredients when allIngredients is ready
  useEffect(() => {
    if (allIngredients.length > 0) {
      const enabled = initializeEnabledIngredients(allIngredients);
      setEnabledIngredients(enabled);
    }
  }, [allIngredients]);

  const handleScanComplete = (extractedText) => {
    if (!extractedText) {
      alert('No text could be extracted from the image. Please try another image.');
      return;
    }

    // Extract just the ingredients text
    const ingredientsText = extractIngredientsText(extractedText);
    
    // Find matching ingredients
    const foundIngredients = findIngredientsInText(
      ingredientsText, 
      fuzzyMatcher, 
      enabledIngredients
    );

    const scanResult = {
      extractedText: extractedText,
      ingredientsText: ingredientsText,
      foundIngredients: foundIngredients,
      timestamp: new Date().toISOString()
    };

    setScanResults(scanResult);

    // Add to scan history if user is logged in
    if (user) {
      const newHistory = [scanResult, ...scanHistory].slice(0, 50); // Keep last 50 scans
      setScanHistory(newHistory);
      localStorage.setItem('cleanscan_scan_history', JSON.stringify(newHistory));
    }

    setCurrentView('results');
  };

  const handleToggleIngredient = (ingredientId) => {
    const newEnabled = new Set(enabledIngredients);
    if (newEnabled.has(ingredientId)) {
      newEnabled.delete(ingredientId);
    } else {
      newEnabled.add(ingredientId);
    }
    setEnabledIngredients(newEnabled);
    saveEnabledIngredients(newEnabled);
  };

  const handleAddCustomIngredient = (ingredient) => {
    const newCustom = [...customIngredients, ingredient];
    setCustomIngredients(newCustom);
    saveCustomIngredients(newCustom);
    
    // Enable the new ingredient by default
    const newEnabled = new Set(enabledIngredients);
    newEnabled.add(ingredient.id);
    setEnabledIngredients(newEnabled);
    saveEnabledIngredients(newEnabled);
  };

  const handleDeleteIngredient = (ingredientId) => {
    // Only allow deletion of custom ingredients
    const ingredient = allIngredients.find(ing => ing.id === ingredientId);
    if (!ingredient?.isCustom) return;

    const newCustom = customIngredients.filter(ing => ing.id !== ingredientId);
    setCustomIngredients(newCustom);
    saveCustomIngredients(newCustom);

    // Remove from enabled list too
    const newEnabled = new Set(enabledIngredients);
    newEnabled.delete(ingredientId);
    setEnabledIngredients(newEnabled);
    saveEnabledIngredients(newEnabled);
  };

  const handleScanAgain = () => {
    setScanResults(null);
    setCurrentView('scanner');
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('cleanscan_user', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    setUser(null);
    setScanHistory([]);
    localStorage.removeItem('cleanscan_user');
    localStorage.removeItem('cleanscan_scan_history');
    setCurrentView('scanner');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your scan history? This cannot be undone.')) {
      setScanHistory([]);
      localStorage.removeItem('cleanscan_scan_history');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'results':
        return (
          <ScanResults
            results={scanResults}
            onIngredientClick={setSelectedIngredient}
            onScanAgain={handleScanAgain}
          />
        );
      case 'settings':
        return (
          <AvoidListManager
            ingredients={allIngredients}
            enabledIngredients={enabledIngredients}
            onToggleIngredient={handleToggleIngredient}
            onAddCustomIngredient={handleAddCustomIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        );
      case 'profile':
        return user ? (
          <UserProfile
            user={user}
            scanHistory={scanHistory}
            onSignOut={handleSignOut}
            onClearHistory={handleClearHistory}
          />
        ) : (
          <div className="card" style={{ textAlign: 'center' }}>
            <h2>👤 User Profile</h2>
            <p>Sign in to track your scan history and sync your preferences across devices.</p>
            <button onClick={() => setShowAuthModal(true)} className="button">
              Sign In / Sign Up
            </button>
          </div>
        );
      default:
        return (
          <IngredientScanner onScanComplete={handleScanComplete} />
        );
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ 
            color: '#007bff', 
            margin: '0',
            fontSize: '2.5rem'
          }}>
            🔍 CleanScan
          </h1>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#666' }}>Hello, {user.displayName || user.email}!</span>
              <button 
                onClick={() => setCurrentView('profile')} 
                className={`button ${currentView === 'profile' ? 'success' : ''}`}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                👤 Profile
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="button">
              Sign In
            </button>
          )}
        </div>
        <p style={{ 
          color: '#666', 
          fontSize: '18px',
          margin: '0'
        }}>
          Scan ingredient labels to detect harmful substances
        </p>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          className={`button ${currentView === 'scanner' ? 'success' : ''}`}
          onClick={() => setCurrentView('scanner')}
        >
          📷 Scanner
        </button>
        <button
          className={`button ${currentView === 'settings' ? 'success' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          ⚙️ Avoid List ({enabledIngredients.size})
        </button>
        {scanResults && (
          <button
            className={`button ${currentView === 'results' ? 'success' : ''}`}
            onClick={() => setCurrentView('results')}
          >
            📊 Results ({scanResults.foundIngredients.length})
          </button>
        )}
      </div>

      {/* Main Content */}
      {renderCurrentView()}

      {/* Ingredient Detail Modal */}
      {selectedIngredient && (
        <IngredientModal
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px', 
        padding: '20px',
        fontSize: '14px',
        color: '#666',
        borderTop: '1px solid #eee'
      }}>
        <p>
          <strong>CleanScan</strong> helps you identify potentially harmful ingredients in packaged foods.
          Always consult healthcare professionals for personalized dietary advice.
        </p>
        <p style={{ marginTop: '10px' }}>
          Currently tracking <strong>{allIngredients.length}</strong> ingredients • 
          <strong> {enabledIngredients.size}</strong> enabled for scanning
        </p>
      </div>
    </div>
  );
}

export default App;
