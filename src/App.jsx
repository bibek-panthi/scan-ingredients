import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';

// Components
import BarcodeScanner from './components/BarcodeScanner';
import SimpleOCR from './components/SimpleOCR';
import ScanResults from './components/ScanResults';
import AvoidListManager from './components/AvoidListManager';
import IngredientModal from './components/IngredientModal';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import Watchlist from './components/Watchlist';
import History from './components/History';

// Utils
import { findIngredientsInText } from './utils/ingredientMatcher';
import { saveCustomIngredients, loadCustomIngredients, saveEnabledIngredients, loadEnabledIngredients } from './utils/storage';

// Data
import avoidListData from './data/avoidList.json';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDiNgtlEyIw6OOuJVIoXWOGJ_QBGjQYr0g",
  authDomain: "ingredient-scanner-428900.firebaseapp.com",
  projectId: "ingredient-scanner-428900",
  storageBucket: "ingredient-scanner-428900.firebasestorage.app",
  messagingSenderId: "527439037993",
  appId: "1:527439037993:web:2a76dae98dfb52a3abc8a3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  // Navigation state
  const [currentView, setCurrentView] = useState('barcode'); // barcode, ocr, watchlist, history, results
  
  // User and auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Ingredients and scanning state
  const [avoidList, setAvoidList] = useState([]);
  const [customIngredients, setCustomIngredients] = useState([]);
  const [enabledIngredients, setEnabledIngredients] = useState(new Set());
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  // Initialize app
  useEffect(() => {
    // Load avoid list
    setAvoidList(avoidListData);
    
    // Load custom ingredients from localStorage
    const savedCustom = loadCustomIngredients();
    setCustomIngredients(savedCustom);
    
    // Load enabled ingredients from localStorage
    const savedEnabled = loadEnabledIngredients();
    setEnabledIngredients(savedEnabled);
    
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserData(user);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Load user data from Firebase
  const loadUserData = async (user) => {
    try {
      // Load user preferences
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.customIngredients) {
          setCustomIngredients(userData.customIngredients);
        }
        if (userData.enabledIngredients) {
          setEnabledIngredients(new Set(userData.enabledIngredients));
        }
      }
      
      // Load scan history
      const historyRef = collection(db, 'users', user.uid, 'scanHistory');
      const historyQuery = query(historyRef, orderBy('timestamp', 'desc'));
      const historySnapshot = await getDocs(historyQuery);
      
      const history = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setScanHistory(history);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Save user data to Firebase
  const saveUserData = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        customIngredients: customIngredients,
        enabledIngredients: Array.from(enabledIngredients),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  // Save scan to history
  const saveScanToHistory = async (extractedText, foundIngredients) => {
    const scanData = {
      timestamp: new Date().toISOString(),
      extractedText,
      foundIngredients: foundIngredients.map(ing => ({
        name: ing.name,
        severity: ing.severity,
        description: ing.description
      }))
    };

    if (user) {
      // Save to Firebase
      try {
        const historyRef = collection(db, 'users', user.uid, 'scanHistory');
        const docRef = await addDoc(historyRef, scanData);
        setScanHistory(prev => [{ id: docRef.id, ...scanData }, ...prev]);
      } catch (error) {
        console.error('Error saving scan history:', error);
      }
    } else {
      // Save to localStorage for non-logged-in users
      const localHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
      const newScan = { id: Date.now().toString(), ...scanData };
      const updatedHistory = [newScan, ...localHistory].slice(0, 50); // Keep last 50
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
      setScanHistory(updatedHistory);
    }
  };

  // Clear scan history
  const clearScanHistory = async () => {
    if (!confirm('Are you sure you want to clear all scan history?')) return;
    
    if (user) {
      try {
        const historyRef = collection(db, 'users', user.uid, 'scanHistory');
        const historySnapshot = await getDocs(historyRef);
        
        await Promise.all(
          historySnapshot.docs.map(doc => deleteDoc(doc.ref))
        );
        
        setScanHistory([]);
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    } else {
      localStorage.removeItem('scanHistory');
      setScanHistory([]);
    }
  };

  // Handle scan completion
  const handleScanComplete = (extractedText) => {
    const allIngredients = [...avoidList, ...customIngredients];
    const foundIngredients = findIngredientsInText(extractedText, allIngredients, enabledIngredients);
    
    const results = {
      extractedText,
      foundIngredients,
      isHarmful: foundIngredients.length > 0,
      timestamp: new Date().toISOString()
    };
    
    setScanResults(results);
    setCurrentView('results');
    
    // Save to history
    saveScanToHistory(extractedText, foundIngredients);
  };

  // Handle authentication success
  const handleAuthSuccess = (user) => {
    setUser(user);
    setShowAuthModal(false);
    loadUserData(user);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setScanHistory([]);
      setCurrentView('barcode');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Handle ingredient toggle
  const handleToggleIngredient = (ingredientId) => {
    const newEnabled = new Set(enabledIngredients);
    if (newEnabled.has(ingredientId)) {
      newEnabled.delete(ingredientId);
    } else {
      newEnabled.add(ingredientId);
    }
    setEnabledIngredients(newEnabled);
    
    // Save to localStorage
    saveEnabledIngredients(newEnabled);
    
    // Save to Firebase if logged in
    if (user) {
      saveUserData();
    }
  };

  // Add custom ingredient
  const handleAddCustomIngredient = (ingredient) => {
    const newCustomIngredients = [...customIngredients, ingredient];
    setCustomIngredients(newCustomIngredients);
    
    // Enable by default
    const newEnabled = new Set(enabledIngredients);
    newEnabled.add(ingredient.id);
    setEnabledIngredients(newEnabled);
    
    // Save to localStorage
    saveCustomIngredients(newCustomIngredients);
    saveEnabledIngredients(newEnabled);
    
    // Save to Firebase if logged in
    if (user) {
      saveUserData();
    }
  };

  // Delete custom ingredient
  const handleDeleteIngredient = (ingredientId) => {
    if (!confirm('Are you sure you want to delete this custom ingredient?')) return;
    
    const newCustomIngredients = customIngredients.filter(ing => ing.id !== ingredientId);
    setCustomIngredients(newCustomIngredients);
    
    // Remove from enabled list
    const newEnabled = new Set(enabledIngredients);
    newEnabled.delete(ingredientId);
    setEnabledIngredients(newEnabled);
    
    // Save to localStorage
    saveCustomIngredients(newCustomIngredients);
    saveEnabledIngredients(newEnabled);
    
    // Save to Firebase if logged in
    if (user) {
      saveUserData();
    }
  };

  const allIngredients = [...avoidList, ...customIngredients];

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="loading"></div>
        <p>Loading CleanScan...</p>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px 0',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>🧪 CleanScan</h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Smart ingredient analysis for healthier choices
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                Hi, {user.displayName || user.email}!
              </span>
              <button onClick={handleSignOut} className="button" style={{ fontSize: '14px', padding: '8px 16px' }}>
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="button">
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Navigation */}
      <nav style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '12px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setCurrentView('barcode')}
          className={`nav-button ${currentView === 'barcode' ? 'active' : ''}`}
        >
          📱 Barcode
        </button>
        <button 
          onClick={() => setCurrentView('ocr')}
          className={`nav-button ${currentView === 'ocr' ? 'active' : ''}`}
        >
          📸 OCR
        </button>
        <button 
          onClick={() => setCurrentView('watchlist')}
          className={`nav-button ${currentView === 'watchlist' ? 'active' : ''}`}
        >
          📋 Watchlist ({enabledIngredients.size})
        </button>
        <button 
          onClick={() => setCurrentView('history')}
          className={`nav-button ${currentView === 'history' ? 'active' : ''}`}
        >
          📝 History ({scanHistory.length})
        </button>
        {scanResults && (
          <button 
            onClick={() => setCurrentView('results')}
            className={`nav-button ${currentView === 'results' ? 'active' : ''}`}
            style={{ 
              background: scanResults.isHarmful ? '#dc3545' : '#28a745',
              color: 'white'
            }}
          >
            {scanResults.isHarmful ? '❌' : '✅'} Last Result
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'barcode' && (
          <BarcodeScanner onScanComplete={handleScanComplete} />
        )}
        
        {currentView === 'ocr' && (
          <SimpleOCR onScanComplete={handleScanComplete} />
        )}
        
        {currentView === 'watchlist' && (
          <Watchlist
            ingredients={allIngredients}
            enabledIngredients={enabledIngredients}
            onToggleIngredient={handleToggleIngredient}
            onAddCustomIngredient={handleAddCustomIngredient}
            onDeleteIngredient={handleDeleteIngredient}
          />
        )}
        
        {currentView === 'history' && (
          <History
            user={user}
            scanHistory={scanHistory}
            onClearHistory={clearScanHistory}
          />
        )}
        
        {currentView === 'results' && scanResults && (
          <ScanResults
            results={scanResults}
            onIngredientClick={setSelectedIngredient}
            onScanAgain={() => setCurrentView('barcode')}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          auth={auth}
          GoogleAuthProvider={GoogleAuthProvider}
          signInWithPopup={signInWithPopup}
          signInWithEmailAndPassword={signInWithEmailAndPassword}
          createUserWithEmailAndPassword={createUserWithEmailAndPassword}
        />
      )}

      {selectedIngredient && (
        <IngredientModal
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}
    </div>
  );
}

export default App;
