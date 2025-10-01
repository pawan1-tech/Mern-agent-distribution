import { validationResult } from 'express-validator';
import Agent from '../models/Agent.js';

export const listAgents = async (req, res, next) => {
  try {
    const agents = await Agent.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    next(error);
  }
};

export const createAgent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, countryCode, mobile, password } = req.body;
    
    const existingAgent = await Agent.findOne({ email: email.trim().toLowerCase() });
    if (existingAgent) {
      return res.status(400).json({ 
        message: 'Agent with this email already exists' 
      });
    }

    const agent = await Agent.create({ 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      countryCode: countryCode.trim(), 
      mobile: mobile.trim(), 
      password 
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

export const updateAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remove password from update if not provided
    if (!updateData.password) {
      delete updateData.password;
    }

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check for email conflicts if email is being updated
    if (updateData.email && updateData.email !== agent.email) {
      const existingAgent = await Agent.findOne({ 
        email: updateData.email.trim().toLowerCase(),
        _id: { $ne: id }
      });
      if (existingAgent) {
        return res.status(400).json({ 
          message: 'Agent with this email already exists' 
        });
      }
    }

    Object.assign(agent, updateData);
    await agent.save();

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: agent
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findByIdAndDelete(id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ 
      success: true,
      message: 'Agent deleted successfully' 
    });
  } catch (error) {
    next(error);
  }
};

export const getAgentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await Agent.findById(id);
    
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    next(error);
  }
};
