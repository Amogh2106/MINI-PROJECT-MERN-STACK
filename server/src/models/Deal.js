import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
      maxlength: 150,
    },
    value: {
      type: Number,
      required: [true, 'Deal value is required'],
      min: 0,
      default: 0,
    },
    stage: {
      type: String,
      enum: ['lead', 'qualified', 'proposal', 'won', 'lost'],
      default: 'lead',
      index: true,
    },
    expectedCloseDate: {
      type: Date,
      default: null,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      default: null,
      index: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Deal', dealSchema);
