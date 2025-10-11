// components/ui/loader.tsx
'use client';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Loader = ({ size = 'md', className }: LoaderProps) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <span className={`inline-block ${sizes[size]} bg-teal-600 rounded-full animate-bounce`}></span>
      <span className={`inline-block ${sizes[size]} bg-teal-600 rounded-full animate-bounce200`}></span>
      <span className={`inline-block ${sizes[size]} bg-teal-600 rounded-full animate-bounce400`}></span>

      <style jsx>{`
        .animate-bounce200 {
          animation: bounce 0.6s infinite 0.2s;
        }
        .animate-bounce400 {
          animation: bounce 0.6s infinite 0.4s;
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
