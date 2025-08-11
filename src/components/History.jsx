import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

const History = ({ user, scanHistory, onClearHistory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, flagged, safe

  const filteredHistory = scanHistory.filter(scan => {
    const matchesSearch = !searchTerm || 
      scan.foundIngredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      scan.extractedText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'flagged' && scan.foundIngredients.length > 0) ||
      (filterType === 'safe' && scan.foundIngredients.length === 0);
    
    return matchesSearch && matchesFilter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const getTotalScans = () => scanHistory.length;
  const getFlaggedScans = () => scanHistory.filter(scan => scan.foundIngredients.length > 0).length;
  const getSafeScans = () => scanHistory.filter(scan => scan.foundIngredients.length === 0).length;

  const getTopFlaggedIngredients = () => {
    const ingredientCounts = {};
    scanHistory.forEach(scan => {
      scan.foundIngredients.forEach(ingredient => {
        ingredientCounts[ingredient.name] = (ingredientCounts[ingredient.name] || 0) + 1;
      });
    });
    
    return Object.entries(ingredientCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  };

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>📝 Scan History</h2>
        <div style={{ fontSize: '64px', margin: '20px 0' }}>🔒</div>
        <p>Sign in to track your scan history and get insights about the products you check.</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Your scan history will be securely stored and synced across all your devices.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📝 Scan History</h2>
        {scanHistory.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="button"
            style={{ background: '#dc3545', fontSize: '14px', padding: '8px 16px' }}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      {/* Statistics */}
      {scanHistory.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>📊 Your Scanning Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{getTotalScans()}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Scans</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#d4edda', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{getSafeScans()}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Safe Products</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f8d7da', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{getFlaggedScans()}</div>
              <div style={{ fontSize: '14px', color: '#666' }}>Flagged Products</div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#fff3cd', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>
                {scanHistory.length > 0 ? Math.round((getSafeScans() / getTotalScans()) * 100) : 0}%
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Flagged Ingredients */}
      {getTopFlaggedIngredients().length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>🚫 Most Detected Harmful Ingredients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {getTopFlaggedIngredients().map((ingredient, index) => (
              <div key={ingredient.name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '10px 15px', 
                background: '#f8f9fa', 
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}>
                <div>
                  <span style={{ marginRight: '10px', fontWeight: 'bold' }}>#{index + 1}</span>
                  {ingredient.name}
                </div>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: '#dc3545',
                  background: '#f8d7da',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {ingredient.count} times
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {scanHistory.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="all">All Scans ({scanHistory.length})</option>
              <option value="flagged">Flagged ({getFlaggedScans()})</option>
              <option value="safe">Safe ({getSafeScans()})</option>
            </select>
          </div>
        </div>
      )}

      {/* History List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {sortedHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {scanHistory.length === 0 ? (
              <>
                <div style={{ fontSize: '48px', margin: '0 0 20px 0' }}>📱</div>
                <p>No scans yet!</p>
                <p>Start scanning ingredient labels to build your history and get insights.</p>
              </>
            ) : (
              <>
                <p>No scans found matching your search.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                  className="button"
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        ) : (
          sortedHistory.map((scan, index) => (
            <div key={scan.timestamp} style={{ 
              padding: '15px', 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              marginBottom: '10px',
              background: scan.foundIngredients.length > 0 ? '#fff5f5' : '#f0fff4'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {scan.foundIngredients.length > 0 ? '❌' : '✅'}
                  </span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      Scan #{scanHistory.length - index}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {format(new Date(scan.timestamp), 'MMM dd, yyyy • HH:mm')}
                    </div>
                  </div>
                </div>
              </div>
              
              {scan.foundIngredients.length > 0 ? (
                <div>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#dc3545', 
                    marginBottom: '8px',
                    fontWeight: 'bold'
                  }}>
                    🚨 Found {scan.foundIngredients.length} harmful ingredient{scan.foundIngredients.length > 1 ? 's' : ''}:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {scan.foundIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: ing.severity === 'High' ? '#dc3545' : 
                                     ing.severity === 'Medium' ? '#ffc107' : '#28a745',
                          color: ing.severity === 'Medium' ? '#000' : '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '14px', color: '#28a745', fontWeight: 'bold' }}>
                  ✅ No harmful ingredients detected
                </div>
              )}

              {/* Extracted text preview */}
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}>
                  View scanned text
                </summary>
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {scan.extractedText || scan.ingredientsText || 'No text available'}
                </div>
              </details>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
