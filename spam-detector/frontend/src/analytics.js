import config from './config';

// Google Analytics 4 (gtag) implementation
export const initGA = () => {
  if (!config.GOOGLE_ANALYTICS_ID || config.NODE_ENV !== 'production') {
    console.log('Google Analytics not initialized (development mode or missing ID)');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.GOOGLE_ANALYTICS_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', config.GOOGLE_ANALYTICS_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });

  console.log('Google Analytics initialized');
};

// Track custom events
export const trackEvent = (action, category = 'General', label = '', value = 0) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track spam analysis
export const trackSpamAnalysis = (spamProbability, hasAIAnalysis = false) => {
  trackEvent('spam_analysis', 'Analysis', `probability_${Math.floor(spamProbability/10)*10}`, spamProbability);
  
  if (hasAIAnalysis) {
    trackEvent('ai_analysis_used', 'AI', '', 1);
  }
};

// Track file upload
export const trackFileUpload = (fileSize) => {
  trackEvent('file_upload', 'Upload', 'eml_file', fileSize);
};

// Track errors
export const trackError = (errorType, errorMessage) => {
  trackEvent('error', 'Error', `${errorType}: ${errorMessage}`, 1);
};