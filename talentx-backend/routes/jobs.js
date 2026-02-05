const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const { generateJobDescription, calculateMatchScore } = require('../services/aiService');

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:users!jobs_employer_id_fkey (
          name,
          company_name
        )
      `, { count: 'exact' })

      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: jobs, error, count } = await query;

    if (error) throw error;

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:users!jobs_employer_id_fkey (
          name,
          company_name
        )
      `)
      .eq('id', id)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create job (employer only)
router.post('/', auth, authorize('employer'), async (req, res) => {
  try {
    const { title, techStack, applicationDeadline } = req.body;
    const employerId = req.user.userId;

    if (!title || !techStack || !Array.isArray(techStack)) {
      return res.status(400).json({ error: 'Title and tech stack are required' });
    }

    // Generate job description using AI
    const description = await generateJobDescription(title, techStack);

    const { data: job, error } = await supabase
      .from('jobs')
      .insert([{
        employer_id: employerId,
        title,
        tech_stack: techStack,
        description,
        application_deadline: applicationDeadline ? new Date(applicationDeadline) : null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job (employer only)
router.put('/:id', auth, authorize('employer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, techStack, description, applicationDeadline } = req.body;
    const employerId = req.user.userId;

    // Check if job belongs to employer
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', id)
      .single();

    if (!existingJob || existingJob.employer_id !== employerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (techStack) updateData.tech_stack = techStack;
    if (description) updateData.description = description;
    if (applicationDeadline) updateData.application_deadline = new Date(applicationDeadline);

    const { data: job, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Job updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete job (employer only)
router.delete('/:id', auth, authorize('employer'), async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.userId;

    // Check if job belongs to employer
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', id)
      .single();

    if (!existingJob || existingJob.employer_id !== employerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employer jobs
router.get('/employer/my-jobs', auth, authorize('employer'), async (req, res) => {
  try {
    const employerId = req.user.userId;

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ jobs });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI-matched jobs for talent
router.get('/talent/matched', auth, authorize('talent'), async (req, res) => {
  try {
    const talentId = req.user.userId;

    // Get talent profile
    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', talentId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Talent profile not found' });
    }

    // Get all active jobs
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:users!jobs_employer_id_fkey (
          name,
          company_name
        )
      `)
      .neq('employer_id', talentId)
      .or('application_deadline.is.null,application_deadline.gte.now()')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate match scores and sort
    const jobsWithScores = await Promise.all(
      jobs.map(async (job) => {
        const matchScore = await calculateMatchScore(profile, job);
        return { ...job, matchScore };
      })
    );

    // Sort by match score (descending)
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ jobs: jobsWithScores });
  } catch (error) {
    console.error('Get matched jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;