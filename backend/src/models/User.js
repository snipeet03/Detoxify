const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    interests: [{ type: String }],
    watchHistory: [
      {
        videoId: String,
        title: String,
        watchedAt: { type: Date, default: Date.now },
      },
    ],
    savedCreators: [{ type: String }], // channelIds
    preferences: {
      defaultType: { type: String, enum: ['short', 'long', 'both'], default: 'both' },
      defaultLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
