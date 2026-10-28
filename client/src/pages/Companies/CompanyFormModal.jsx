import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(150),
  domain: z.string().optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const CompanyFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      domain: '',
      industry: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        domain: initialData.domain || '',
        industry: initialData.industry || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
      });
    } else {
      reset({
        name: '',
        domain: '',
        industry: '',
        phone: '',
        address: '',
      });
    }
  }, [initialData, reset, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Company' : 'Add New Company'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Company'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          id="name"
          label="Company Name *"
          placeholder="Acme Corporation"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="domain"
          label="Website / Domain"
          placeholder="acme.com"
          error={errors.domain?.message}
          {...register('domain')}
        />

        <Input
          id="industry"
          label="Industry"
          placeholder="Software / Logistics / Financial"
          error={errors.industry?.message}
          {...register('industry')}
        />

        <Input
          id="phone"
          label="Phone"
          placeholder="+1 (555) 000-1111"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          id="address"
          label="Address"
          placeholder="100 Main St, Suite 200, City, State"
          error={errors.address?.message}
          {...register('address')}
        />
      </form>
    </Modal>
  );
};

export default CompanyFormModal;
