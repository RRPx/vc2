const express = require('express');
const router = express.Router();
const supabase = require('../config/database');
const { auth, authorize } = require('../middleware/auth');
const { calculateMatchScore } = require('../services/aiService');

// Create invitation (employer only)
router.post('/', auth, authorize('employer'), async (req, res) => {
  try {
    const { jobId, talentId } = req.body;
    const employerId = req.user.userId;

    if (!jobId || !talentId) {
      return res.status(400).json({ error: 'Job ID and Talent ID are required' });
    }

    // Check if job belongs to employer
    const { data: job } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', jobId)
      .single();

    if (!job || job.employer_id !== employerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('job_id', jobId)
      .eq('talent_id', talentId)
      .single();

    if (existingInvitation) {
      return res.status(400).json({ error: 'Invitation already exists' });
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert([{
        job_id: jobId,
        employer_id: employerId,
        talent_id: talentId,
        status: 'pending'
      }])
      .select(`
        *,
        job:jobs (
          title,
          application_deadline
        ),
        employer:users (
          name,
          company_name
        ),
        talent:users (
          name,
          email
        )
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitations for a talent
router.get('/my-invitations', auth, authorize('talent'), async (req, res) => {
  try {
    const talentId = req.user.userId;

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        job:jobs (
          title,
          application_deadline,
          employer:users!jobs_employer_id_fkey (
            name,
            company_name
          )
        ),
        employer:users (
          name,
          company_name
        )
      `)
      .eq('talent_id', talentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ invitations });
  } catch (error) {
    console.error('Get talent invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitations sent by employer
router.get('/sent', auth, authorize('employer'), async (req, res) => {
  try {
    const employerId = req.user.userId;

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        job:jobs (
          title,
          application_deadline
        ),
        talent:users (
          name,
          email,
          created_at
        )
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ invitations });
  } catch (error) {
    console.error('Get employer invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to invitation (talent only)
router.put('/:id/respond', auth, authorize('talent'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const talentId = req.user.userId;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or declined' });
    }

    // Check if invitation belongs to talent and is pending
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .eq('talent_id', talentId)
      .eq('status', 'pending')
      .single();

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already responded' });
    }

    // Update invitation status
    const { data: updatedInvitation, error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', id)
      .select(`
        *,
        job:jobs (
          title,
          employer:users!jobs_employer_id_fkey (
            name,
            company_name
          )
        )
      `)
      .single();

    if (error) throw error;

    res.json({
      message: `Invitation ${status} successfully`,
      invitation: updatedInvitation
    });
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get matched talents for a job (employer only)
router.get('/matched-talents/:jobId', auth, authorize('employer'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.userId;

    // Check if job belongs to employer
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (!job || job.employer_id !== employerId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all talent profiles
    const { data: talents, error } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        user:users (
          id,
          name,
          email,
          created_at
        )
      `)
      .neq('user_id', employerId);

    if (error) throw error;

    // Calculate match scores
    const talentsWithScores = await Promise.all(
      talents.map(async (talent) => {
        const matchScore = await calculateMatchScore(talent, job);
        return {
          ...talent,
          matchScore
        };
      })
    );

    // Sort by match score (descending) and filter for good matches
    const matchedTalents = talentsWithScores
      .filter(talent => talent.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20); // Top 20 matches

    res.json({ talents: matchedTalents });
  } catch (error) {
    console.error('Get matched talents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitation statistics for talent
router.get('/stats/talent', auth, authorize('talent'), async (req, res) => {
  try {
    const talentId = req.user.userId;

    const { data: stats, error } = await supabase
      .from('invitations')
      .select('status')
      .eq('talent_id', talentId);

    if (error) throw error;

    const pending = stats.filter(inv => inv.status === 'pending').length;
    const accepted = stats.filter(inv => inv.status === 'accepted').length;
    const declined = stats.filter(inv => inv.status === 'declined').length;

    res.json({
      total: stats.length,
      pending,
      accepted,
      declined
    });
  } catch (error) {
    console.error('Get invitation stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;