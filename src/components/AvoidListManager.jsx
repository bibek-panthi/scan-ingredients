import React, { useState } from 'react';

const AvoidListManager = ({ 
  ingredients, 
  enabledIngredients, 
  onToggleIngredient, 
  onAddCustomIngredient,
  onDeleteIngredient 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    description: '',
    severity: 'Medium',
    whyHarmful: ''
  });

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

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.name.trim()) return;

    const ingredient = {
      id: `custom_${Date.now()}`,
      name: newIngredient.name.trim(),
      aliases: [newIngredient.name.trim().toLowerCase()],
      severity: newIngredient.severity,
      description: newIngredient.description.trim() || 'Custom ingredient',
      whyHarmful: newIngredient.whyHarmful.trim() || 'User-defined harmful ingredient',
      sourceLink: '',
      isCustom: true
    };

    onAddCustomIngredient(ingredient);
    setNewIngredient({ name: '', description: '', severity: 'Medium', whyHarmful: '' });
    setShowAddForm(false);
  };

  const sortedIngredients = [...ingredients].sort((a, b) => {
    // Sort by severity first (High > Medium > Low), then by name
    const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="card">
      <h2>Avoid List Management</h2>
      <p>Toggle ingredients you want to check for when scanning labels:</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="button" 
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Custom Ingredient'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa' }}>
          <h3>Add Custom Ingredient</h3>
          <form onSubmit={handleAddIngredient}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Ingredient name (required)"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="Short description"
                value={newIngredient.description}
                onChange={(e) => setNewIngredient({ ...newIngredient, description: e.target.value })}
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Why is it harmful?"
                value={newIngredient.whyHarmful}
                onChange={(e) => setNewIngredient({ ...newIngredient, whyHarmful: e.target.value })}
                style={{ width: '100%', padding: '8px', height: '60px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newIngredient.severity}
                onChange={(e) => setNewIngredient({ ...newIngredient, severity: e.target.value })}
                style={{ padding: '8px' }}
              >
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟠 Medium</option>
                <option value="High">🔴 High</option>
              </select>
            </div>
            <button type="submit" className="button">Add Ingredient</button>
          </form>
        </div>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {sortedIngredients.map(ingredient => (
          <div key={ingredient.id} className="ingredient-item">
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <span style={{ marginRight: '8px' }}>
                {getSeverityIcon(ingredient.severity)}
              </span>
              <div>
                <div style={{ fontWeight: 'bold' }}>
                  {ingredient.name}
                  {ingredient.isCustom && (
                    <span style={{ 
                      fontSize: '12px', 
                      background: '#e3f2fd', 
                      padding: '2px 6px', 
                      borderRadius: '12px',
                      marginLeft: '8px'
                    }}>
                      Custom
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {ingredient.description}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {ingredient.isCustom && (
                <button
                  onClick={() => onDeleteIngredient(ingredient.id)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              )}
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={enabledIngredients.has(ingredient.id)}
                  onChange={() => onToggleIngredient(ingredient.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>
          <strong>Enabled:</strong> {enabledIngredients.size} of {ingredients.length} ingredients
        </p>
        <p>
          <strong>Legend:</strong> 🔴 High severity • 🟠 Medium severity • 🟢 Low severity
        </p>
      </div>
    </div>
  );
};

export default AvoidListManager;
