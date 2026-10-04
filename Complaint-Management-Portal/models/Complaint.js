const mongoose = require('mongoose');

const STATUS_STAGES = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = [
  'Electricity',
  'Water Supply',
  'Road & Infrastructure',
  'Sanitation & Garbage',
  'Public Transport',
  'Internet & Telecom',
  'Noise Pollution',
  'Consumer Product/Service',
  'Billing & Payment',
  'Other'
];

// Each entry represents one point in the status timeline of a complaint.
const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUS_STAGES, required: true },
    remarks: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true, index: true },

    // Complainant details
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },

    // Complaint details
    category: { type: String, required: true, enum: CATEGORIES },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    priority: { type: String, required: true, enum: PRIORITIES, default: 'Medium' },

    // Optional attachment
    attachment: {
      originalName: { type: String, default: null },
      storedName: { type: String, default: null },
      url: { type: String, default: null }
    },

    // Status tracking
    status: { type: String, enum: STATUS_STAGES, default: 'Submitted' },
    adminRemarks: { type: String, default: '' },
    timeline: { type: [timelineEntrySchema], default: [] },

    // Ownership - links complaint to the logged-in user who filed it
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

complaintSchema.index({ category: 1, status: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.STATUS_STAGES = STATUS_STAGES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.CATEGORIES = CATEGORIES;
