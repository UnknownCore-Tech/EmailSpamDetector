import React, { useState } from "react";
import SpamFactors from "./SpamFactors";
import Feedback from "./Feedback";
import TypewriterEffect from "./TypewriterEffect";
import config from "../config";
import { trackSpamAnalysis, trackFileUpload, trackError } from "../analytics";

function SpamForm() {
  const [email, setEmail] = useState("");
  const [urls, setUrls] = useState("");
  const [spamProb, setSpamProb] = useState(null);
  const [factors, setFactors] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [emlFile, setEmlFile] = useState(null);
  const [aiVerdict, setAiVerdict] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const getRiskLevel = (probability) => {
    if (probability < 30) return { level: 'safe', icon: '✓', text: 'Low Risk' };
    if (probability < 70) return { level: 'warning', icon: '⚠', text: 'Medium Risk' };
    return { level: 'danger', icon: '✕', text: 'High Risk' };
  };
  
  const adjustLocalAnalysis = (aiVerdict) => {
    // Extract AI confidence and verdict
    const confidenceMatch = aiVerdict.match(/\*\*CONFIDENCE\*\*: (\d+)%/);
    const verdictMatch = aiVerdict.match(/\*\*VERDICT\*\*: (\w+)/);
    
    if (confidenceMatch && verdictMatch) {
      const aiConfidence = parseInt(confidenceMatch[1]);
      const aiVerdictType = verdictMatch[1].toLowerCase();
      
      // Get current values
      const currentProb = spamProb || 15;
      const currentFactors = factors || [];
      
      let adjustedProbability = currentProb;
      let adjustmentFactors = [...currentFactors];
      
      // If AI detected high-risk content that local analysis missed
      if ((aiVerdictType === 'phishing' || aiVerdictType === 'spam') && aiConfidence >= 70 && currentProb < 50) {
        // Boost local analysis to better align with AI
        adjustedProbability = Math.min(Math.max(currentProb, 55), aiConfidence - 5);
        adjustmentFactors.push('🤖 AI detected high-risk patterns missed by local analysis');
        
        // Add specific AI-identified risks to local factors
        if (/suspicious.*url|suspicious.*domain/i.test(aiVerdict)) {
          adjustmentFactors.push('Suspicious URLs/domains confirmed by AI');
        }
        if (/missing.*sender|lack.*information/i.test(aiVerdict)) {
          adjustmentFactors.push('Missing sender information identified by AI');
        }
        if (/subject.*line/i.test(aiVerdict)) {
          adjustmentFactors.push('Subject line issues detected by AI');
        }
        if (/phishing|malicious/i.test(aiVerdict)) {
          adjustmentFactors.push('Phishing indicators confirmed by AI analysis');
        }
      }
      
      // Always update if there's a significant discrepancy (>20 points)
      if (Math.abs(adjustedProbability - currentProb) > 20) {
        setSpamProb(adjustedProbability);
        setFactors(adjustmentFactors);
      }
    }
  };

  const analyzeEmail = async () => {
    if (!email.trim() && !urls.trim() && !emlFile) {
      alert('Please provide email content, URLs, or upload an EML file.');
      return;
    }

    setIsLoading(true);
    setHasAnalyzed(false);

    // Enhanced spam detection logic for all input types
    let probability = 0;
    let detected = [];
    
    // Combine all content for analysis
    const allContent = [email, urls, emlFile?.name || ''].join(' ').toLowerCase();
    const emailContent = email.toLowerCase();
    const urlContent = urls.toLowerCase();
    
    // Email content analysis
    if (emailContent) {
      // Marketing and urgency keywords
      if (/free|discount|limited time offer|urgent|act now|click here|register now|secure.*spot/i.test(emailContent)) {
        probability += 35;
        detected.push("Suspicious marketing keywords detected");
      }
      
      if (/[A-Z]{5,}/.test(email)) {
        probability += 25;
        detected.push("Excessive use of capital letters");
      }
      
      if (/\$\d+|money|cash|prize|winner/i.test(emailContent)) {
        probability += 30;
        detected.push("Financial/monetary content detected");
      }
      
      if (/viagra|pharmacy|medication|pills/i.test(emailContent)) {
        probability += 40;
        detected.push("Pharmaceutical spam indicators");
      }
      
      // Multiple links (phishing indicator)
      if (email.match(/http[s]?:\/\//g)?.length > 2) {
        probability += 25;
        detected.push("Multiple links detected (phishing indicator)");
      }
      
      // Urgency tactics
      if (/urgent|immediate|expire|limited time|deadline|act fast|don't miss|final notice/i.test(emailContent)) {
        probability += 30;
        detected.push("Urgency manipulation tactics detected");
      }
      
      // Lack of personalization (generic greetings)
      if (/dear customer|dear user|dear sir|dear madam|hello there|greetings/i.test(emailContent) && 
          !/dear [a-z]+ [a-z]+/i.test(emailContent)) {
        probability += 25;
        detected.push("Generic greeting - lack of personalization");
      }
      
      // Training/educational content that could be phishing bait
      if (/training|course|certification|webinar|session|seminar/i.test(emailContent) && 
          /register|secure.*spot|limited|exclusive/i.test(emailContent)) {
        probability += 20;
        detected.push("Training/educational phishing bait detected");
      }
      
      // Verification/security requests
      if (/verify|confirm|update.*account|security|authentication|credentials/i.test(emailContent)) {
        probability += 30;
        detected.push("Account verification request (phishing indicator)");
      }
    }
    
    // URL analysis
    if (urlContent) {
      if (/bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|short|tiny/i.test(urlContent)) {
        probability += 30;
        detected.push("Suspicious shortened URLs detected");
      }
      if (/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(urlContent)) {
        probability += 35;
        detected.push("Direct IP addresses detected (suspicious)");
      }
      if (/fake|scam|phishing|malware|virus|trojan/i.test(urlContent)) {
        probability += 50;
        detected.push("Explicitly malicious domain keywords");
      }
      
      // Email marketing and tracking domains (often used in phishing)
      if (/exacttarget|mailchimp|constantcontact|sendgrid|mandrill|campaign|tracking|click\..*\.|view\..*\.|open\.|track\./i.test(urlContent)) {
        probability += 35;
        detected.push("Email marketing/tracking domains detected (suspicious)");
      }
      
      // Suspicious subdomain patterns
      if (/[a-z0-9]+\.[a-z]\d+\.[a-z]+/i.test(urlContent)) {
        probability += 25;
        detected.push("Suspicious subdomain patterns detected");
      }
      
      if (urls.split(',').length > 5) {
        probability += 25;
        detected.push("Multiple URLs detected (suspicious)");
      }
      
      // Check for suspicious TLDs
      if (/\.(tk|ml|ga|cf|click|download|zip|exe)\b/i.test(urlContent)) {
        probability += 40;
        detected.push("Suspicious top-level domain detected");
      }
      
      // Check for URL shortening services or redirects
      if (/redirect|goto|link|url|forward/i.test(urlContent)) {
        probability += 20;
        detected.push("URL redirection patterns detected");
      }
    }
    
    // EML file analysis
    if (emlFile) {
      probability += 15; // Base suspicion for file uploads
      detected.push("Email file attachment detected - requires analysis");
      
      if (emlFile.name.includes('suspicious') || emlFile.name.includes('spam')) {
        probability += 30;
        detected.push("Suspicious filename detected");
      }
    }
    
    // Ensure we always have some analysis
    if (probability === 0 && (email.trim() || urls.trim() || emlFile)) {
      probability = 15; // Minimal baseline
      detected.push("Content appears clean - low risk indicators");
    } else if (probability === 0) {
      detected.push("No content provided for analysis");
    }
    
    probability = Math.min(probability, 100);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSpamProb(probability);
    setFactors(detected);
    setShowFeedback(true);
    setHasAnalyzed(true);
    
    // Track analytics
    trackSpamAnalysis(probability, false);

    // Reset AI verdict/error before new request
    setAiVerdict(null);
    setAiError(null);

    // Send data to backend
    if (emlFile) {
      // Send as multipart/form-data if file is present
      const formData = new FormData();
      formData.append('email', email);
      formData.append('urls', urls);
      formData.append('emlFile', emlFile);
      
      // Track file upload
      trackFileUpload(emlFile.size);
      
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/spam/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (response.ok && data.verdict) {
          setAiVerdict(data.verdict);
          // Track AI analysis usage
          trackSpamAnalysis(spamProb || 0, true);
          // Adjust local analysis based on AI verdict
          adjustLocalAnalysis(data.verdict);
        } else if (data.error) {
          setAiError(data.error);
        } else {
          setAiError('AI service temporarily unavailable');
        }
      } catch (error) {
        setAiError('AI analysis failed: ' + error.message);
      }
    } else {
      // Send as JSON if no file is present
      const payload = {
        email,
        urls
      };
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/spam`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok && data.verdict) {
          setAiVerdict(data.verdict);
          // Adjust local analysis based on AI verdict
          adjustLocalAnalysis(data.verdict);
        } else if (data.error) {
          setAiError(data.error);
        } else {
          setAiError('AI service temporarily unavailable');
        }
      } catch (error) {
        setAiError('AI analysis failed: ' + error.message);
      }
    }
    
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setEmlFile(file);
  };

  const clearForm = () => {
    setEmail('');
    setUrls('');
    setEmlFile(null);
    setSpamProb(null);
    setFactors([]);
    setShowFeedback(false);
    setAiVerdict(null);
    setAiError(null);
    setHasAnalyzed(false);
  };

  return (
    <div className={`spam-form ${spamProb !== null ? `risk-${getRiskLevel(spamProb).level}` : ''}`}>
      <label>Email Content</label>
      <textarea
        placeholder="Paste your email content here..."
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isLoading}
      />

      <label>URLs (Optional)</label>
      <input
        type="text"
        placeholder="Enter suspicious URLs separated by commas..."
        value={urls}
        onChange={e => setUrls(e.target.value)}
        disabled={isLoading}
      />

      <label>Upload .eml File (Optional)</label>
      <div className="file-upload">
        <input
          type="file"
          accept=".eml"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <label className={`file-upload-label ${emlFile ? 'has-file' : ''}`}>
          {emlFile ? `📁 ${emlFile.name}` : '📎 Click to upload .eml file or drag & drop'}
        </label>
      </div>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          className={`analyze-btn ${isLoading ? 'loading' : ''}`} 
          onClick={analyzeEmail}
          disabled={isLoading}
        >
          {isLoading && <div className="spinner"></div>}
          {isLoading ? 'Analyzing...' : 'Analyze Email'}
        </button>
        
        {hasAnalyzed && (
          <button 
            className="analyze-btn" 
            onClick={clearForm}
            style={{ background: 'linear-gradient(135deg, #718096, #4a5568)' }}
          >
            Clear Results
          </button>
        )}
      </div>

      {spamProb !== null && (
        <div className="result">
          <div className="result-header">
            <div className={`result-icon ${getRiskLevel(spamProb).level}`}>
              {getRiskLevel(spamProb).icon}
            </div>
            <div>
              <div className="prob-text">
                Spam Probability: {spamProb}% - {getRiskLevel(spamProb).text}
              </div>
            </div>
          </div>
          <div className="prob-bar">
            <div className={`fill ${getRiskLevel(spamProb).level}`} style={{ width: spamProb + "%" }} />
          </div>
          
          {spamProb < 30 && (
            <p style={{ marginTop: '15px', color: '#38a169', fontWeight: '600' }}>
              ✅ This email appears to be legitimate with minimal spam indicators.
            </p>
          )}
          {spamProb >= 30 && spamProb < 70 && (
            <p style={{ marginTop: '15px', color: '#dd6b20', fontWeight: '600' }}>
              ⚠️ Exercise caution - this email shows moderate spam characteristics.
            </p>
          )}
          {spamProb >= 70 && (
            <p style={{ marginTop: '15px', color: '#e53e3e', fontWeight: '600' }}>
              🚨 High spam probability - this email is likely malicious.
            </p>
          )}
        </div>
      )}

      {aiVerdict && (
        <div className="ai-verdict">
          <h4>🤖 AI Analysis</h4>
          <div className="ai-analysis-container">
            <TypewriterEffect 
              text={aiVerdict} 
              speed={20} 
              onComplete={() => console.log('AI analysis typing complete!')} 
            />
          </div>
        </div>
      )}
      
      {aiError && (
        <div className="ai-error">
          <strong>🚫 AI Analysis Error:</strong> {aiError}
          <p style={{ fontSize: '0.9rem', marginTop: '8px', opacity: '0.8' }}>
            Don't worry! The local analysis above is still accurate.
          </p>
        </div>
      )}

      {factors.length > 0 && <SpamFactors factors={factors} />}

      {showFeedback && <Feedback />}
    </div>
  );
}

export default SpamForm;
