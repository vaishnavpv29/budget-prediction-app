/**
 * ESTIMATRIX – Full Database Seeder
 * Run: node seed.js
 * Seeds: admin, employees, historical data, projects, tasks, weekly reports
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const WeeklyReport = require('./models/WeeklyReport');
const HistoricalProject = require('./models/HistoricalProject');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');
};

// ─── HISTORICAL DATA ────────────────────────────────────────────────────────
const historicalData = [
  { name: 'E-Commerce Platform v1', type: 'web', complexity: 'high', teamSize: 5, estimatedCost: 80000, actualCost: 97000, estimatedDuration: 120, actualDuration: 145, wasDelayed: true, wasOverBudget: true, delayDays: 25, costOverrun: 17000, notes: 'Scope creep in payment module' },
  { name: 'Company Portfolio Website', type: 'web', complexity: 'low', teamSize: 2, estimatedCost: 8000, actualCost: 7500, estimatedDuration: 30, actualDuration: 28, wasDelayed: false, wasOverBudget: false, notes: 'Delivered ahead of schedule' },
  { name: 'Inventory Management System', type: 'web', complexity: 'medium', teamSize: 4, estimatedCost: 45000, actualCost: 51000, estimatedDuration: 90, actualDuration: 102, wasDelayed: true, wasOverBudget: true, delayDays: 12, costOverrun: 6000, notes: 'Integration with legacy ERP took longer' },
  { name: 'Food Delivery Mobile App', type: 'mobile', complexity: 'high', teamSize: 6, estimatedCost: 120000, actualCost: 138000, estimatedDuration: 150, actualDuration: 168, wasDelayed: true, wasOverBudget: true, delayDays: 18, costOverrun: 18000, notes: 'Real-time tracking feature added mid-project' },
  { name: 'Fitness Tracker App', type: 'mobile', complexity: 'medium', teamSize: 3, estimatedCost: 35000, actualCost: 33000, estimatedDuration: 75, actualDuration: 70, wasDelayed: false, wasOverBudget: false, notes: 'Efficient team, reused components' },
  { name: 'REST API for Banking', type: 'api', complexity: 'critical', teamSize: 7, estimatedCost: 200000, actualCost: 245000, estimatedDuration: 180, actualDuration: 210, wasDelayed: true, wasOverBudget: true, delayDays: 30, costOverrun: 45000, notes: 'Compliance requirements increased scope' },
  { name: 'Weather Data API', type: 'api', complexity: 'low', teamSize: 2, estimatedCost: 12000, actualCost: 11000, estimatedDuration: 45, actualDuration: 42, wasDelayed: false, wasOverBudget: false, notes: 'Smooth delivery' },
  { name: 'Customer Churn Prediction', type: 'ml', complexity: 'high', teamSize: 4, estimatedCost: 90000, actualCost: 105000, estimatedDuration: 120, actualDuration: 135, wasDelayed: true, wasOverBudget: true, delayDays: 15, costOverrun: 15000, notes: 'Data quality issues required extra cleaning' },
  { name: 'Sales Forecasting Model', type: 'ml', complexity: 'medium', teamSize: 3, estimatedCost: 50000, actualCost: 48000, estimatedDuration: 90, actualDuration: 85, wasDelayed: false, wasOverBudget: false, notes: 'Good data availability' },
  { name: 'HR Management System', type: 'web', complexity: 'medium', teamSize: 4, estimatedCost: 55000, actualCost: 62000, estimatedDuration: 100, actualDuration: 115, wasDelayed: true, wasOverBudget: true, delayDays: 15, costOverrun: 7000, notes: 'Payroll module complexity underestimated' },
  { name: 'Real Estate Listing Portal', type: 'web', complexity: 'high', teamSize: 5, estimatedCost: 75000, actualCost: 88000, estimatedDuration: 110, actualDuration: 128, wasDelayed: true, wasOverBudget: true, delayDays: 18, costOverrun: 13000, notes: 'Map integration and search filters took extra time' },
  { name: 'Task Management Desktop App', type: 'desktop', complexity: 'medium', teamSize: 3, estimatedCost: 40000, actualCost: 38000, estimatedDuration: 80, actualDuration: 75, wasDelayed: false, wasOverBudget: false, notes: 'Electron framework sped up development' },
  { name: 'Online Learning Platform', type: 'web', complexity: 'high', teamSize: 6, estimatedCost: 100000, actualCost: 118000, estimatedDuration: 140, actualDuration: 160, wasDelayed: true, wasOverBudget: true, delayDays: 20, costOverrun: 18000, notes: 'Video streaming integration was complex' },
  { name: 'Ride Sharing App', type: 'mobile', complexity: 'critical', teamSize: 8, estimatedCost: 180000, actualCost: 195000, estimatedDuration: 200, actualDuration: 215, wasDelayed: true, wasOverBudget: true, delayDays: 15, costOverrun: 15000, notes: 'Driver matching algorithm required multiple iterations' },
  { name: 'Simple Blog CMS', type: 'web', complexity: 'low', teamSize: 2, estimatedCost: 10000, actualCost: 9500, estimatedDuration: 35, actualDuration: 32, wasDelayed: false, wasOverBudget: false, notes: 'Used existing CMS framework' },
];

// ─── EMPLOYEES ───────────────────────────────────────────────────────────────
const employeeData = [
  { name: 'Arjun Sharma', email: 'arjun@estimatrix.com', password: 'emp123', githubUsername: 'arjun-dev', department: 'Frontend', skills: ['React', 'TypeScript', 'CSS'] },
  { name: 'Priya Nair', email: 'priya@estimatrix.com', password: 'emp123', githubUsername: 'priya-codes', department: 'Backend', skills: ['Node.js', 'MongoDB', 'Express'] },
  { name: 'Karthik Rajan', email: 'karthik@estimatrix.com', password: 'emp123', githubUsername: 'karthik-r', department: 'Full Stack', skills: ['React', 'Node.js', 'AWS'] },
  { name: 'Sneha Patel', email: 'sneha@estimatrix.com', password: 'emp123', githubUsername: 'sneha-p', department: 'QA', skills: ['Testing', 'Selenium', 'Jest'] },
];

// ─── PROJECTS ────────────────────────────────────────────────────────────────
const projectTemplates = [
  {
    name: 'ESTIMATRIX Web Portal',
    description: 'Internal project management and estimation portal for the organization.',
    type: 'web', complexity: 'high',
    budget: 95000,
    daysFromNow: 120,
    status: 'in-progress',
    githubOwner: 'dharshini-2005',
    githubRepo: 'estimatrix',
  },
  {
    name: 'Employee Self-Service App',
    description: 'Mobile app for employees to apply leave, view payslips and raise requests.',
    type: 'mobile', complexity: 'medium',
    budget: 40000,
    daysFromNow: 90,
    status: 'in-progress',
    githubOwner: '',
    githubRepo: '',
  },
  {
    name: 'Analytics Dashboard API',
    description: 'REST API backend for the company analytics and reporting dashboard.',
    type: 'api', complexity: 'medium',
    budget: 30000,
    daysFromNow: 60,
    status: 'on-track',
    githubOwner: '',
    githubRepo: '',
  },
];

// ─── TASK TEMPLATES ──────────────────────────────────────────────────────────
const taskTemplatesByType = {
  web: [
    { title: 'Requirements & Scope Definition', priority: 'high', estimatedHours: 16, phase: 0 },
    { title: 'UI/UX Wireframes & Design', priority: 'high', estimatedHours: 24, phase: 0 },
    { title: 'Database Schema Design', priority: 'high', estimatedHours: 12, phase: 0 },
    { title: 'Authentication & Authorization', priority: 'critical', estimatedHours: 20, phase: 1 },
    { title: 'Core API Development', priority: 'critical', estimatedHours: 40, phase: 1 },
    { title: 'Frontend Component Development', priority: 'high', estimatedHours: 40, phase: 1 },
    { title: 'Unit & Integration Testing', priority: 'high', estimatedHours: 24, phase: 2 },
    { title: 'Security Audit & Fixes', priority: 'critical', estimatedHours: 10, phase: 2 },
    { title: 'Deployment & Go-Live', priority: 'critical', estimatedHours: 8, phase: 2 },
  ],
  mobile: [
    { title: 'App Architecture Design', priority: 'high', estimatedHours: 10, phase: 0 },
    { title: 'UI/UX Design & Prototyping', priority: 'high', estimatedHours: 30, phase: 0 },
    { title: 'Authentication Module', priority: 'critical', estimatedHours: 20, phase: 1 },
    { title: 'Core Feature Development', priority: 'critical', estimatedHours: 50, phase: 1 },
    { title: 'Push Notifications', priority: 'medium', estimatedHours: 12, phase: 1 },
    { title: 'Device Testing (iOS & Android)', priority: 'high', estimatedHours: 24, phase: 2 },
    { title: 'App Store Submission', priority: 'high', estimatedHours: 8, phase: 2 },
  ],
  api: [
    { title: 'API Design & OpenAPI Spec', priority: 'critical', estimatedHours: 16, phase: 0 },
    { title: 'Database Design & Setup', priority: 'high', estimatedHours: 12, phase: 0 },
    { title: 'Core Endpoints Development', priority: 'critical', estimatedHours: 40, phase: 1 },
    { title: 'Authentication & Rate Limiting', priority: 'critical', estimatedHours: 16, phase: 1 },
    { title: 'API Testing Suite', priority: 'high', estimatedHours: 24, phase: 2 },
    { title: 'API Documentation', priority: 'medium', estimatedHours: 10, phase: 2 },
  ],
};

// ─── WEEKLY REPORT TEMPLATES ─────────────────────────────────────────────────
const reportTemplates = [
  {
    weekOffset: -3, // 3 weeks ago
    workCompleted: 'Completed the requirements gathering and finalized the project scope document. Set up the development environment and configured CI/CD pipeline. Reviewed existing codebase and identified reusable components.',
    pendingTasks: 'Database schema design is pending review from the team lead.',
    timeSpent: 42,
    challenges: 'Aligning stakeholder expectations on feature priorities took longer than expected.',
    nextWeekPlan: 'Start UI wireframes and begin database schema design.',
    commits: 12, prs: 1,
  },
  {
    weekOffset: -2,
    workCompleted: 'Completed UI wireframes for all major screens. Finalized database schema and created migration scripts. Started implementing authentication module with JWT.',
    pendingTasks: 'Authentication module needs unit tests.',
    timeSpent: 45,
    challenges: 'OAuth integration with Google had some configuration issues that took extra time to resolve.',
    nextWeekPlan: 'Complete authentication, start core API development.',
    commits: 18, prs: 2,
  },
  {
    weekOffset: -1,
    workCompleted: 'Authentication module fully implemented and tested. Built 60% of core API endpoints. Started frontend component library setup with reusable components.',
    pendingTasks: 'Remaining API endpoints and frontend integration.',
    timeSpent: 48,
    challenges: 'Performance issue found in the search endpoint — resolved with proper indexing.',
    nextWeekPlan: 'Complete all API endpoints and begin frontend-backend integration.',
    commits: 25, prs: 3,
  },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      WeeklyReport.deleteMany({}),
      HistoricalProject.deleteMany({}),
    ]);

    // ── 1. Create Admin ──────────────────────────────────────────────────
    console.log('👤 Creating admin...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@estimatrix.com',
      password: 'admin123',
      role: 'admin',
      department: 'Management',
      skills: ['Project Management', 'Agile', 'Risk Analysis'],
    });
    console.log(`   ✅ Admin → email: admin@estimatrix.com | password: admin123`);

    // ── 2. Create Employees (one by one so pre-save hash hook runs) ──────
    console.log('👥 Creating employees...');
    const employees = [];
    for (const e of employeeData) {
      const emp = await User.create({ ...e, role: 'employee' });
      employees.push(emp);
      console.log(`   ✅ ${emp.name} → ${emp.email} | password: emp123`);
    }

    // ── 3. Historical Data ───────────────────────────────────────────────
    console.log('📊 Seeding historical project data...');
    await HistoricalProject.insertMany(
      historicalData.map((h) => ({ ...h, uploadedBy: admin._id }))
    );
    console.log(`   ✅ ${historicalData.length} historical records inserted`);

    // ── 4. Create Projects + Tasks ───────────────────────────────────────
    console.log('📁 Creating projects with AI-generated tasks...');
    const createdProjects = [];

    for (const pt of projectTemplates) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + pt.daysFromNow);

      // Simple prediction heuristic
      const multipliers = { low: 1.0, medium: 1.4, high: 1.9, critical: 2.5 };
      const m = multipliers[pt.complexity] || 1.4;
      const predictedCost = Math.round(pt.budget * m * 1.1);
      const predictedTimeline = Math.round(pt.daysFromNow * m * 0.9);

      const memberIds = employees.map((e) => e._id);

      const project = await Project.create({
        name: pt.name,
        description: pt.description,
        type: pt.type,
        complexity: pt.complexity,
        budget: pt.budget,
        expectedDeadline: deadline,
        teamSize: employees.length,
        githubRepo: pt.githubRepo,
        githubOwner: pt.githubOwner,
        admin: admin._id,
        teamMembers: memberIds,
        predictedCost,
        predictedTimeline,
        costRisk: predictedCost > pt.budget,
        timeRisk: predictedTimeline > pt.daysFromNow,
        riskLevel: predictedCost > pt.budget && predictedTimeline > pt.daysFromNow ? 'high' : predictedCost > pt.budget || predictedTimeline > pt.daysFromNow ? 'medium' : 'low',
        status: pt.status,
      });

      // Add project to all employees
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $addToSet: { assignedProjects: project._id } }
      );

      // Generate tasks
      const templates = taskTemplatesByType[pt.type] || taskTemplatesByType.web;
      const totalDays = predictedTimeline || 30;
      const now = new Date();
      const phase0End = new Date(now.getTime() + totalDays * 0.25 * 86400000);
      const phase1End = new Date(now.getTime() + totalDays * 0.65 * 86400000);
      const phase2End = deadline;
      const phaseDates = [phase0End, phase1End, phase2End];

      const hourMult = { low: 0.7, medium: 1.0, high: 1.4, critical: 1.8 }[pt.complexity] || 1.0;

      const taskDocs = templates.map((t, i) => ({
        title: t.title,
        description: `AI-generated task for ${pt.name}: ${t.title}`,
        project: project._id,
        assignedTo: memberIds[i % memberIds.length],
        assignedBy: admin._id,
        priority: t.priority,
        dueDate: phaseDates[t.phase] || phase2End,
        estimatedHours: Math.round(t.estimatedHours * hourMult),
        tags: [pt.type, pt.complexity],
        status: t.phase === 0 ? 'completed' : t.phase === 1 ? 'in-progress' : 'pending',
        completedDate: t.phase === 0 ? new Date() : undefined,
      }));

      const createdTasks = await Task.insertMany(taskDocs);
      const completedCount = createdTasks.filter((t) => t.status === 'completed').length;

      await Project.findByIdAndUpdate(project._id, {
        totalTasks: createdTasks.length,
        completedTasks: completedCount,
        completionPercentage: Math.round((completedCount / createdTasks.length) * 100),
      });

      createdProjects.push({ project, tasks: createdTasks });
      console.log(`   ✅ "${pt.name}" → ${createdTasks.length} tasks generated`);
    }

    // ── 5. Weekly Reports ────────────────────────────────────────────────
    console.log('📝 Creating weekly reports...');
    const mainProject = createdProjects[0].project;
    const mainTasks = createdProjects[0].tasks;

    for (const emp of employees) {
      for (const tmpl of reportTemplates) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() + tmpl.weekOffset * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const completedTaskIds = mainTasks
          .filter((t) => t.status === 'completed')
          .slice(0, 2)
          .map((t) => t._id);

        await WeeklyReport.create({
          employee: emp._id,
          project: mainProject._id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          workCompleted: tmpl.workCompleted,
          githubActivity: {
            commits: tmpl.commits + Math.floor(Math.random() * 5),
            additions: Math.floor(Math.random() * 500) + 100,
            deletions: Math.floor(Math.random() * 100) + 20,
            pullRequests: tmpl.prs,
          },
          pendingTasks: tmpl.pendingTasks,
          timeSpent: tmpl.timeSpent + Math.floor(Math.random() * 6) - 3,
          challenges: tmpl.challenges,
          nextWeekPlan: tmpl.nextWeekPlan,
          tasksCompleted: completedTaskIds,
          status: tmpl.weekOffset < -1 ? 'approved' : 'submitted',
          adminFeedback: tmpl.weekOffset < -1 ? 'Good progress! Keep it up.' : '',
        });
      }
    }

    const totalReports = employees.length * reportTemplates.length;
    console.log(`   ✅ ${totalReports} weekly reports created`);

    // ── Summary ──────────────────────────────────────────────────────────
    console.log('\n🎉 Seed complete! Summary:');
    console.log('─────────────────────────────────────────');
    console.log(`  Admin:            admin@estimatrix.com / admin123`);
    console.log(`  Employees (${employees.length}):     *@estimatrix.com / emp123`);
    console.log(`  Historical Data:  ${historicalData.length} records`);
    console.log(`  Projects:         ${createdProjects.length}`);
    console.log(`  Tasks:            ${createdProjects.reduce((s, p) => s + p.tasks.length, 0)}`);
    console.log(`  Weekly Reports:   ${totalReports}`);
    console.log('─────────────────────────────────────────');
    console.log('\n👉 Open http://localhost:3000/admin/login');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
