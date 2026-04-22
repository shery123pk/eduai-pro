const LoadingSpinner = ({ size = 'md', message }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-4 border-primary/30 border-t-primary rounded-full animate-spin`} />
      {message && (
        <p className="text-slate-400 text-sm animate-pulse-slow">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
