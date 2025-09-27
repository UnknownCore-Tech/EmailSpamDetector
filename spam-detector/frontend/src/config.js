const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  
  // Feature flags
  ENABLE_AI_ANALYSIS: process.env.REACT_APP_ENABLE_AI_ANALYSIS !== 'false',
  
  // Analytics
  GOOGLE_ANALYTICS_ID: process.env.REACT_APP_GOOGLE_ANALYTICS_ID,
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // App info
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  APP_NAME: 'EmailSpamDetector'
};

export default config;