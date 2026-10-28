import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Trash2, Mail, Phone, Building2, User, Calendar } from 'lucide-react';
import { contactsApi } from '../../api/contactsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ContactFormModal from './ContactFormModal.jsx';
import NotesSection from '../../components/common/NotesSection.jsx';
import { formatDate, getStatusBadgeVariant } from '../../utils/formatters.js';

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.getById(id),
  });

  const contact = data?.data;

  const updateMutation = useMutation({
    mutationFn: (updateData) => contactsApi.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsEditOpen(false);
      setErrorMsg('');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      navigate('/contacts');
    },
    onError: (err) => setErrorMsg(err.message),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading contact details...</div>;
  }

  if (isError || !contact) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded">
        <p className="text-sm text-red-600 mb-3">{error?.message || 'Contact not found'}</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/contacts')}>
          Back to Contacts
        </Button>
      </div>
    );
  }

  const canModify = isAdmin || contact.owner?._id?.toString() === user?._id?.toString();

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/contacts"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Contacts
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700 text-sm">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                <Badge variant={getStatusBadgeVariant(contact.status)} className="capitalize">
                  {contact.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">{contact.email}</p>
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

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded p-5 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-200">
              Contact Overview
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block mb-0.5">Email</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {contact.email}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Phone</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {contact.phone || '—'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Company</span>
                {contact.company ? (
                  <Link
                    to={`/companies/${contact.company._id}`}
                    className="font-medium text-blue-600 hover:underline flex items-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    {contact.company.name}
                  </Link>
                ) : (
                  <span className="text-gray-500">None linked</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Account Owner</span>
                <span className="font-medium text-gray-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  {contact.owner?.name || 'Unassigned'}
                </span>
              </div>

              <div>
                <span className="text-gray-400 block mb-0.5">Created Date</span>
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDate(contact.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Timeline & Notes */}
        <div className="md:col-span-2">
          <NotesSection entityType="contact" entityId={contact._id} />
        </div>
      </div>

      {/* Edit Modal */}
      <ContactFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={contact}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.name}? This will also remove any notes linked to this contact.`}
        confirmText="Delete Contact"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ContactDetail;
