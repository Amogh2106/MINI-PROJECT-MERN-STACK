import { AppError } from './errorMiddleware.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You do not have permission to perform this action', 403));
    }
    next();
  };
};

/**
 * Ensures Sales users can only edit or delete records they own.
 * Admins have permission to edit or delete any record.
 */
export const checkOwnership = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const doc = await Model.findById(resourceId);

      if (!doc) {
        return next(new AppError('Record not found', 404));
      }

      // Admins bypass ownership restriction
      if (req.user.role === 'admin') {
        req.record = doc;
        return next();
      }

      // Check if document has an owner or author field
      const ownerId = doc.owner ? doc.owner.toString() : (doc.author ? doc.author.toString() : null);

      if (ownerId && ownerId !== req.user._id.toString()) {
        return next(new AppError('Forbidden: You can only edit or delete records you own', 403));
      }

      req.record = doc;
      next();
    } catch (error) {
      next(error);
    }
  };
};
