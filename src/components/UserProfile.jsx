import React, { useState } from 'react';
import { format } from 'date-fns';

const UserProfile = ({ user, scanHistory, onSignOut, onClearHistory }) => {
  const [showHistory, setShowHistory] = useState(false);

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

  const getRiskDistribution = () => {
    const distribution = { High: 0, Medium: 0, Low: 0 };
    scanHistory.forEach(scan => {
      scan.foundIngredients.forEach(ingredient => {
        distribution[ingredient.severity] = (distribution[ingredient.severity] || 0) + 1;
      });
    });
    return distribution;
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👤 Profile</h2>
        <button onClick={onSignOut} className="button" style={{ background: '#6c757d' }}>
          Sign Out
        </button>
      </div>

      {/* User Info */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: '#007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <h3 style={{ margin: '0', color: '#333' }}>{user.displayName || 'CleanScan User'}</h3>
            <p style={{ margin: '0', color: '#666' }}>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ marginBottom: '30px' }}>
        <h3>📊 Scan Statistics</h3>
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
        </div>
      </div>

      {/* Risk Distribution */}
      {scanHistory.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>⚠️ Risk Distribution</h3>
          {(() => {
            const risks = getRiskDistribution();
            const total = risks.High + risks.Medium + risks.Low;
            return total > 0 ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f8d7da', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#dc3545' }}>{risks.High}</div>
                  <div style={{ fontSize: '12px' }}>🔴 High Risk</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#fff3cd', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#856404' }}>{risks.Medium}</div>
                  <div style={{ fontSize: '12px' }}>🟠 Medium Risk</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#d1ecf1', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold', color: '#0c5460' }}>{risks.Low}</div>
                  <div style={{ fontSize: '12px' }}>🟢 Low Risk</div>
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>No flagged ingredients found yet</p>
            );
          })()}
        </div>
      )}

      {/* Top Flagged Ingredients */}
      {getTopFlaggedIngredients().length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3>🚫 Most Detected Ingredients</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {getTopFlaggedIngredients().map((ingredient, index) => (
              <div key={ingredient.name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 12px', 
                background: '#f8f9fa', 
                borderRadius: '6px' 
              }}>
                <span>{ingredient.name}</span>
                <span style={{ fontWeight: 'bold', color: '#dc3545' }}>{ingredient.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>📝 Scan History</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            {scanHistory.length > 0 && (
              <button
                onClick={onClearHistory}
                className="button"
                style={{ background: '#dc3545', fontSize: '14px', padding: '6px 12px' }}
              >
                Clear History
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="button"
              style={{ fontSize: '14px', padding: '6px 12px' }}
            >
              {showHistory ? 'Hide' : 'Show'} ({scanHistory.length})
            </button>
          </div>
        </div>

        {showHistory && (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {scanHistory.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                No scans yet. Start scanning products to build your history!
              </p>
            ) : (
              scanHistory
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((scan, index) => (
                  <div key={index} style={{ 
                    padding: '12px', 
                    border: '1px solid #eee', 
                    borderRadius: '6px', 
                    marginBottom: '8px',
                    background: scan.foundIngredients.length > 0 ? '#fff5f5' : '#f0fff4'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        {scan.foundIngredients.length > 0 ? '❌' : '✅'} 
                        Scan #{scanHistory.length - index}
                      </span>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {format(new Date(scan.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    {scan.foundIngredients.length > 0 ? (
                      <div>
                        <div style={{ fontSize: '14px', color: '#dc3545', marginBottom: '4px' }}>
                          Found {scan.foundIngredients.length} harmful ingredient{scan.foundIngredients.length > 1 ? 's' : ''}:
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {scan.foundIngredients.map(ing => ing.name).join(', ')}
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '14px', color: '#28a745' }}>
                        No harmful ingredients detected
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
