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
import { dealsApi } from '../../api/dealsApi.js';
import { TASK_STATUSES } from '../../utils/constants.js';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['open', 'done']).default('open'),
  contact: z.string().optional(),
  deal: z.string().optional(),
});

const TaskFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false, apiError = '' }) => {
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', 'tasks-select'],
    queryFn: () => contactsApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });

  const { data: dealsData } = useQuery({
    queryKey: ['deals', 'tasks-select'],
    queryFn: () => dealsApi.getAll({ limit: 100 }),
    enabled: isOpen,
  });

  const contacts = contactsData?.data?.items || [];
  const deals = dealsData?.data?.items || [];

  const contactOptions = contacts.map((c) => ({ value: c._id, label: c.name }));
  const dealOptions = deals.map((d) => ({ value: d._id, label: `${d.title} ($${d.value})` }));

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      status: 'open',
      contact: '',
      deal: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      let formattedDate = '';
      if (initialData.dueDate) {
        formattedDate = new Date(initialData.dueDate).toISOString().split('T')[0];
      }

      reset({
        title: initialData.title || '',
        dueDate: formattedDate,
        status: initialData.status || 'open',
        contact: initialData.contact?._id || initialData.contact || '',
        deal: initialData.deal?._id || initialData.deal || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      reset({
        title: '',
        dueDate: today,
        status: 'open',
        contact: '',
        deal: '',
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      contact: data.contact ? data.contact : null,
      deal: data.deal ? data.deal : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Task' : 'Add New Task / Follow-up'}
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
            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Task'}
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
          label="Task Description *"
          placeholder="e.g. Call client for contract review"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="dueDate"
            type="date"
            label="Due Date *"
            error={errors.dueDate?.message}
            {...register('dueDate')}
          />

          <Select
            id="status"
            label="Status"
            options={TASK_STATUSES}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>

        <Select
          id="contact"
          label="Linked Contact"
          placeholder="Select a contact (optional)"
          options={contactOptions}
          error={errors.contact?.message}
          {...register('contact')}
        />

        <Select
          id="deal"
          label="Linked Deal"
          placeholder="Select a deal (optional)"
          options={dealOptions}
          error={errors.deal?.message}
          {...register('deal')}
        />
      </form>
    </Modal>
  );
};

export default TaskFormModal;
