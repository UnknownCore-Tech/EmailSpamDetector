import React, { useState, useEffect } from 'react';

const TypewriterEffect = ({ text, speed = 30, onComplete = () => {} }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text || currentIndex >= text.length) {
      if (!isComplete && text) {
        setIsComplete(true);
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayText(text.substring(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isComplete, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Convert markdown-style formatting to HTML
  const formatText = (text) => {
    return text
      // Convert **bold** to <strong>bold</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *italic* to <em>italic</em>
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Preserve line breaks
      .replace(/\n/g, '<br />');
  };

  const formattedText = formatText(displayText);

  return (
    <div className="typewriter-container">
      <div 
        style={{ 
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          color: 'inherit'
        }}
        dangerouslySetInnerHTML={{ __html: formattedText }}
      />
      {!isComplete && <span className="typing-cursor">▋</span>}
    </div>
  );
};

export default TypewriterEffect;
