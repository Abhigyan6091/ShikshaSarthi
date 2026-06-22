const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
    version: {
        type: String,
        required: true
    },
    releaseNotes: String,
    forceUpdate: {
        type: Boolean,
        default: false
    },
    releaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Version', VersionSchema);
