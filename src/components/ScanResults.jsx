import React from 'react';

const ScanResults = ({ results, onIngredientClick, onScanAgain }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'High': return '🔴';
      case 'Medium': return '🟠';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'High': return 'severity-high';
      case 'Medium': return 'severity-medium';
      case 'Low': return 'severity-low';
      default: return '';
    }
  };

  const getOverallRisk = () => {
    if (!results.foundIngredients.length) return 'safe';
    
    const hasHigh = results.foundIngredients.some(ing => ing.severity === 'High');
    const hasMedium = results.foundIngredients.some(ing => ing.severity === 'Medium');
    
    if (hasHigh) return 'high';
    if (hasMedium) return 'medium';
    return 'low';
  };

  const overallRisk = getOverallRisk();

  if (results.foundIngredients.length === 0) {
    return (
      <div className="card" style={{ background: '#d4edda', borderColor: '#c3e6cb' }}>
        <div style={{ textAlign: 'center', color: '#155724' }}>
          <div style={{ fontSize: '64px', margin: '20px 0' }}>✅</div>
          <h2>Great News!</h2>
          <p style={{ fontSize: '18px' }}>
            No flagged ingredients found in this product.
          </p>
          <p>
            This product appears to be free from the harmful ingredients in your avoid list.
          </p>
        </div>
        
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button onClick={onScanAgain} className="button success">
            Scan Another Product
          </button>
        </div>

        {results.extractedText && (
          <details style={{ marginTop: '20px', fontSize: '14px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              View extracted text
            </summary>
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#f8f9fa', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap'
            }}>
              {results.extractedText}
            </div>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="card" style={{ 
      background: overallRisk === 'high' ? '#f8d7da' : 
                 overallRisk === 'medium' ? '#fff3cd' : '#d1ecf1',
      borderColor: overallRisk === 'high' ? '#f5c6cb' : 
                  overallRisk === 'medium' ? '#ffeaa7' : '#bee5eb'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '64px', margin: '20px 0' }}>
          {overallRisk === 'high' ? '❌' : overallRisk === 'medium' ? '⚠️' : '⚠️'}
        </div>
        <h2 style={{ 
          color: overallRisk === 'high' ? '#721c24' : 
                 overallRisk === 'medium' ? '#856404' : '#0c5460'
        }}>
          {overallRisk === 'high' ? 'High Risk Ingredients Detected' :
           overallRisk === 'medium' ? 'Concerning Ingredients Found' :
           'Low Risk Ingredients Found'}
        </h2>
        <p style={{ fontSize: '16px' }}>
          Found <strong>{results.foundIngredients.length}</strong> ingredient{results.foundIngredients.length > 1 ? 's' : ''} from your avoid list:
        </p>
      </div>

      <div className="results-container">
        {results.foundIngredients
          .sort((a, b) => {
            // Sort by severity (High > Medium > Low)
            const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
          })
          .map((ingredient, index) => (
            <div 
              key={ingredient.id}
              className="ingredient-item"
              style={{ 
                cursor: 'pointer',
                borderLeft: `4px solid ${
                  ingredient.severity === 'High' ? '#dc3545' :
                  ingredient.severity === 'Medium' ? '#ffc107' : '#28a745'
                }`
              }}
              onClick={() => onIngredientClick(ingredient)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  <span style={{ marginRight: '8px' }}>
                    {getSeverityIcon(ingredient.severity)}
                  </span>
                  {ingredient.name}
                  <span style={{ 
                    marginLeft: '8px',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    background: ingredient.severity === 'High' ? '#dc3545' :
                              ingredient.severity === 'Medium' ? '#ffc107' : '#28a745',
                    color: ingredient.severity === 'Medium' ? '#000' : '#fff'
                  }}>
                    {ingredient.severity}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  {ingredient.description}
                </div>
                {ingredient.matchedAlias && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#888',
                    fontFamily: 'monospace',
                    background: '#f8f9fa',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Detected as: "{ingredient.matchedAlias}"
                  </div>
                )}
              </div>
              <div style={{ color: '#666', fontSize: '20px' }}>
                →
              </div>
            </div>
          ))}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: overallRisk === 'high' ? '#721c24' : 
                   overallRisk === 'medium' ? '#856404' : '#0c5460',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Recommendation</h3>
        <p style={{ margin: 0 }}>
          {overallRisk === 'high' 
            ? '🚫 Avoid this product. High-risk ingredients detected.'
            : overallRisk === 'medium'
            ? '⚠️ Consider alternatives. Medium-risk ingredients present.'
            : '⚠️ Use with caution. Low-risk ingredients detected.'}
        </p>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={onScanAgain} className="button">
          Scan Another Product
        </button>
      </div>

      {results.extractedText && (
        <details style={{ marginTop: '20px', fontSize: '14px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            View extracted text
          </summary>
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: 'rgba(255,255,255,0.5)', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {results.extractedText}
          </div>
        </details>
      )}
    </div>
  );
};

export default ScanResults;
