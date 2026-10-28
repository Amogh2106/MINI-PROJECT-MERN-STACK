import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, valueColor = 'text-gray-900' }) => {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {Icon && (
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-gray-600">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
