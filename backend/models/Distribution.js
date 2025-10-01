import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  notes: { 
    type: String, 
    default: '',
    trim: true
  }
}, { _id: false });

const perAgentSchema = new mongoose.Schema({
  agentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agent',
    required: true
  },
  agentName: { 
    type: String, 
    required: true,
    trim: true
  },
  recordCount: { 
    type: Number, 
    required: true,
    min: 0
  },
  records: [recordSchema]
}, { _id: false });

const distributionSchema = new mongoose.Schema({
  fileName: { 
    type: String, 
    required: true,
    trim: true
  },
  totalRecords: { 
    type: Number, 
    required: true,
    min: 0
  },
  distributions: [perAgentSchema],
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  skippedCount: {
    type: Number,
    default: 0
  },
  validationErrors: [{
    row: Number,
    error: String
  }]
}, { 
  timestamps: true 
});

export default mongoose.model('Distribution', distributionSchema);
