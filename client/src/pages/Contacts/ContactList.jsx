import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit2, User } from 'lucide-react';
import { contactsApi } from '../../api/contactsApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import ContactFormModal from './ContactFormModal.jsx';
import { getStatusBadgeVariant } from '../../utils/formatters.js';
import { CONTACT_STATUSES } from '../../utils/constants.js';

const ContactList = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deletingContact, setDeletingContact] = useState(null);
  const [apiError, setApiError] = useState('');

  // Fetch contacts with server-side pagination & filtering
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contacts', { page, search, status: statusFilter }],
    queryFn: () => contactsApi.getAll({ page, limit: 10, search, status: statusFilter }),
  });

  const contacts = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newContact) => contactsApi.create(newContact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsModalOpen(false);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => contactsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setIsModalOpen(false);
      setEditingContact(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contactsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeletingContact(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const handleCreateOrUpdate = (formData) => {
    if (editingContact) {
      updateMutation.mutate({ id: editingContact._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canModify = (contact) => {
    if (isAdmin) return true;
    const ownerId = contact.owner?._id || contact.owner;
    return ownerId?.toString() === user?._id?.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Contacts</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer leads, active accounts, and key people</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingContact(null);
            setIsModalOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
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
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            placeholder="All Statuses"
            options={CONTACT_STATUSES}
          />
        </div>
      </div>

      {/* Table / Content */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Loading contacts...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600 bg-white border border-gray-200 rounded">
          {error?.message || 'Failed to load contacts'}
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          title="No contacts found"
          description={search || statusFilter ? 'Try clearing your search or status filter.' : 'Get started by creating your first contact.'}
          icon={User}
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingContact(null);
                setIsModalOpen(true);
              }}
            >
              Add First Contact
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-gray-600 text-xs">{contact.email}</TableCell>
                  <TableCell className="text-gray-600 text-xs">{contact.phone || '—'}</TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {contact.company ? (
                      <Link
                        to={`/companies/${contact.company._id}`}
                        className="hover:underline text-gray-800"
                      >
                        {contact.company.name}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(contact.status)}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {contact.owner?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModify(contact) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingContact(contact);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingContact(contact)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded"
                            title="Delete Contact"
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

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingContact}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={() => deleteMutation.mutate(deletingContact?._id)}
        title="Delete Contact"
        message={`Are you sure you want to permanently delete "${deletingContact?.name}"?`}
        confirmText="Delete Contact"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ContactList;
