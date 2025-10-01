import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const agentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: { 
    type: String, 
    unique: true, 
    required: true, 
    trim: true,
    lowercase: true
  },
  countryCode: { 
    type: String, 
    required: true, 
    trim: true,
    default: '+91'
  },
  mobile: { 
    type: String, 
    required: true, 
    trim: true,
    minlength: 7,
    maxlength: 15
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Hash password before saving
agentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Remove password from JSON output
agentSchema.methods.toJSON = function() {
  const agent = this.toObject();
  delete agent.password;
  return agent;
};

export default mongoose.model('Agent', agentSchema);
