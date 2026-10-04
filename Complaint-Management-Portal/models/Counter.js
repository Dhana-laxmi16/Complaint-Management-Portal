const mongoose = require('mongoose');

// Generic counter collection used to generate sequential, unique
// human-readable Complaint IDs like CMP20260001, CMP20260002, ...
// One counter document is kept per year so numbering restarts each year.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "complaint_2026"
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Atomically increments and returns the next sequence number for the given year.
 */
async function getNextSequence(year) {
  const id = `complaint_${year}`;
  const result = await Counter.findByIdAndUpdate(
    id,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return result.seq;
}

module.exports = { Counter, getNextSequence };
