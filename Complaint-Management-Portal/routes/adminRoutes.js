const express = require('express');
const router = express.Router();

const Complaint = require('../models/Complaint');
const { requireAdmin } = require('../middleware/auth');
const { STATUS_STAGES } = require('../models/Complaint');

// @route   GET /api/admin/complaints
// @desc    Get all complaints with optional search/filter by complaintId, category, status, priority
router.get('/complaints', requireAdmin, async (req, res) => {
  try {
    const { complaintId, category, status, priority, q } = req.query;
    const filter = {};

    if (complaintId) filter.complaintId = { $regex: complaintId.trim(), $options: 'i' };
    if (category && category !== 'All') filter.category = category;
    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;

    if (q) {
      filter.$or = [
        { complaintId: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });

    const overallStats = {
      total: await Complaint.countDocuments(),
      submitted: await Complaint.countDocuments({ status: 'Submitted' }),
      underReview: await Complaint.countDocuments({ status: 'Under Review' }),
      inProgress: await Complaint.countDocuments({ status: 'In Progress' }),
      resolved: await Complaint.countDocuments({ status: 'Resolved' })
    };

    return res.json({ success: true, count: complaints.length, complaints, stats: overallStats });
  } catch (err) {
    console.error('Admin fetch complaints error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching complaints.' });
  }
});

// @route   GET /api/admin/complaints/:id
// @desc    Get single complaint full details (by Mongo _id or complaintId)
router.get('/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    return res.json({ success: true, complaint });
  } catch (err) {
    console.error('Admin fetch single complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching complaint.' });
  }
});

// @route   PUT /api/admin/complaints/:id
// @desc    Update a complaint's status and/or admin remarks
router.put('/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body;

    if (status && !STATUS_STAGES.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const complaint = await Complaint.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id.toUpperCase() }]
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const statusChanged = status && status !== complaint.status;

    if (status) complaint.status = status;
    if (adminRemarks !== undefined) complaint.adminRemarks = adminRemarks;

    // Append a new timeline entry whenever the status changes, or when remarks
    // are updated without a status change (kept as an update on the current stage).
    if (statusChanged) {
      complaint.timeline.push({
        status,
        remarks: adminRemarks !== undefined ? adminRemarks : complaint.adminRemarks,
        updatedAt: new Date()
      });
    } else if (adminRemarks !== undefined) {
      complaint.timeline.push({
        status: complaint.status,
        remarks: adminRemarks,
        updatedAt: new Date()
      });
    }

    await complaint.save();

    return res.json({ success: true, message: 'Complaint updated successfully.', complaint });
  } catch (err) {
    console.error('Admin update complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating complaint.' });
  }
});

// @route   DELETE /api/admin/complaints/:id
// @desc    Delete a complaint (extra admin capability)
router.delete('/complaints/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id.toUpperCase() }]
    });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }
    return res.json({ success: true, message: 'Complaint deleted successfully.' });
  } catch (err) {
    console.error('Admin delete complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while deleting complaint.' });
  }
});

module.exports = router;
