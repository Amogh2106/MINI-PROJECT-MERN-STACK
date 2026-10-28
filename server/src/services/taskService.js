import Task from '../models/Task.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getTasks = async (
  { page = 1, limit = 50, status, dueToday, myTasks, owner },
  currentUser
) => {
  const query = {};

  if (status && status.trim() !== '') {
    query.status = status;
  }

  if (myTasks === 'true') {
    query.owner = currentUser._id;
  } else if (owner && owner.trim() !== '') {
    query.owner = owner;
  }

  if (dueToday === 'true') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    query.dueDate = { $gte: startOfDay, $lte: endOfDay };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Task.find(query)
      .populate('contact', 'name email')
      .populate('deal', 'title value')
      .populate('owner', 'name email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
  };
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('contact', 'name email')
    .populate('deal', 'title value')
    .populate('owner', 'name email');

  if (!task) {
    throw new AppError('Task not found', 404);
  }
  return task;
};

export const createTask = async (data, currentUser) => {
  const ownerId = (currentUser.role === 'admin' && data.owner) ? data.owner : currentUser._id;

  const task = await Task.create({
    ...data,
    contact: data.contact || null,
    deal: data.deal || null,
    owner: ownerId,
  });

  return task.populate([
    { path: 'contact', select: 'name email' },
    { path: 'deal', select: 'title' },
    { path: 'owner', select: 'name email' },
  ]);
};

export const updateTask = async (id, data, currentUser) => {
  const updateData = { ...data };
  if (data.contact === '') updateData.contact = null;
  if (data.deal === '') updateData.deal = null;

  if (currentUser.role !== 'admin') {
    delete updateData.owner;
  }

  const updated = await Task.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('contact', 'name email')
    .populate('deal', 'title')
    .populate('owner', 'name email');

  if (!updated) {
    throw new AppError('Task not found', 404);
  }

  return updated;
};

export const deleteTask = async (id) => {
  const deleted = await Task.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Task not found', 404);
  }
  return deleted;
};
