import React from "react";

/**
 * simple star rater
 * Props:
 *  - value: number (0..5)
 *  - onChange: (n) => void
 */
export default function StarRater({ value = 0, onChange }) {
  const [val, setVal] = React.useState(value);

  React.useEffect(() => setVal(value), [value]);

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => { setVal(n); onChange?.(n); }}
          aria-label={`${n} star`}
          className={`text-2xl leading-none focus:outline-none ${n <= val ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
