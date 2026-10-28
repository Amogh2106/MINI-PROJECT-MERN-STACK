import Note from '../models/Note.js';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import { AppError } from '../middleware/errorMiddleware.js';

export const getNotesByEntity = async (entityType, entityId) => {
  const notes = await Note.find({ entityType, entityId })
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  return notes;
};

export const createNote = async ({ content, entityType, entityId }, currentUser) => {
  // Validate that the target entity exists
  if (entityType === 'contact') {
    const contact = await Contact.findById(entityId);
    if (!contact) throw new AppError('Associated contact not found', 404);
  } else if (entityType === 'deal') {
    const deal = await Deal.findById(entityId);
    if (!deal) throw new AppError('Associated deal not found', 404);
  } else {
    throw new AppError('Invalid entity type', 400);
  }

  const note = await Note.create({
    content,
    entityType,
    entityId,
    author: currentUser._id,
  });

  return note.populate({ path: 'author', select: 'name email' });
};

export const deleteNote = async (id) => {
  const deleted = await Note.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError('Note not found', 404);
  }
  return deleted;
};
