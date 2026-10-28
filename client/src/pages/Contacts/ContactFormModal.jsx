import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { companiesApi } from '../../api/companiesApi.js';
import { CONTACT_STATUSES } from '../../utils/constants.js';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['lead', 'active', 'inactive']).default('lead'),
});

const ContactFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const { data: companiesData } = useQuery({
    queryKey: ['companies', 'all'],
    queryFn: () => companiesApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });

  const companies = companiesData?.data?.items || [];
  const companyOptions = companies.map((c) => ({ value: c._id, label: c.name }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'lead',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company?._id || initialData.company || '',
        status: initialData.status || 'lead',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'lead',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      company: data.company ? data.company : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Contact' : 'Create Contact'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Contact'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        <Input
          id="name"
          label="Full Name *"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          id="email"
          type="email"
          label="Email Address *"
          placeholder="jane@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="phone"
          label="Phone Number"
          placeholder="+1 (555) 012-3456"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Select
          id="company"
          label="Associated Company"
          placeholder="Select a company (optional)"
          options={companyOptions}
          error={errors.company?.message}
          {...register('company')}
        />

        <Select
          id="status"
          label="Contact Status"
          options={CONTACT_STATUSES}
          error={errors.status?.message}
          {...register('status')}
        />
      </form>
    </Modal>
  );
};

export default ContactFormModal;
