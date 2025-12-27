interface GlobalLoaderProps {
  size?: 'small' | 'medium' | 'large';
  fullPage?: boolean;
  className?: string;
}

export default function GlobalLoader({ 
  size = 'medium', 
  fullPage = false,
  className = ''
}: GlobalLoaderProps) {
  const sizeMap = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-[3px]'
  };

  const loader = (
    <div 
      className={`${sizeMap[size]} border-emerald-600 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {loader}
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return loader;
}
