import React from 'react';

const EmptyState = ({ title, description, actionButton, icon: Icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded text-center">
      {Icon && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-full text-gray-400 mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-1 text-xs text-gray-500 max-w-sm">{description}</p>}
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
