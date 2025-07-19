import React, { useState } from "react";

function Feedback() {
  const [selection, setSelection] = useState(null);
  const [comment, setComment] = useState("");

  return (
    <div className="feedback">
      <h3>Feedback</h3>
      <p>Was this classification correct?</p>
      <div>
        <button className={selection==='yes'?'selected':''}
          onClick={() => setSelection("yes")}>Yes</button>
        <button className={selection==='no'?'selected':''}
          onClick={() => setSelection("no")}>No</button>
      </div>
      <label>Feedback (optional)</label>
      <textarea
        placeholder="text..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <button className="submit-btn" onClick={() => {/* handle submit action */}}>Submit</button>
    </div>
  );
}

export default Feedback;
