// Load environment variables
require('dotenv').config();

// Import required packages
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Body parser
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API ROUTES ---

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Attempt a simple query to check database connection
    const { data, error } = await supabase.from('todos').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Create a new todo item
app.post('/todos', async (req, res) => {
  // Input validation with Joi
  const schema = Joi.object({
    title: Joi.string().trim().min(1).required(),
    description: Joi.string().trim().allow(null, ''),
    priority: Joi.string().valid('High', 'Medium', 'Low').required(),
    due_date: Joi.date().iso().allow(null, '')
  });

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { data, error: dbError } = await supabase
    .from('todos')
    .insert([
      { ...value }])
    .select();

  if (dbError) {
    return res.status(500).json({ error: 'Failed to create todo' });
  }

  res.status(201).json(data[0]);
});

// Get all todos with filtering and sorting
app.get('/todos', async (req, res) => {
  const { sort, filter } = req.query;
  
  let query = supabase.from('todos').select('*');

  // Advanced Filtering
  if (filter === 'completed') {
    query = query.eq('is_completed', true);
  } else if (filter === 'incomplete') {
    query = query.eq('is_completed', false);
  } else if (filter === 'high-priority') {
    query = query.eq('priority', 'High');
  } else if (filter === 'overdue') {
    query = query.lt('due_date', new Date().toISOString()).eq('is_completed', false);
  }

  // Advanced Sorting
  if (sort === 'priority-asc') {
    query = query.order('priority', { ascending: true });
  } else if (sort === 'due-date-asc') {
    query = query.order('due_date', { ascending: true, nullsFirst: true });
  } else {
    // Default sorting
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch todos' });
  }

  res.status(200).json(data);
});

// Get a single todo by ID
app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.status(200).json(data);
});

// Update a todo by ID
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;

  // Joi validation schema for updates (all fields are optional)
  const schema = Joi.object({
    title: Joi.string().trim().min(1),
    description: Joi.string().trim().allow(null, ''),
    priority: Joi.string().valid('High', 'Medium', 'Low'),
    due_date: Joi.date().iso().allow(null, ''),
    is_completed: Joi.boolean()
  }).min(1); // At least one field must be present for update

  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  const { data, error: dbError } = await supabase
    .from('todos')
    .update({ ...value, updated_at: new Date().toISOString() }) // Add updated_at timestamp
    .eq('id', id)
    .select();

  if (dbError) {
    return res.status(500).json({ error: 'Failed to update todo' });
  }

  res.status(200).json(data[0]);
});

// Delete a todo by ID
app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: 'Failed to delete todo' });
  }

  res.status(204).end(); // No content to send back after a successful deletion
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});