import React from 'react';

interface TagSelectProps {
  label: string;
  /** Existing tag values already registered in the question bank. */
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Message shown in the dropdown when there are no existing options yet. */
  emptyHint?: string;
}

const OTHER = '__other__';

/**
 * A dropdown of existing question-bank tags (subjects / classes / topics) plus
 * an "Other (add new)" choice. Picking "Other" reveals a text box — the only
 * way to type a brand-new tag, which is then created in the bank on save.
 */
const TagSelect: React.FC<TagSelectProps> = ({ label, options, value, onChange, placeholder, disabled, emptyHint }) => {
  // If the current value isn't one of the known options (and isn't empty), the
  // teacher is entering a new tag → show the free-text box.
  const isOther = Boolean(value) && !options.includes(value);
  const [otherMode, setOtherMode] = React.useState(isOther);

  React.useEffect(() => {
    // Keep in sync if the value is externally set to a known option.
    if (value && options.includes(value)) setOtherMode(false);
  }, [value, options]);

  const showOther = otherMode || isOther;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        value={showOther ? OTHER : value}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === OTHER) {
            setOtherMode(true);
            onChange('');
          } else {
            setOtherMode(false);
            onChange(e.target.value);
          }
        }}
        className="w-full p-2 border rounded bg-white disabled:bg-gray-100"
      >
        <option value="">{disabled ? (emptyHint || 'Unavailable') : `Select ${label.toLowerCase()}…`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={OTHER}>+ Other (add new)</option>
      </select>
      {showOther && (
        <input
          type="text"
          value={value}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `New ${label.toLowerCase()}`}
          className="w-full p-2 border rounded"
        />
      )}
    </div>
  );
};

export default TagSelect;
