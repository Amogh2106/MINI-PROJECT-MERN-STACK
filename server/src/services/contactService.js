import Contact from '../models/Contact.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getContacts = async ({ page = 1, limit = 10, search, status, owner }) => {
  const query = {};

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  if (status && status.trim() !== '') {
    query.status = status;
  }

  if (owner && owner.trim() !== '') {
    query.owner = owner;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Contact.find(query)
      .populate('company', 'name')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Contact.countDocuments(query),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
  };
};

export const getContactById = async (id) => {
  const contact = await Contact.findById(id)
    .populate('company', 'name domain industry phone')
    .populate('owner', 'name email');

  if (!contact) {
    throw new AppError('Contact not found', 404);
  }
  return contact;
};

export const createContact = async (data, currentUser) => {
  // If owner not specified or not admin, assign to current user
  const ownerId = (currentUser.role === 'admin' && data.owner) ? data.owner : currentUser._id;

  const contact = await Contact.create({
    ...data,
    company: data.company || null,
    owner: ownerId,
  });

  return contact.populate([
    { path: 'company', select: 'name' },
    { path: 'owner', select: 'name email' },
  ]);
};

export const updateContact = async (id, data, currentUser) => {
  const updateData = { ...data };
  if (data.company === '') {
    updateData.company = null;
  }

  // Only admin can change record owner
  if (currentUser.role !== 'admin') {
    delete updateData.owner;
  }

  const updated = await Contact.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('company', 'name')
    .populate('owner', 'name email');

  if (!updated) {
    throw new AppError('Contact not found', 404);
  }

  return updated;
};

export const deleteContact = async (id) => {
  const deleted = await Contact.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Contact not found', 404);
  }
  return deleted;
};
