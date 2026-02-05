const bcrypt = require('bcryptjs');
const supabase = require('./config/database');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Create sample employers
    const employers = [
      {
        email: 'employer1@techcorp.com',
        password: 'password123',
        name: 'John Smith',
        role: 'employer',
        company_name: 'TechCorp Solutions'
      },
      {
        email: 'employer2@innovateco.com',
        password: 'password123',
        name: 'Sarah Johnson',
        role: 'employer',
        company_name: 'InnovateCo'
      },
      {
        email: 'employer3@datapro.com',
        password: 'password123',
        name: 'Michael Chen',
        role: 'employer',
        company_name: 'DataPro Systems'
      }
    ];

    const createdEmployers = [];
    for (const employer of employers) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(employer.password, saltRounds);
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: employer.email,
          password_hash: passwordHash,
          name: employer.name,
          role: employer.role,
          company_name: employer.company_name
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating employer:', error);
        continue;
      }
      
      createdEmployers.push(data);
      console.log(`Created employer: ${employer.name}`);
    }

    // Create sample talents
    const talents = [
      {
        email: 'talent1@dev.com',
        password: 'password123',
        name: 'Alice Wilson',
        role: 'talent',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        experience_years: 5,
        bio: 'Full-stack developer with expertise in modern web technologies'
      },
      {
        email: 'talent2@dev.com',
        password: 'password123',
        name: 'Bob Martinez',
        role: 'talent',
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
        experience_years: 3,
        bio: 'Data scientist passionate about AI and machine learning'
      },
      {
        email: 'talent3@dev.com',
        password: 'password123',
        name: 'Carol Davis',
        role: 'talent',
        skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
        experience_years: 7,
        bio: 'Senior backend developer specializing in enterprise applications'
      },
      {
        email: 'talent4@dev.com',
        password: 'password123',
        name: 'David Kim',
        role: 'talent',
        skills: ['React', 'Vue.js', 'CSS', 'UI/UX'],
        experience_years: 4,
        bio: 'Frontend developer with strong design skills'
      },
      {
        email: 'talent5@dev.com',
        password: 'password123',
        name: 'Emma Brown',
        role: 'talent',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
        experience_years: 6,
        bio: 'Backend developer with cloud expertise'
      }
    ];

    const createdTalents = [];
    for (const talent of talents) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(talent.password, saltRounds);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert([{
          email: talent.email,
          password_hash: passwordHash,
          name: talent.name,
          role: talent.role
        }])
        .select()
        .single();

      if (userError) {
        console.error('Error creating talent user:', userError);
        continue;
      }

      const { data: profile, error: profileError } = await supabase
        .from('talent_profiles')
        .insert([{
          user_id: user.id,
          skills: talent.skills,
          experience_years: talent.experience_years,
          bio: talent.bio
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating talent profile:', profileError);
        continue;
      }
      
      createdTalents.push({ ...user, profile });
      console.log(`Created talent: ${talent.name}`);
    }

    // Create sample jobs
    const jobs = [
      {
        employer_id: createdEmployers[0].id,
        title: 'Senior Frontend Developer',
        tech_stack: ['React', 'TypeScript', 'Node.js', 'CSS'],
        // application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        employer_id: createdEmployers[0].id,
        title: 'Full Stack Engineer',
        tech_stack: ['JavaScript', 'React', 'Python', 'PostgreSQL'],
        // application_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      },
      {
        employer_id: createdEmployers[1].id,
        title: 'Data Scientist',
        tech_stack: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas'],
        // application_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) // 20 days from now
      },
      {
        employer_id: createdEmployers[1].id,
        title: 'Machine Learning Engineer',
        tech_stack: ['Python', 'PyTorch', 'AWS', 'Docker'],
        // application_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      },
      {
        employer_id: createdEmployers[2].id,
        title: 'Backend Developer',
        tech_stack: ['Java', 'Spring Boot', 'Microservices', 'MySQL'],
        // application_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      },
      {
        employer_id: createdEmployers[2].id,
        title: 'DevOps Engineer',
        tech_stack: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        // application_deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000) // 25 days from now
      }
    ];

    const createdJobs = [];
    for (const job of jobs) {
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          employer_id: job.employer_id,
          title: job.title,
          tech_stack: job.tech_stack,
          description: `We are looking for a talented ${job.title} to join our team.`,
          // // application_deadline: job.application_deadline
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating job:', error);
        continue;
      }
      
      createdJobs.push(data);
      console.log(`Created job: ${job.title}`);
    }

    // Create sample applications
    const applications = [
      {
        job_id: createdJobs[0].id, // Senior Frontend Developer
        talent_id: createdTalents[0].id, // Alice Wilson (Frontend dev)
        source: 'manual'
      },
      {
        job_id: createdJobs[1].id, // Full Stack Engineer
        talent_id: createdTalents[0].id, // Alice Wilson
        source: 'manual'
      },
      {
        job_id: createdJobs[2].id, // Data Scientist
        talent_id: createdTalents[1].id, // Bob Martinez (Data scientist)
        source: 'manual'
      },
      {
        job_id: createdJobs[3].id, // ML Engineer
        talent_id: createdTalents[1].id, // Bob Martinez
        source: 'manual'
      },
      {
        job_id: createdJobs[4].id, // Backend Developer
        talent_id: createdTalents[2].id, // Carol Davis (Backend dev)
        source: 'manual'
      },
      {
        job_id: createdJobs[0].id, // Senior Frontend Developer
        talent_id: createdTalents[3].id, // David Kim (Frontend dev)
        source: 'manual'
      },
      {
        job_id: createdJobs[5].id, // DevOps Engineer
        talent_id: createdTalents[4].id, // Emma Brown (Backend dev)
        source: 'manual'
      }
    ];

    for (const application of applications) {
      const { data, error } = await supabase
        .from('applications')
        .insert([application])
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        continue;
      }
      
      console.log(`Created application for talent ${application.talent_id}`);
    }

    // Create sample invitations
    const invitations = [
      {
        job_id: createdJobs[0].id, // Senior Frontend Developer
        employer_id: createdEmployers[0].id,
        talent_id: createdTalents[3].id, // David Kim (Frontend dev)
        status: 'pending'
      },
      {
        job_id: createdJobs[2].id, // Data Scientist
        employer_id: createdEmployers[1].id,
        talent_id: createdTalents[1].id, // Bob Martinez (Data scientist)
        status: 'accepted'
      },
      {
        job_id: createdJobs[4].id, // Backend Developer
        employer_id: createdEmployers[2].id,
        talent_id: createdTalents[4].id, // Emma Brown (Backend dev)
        status: 'pending'
      }
    ];

    for (const invitation of invitations) {
      const { data, error } = await supabase
        .from('invitations')
        .insert([invitation])
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        continue;
      }
      
      console.log(`Created invitation for talent ${invitation.talent_id}`);
    }

    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Employers:');
    console.log('  Email: employer1@techcorp.com, Password: password123');
    console.log('  Email: employer2@innovateco.com, Password: password123');
    console.log('Talents:');
    console.log('  Email: talent1@dev.com, Password: password123');
    console.log('  Email: talent2@dev.com, Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run the seeding function
seedData();