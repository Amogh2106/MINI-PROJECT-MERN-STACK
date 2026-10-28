import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, CheckSquare, Calendar, User, Briefcase, Users, Edit2, Trash2 } from 'lucide-react';
import { tasksApi } from '../../api/tasksApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Table, { TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import TaskFormModal from './TaskFormModal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { TASK_STATUSES } from '../../utils/constants.js';

const TaskList = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState('');
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [dueTodayOnly, setDueTodayOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [apiError, setApiError] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['tasks', { status: statusFilter, myTasks: myTasksOnly, dueToday: dueTodayOnly }],
    queryFn: () =>
      tasksApi.getAll({
        status: statusFilter,
        myTasks: myTasksOnly ? 'true' : 'false',
        dueToday: dueTodayOnly ? 'true' : 'false',
      }),
  });

  const tasks = data?.data?.items || [];

  const createMutation = useMutation({
    mutationFn: (newTask) => tasksApi.create(newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      if (statusFilter === 'done') setStatusFilter('');
      if (dueTodayOnly) setDueTodayOnly(false);
      setIsModalOpen(false);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.refetchQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsModalOpen(false);
      setEditingTask(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err) => setApiError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setDeletingTask(null);
      setApiError('');
    },
    onError: (err) => setApiError(err.message),
  });

  const handleCreateOrUpdate = (formData) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const canModify = (task) => {
    if (isAdmin) return true;
    const ownerId = task.owner?._id || task.owner;
    return ownerId?.toString() === user?._id?.toString();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Tasks & Follow-ups</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage action items, scheduled calls, and reminders</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingTask(null);
            setApiError('');
            setIsModalOpen(true);
          }}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {apiError}
        </div>
      )}

      {/* Filter Toolbar with My Tasks & Due Today */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-gray-200 rounded">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMyTasksOnly((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded border ${
              myTasksOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Tasks Only
          </button>

          <button
            onClick={() => setDueTodayOnly((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded border ${
              dueTodayOnly
                ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Due Today Only
          </button>
        </div>

        <div className="w-full sm:w-44">
          <Select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Statuses"
            options={TASK_STATUSES}
          />
        </div>
      </div>

      {/* Table / Content */}
      {isLoading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Loading tasks...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-sm text-red-600 bg-white border border-gray-200 rounded">
          {error?.message || 'Failed to load tasks'}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your filters"
          description={myTasksOnly || dueTodayOnly || statusFilter ? 'Try clearing your active filters.' : 'All caught up! Add a new follow-up task to stay on top.'}
          icon={CheckSquare}
          actionButton={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setApiError('');
                setIsModalOpen(true);
              }}
            >
              Add New Task
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Done</TableHead>
              <TableHead>Task Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Linked Contact / Deal</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <TableRow key={task._id} className={isDone ? 'bg-gray-50/70 text-gray-400' : ''}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isDone}
                      disabled={!canModify(task)}
                      onChange={(e) =>
                        toggleStatusMutation.mutate({
                          id: task._id,
                          status: e.target.checked ? 'done' : 'open',
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(task.dueDate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isDone ? 'success' : 'warning'}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {task.contact ? (
                      <Link
                        to={`/contacts/${task.contact._id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Users className="w-3 h-3 text-gray-400" />
                        {task.contact.name}
                      </Link>
                    ) : task.deal ? (
                      <Link
                        to={`/deals/${task.deal._id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Briefcase className="w-3 h-3 text-gray-400" />
                        {task.deal.title}
                      </Link>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400" />
                      {task.owner?.name || 'Unassigned'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canModify(task) && (
                        <>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600 rounded"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTask(task)}
                            className="p-1 text-gray-500 hover:text-red-600 rounded"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Form Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          setApiError('');
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTask}
        isLoading={createMutation.isPending || updateMutation.isPending}
        apiError={apiError}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={() => deleteMutation.mutate(deletingTask?._id)}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        confirmText="Delete Task"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default TaskList;
