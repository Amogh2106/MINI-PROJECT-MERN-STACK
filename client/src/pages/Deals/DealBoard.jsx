import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, User, Calendar } from 'lucide-react';
import { DEAL_STAGES } from '../../utils/constants.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const DealBoard = ({ deals, onStageChange, canModify }) => {
  // Group deals by stage
  const dealsByStage = DEAL_STAGES.reduce((acc, stage) => {
    acc[stage.value] = deals.filter((d) => d.stage === stage.value);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 overflow-x-auto pb-4">
      {DEAL_STAGES.map((stage) => {
        const stageDeals = dealsByStage[stage.value] || [];
        const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

        return (
          <div
            key={stage.value}
            className="bg-gray-100 border border-gray-200 rounded flex flex-col min-w-[220px]"
          >
            {/* Stage Column Header */}
            <div className="p-3 border-b border-gray-200 bg-white rounded-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {stage.label}
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                  {stageDeals.length}
                </span>
              </div>
              <div className="text-[11px] font-medium text-gray-500 mt-1">
                {formatCurrency(totalValue)}
              </div>
            </div>

            {/* Cards List */}
            <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
              {stageDeals.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400">
                  No deals in {stage.label.toLowerCase()}
                </div>
              ) : (
                stageDeals.map((deal) => (
                  <div
                    key={deal._id}
                    className="p-3 bg-white border border-gray-200 rounded shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        to={`/deals/${deal._id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600 hover:underline leading-snug"
                      >
                        {deal.title}
                      </Link>
                    </div>

                    <div className="text-sm font-bold text-gray-800">
                      {formatCurrency(deal.value)}
                    </div>

                    <div className="space-y-1 text-gray-500 text-[11px]">
                      {deal.company && (
                        <div className="flex items-center gap-1 truncate">
                          <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{deal.company.name}</span>
                        </div>
                      )}

                      {deal.owner && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>{deal.owner.name}</span>
                        </div>
                      )}

                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>Close: {formatDate(deal.expectedCloseDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Change Stage Dropdown (No drag and drop) */}
                    {canModify(deal) && (
                      <div className="pt-2 border-t border-gray-100">
                        <label className="block text-[10px] text-gray-400 font-semibold mb-1">
                          MOVE STAGE
                        </label>
                        <select
                          value={deal.stage}
                          onChange={(e) => onStageChange(deal._id, e.target.value)}
                          className="w-full text-xs py-1 px-2 bg-gray-50 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                          {DEAL_STAGES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DealBoard;
