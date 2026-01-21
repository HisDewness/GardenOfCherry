import React, { useState } from 'react';
import '../Accordion.css';

const LAYOUTS = [
  { id: 'flat', label: 'FLAT', icon: '⊞' },
  { id: 'table', label: 'TABLE', icon: '▦' },
  { id: 'sphere', label: 'SPHERE', icon: '◉' },
  { id: 'helix', label: 'HELIX', icon: '𝌀' },
  { id: 'grid', label: 'GRID', icon: '▣' },
];

const Accordion = ({ currentLayout, onLayoutChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleLayoutSelect = (layoutId) => {
    onLayoutChange(layoutId);
    setIsOpen(false);
  };

  const currentLayoutObj = LAYOUTS.find(l => l.id === currentLayout) || LAYOUTS[0];

  return (
    <div className={`accordion ${disabled ? 'accordion--disabled' : ''}`}>
      <button
        className={`accordion__toggle ${isOpen ? 'accordion__toggle--open' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
        title={disabled ? 'Select a specific year to enable 3D layouts' : 'Change layout'}
      >
        <span className="accordion__icon">{currentLayoutObj.icon}</span>
        <span className="accordion__label">{currentLayoutObj.label}</span>
        <span className={`accordion__arrow ${isOpen ? 'accordion__arrow--open' : ''}`}>▼</span>
      </button>

      {isOpen && !disabled && (
        <div className="accordion__menu">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              className={`accordion__item ${currentLayout === layout.id ? 'accordion__item--active' : ''}`}
              onClick={() => handleLayoutSelect(layout.id)}
            >
              <span className="accordion__item-icon">{layout.icon}</span>
              <span className="accordion__item-label">{layout.label}</span>
            </button>
          ))}
        </div>
      )}

      {disabled && (
        <div className="accordion__hint">
          Select a year to enable 3D layouts
        </div>
      )}
    </div>
  );
};

export default Accordion;
