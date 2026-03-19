const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema(
  {
    channelId: { type: String, required: true, unique: true },
    channelTitle: { type: String, required: true },
    subscriberCount: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    category: { type: String },
    thumbnail: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

creatorSchema.index({ score: -1 });
creatorSchema.index({ category: 1, score: -1 });

module.exports = mongoose.model('Creator', creatorSchema);
