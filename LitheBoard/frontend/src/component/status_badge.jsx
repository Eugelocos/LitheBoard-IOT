import React from 'react';
import Badge from '@mui/material/Badge';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const StatusBadge = ({ status }) => {
  const renderContent = () => {
    switch (status) {
      case 1: // Loading
        return (
          <Badge
            overlap="circular"
            badgeContent={
              <div className="bg-blue-500 text-white rounded-full px-2 py-1">
                <CircularProgress size={20} sx={{ color: '#232939' }} />
              </div>
            }
          />
        );
      case 2: // Success
        return (
          <Badge
            overlap="circular"
            badgeContent={
              <div className="flex items-center gap-2 bg-green-500 text-white rounded-full px-2 py-1">
                <CheckCircleIcon fontSize="small" sx={{ color: '#FFFFFF' }} />
                <span className="text-sm">Success</span>
              </div>
            }
          />
        );
      case 3: // Error
        return (
          <Badge
            overlap="circular"
            badgeContent={
              <div className="flex items-center gap-2 bg-[#df6d6c] text-white rounded-full px-2 py-1">
                <ErrorIcon fontSize="small" sx={{ color: '#FFFFFF' }} />
                <span className="text-sm">Error</span>
              </div>
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center w-auto h-auto">
      {renderContent()}
    </div>
  );
};

export default StatusBadge;
