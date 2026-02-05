const axios = require('axios');

// Generate job description using AI
const generateJobDescription = async (title, techStack) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to template if no OpenAI key
      return `We are looking for a talented ${title} to join our team. 

Responsibilities:
- Develop and maintain high-quality software solutions
- Collaborate with cross-functional teams
- Write clean, testable, and efficient code
- Participate in code reviews and architectural decisions
- Stay updated with the latest industry trends

Requirements:
- Strong experience with ${techStack.join(', ')}
- Bachelor's degree in Computer Science or related field
- Excellent problem-solving skills
- Strong communication and teamwork abilities

We offer competitive compensation, flexible work environment, and opportunities for professional growth.`;
    }

    const prompt = `Generate a professional job description for a ${title} position. The tech stack includes: ${techStack.join(', ')}.

Requirements:
1. Make it professional and engaging
2. Include responsibilities section
3. Include requirements section
4. Include company benefits section
5. Keep it concise but comprehensive
6. Avoid generic clichés
7. Target experienced professionals`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR professional who writes compelling job descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating job description:', error);
    // Fallback to template
    return `We are looking for a talented ${title} to join our team. 

Responsibilities:
- Develop and maintain high-quality software solutions using ${techStack.join(', ')}
- Collaborate with cross-functional teams
- Write clean, testable, and efficient code
- Participate in code reviews and architectural decisions
- Stay updated with the latest industry trends

Requirements:
- Strong experience with ${techStack.join(', ')}
- Bachelor's degree in Computer Science or related field
- Excellent problem-solving skills
- Strong communication and teamwork abilities

We offer competitive compensation, flexible work environment, and opportunities for professional growth.`;
  }
};

// Calculate match score between talent profile and job
const calculateMatchScore = async (talentProfile, job) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Simple scoring algorithm fallback
      return calculateSimpleScore(talentProfile, job);
    }

    const prompt = `Calculate a match score (0-100) between a talent profile and a job.

Talent Profile:
- Skills: ${talentProfile.skills.join(', ')}
- Experience: ${talentProfile.experience_years} years
- Bio: ${talentProfile.bio || 'Not provided'}

Job Details:
- Title: ${job.title}
- Required Skills: ${job.tech_stack.join(', ')}
- Description: ${job.description || 'Not provided'}

Return only a number between 0 and 100 representing the match percentage. Consider:
- Skill alignment (60% weight)
- Experience level (25% weight)
- Bio/description relevance (15% weight)`;

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert recruiting AI that calculates job-talent compatibility scores.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const score = parseInt(response.data.choices[0].message.content.trim());
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error calculating match score:', error);
    return calculateSimpleScore(talentProfile, job);
  }
};

// Simple scoring algorithm as fallback
const calculateSimpleScore = (talentProfile, job) => {
  const talentSkills = talentProfile.skills.map(s => s.toLowerCase());
  const jobSkills = job.tech_stack.map(s => s.toLowerCase());
  
  // Calculate skill overlap
  const commonSkills = talentSkills.filter(skill => 
    jobSkills.some(jobSkill => 
      jobSkill.includes(skill) || skill.includes(jobSkill)
    )
  );
  
  const skillScore = jobSkills.length > 0 ? (commonSkills.length / jobSkills.length) * 60 : 0;
  
  // Calculate experience score
  const experienceScore = Math.min(talentProfile.experience_years * 2, 25);
  
  // Base score
  const baseScore = 15;
  
  return Math.round(skillScore + experienceScore + baseScore);
};

module.exports = {
  generateJobDescription,
  calculateMatchScore
};