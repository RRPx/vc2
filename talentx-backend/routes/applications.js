const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { auth, authorize } = require('../middleware/auth');

// Apply to job (talent only)
router.post('/', auth, authorize('talent'), async (req, res) => {
  try {
    const { jobId, source = 'manual', invitationId } = req.body;
    const talentId = req.user.userId;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Check if job exists and deadline hasn't passed
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      return res.status(400).json({ error: 'Application deadline has passed' });
    }

    // Check if already applied
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('talent_id', talentId)
      .single();

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // If this is from an invitation, validate and update invitation status
    if (invitationId) {
      const { data: invitation } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('job_id', jobId)
        .eq('talent_id', talentId)
        .eq('status', 'pending')
        .single();

      if (!invitation) {
        return res.status(400).json({ error: 'Invalid invitation' });
      }

      // Update invitation status to accepted
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert([{
        job_id: jobId,
        talent_id: talentId,
        source,
        invitation_id: invitationId
      }])
      .select(`
        *,
        job:jobs (
          title,
          employer:users!jobs_employer_id_fkey (
            name,
            company_name
          )
        ),
        talent:users (
          name,
          email
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get applications for a job (employer only)
router.get('/job/:jobId', auth, authorize('employer'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.userId;

    // Check if job belongs to employer
    const { data: job } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', jobId)
      .single();

    if (!job || job.employer_id !== employerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        talent:users (
          id,
          name,
          email,
          created_at
        ),
        invitation:invitations (
          id,
          status,
          created_at
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ applications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get talent's application history
router.get('/my-applications', auth, authorize('talent'), async (req, res) => {
  try {
    const talentId = req.user.userId;

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs (
          title,
          employer:users!jobs_employer_id_fkey (
            name,
            company_name
          ),
          application_deadline
        )
      `)
      .eq('talent_id', talentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ applications });
  } catch (error) {
    console.error('Get talent applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete application (withdraw)
router.delete('/:id', auth, authorize('talent'), async (req, res) => {
  try {
    const { id } = req.params;
    const talentId = req.user.userId;

    // Check if application belongs to talent
    const { data: application } = await supabase
      .from('applications')
      .select('talent_id')
      .eq('id', id)
      .single();

    if (!application || application.talent_id !== talentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application statistics for employer
router.get('/stats/employer', auth, authorize('employer'), async (req, res) => {
  try {
    const employerId = req.user.userId;

    // Get total applications count
    const { data: stats, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        applications:count_applications(id)
      `)
      .eq('employer_id', employerId);

    if (error) throw error;

    const totalApplications = stats.reduce((sum, job) => sum + job.applications, 0);
    const totalJobs = stats.length;

    res.json({
      totalApplications,
      totalJobs,
      jobStats: stats
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;