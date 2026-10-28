import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Building2, Globe, Phone, Edit2, Trash2 } from 'lucide-react';
import { companiesApi } from '../../api/companiesApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CompanyFormModal from './CompanyFormModal.jsx';

const CompanyList = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [apiError, setApiError] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['companies', { page, search }],
    queryFn: () => companiesApi.getAll({ page, limit: 10, search }),
  });

  const companies = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: (newCompany) => companiesApi.create(newCompany),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsModalOpen(false);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => companiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setIsModalOpen(false);
      setEditingCompany(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => companiesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      setDeletingCompany(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const handleCreateOrUpdate = (formData) => {
    if (editingCompany) {
      updateMutation.mutate({ id: editingCompany._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canModify = (company) => {
    if (isAdmin) return true;
    const ownerId = company.owner?._id || company.owner;
    return ownerId?.toString() === user?._id?.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Companies</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage organizations, client accounts, and firm profiles</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingCompany(null);
            setIsModalOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </Button>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {apiError}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-3 border border-gray-200 rounded">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by company name, domain, or industry..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Table / Content */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Loading companies...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600 bg-white border border-gray-200 rounded">
          {error?.message || 'Failed to load companies'}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description={search ? 'Try clearing your search term.' : 'Get started by creating your first company profile.'}
          icon={Building2}
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingCompany(null);
                setIsModalOpen(true);
              }}
            >
              Add First Company
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company._id}>
                  <TableCell className="font-semibold">
                    <Link
                      to={`/companies/${company._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {company.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {company.domain ? (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-gray-400" />
                        {company.domain}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 text-xs">{company.industry || '—'}</TableCell>
                  <TableCell className="text-gray-600 text-xs">
                    {company.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {company.phone}
                      </span>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {company.owner?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModify(company) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCompany(company);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded"
                            title="Edit Company"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingCompany(company)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded"
                            title="Delete Company"
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

      {/* Form Modal */}
      <CompanyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCompany}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingCompany}
        onClose={() => setDeletingCompany(null)}
        onConfirm={() => deleteMutation.mutate(deletingCompany?._id)}
        title="Delete Company"
        message={`Are you sure you want to delete ${deletingCompany?.name}? Any contacts associated will have their company field unlinked.`}
        confirmText="Delete Company"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default CompanyList;
