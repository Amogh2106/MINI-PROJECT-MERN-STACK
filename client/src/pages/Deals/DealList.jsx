import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, Table as TableIcon, Edit2, Trash2, Briefcase } from 'lucide-react';
import { dealsApi } from '../../api/dealsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DealFormModal from './DealFormModal.jsx';
import DealBoard from './DealBoard.jsx';
import { formatCurrency, formatDate, getStageBadgeVariant } from '../../utils/formatters.js';
import { DEAL_STAGES } from '../../utils/constants.js';

const DealList = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'board'
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deletingDeal, setDeletingDeal] = useState(null);
  const [apiError, setApiError] = useState('');

  // Fetch deals (if board view, fetch all/higher limit; if table view, paginate)
  const limit = viewMode === 'board' ? 100 : 10;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['deals', { page: viewMode === 'board' ? 1 : page, limit, search, stage: stageFilter }],
    queryFn: () => dealsApi.getAll({ page: viewMode === 'board' ? 1 : page, limit, search, stage: stageFilter }),
  });

  const deals = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (newDeal) => dealsApi.create(newDeal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.refetchQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setPage(1);
      setSearch('');
      setIsModalOpen(false);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => dealsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.refetchQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsModalOpen(false);
      setEditingDeal(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }) => dealsApi.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err) => setApiError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setDeletingDeal(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const handleCreateOrUpdate = (formData) => {
    if (editingDeal) {
      updateMutation.mutate({ id: editingDeal._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canModify = (deal) => {
    if (isAdmin) return true;
    const ownerId = deal.owner?._id || deal.owner;
    return ownerId?.toString() === user?._id?.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Deals Pipeline</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track opportunities, deal sizes, stages, and close dates</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Toggle */}
          <div className="inline-flex rounded border border-gray-300 bg-white p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'table' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded ${
                viewMode === 'board' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Board
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              setEditingDeal(null);
              setApiError('');
              setIsModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {apiError}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-gray-200 rounded">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search deals by title..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {viewMode === 'table' && (
          <div className="w-full sm:w-48">
            <Select
              id="stageFilter"
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              placeholder="All Stages"
              options={DEAL_STAGES}
            />
          </div>
        )}
      </div>

      {/* Main View */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Loading deals...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600 bg-white border border-gray-200 rounded">
          {error?.message || 'Failed to load deals'}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          title="No deals found"
          description={search || stageFilter ? 'Try clearing your filters.' : 'Get started by creating your first sales opportunity.'}
          icon={Briefcase}
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingDeal(null);
                setApiError('');
                setIsModalOpen(true);
              }}
            >
              Add First Deal
            </Button>
          }
        />
      ) : viewMode === 'board' ? (
        <DealBoard
          deals={deals}
          onStageChange={(id, stage) => updateStageMutation.mutate({ id, stage })}
          canModify={canModify}
        />
      ) : (
        <div className="flex flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deal Title</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Target Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => (
                <TableRow key={deal._id}>
                  <TableCell className="font-semibold">
                    <Link
                      to={`/deals/${deal._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">
                    {formatCurrency(deal.value)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStageBadgeVariant(deal.stage)} className="capitalize">
                      {deal.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {deal.company ? (
                      <Link
                        to={`/companies/${deal.company._id}`}
                        className="hover:underline text-gray-800"
                      >
                        {deal.company.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {deal.contact ? (
                      <Link
                        to={`/contacts/${deal.contact._id}`}
                        className="hover:underline text-gray-800"
                      >
                        {deal.contact.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(deal.expectedCloseDate)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {deal.owner?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModify(deal) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingDeal(deal);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded"
                            title="Edit Deal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingDeal(deal)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={10}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Deal Form Modal */}
      <DealFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeal(null);
          setApiError('');
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingDeal}
        isLoading={createMutation.isPending || updateMutation.isPending}
        apiError={apiError}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDeal}
        onClose={() => setDeletingDeal(null)}
        onConfirm={() => deleteMutation.mutate(deletingDeal?._id)}
        title="Delete Deal"
        message={`Are you sure you want to permanently delete "${deletingDeal?.title}"?`}
        confirmText="Delete Deal"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default DealList;
