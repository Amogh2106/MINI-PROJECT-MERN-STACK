import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Trash2, Globe, Phone, MapPin, Building2, User, Calendar, Users } from 'lucide-react';
import { companiesApi } from '../../api/companiesApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CompanyFormModal from './CompanyFormModal.jsx';
import { formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companiesApi.getById(id),
  });

  const company = data?.data;
  const contacts = company?.contacts || [];

  const updateMutation = useMutation({
    mutationFn: (updateData) => companiesApi.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsEditOpen(false);
      setErrorMsg('');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      navigate('/companies');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading company profile...</div>;
  }

  if (isError || !company) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded">
        <p className="text-sm text-red-600 mb-3">{error?.message || 'Company not found'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/companies')}>
          Back to Companies
        </Button>
      </div>
    );
  }

  const canModify = isAdmin || company.owner?._id?.toString() === user?._id?.toString();

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Companies
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700 text-sm">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-xs text-gray-500">{company.industry || 'No industry set'}</p>
            </div>
          </div>

          {canModify && (
            <div className="flex items-center gap-2">
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

      {/* Grid: Company Details & Linked Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
              Company Overview
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Website</span>
                {company.domain ? (
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                    {company.domain}
                  </a>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Industry</span>
                <span className="font-medium text-gray-900">{company.industry || '—'}</span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Phone</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {company.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Address</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {company.address || '—'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Account Owner</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {company.owner?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Added Date</span>
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(company.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Contacts */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white border border-gray-200 rounded p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Associated Contacts</h2>
              </div>
              <Badge variant="neutral">{contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}</Badge>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No contacts currently linked to this company.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact._id}>
                      <TableCell className="font-semibold">
                        <Link
                          to={`/contacts/${contact._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contact.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">{contact.email}</TableCell>
                      <TableCell className="text-xs text-gray-600">{contact.phone || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(contact.status)}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/contacts/${contact._id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          View →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <CompanyFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={company}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Company"
        message={`Are you sure you want to delete ${company.name}? Contacts linked to this company will remain intact with unlinked company status.`}
        confirmText="Delete Company"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CompanyDetail;
