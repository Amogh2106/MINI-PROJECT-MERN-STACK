import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Trash2, DollarSign, Building2, User, Calendar, CheckCircle2 } from 'lucide-react';
import { dealsApi } from '../../api/dealsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DealFormModal from './DealFormModal.jsx';
import NotesSection from '../../components/common/NotesSection.jsx';
import { formatCurrency, formatDate, getStageBadgeVariant } from '../../utils/formatters.js';
import { DEAL_STAGES } from '../../utils/constants.js';

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['deal', id],
    queryFn: () => dealsApi.getById(id),
  });

  const deal = data?.data;

  const updateMutation = useMutation({
    mutationFn: (updateData) => dealsApi.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsEditOpen(false);
      setErrorMsg('');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage) => dealsApi.updateStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => dealsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      navigate('/deals');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading opportunity details...</div>;
  }

  if (isError || !deal) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded">
        <p className="text-sm text-red-600 mb-3">{error?.message || 'Deal not found'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/deals')}>
          Back to Deals
        </Button>
      </div>
    );
  }

  const canModify = isAdmin || deal.owner?._id?.toString() === user?._id?.toString();

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/deals"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Deals Pipeline
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{deal.title}</h1>
              <Badge variant={getStageBadgeVariant(deal.stage)} className="capitalize">
                {deal.stage}
              </Badge>
            </div>
            <div className="text-lg font-bold text-gray-800 mt-0.5">
              {formatCurrency(deal.value)}
            </div>
          </div>

          {canModify && (
            <div className="flex items-center gap-2">
              <select
                value={deal.stage}
                onChange={(e) => updateStageMutation.mutate(e.target.value)}
                className="text-xs py-1.5 px-2 bg-white border border-gray-300 rounded text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {DEAL_STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    Stage: {s.label}
                  </option>
                ))}
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteOpen(true)}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {errorMsg}
        </div>
      )}

      {/* Grid: Deal Info + Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
              Deal Overview
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Deal Value</span>
                <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  {formatCurrency(deal.value)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Pipeline Stage</span>
                <span className="font-medium text-gray-900 capitalize flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  {deal.stage}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Target Company</span>
                {deal.company ? (
                  <Link
                    to={`/companies/${deal.company._id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {deal.company.name}
                  </Link>
                ) : (
                  <span className="text-gray-500">None linked</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Primary Contact</span>
                {deal.contact ? (
                  <Link
                    to={`/contacts/${deal.contact._id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {deal.contact.name}
                  </Link>
                ) : (
                  <span className="text-gray-500">None linked</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Expected Close Date</span>
                <span className="text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(deal.expectedCloseDate)}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Deal Owner</span>
                <span className="text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {deal.owner?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Polymorphic Notes for Deal */}
        <div className="md:col-span-2">
          <NotesSection entityType="deal" entityId={deal._id} />
        </div>
      </div>

      {/* Edit Modal */}
      <DealFormModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setErrorMsg('');
        }}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={deal}
        isLoading={updateMutation.isPending}
        apiError={errorMsg}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Deal"
        message={`Are you sure you want to permanently delete "${deal.title}"?`}
        confirmText="Delete Deal"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default DealDetail;
