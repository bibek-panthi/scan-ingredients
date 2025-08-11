import React, { useState } from 'react';

const Watchlist = ({ 
  ingredients, 
  enabledIngredients, 
  onToggleIngredient, 
  onAddCustomIngredient, 
  onDeleteIngredient 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, enabled, disabled, custom
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    severity: 'medium',
    description: '',
    categories: []
  });

  // Filter ingredients based on search and filter type
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ingredient.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterType) {
      case 'enabled':
        return enabledIngredients.has(ingredient.id);
      case 'disabled':
        return !enabledIngredients.has(ingredient.id);
      case 'custom':
        return ingredient.isCustom;
      default:
        return true;
    }
  });

  const handleAddIngredient = (e) => {
    e.preventDefault();
    
    if (!newIngredient.name.trim()) {
      alert('Please enter an ingredient name');
      return;
    }
    
    const ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name.trim(),
      severity: newIngredient.severity,
      description: newIngredient.description.trim() || `Custom ingredient: ${newIngredient.name}`,
      categories: ['custom'],
      isCustom: true
    };
    
    onAddCustomIngredient(ingredient);
    
    // Reset form
    setNewIngredient({
      name: '',
      severity: 'medium',
      description: '',
      categories: []
    });
    setShowAddForm(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚫';
      case 'medium': return '⚠️';
      case 'low': return '⚡';
      default: return '❓';
    }
  };

  const enabledCount = ingredients.filter(ing => enabledIngredients.has(ing.id)).length;
  const customCount = ingredients.filter(ing => ing.isCustom).length;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>📋 Ingredient Watchlist</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            {enabledCount} of {ingredients.length} ingredients enabled • {customCount} custom
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="button"
          style={{ background: '#28a745' }}
        >
          {showAddForm ? 'Cancel' : '+ Add Custom'}
        </button>
      </div>

      {/* Add Custom Ingredient Form */}
      {showAddForm && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Add Custom Ingredient</h3>
          <form onSubmit={handleAddIngredient}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Ingredient Name *
              </label>
              <input
                type="text"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                placeholder="e.g., Red Dye #40, MSG, etc."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Severity Level
              </label>
              <select
                value={newIngredient.severity}
                onChange={(e) => setNewIngredient({ ...newIngredient, severity: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="low">🟢 Low - Minor concern</option>
                <option value="medium">🟡 Medium - Moderate concern</option>
                <option value="high">🔴 High - Major concern</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description (Optional)
              </label>
              <textarea
                value={newIngredient.description}
                onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                placeholder="Why do you want to avoid this ingredient?"
                rows="3"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="button" style={{ background: '#28a745' }}>
                Add Ingredient
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="button"
                style={{ background: '#6c757d' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1,
              minWidth: '200px',
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Ingredients</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
            <option value="custom">Custom Only</option>
          </select>
        </div>
      </div>

      {/* Ingredients List */}
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {filteredIngredients.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 10px 0' }}>🔍</p>
            <p>No ingredients found</p>
            {searchTerm && (
              <p style={{ fontSize: '14px' }}>
                Try adjusting your search or filters
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredIngredients.map((ingredient) => (
              <div
                key={ingredient.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: enabledIngredients.has(ingredient.id) ? '#f8fff8' : '#f8f9fa',
                  borderColor: enabledIngredients.has(ingredient.id) ? '#28a745' : '#ddd'
                }}
              >
                <input
                  type="checkbox"
                  checked={enabledIngredients.has(ingredient.id)}
                  onChange={() => onToggleIngredient(ingredient.id)}
                  style={{ marginRight: '12px', transform: 'scale(1.2)' }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px' }}>
                      {getSeverityIcon(ingredient.severity)}
                    </span>
                    <strong style={{ fontSize: '16px' }}>{ingredient.name}</strong>
                    {ingredient.isCustom && (
                      <span style={{ 
                        fontSize: '12px', 
                        background: '#007bff', 
                        color: 'white', 
                        padding: '2px 6px', 
                        borderRadius: '10px' 
                      }}>
                        CUSTOM
                      </span>
                    )}
                    <span style={{ 
                      fontSize: '12px', 
                      background: getSeverityColor(ingredient.severity), 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {ingredient.severity}
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {ingredient.description}
                  </p>
                  {ingredient.categories && ingredient.categories.length > 0 && (
                    <div style={{ marginTop: '6px' }}>
                      {ingredient.categories.map((category, index) => (
                        <span
                          key={index}
                          style={{
                            fontSize: '11px',
                            background: '#e9ecef',
                            color: '#495057',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            marginRight: '4px'
                          }}
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {ingredient.isCustom && (
                  <button
                    onClick={() => onDeleteIngredient(ingredient.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      padding: '5px',
                      fontSize: '16px',
                      marginLeft: '10px'
                    }}
                    title="Delete custom ingredient"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {ingredients.length > 0 && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#e9ecef', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#495057'
        }}>
          <strong>💡 Pro Tip:</strong> Enable ingredients you want to avoid. CleanScan will alert you when they're found in product labels.
        </div>
      )}
    </div>
  );
};

export default Watchlist;
