import React, { memo } from 'react';

interface LoadingModalProps {
  title?: string;
  message?: string;
  variant?: 'default' | 'gradient' | 'minimal' | 'floating';
}

export const LoadingModal: React.FC<LoadingModalProps> = memo(({
  title = "Loading",
  message = "Please wait",
  variant = 'default'
}) => {
  const getSpinnerDesign = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="relative mb-6">
            {/* Gradient Rings */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-1 animate-spin">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"></div>
              </div>
            </div>
          </div>
        );
      
      case 'floating':
        return (
          <div className="relative mb-6">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.4s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        );
      
      case 'minimal':
        return (
          <div className="relative mb-6">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        );
      
      default:
        return (
          <div className="relative mb-6">
            {/* Multi-layer Spinner */}
            <div className="w-16 h-16 border-4 border-purple-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-purple-400 rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-12 h-12 border-3 border-transparent border-t-pink-500 border-l-pink-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 max-w-sm mx-4 transform animate-scale-in">
        <div className="flex flex-col items-center">
          {getSpinnerDesign()}

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            <div className="flex items-center justify-center space-x-1">
              <span className="text-gray-600 text-sm">{message}</span>
              <div className="flex space-x-1 ml-2">
                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-loading-bar"
              style={{
                animation: 'loading-bar 2s ease-in-out infinite'
              }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        @keyframes scale-in {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(10px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0px); 
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

LoadingModal.displayName = 'LoadingModal';
