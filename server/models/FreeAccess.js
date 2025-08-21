const mongoose = require('mongoose');

const freeAccessSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true, index: true },
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  blocked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('FreeAccess', freeAccessSchema); 