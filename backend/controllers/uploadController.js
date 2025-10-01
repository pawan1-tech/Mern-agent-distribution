import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import Agent from '../models/Agent.js';
import Distribution from '../models/Distribution.js';

const requiredHeaders = ['FirstName', 'Phone', 'Notes'];

const parseFile = (filepath, originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  
  if (ext === '.csv') {
    const content = fs.readFileSync(filepath, 'utf8');
    const rows = parse(content, { 
      columns: true, 
      skip_empty_lines: true, 
      trim: true,
      relax_column_count: true
    });
    return rows;
  } else {
    const workbook = xlsx.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  }
};

export const uploadAndDistribute = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const rows = parseFile(req.file.path, req.file.originalname);
    
    // Validate headers
    if (rows.length === 0) {
      return res.status(400).json({ 
        message: 'File is empty or has no data rows' 
      });
    }

    const headers = Object.keys(rows[0]);
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        message: `Invalid headers. Required: ${requiredHeaders.join(', ')}. Missing: ${missingHeaders.join(', ')}` 
      });
    }

    // Normalize and filter invalid rows
    const validRecords = [];
    const validationErrors = [];
    
    rows.forEach((row, index) => {
      const rowNumber = index + 2; // considering header is row 1
      const firstName = String(row.FirstName || '').trim();
      const phone = String(row.Phone || '').replace(/\D/g, '');
      const notes = String(row.Notes || '').trim();

      if (!firstName || !phone) {
        validationErrors.push({ 
          row: rowNumber, 
          error: 'Missing FirstName or Phone',
          data: { firstName, phone, notes }
        });
        return;
      }

      if (phone.length < 7) {
        validationErrors.push({ 
          row: rowNumber, 
          error: 'Phone number too short',
          data: { firstName, phone, notes }
        });
        return;
      }

      validRecords.push({ firstName, phone, notes });
    });

    const totalValidRecords = validRecords.length;
    if (totalValidRecords === 0) {
      return res.status(400).json({ 
        message: 'No valid records found', 
        validationErrors 
      });
    }

    // Get exactly 5 active agents
    const agents = await Agent.find({ isActive: true })
      .sort({ createdAt: 1 })
      .limit(5);

    if (agents.length !== 5) {
      return res.status(400).json({ 
        message: 'Exactly 5 active agents are required for distribution. Please create more agents or activate existing ones.',
        currentActiveAgents: agents.length
      });
    }

    // Distribution algorithm
    const baseRecords = Math.floor(totalValidRecords / 5);
    const remainder = totalValidRecords % 5;

    const distributions = [];
    let currentIndex = 0;

    agents.forEach((agent, agentIndex) => {
      const recordsForThisAgent = baseRecords + (agentIndex < remainder ? 1 : 0);
      const agentRecords = validRecords.slice(currentIndex, currentIndex + recordsForThisAgent);
      
      distributions.push({
        agentId: agent._id,
        agentName: agent.name,
        recordCount: agentRecords.length,
        records: agentRecords
      });
      
      currentIndex += recordsForThisAgent;
    });

    // Save distribution to database
    const distribution = await Distribution.create({
      fileName: req.file.originalname,
      totalRecords: totalValidRecords,
      distributions,
      uploadedBy: req.user.id,
      skippedCount: validationErrors.length,
      validationErrors
    });

    // Cleanup uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(201).json({
      success: true,
      message: 'File processed and distributed successfully',
      data: {
        distribution,
        summary: {
          totalRecords: totalValidRecords,
          skippedCount: validationErrors.length,
          agentsUsed: agents.length,
          recordsPerAgent: distributions.map(d => ({
            agentName: d.agentName,
            recordCount: d.recordCount
          }))
        },
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      }
    });
  } catch (error) {
    // Cleanup file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    next(error);
  }
};

export const listDistributions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const distributions = await Distribution.find({})
      .populate('uploadedBy', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Distribution.countDocuments();

    res.json({
      success: true,
      data: distributions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getDistribution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const distribution = await Distribution.findById(id)
      .populate('uploadedBy', 'email')
      .populate('distributions.agentId', 'name email');

    if (!distribution) {
      return res.status(404).json({ message: 'Distribution not found' });
    }

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    next(error);
  }
};
