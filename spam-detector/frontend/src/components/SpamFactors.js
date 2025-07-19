import React from "react";

function SpamFactors({ factors }) {
  return (
    <div className="factors">
      <h3>Spam Classification Factors</h3>
      <ul>
        {factors.map((fac, idx) => (
          <li key={idx}>⚠️ {fac}</li>
        ))}
      </ul>
    </div>
  );
}

export default SpamFactors;
