const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const Complaint = require('../models/Complaint');
const { getNextSequence } = require('../models/Counter');
const { requireUser } = require('../middleware/auth');

// ---------- Multer setup for optional attachment upload ----------
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) return cb(null, true);
    cb(new Error('Unsupported file type. Allowed: jpg, jpeg, png, gif, pdf, doc, docx'));
  }
});

// Helper to generate a Complaint ID like CMP20260001
async function generateComplaintId() {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(year);
  const padded = String(seq).padStart(4, '0');
  return `CMP${year}${padded}`;
}

const CATEGORIES = require('../models/Complaint').CATEGORIES;
const PRIORITIES = require('../models/Complaint').PRIORITIES;

// @route   POST /api/complaints
// @desc    Submit a new complaint (requires logged-in user)
router.post('/', requireUser, (req, res) => {
  upload.single('attachment')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    try {
      const { name, email, phone, category, title, description, location, priority } = req.body;

      if (!name || !email || !phone || !category || !title || !description || !location || !priority) {
        return res.status(400).json({ success: false, message: 'All required fields must be filled in.' });
      }
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category selected.' });
      }
      if (!PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority selected.' });
      }

      const complaintId = await generateComplaintId();

      const attachment = req.file
        ? {
            originalName: req.file.originalname,
            storedName: req.file.filename,
            url: `/uploads/${req.file.filename}`
          }
        : { originalName: null, storedName: null, url: null };

      const complaint = await Complaint.create({
        complaintId,
        name,
        email,
        phone,
        category,
        title,
        description,
        location,
        priority,
        attachment,
        status: 'Submitted',
        adminRemarks: '',
        timeline: [{ status: 'Submitted', remarks: 'Complaint submitted successfully.', updatedAt: new Date() }],
        createdBy: req.user.id
      });

      return res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully!',
        complaint
      });
    } catch (error) {
      console.error('Complaint submission error:', error);
      return res.status(500).json({ success: false, message: 'Server error while submitting complaint. Please try again.' });
    }
  });
});

// @route   GET /api/complaints/track/:complaintId
// @desc    Public - track a complaint by its Complaint ID
router.get('/track/:complaintId', async (req, res) => {
  try {
    const complaintId = req.params.complaintId.trim().toUpperCase();
    const complaint = await Complaint.findOne({ complaintId });

    if (!complaint) {
      return res.status(404).json({ success: false, message: `No complaint found with ID "${complaintId}". Please check and try again.` });
    }

    return res.json({ success: true, complaint });
  } catch (err) {
    console.error('Track complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while tracking complaint.' });
  }
});

// @route   GET /api/complaints/my
// @desc    Get all complaints submitted by the logged-in user
router.get('/my', requireUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, complaints });
  } catch (err) {
    console.error('Fetch my complaints error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching your complaints.' });
  }
});

// @route   GET /api/complaints/my/stats
// @desc    Dashboard summary stats for the logged-in user
router.get('/my/stats', requireUser, async (req, res) => {
  try {
    const complaints = await Complaint.find({ createdBy: req.user.id });
    const stats = {
      total: complaints.length,
      submitted: complaints.filter((c) => c.status === 'Submitted').length,
      underReview: complaints.filter((c) => c.status === 'Under Review').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length
    };
    stats.pending = stats.submitted + stats.underReview;
    return res.json({ success: true, stats });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching stats.' });
  }
});

// @route   GET /api/complaints/meta
// @desc    Get available categories and priorities (for populating form dropdowns)
router.get('/meta/options', (req, res) => {
  res.json({ success: true, categories: CATEGORIES, priorities: PRIORITIES, statuses: require('../models/Complaint').STATUS_STAGES });
});

module.exports = router;
