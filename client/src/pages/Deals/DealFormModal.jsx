import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';
import { contactsApi } from '../../api/contactsApi.js';
import { companiesApi } from '../../api/companiesApi.js';
import { DEAL_STAGES } from '../../utils/constants.js';

const dealFormSchema = z.object({
  title: z.string().min(1, 'Deal title is required').max(150),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['lead', 'qualified', 'proposal', 'won', 'lost']).default('lead'),
  expectedCloseDate: z.string().optional(),
  contact: z.string().optional(),
  company: z.string().optional(),
});

const DealFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false, apiError = '' }) => {
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', 'select'],
    queryFn: () => contactsApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies', 'select'],
    queryFn: () => companiesApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });

  const contacts = contactsData?.data?.items || [];
  const companies = companiesData?.data?.items || [];

  const contactOptions = contacts.map((c) => ({ value: c._id, label: `${c.name} (${c.email})` }));
  const companyOptions = companies.map((c) => ({ value: c._id, label: c.name }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      title: '',
      value: 0,
      stage: 'lead',
      expectedCloseDate: '',
      contact: '',
      company: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.expectedCloseDate) {
        formattedDate = new Date(initialData.expectedCloseDate).toISOString().split('T')[0];
      }

      reset({
        title: initialData.title || '',
        value: initialData.value || 0,
        stage: initialData.stage || 'lead',
        expectedCloseDate: formattedDate,
        contact: initialData.contact?._id || initialData.contact || '',
        company: initialData.company?._id || initialData.company || '',
      });
    } else {
      reset({
        title: '',
        value: 0,
        stage: 'lead',
        expectedCloseDate: '',
        contact: '',
        company: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      value: Number(data.value),
      contact: data.contact ? data.contact : null,
      company: data.company ? data.company : null,
      expectedCloseDate: data.expectedCloseDate ? data.expectedCloseDate : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Deal' : 'Add New Deal'}
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
            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Deal'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
        {apiError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
            {apiError}
          </div>
        )}

        <Input
          id="title"
          label="Deal Name *"
          placeholder="e.g. Enterprise Software License"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="value"
            type="number"
            label="Deal Value ($) *"
            placeholder="10000"
            error={errors.value?.message}
            {...register('value')}
          />

          <Select
            id="stage"
            label="Pipeline Stage"
            options={DEAL_STAGES}
            error={errors.stage?.message}
            {...register('stage')}
          />
        </div>

        <Input
          id="expectedCloseDate"
          type="date"
          label="Expected Close Date"
          error={errors.expectedCloseDate?.message}
          {...register('expectedCloseDate')}
        />

        <Select
          id="contact"
          label="Primary Contact"
          placeholder="Select a contact (optional)"
          options={contactOptions}
          error={errors.contact?.message}
          {...register('contact')}
        />

        <Select
          id="company"
          label="Target Company"
          placeholder="Select a company (optional)"
          options={companyOptions}
          error={errors.company?.message}
          {...register('company')}
        />
      </form>
    </Modal>
  );
};

export default DealFormModal;
