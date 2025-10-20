// src/components/UI/LoadingSpinner.jsx
const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'size-4',
    md: 'size-8',
    lg: 'size-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;