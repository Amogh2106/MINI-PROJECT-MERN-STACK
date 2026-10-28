import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
      trim: true,
      maxlength: 2000,
    },
    entityType: {
      type: String,
      enum: ['contact', 'deal'],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

noteSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);
