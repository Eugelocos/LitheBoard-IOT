import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-[#e7e7e7]">
      <h1 className="relative text-[120px] font-extrabold uppercase tracking-wide text-[#d4d4d4]
                     bg-gradient-to-r from-[#b8b8b8] via-[#d4d4d4] to-[#b8b8b8]
                     bg-clip-text text-transparent animate-[shimmer_2s_infinite]">
        Litheboard
      </h1>

      {/* Animación personalizada */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingIndicator;
