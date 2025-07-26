import React, { useState } from "react";
import SpamFactors from "./SpamFactors";
import Feedback from "./Feedback";

function SpamForm() {
  const [email, setEmail] = useState("");
  const [urls, setUrls] = useState("");
  const [spamProb, setSpamProb] = useState(null);
  const [factors, setFactors] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [emlFile, setEmlFile] = useState(null);

  const analyzeEmail = async () => {
    // Simple spam detection logic for demo purposes:
    let probability = 0;
    let detected = [];

    if (/free|discount|limited time offer/i.test(email)) {
      probability += 40;
      detected.push("Suspicious Keywords: 'Free', 'Discount', 'Limited Time Offer'");
    }
    if (/[A-Z]{5,}/.test(email)) {
      probability += 20;
      detected.push("Excessive Use of Capital Letters");
    }
    if (/xyz@\w+\.\w+/.test(email) || /unusualdomain/.test(email)) {
      probability += 15;
      detected.push("Unusual Sender Address");
    }
    if (probability === 0) {
      detected.push("No significant spam indicators found.");
    }
    probability = Math.min(probability + 35, 100);

    setSpamProb(probability);
    setFactors(detected);
    setShowFeedback(true);

    // Send data to backend
    if (emlFile) {
      // Send as multipart/form-data if file is present
      const formData = new FormData();
      formData.append('email', email);
      formData.append('urls', urls);
      formData.append('emlFile', emlFile);
      try {
        const response = await fetch('http://localhost:8080/api/spam/upload', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          console.log('Data with file sent to backend');
        } else {
          console.error('Failed to send data with file to backend');
        }
      } catch (error) {
        console.error('Error sending data with file:', error);
      }
    } else {
      // Send as JSON if no file is present
      const payload = {
        email,
        urls
      };
      try {
        const response = await fetch('http://localhost:8080/api/spam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          console.log('Data sent to backend');
        } else {
          console.error('Failed to send data to backend');
        }
      } catch (error) {
        console.error('Error sending data:', error);
      }
    }
  };

  return (
    <div className="spam-form">
      <h2>Analyze Email for Spam</h2>
      <label>Email Content</label>
      <textarea
        placeholder="Email Body"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <label>URLs (optional)</label>
      <input
        type="text"
        placeholder="Add URLs (optional)"
        value={urls}
        onChange={e => setUrls(e.target.value)}
      />

      <label>Upload .eml File</label>
      <input
        type="file"
        accept=".eml"
        onChange={e => setEmlFile(e.target.files[0])}
      />

      <button className="analyze-btn" onClick={analyzeEmail}>Analyze</button>

      {spamProb !== null && (
        <div className="result">
          <div>Spam Probability: <b>{spamProb}%</b></div>
          <div className="prob-bar">
            <div className="fill" style={{ width: spamProb + "%" }} />
          </div>
        </div>
      )}

      {factors.length > 0 && <SpamFactors factors={factors} />}

      {showFeedback && <Feedback />}
    </div>
  );
}

export default SpamForm;
