import { useState, useRef, useCallback } from 'react';
import { Chip, Input } from '@heroui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function TagInput({ tags, onChange, placeholder, suggestions = [] }) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const addTag = useCallback((tag) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue('');
    setShowSuggestions(false);
  }, [tags, onChange]);

  const removeTag = useCallback((tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 p-2 border border-default-200 rounded-lg min-h-[42px]">
        {tags.map((tag) => (
          <Chip
            key={tag}
            size="sm"
            onClose={() => removeTag(tag)}
            className="bg-primary-100 text-primary"
          >
            {tag}
          </Chip>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="mt-1 border border-default-200 rounded-lg shadow-lg bg-background z-50 max-h-32 overflow-y-auto">
          {filteredSuggestions.map(s => (
            <div
              key={s}
              className="px-3 py-2 hover:bg-default-100 cursor-pointer text-sm"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}