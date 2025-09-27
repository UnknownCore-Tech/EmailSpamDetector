import React from "react";

function SpamFactors({ factors }) {
  const getFactorIcon = (factor) => {
    if (factor.includes('No significant')) return '✅';
    if (factor.includes('keywords') || factor.includes('marketing')) return '🎯';
    if (factor.includes('capital') || factor.includes('letters')) return '📢';
    if (factor.includes('Financial') || factor.includes('money')) return '💰';
    if (factor.includes('Pharmaceutical') || factor.includes('medication')) return '💊';
    if (factor.includes('links') || factor.includes('Multiple')) return '🔗';
    if (factor.includes('Urgency') || factor.includes('manipulation')) return '⏰';
    return '⚠️';
  };

  return (
    <div className="factors">
      <h3>🔍 Detection Factors</h3>
      <ul>
        {factors.map((factor, idx) => (
          <li key={idx}>
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>
              {getFactorIcon(factor)}
            </span>
            {factor}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SpamFactors;
