import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  loading,
  children,
  className = "",
  fullWidth = false,
  ...props
}) => (
  <button
    className={`py-3 rounded-lg text-white ${
      loading || props.disabled
        ? "bg-indigo-400 cursor-not-allowed"
        : "bg-indigo-600 hover:bg-indigo-700"
    } ${className} ${fullWidth ? "w-full" : ""}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? "Loading…" : children}
  </button>
);

export default Button;
