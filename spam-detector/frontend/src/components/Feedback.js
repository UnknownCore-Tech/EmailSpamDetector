import React, { useState } from "react";

function Feedback() {
  const [selection, setSelection] = useState(null);
  const [comment, setComment] = useState("");

  return (
    <div className="feedback">
      <h3>💬 Help us improve</h3>
      <p>Was this spam analysis accurate?</p>
      <div className="feedback-buttons">
        <button 
          className={selection==='yes'?'selected':''}
          onClick={() => setSelection("yes")}
        >
          👍 Yes, accurate
        </button>
        <button 
          className={selection==='no'?'selected':''}
          onClick={() => setSelection("no")}
        >
          👎 No, incorrect
        </button>
      </div>
      <label>Additional feedback (optional)</label>
      <textarea
        placeholder="Tell us what we missed or what could be better..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />
      <button 
        className="submit-btn" 
        onClick={() => {
          alert('Thank you for your feedback! This helps us improve our detection.');
          setSelection(null);
          setComment('');
        }}
        disabled={!selection}
      >
        🚀 Submit Feedback
      </button>
    </div>
  );
}

export default Feedback;
