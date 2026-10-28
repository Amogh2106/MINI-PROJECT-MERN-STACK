import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Contact from '../models/Contact.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB database...');
    await connectDB();

    console.log('[Seed] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Contact.deleteMany({}),
      Deal.deleteMany({}),
      Task.deleteMany({}),
      Note.deleteMany({}),
    ]);

    // 1. Create Users (1 admin, 1 sales)
    console.log('[Seed] Creating demo users...');
    const adminUser = await User.create({
      name: 'Amogh Admin',
      email: 'admin@crm.local',
      password: 'password123',
      role: 'admin',
    });

    const salesUser = await User.create({
      name: 'Sarah Sales',
      email: 'sales@crm.local',
      password: 'password123',
      role: 'sales',
    });

    const users = [adminUser, salesUser];

    // 2. Create 10 Companies
    console.log('[Seed] Creating 10 companies...');
    const companyNames = [
      { name: 'Apex Technologies', domain: 'apextech.io', industry: 'Cloud Computing' },
      { name: 'Beacon Logistics', domain: 'beaconlogistics.com', industry: 'Supply Chain' },
      { name: 'Crestline Financial', domain: 'crestline.com', industry: 'Fintech' },
      { name: 'Delta Health Partners', domain: 'deltahealth.org', industry: 'Healthcare' },
      { name: 'Echo Media Labs', domain: 'echomedia.co', industry: 'Digital Marketing' },
      { name: 'Frontier Robotics', domain: 'frontierrobotics.ai', industry: 'Hardware / AI' },
      { name: 'Global Retail Hub', domain: 'globalretail.com', industry: 'E-commerce' },
      { name: 'Harbor Energy Systems', domain: 'harborenergy.net', industry: 'Clean Energy' },
      { name: 'Ironclad Security', domain: 'ironcladsec.com', industry: 'Cybersecurity' },
      { name: 'Juniper BioSciences', domain: 'juniperbio.com', industry: 'Biotechnology' },
    ];

    const companies = [];
    for (let i = 0; i < companyNames.length; i++) {
      const c = companyNames[i];
      const owner = users[i % users.length];
      const company = await Company.create({
        name: c.name,
        domain: c.domain,
        industry: c.industry,
        phone: `+1 (555) 010-${(1000 + i).toString().slice(1)}`,
        address: `${100 + i * 15} Business Way, Suite ${200 + i}, New York, NY`,
        owner: owner._id,
      });
      companies.push(company);
    }

    // 3. Create 30 Contacts
    console.log('[Seed] Creating 30 contacts...');
    const contactNames = [
      'James Miller', 'Emily Davis', 'Michael Johnson', 'Sarah Wilson', 'David Taylor',
      'Jessica Brown', 'Daniel Martinez', 'Ashley Anderson', 'Robert Thomas', 'Amanda Jackson',
      'William White', 'Stephanie Harris', 'Christopher Martin', 'Nicole Thompson', 'Matthew Garcia',
      'Elizabeth Martinez', 'Joshua Robinson', 'Megan Clark', 'Andrew Rodriguez', 'Lauren Lewis',
      'Ryan Lee', 'Rachel Walker', 'Brandon Hall', 'Samantha Allen', 'Justin Young',
      'Hannah Hernandez', 'Kevin King', 'Olivia Wright', 'Tyler Lopez', 'Victoria Hill'
    ];

    const contactStatuses = ['lead', 'active', 'inactive'];
    const contacts = [];

    for (let i = 0; i < 30; i++) {
      const name = contactNames[i];
      const email = `${name.toLowerCase().replace(' ', '.')}@${companies[i % companies.length].domain}`;
      const status = contactStatuses[i % contactStatuses.length];
      const owner = users[i % users.length];
      const company = companies[i % companies.length];

      const contact = await Contact.create({
        name,
        email,
        phone: `+1 (555) 200-${(2000 + i).toString().slice(1)}`,
        company: company._id,
        status,
        owner: owner._id,
      });
      contacts.push(contact);
    }

    // 4. Create 15 Deals
    console.log('[Seed] Creating 15 deals...');
    const dealStages = ['lead', 'qualified', 'proposal', 'won', 'lost'];
    const dealTitles = [
      'Enterprise Cloud Migration',
      'Global Supply Chain Optimization',
      'Corporate Financial Dashboard License',
      'Hospital Patient Portal Rollout',
      'Omnichannel Campaign Retainer',
      'Automated Warehouse Bot Fleet',
      'E-commerce Platform Redesign',
      'Solar Microgrid Integration',
      'Zero-Trust Endpoint Security Suite',
      'Clinical Trial Data Management',
      'Annual Platform Support & SLA',
      'Custom ERP Integration Phase 1',
      'Cyber Risk Assessment & Audit',
      'Multi-site Network Upgrade',
      'High-Performance Analytics Module'
    ];

    const deals = [];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const stage = dealStages[i % dealStages.length];
      const value = (i + 1) * 8500 + 12000;
      const owner = users[i % users.length];
      const company = companies[i % companies.length];
      const contact = contacts[i % contacts.length];

      // Close date within 1 to 60 days in future
      const closeDate = new Date(now.getTime() + (i + 5) * 24 * 60 * 60 * 1000);

      const deal = await Deal.create({
        title: dealTitles[i],
        value,
        stage,
        expectedCloseDate: closeDate,
        contact: contact._id,
        company: company._id,
        owner: owner._id,
      });
      deals.push(deal);
    }

    // 5. Create 20 Tasks
    console.log('[Seed] Creating 20 tasks...');
    const taskTitles = [
      'Send contract amendment to client',
      'Prepare custom ROI proposal deck',
      'Introductory discovery call',
      'Follow up on unread email thread',
      'Schedule quarterly account review',
      'Review technical security requirements',
      'Send revised pricing breakdown',
      'Demo analytics dashboard feature',
      'Confirm renewal date with billing',
      'Check in regarding budget approval',
      'Send meeting notes and action items',
      'Coordinate onboarding call with engineering',
      'Audit open opportunity stage progress',
      'Draft scope of work document',
      'Confirm payment terms with finance',
      'Validate primary contact decision-maker role',
      'Verify integration sandbox credentials',
      'Send customer satisfaction survey',
      'Review annual contract milestones',
      'Sync with sales lead on pipeline review'
    ];

    for (let i = 0; i < 20; i++) {
      const isDueToday = i < 4; // Ensure at least 4 tasks are due today
      let dueDate;
      if (isDueToday) {
        dueDate = new Date();
      } else if (i % 2 === 0) {
        dueDate = new Date(now.getTime() + (i - 2) * 24 * 60 * 60 * 1000);
      } else {
        dueDate = new Date(now.getTime() - (i) * 12 * 60 * 60 * 1000);
      }

      const status = i % 3 === 0 ? 'done' : 'open';
      const owner = users[i % users.length];
      const contact = i % 2 === 0 ? contacts[i % contacts.length]._id : null;
      const deal = i % 2 !== 0 ? deals[i % deals.length]._id : null;

      await Task.create({
        title: taskTitles[i],
        dueDate,
        status,
        contact,
        deal,
        owner: owner._id,
      });
    }

    // 6. Create initial activity timeline notes
    console.log('[Seed] Adding sample timeline notes...');
    for (let i = 0; i < 6; i++) {
      await Note.create({
        content: `Spoke with ${contacts[i].name} regarding project scope and timeline expectations. Decision expected by end of month.`,
        entityType: 'contact',
        entityId: contacts[i]._id,
        author: users[i % users.length]._id,
      });

      await Note.create({
        content: `Internal sync held for "${deals[i].title}". Reviewed pricing discount approval and executive sponsorship.`,
        entityType: 'deal',
        entityId: deals[i]._id,
        author: users[(i + 1) % users.length]._id,
      });
    }

    console.log('[Seed] Database successfully seeded with:');
    console.log(' - 2 Users (Admin: admin@crm.local, Sales: sales@crm.local)');
    console.log(' - 10 Companies');
    console.log(' - 30 Contacts');
    console.log(' - 15 Deals');
    console.log(' - 20 Tasks');
    console.log(' - 12 Timeline Notes');

    await disconnectDB();
    console.log('[Seed] Done!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
