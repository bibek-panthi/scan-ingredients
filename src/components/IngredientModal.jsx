import React from 'react';

const IngredientModal = ({ ingredient, onClose }) => {
  if (!ingredient) return null;

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

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{getSeverityIcon(ingredient.severity)}</span>
            {ingredient.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: 'white',
            background: ingredient.severity === 'High' ? '#dc3545' : 
                       ingredient.severity === 'Medium' ? '#ffc107' : '#28a745'
          }}>
            {ingredient.severity} Risk
          </div>
          {ingredient.isCustom && (
            <div style={{ 
              display: 'inline-block',
              marginLeft: '8px',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '14px',
              background: '#e3f2fd',
              color: '#1976d2'
            }}>
              Custom Ingredient
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Description</h3>
          <p>{ingredient.description}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Why It's Harmful</h3>
          <p>{ingredient.whyHarmful}</p>
        </div>

        {ingredient.matchedAlias && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Detected As</h3>
            <p style={{ 
              background: '#f8f9fa',
              padding: '8px 12px',
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}>
              "{ingredient.matchedAlias}"
            </p>
          </div>
        )}

        {ingredient.aliases && ingredient.aliases.length > 1 && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Also Known As</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {ingredient.aliases.map((alias, index) => (
                <span
                  key={index}
                  style={{
                    background: '#e9ecef',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {ingredient.sourceLink && (
          <div style={{ marginBottom: '20px' }}>
            <h3>Learn More</h3>
            <a 
              href={ingredient.sourceLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'none' }}
            >
              View Source →
            </a>
          </div>
        )}

        <button 
          onClick={onClose}
          className="button"
          style={{ width: '100%' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default IngredientModal;
