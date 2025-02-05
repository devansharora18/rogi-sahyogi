import React, { useRef, useEffect } from 'react';

const AutoResizeTextarea = ({ value, onChange, ...props }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (event) => {
    onChange(event);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      style={{ overflow: 'hidden' }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
