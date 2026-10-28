import Company from '../models/Company.js';
import Contact from '../models/Contact.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getCompanies = async ({ page = 1, limit = 10, search, owner }) => {
  const query = {};

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { domain: searchRegex }, { industry: searchRegex }];
  }

  if (owner && owner.trim() !== '') {
    query.owner = owner;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Company.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Company.countDocuments(query),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
  };
};

export const getCompanyById = async (id) => {
  const company = await Company.findById(id).populate('owner', 'name email');
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  // List all contacts linked to this company
  const contacts = await Contact.find({ company: id })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return {
    ...company.toObject(),
    contacts,
  };
};

export const createCompany = async (data, currentUser) => {
  const ownerId = (currentUser.role === 'admin' && data.owner) ? data.owner : currentUser._id;

  const company = await Company.create({
    ...data,
    owner: ownerId,
  });

  return company.populate({ path: 'owner', select: 'name email' });
};

export const updateCompany = async (id, data, currentUser) => {
  const updateData = { ...data };

  // Only admin can change owner
  if (currentUser.role !== 'admin') {
    delete updateData.owner;
  }

  const updated = await Company.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('owner', 'name email');

  if (!updated) {
    throw new AppError('Company not found', 404);
  }

  return updated;
};

export const deleteCompany = async (id) => {
  const deleted = await Company.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Company not found', 404);
  }
  // Unlink company from any contacts
  await Contact.updateMany({ company: id }, { $set: { company: null } });

  return deleted;
};
