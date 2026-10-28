import Deal from '../models/Deal.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getDeals = async ({ page = 1, limit = 50, stage, owner, search }) => {
  const query = {};

  if (stage && stage.trim() !== '') {
    query.stage = stage;
  }

  if (owner && owner.trim() !== '') {
    query.owner = owner;
  }

  if (search && search.trim() !== '') {
    query.title = new RegExp(search.trim(), 'i');
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Deal.find(query)
      .populate('contact', 'name email phone')
      .populate('company', 'name')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Deal.countDocuments(query),
  ]);

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
  };
};

export const getDealById = async (id) => {
  const deal = await Deal.findById(id)
    .populate('contact', 'name email phone')
    .populate('company', 'name domain industry')
    .populate('owner', 'name email');

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }
  return deal;
};

export const createDeal = async (data, currentUser) => {
  const ownerId = (currentUser.role === 'admin' && data.owner) ? data.owner : currentUser._id;

  const deal = await Deal.create({
    ...data,
    contact: data.contact || null,
    company: data.company || null,
    expectedCloseDate: data.expectedCloseDate || null,
    owner: ownerId,
  });

  return deal.populate([
    { path: 'contact', select: 'name email phone' },
    { path: 'company', select: 'name' },
    { path: 'owner', select: 'name email' },
  ]);
};

export const updateDeal = async (id, data, currentUser) => {
  const updateData = { ...data };
  if (data.contact === '') updateData.contact = null;
  if (data.company === '') updateData.company = null;
  if (data.expectedCloseDate === '') updateData.expectedCloseDate = null;

  if (currentUser.role !== 'admin') {
    delete updateData.owner;
  }

  const updated = await Deal.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('contact', 'name email phone')
    .populate('company', 'name')
    .populate('owner', 'name email');

  if (!updated) {
    throw new AppError('Deal not found', 404);
  }

  return updated;
};

export const updateDealStage = async (id, stage) => {
  const updated = await Deal.findByIdAndUpdate(
    id,
    { stage },
    { new: true, runValidators: true }
  )
    .populate('contact', 'name email phone')
    .populate('company', 'name')
    .populate('owner', 'name email');

  if (!updated) {
    throw new AppError('Deal not found', 404);
  }

  return updated;
};

export const deleteDeal = async (id) => {
  const deleted = await Deal.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Deal not found', 404);
  }
  return deleted;
};
