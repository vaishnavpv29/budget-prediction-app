const HistoricalProject = require('../models/HistoricalProject');

/**
 * Task templates per project type
 * Each task has: title, description, priority, estimatedHours, tag, phaseIndex (0=early,1=mid,2=late)
 */
const TASK_TEMPLATES = {
  web: [
    { title: 'Requirements & Scope Definition', description: 'Gather and document all functional and non-functional requirements from stakeholders.', priority: 'high', estimatedHours: 16, tag: 'planning', phase: 0 },
    { title: 'UI/UX Wireframes & Design', description: 'Create wireframes, mockups and finalize the design system (colors, fonts, components).', priority: 'high', estimatedHours: 24, tag: 'design', phase: 0 },
    { title: 'Database Schema Design', description: 'Design and document the database schema, relationships and indexes.', priority: 'high', estimatedHours: 12, tag: 'backend', phase: 0 },
    { title: 'Project Setup & CI/CD Pipeline', description: 'Initialize repo, configure build tools, linting, and set up CI/CD pipeline.', priority: 'medium', estimatedHours: 8, tag: 'devops', phase: 0 },
    { title: 'Authentication & Authorization', description: 'Implement user registration, login, JWT/session management and role-based access.', priority: 'critical', estimatedHours: 20, tag: 'backend', phase: 1 },
    { title: 'Core API Development', description: 'Build all REST/GraphQL API endpoints as per the requirements document.', priority: 'critical', estimatedHours: 40, tag: 'backend', phase: 1 },
    { title: 'Frontend Component Development', description: 'Build reusable UI components and integrate with backend APIs.', priority: 'high', estimatedHours: 40, tag: 'frontend', phase: 1 },
    { title: 'Third-party Integrations', description: 'Integrate payment gateways, email services, or other external APIs.', priority: 'medium', estimatedHours: 16, tag: 'integration', phase: 1 },
    { title: 'Unit & Integration Testing', description: 'Write and run unit tests for all modules. Achieve minimum 70% code coverage.', priority: 'high', estimatedHours: 24, tag: 'testing', phase: 2 },
    { title: 'Performance Optimization', description: 'Profile and optimize slow queries, lazy load assets, and improve page load times.', priority: 'medium', estimatedHours: 12, tag: 'optimization', phase: 2 },
    { title: 'Security Audit & Fixes', description: 'Run security scan, fix vulnerabilities (XSS, CSRF, SQL injection), review auth flows.', priority: 'critical', estimatedHours: 10, tag: 'security', phase: 2 },
    { title: 'UAT & Bug Fixes', description: 'Conduct user acceptance testing, collect feedback and fix reported bugs.', priority: 'high', estimatedHours: 20, tag: 'testing', phase: 2 },
    { title: 'Deployment & Go-Live', description: 'Deploy to production, configure DNS, SSL, monitoring and alerting.', priority: 'critical', estimatedHours: 8, tag: 'devops', phase: 2 },
    { title: 'Documentation', description: 'Write API docs, user manual and developer onboarding guide.', priority: 'low', estimatedHours: 12, tag: 'docs', phase: 2 },
  ],
  mobile: [
    { title: 'Requirements & User Stories', description: 'Define user stories, acceptance criteria and app flow diagrams.', priority: 'high', estimatedHours: 16, tag: 'planning', phase: 0 },
    { title: 'App Architecture Design', description: 'Choose architecture pattern (MVC/MVVM), define folder structure and state management.', priority: 'high', estimatedHours: 10, tag: 'design', phase: 0 },
    { title: 'UI/UX Design & Prototyping', description: 'Design all screens in Figma/Adobe XD, create interactive prototype.', priority: 'high', estimatedHours: 30, tag: 'design', phase: 0 },
    { title: 'Backend API Setup', description: 'Set up backend server and define all API contracts for mobile consumption.', priority: 'high', estimatedHours: 20, tag: 'backend', phase: 0 },
    { title: 'Authentication Module', description: 'Implement login, signup, OAuth (Google/Apple), biometric auth.', priority: 'critical', estimatedHours: 20, tag: 'auth', phase: 1 },
    { title: 'Core Feature Development', description: 'Build all primary app features as defined in requirements.', priority: 'critical', estimatedHours: 50, tag: 'development', phase: 1 },
    { title: 'Push Notifications', description: 'Integrate FCM/APNs for push notifications and in-app messaging.', priority: 'medium', estimatedHours: 12, tag: 'integration', phase: 1 },
    { title: 'Offline Support & Caching', description: 'Implement local storage, offline mode and data sync strategy.', priority: 'medium', estimatedHours: 16, tag: 'development', phase: 1 },
    { title: 'Device Testing (iOS & Android)', description: 'Test on multiple devices and OS versions, fix platform-specific bugs.', priority: 'high', estimatedHours: 24, tag: 'testing', phase: 2 },
    { title: 'Performance & Battery Optimization', description: 'Profile memory usage, reduce battery drain, optimize network calls.', priority: 'medium', estimatedHours: 12, tag: 'optimization', phase: 2 },
    { title: 'App Store Submission', description: 'Prepare store listings, screenshots, privacy policy and submit for review.', priority: 'high', estimatedHours: 8, tag: 'deployment', phase: 2 },
  ],
  api: [
    { title: 'API Design & OpenAPI Spec', description: 'Design all endpoints, request/response schemas and write OpenAPI specification.', priority: 'critical', estimatedHours: 16, tag: 'design', phase: 0 },
    { title: 'Database Design & Setup', description: 'Design schema, set up database, configure connection pooling and migrations.', priority: 'high', estimatedHours: 12, tag: 'backend', phase: 0 },
    { title: 'Authentication & API Keys', description: 'Implement JWT, OAuth2, API key management and rate limiting.', priority: 'critical', estimatedHours: 16, tag: 'security', phase: 0 },
    { title: 'Core Endpoints Development', description: 'Build all CRUD endpoints with proper validation and error handling.', priority: 'critical', estimatedHours: 40, tag: 'backend', phase: 1 },
    { title: 'Middleware & Error Handling', description: 'Implement logging, request validation, error formatting middleware.', priority: 'high', estimatedHours: 12, tag: 'backend', phase: 1 },
    { title: 'API Testing Suite', description: 'Write comprehensive unit and integration tests for all endpoints.', priority: 'high', estimatedHours: 24, tag: 'testing', phase: 2 },
    { title: 'API Documentation', description: 'Generate and publish interactive API docs (Swagger/Postman collection).', priority: 'medium', estimatedHours: 10, tag: 'docs', phase: 2 },
    { title: 'Load Testing & Optimization', description: 'Run load tests, identify bottlenecks and optimize for target throughput.', priority: 'high', estimatedHours: 16, tag: 'optimization', phase: 2 },
  ],
  ml: [
    { title: 'Problem Definition & Data Audit', description: 'Define ML problem type, success metrics and audit available data sources.', priority: 'critical', estimatedHours: 16, tag: 'planning', phase: 0 },
    { title: 'Data Collection & Ingestion', description: 'Build data pipelines to collect, ingest and store raw training data.', priority: 'high', estimatedHours: 24, tag: 'data', phase: 0 },
    { title: 'Exploratory Data Analysis (EDA)', description: 'Analyze data distributions, correlations, missing values and outliers.', priority: 'high', estimatedHours: 20, tag: 'data', phase: 0 },
    { title: 'Data Preprocessing & Feature Engineering', description: 'Clean data, handle missing values, encode features and create new features.', priority: 'critical', estimatedHours: 30, tag: 'data', phase: 1 },
    { title: 'Model Selection & Baseline', description: 'Evaluate multiple algorithms, establish baseline performance metrics.', priority: 'high', estimatedHours: 24, tag: 'ml', phase: 1 },
    { title: 'Model Training & Hyperparameter Tuning', description: 'Train best model, tune hyperparameters using cross-validation.', priority: 'critical', estimatedHours: 40, tag: 'ml', phase: 1 },
    { title: 'Model Evaluation & Validation', description: 'Evaluate on test set, check for bias/fairness, validate against success metrics.', priority: 'high', estimatedHours: 16, tag: 'ml', phase: 2 },
    { title: 'Model Deployment & API Wrapper', description: 'Containerize model, build inference API and deploy to production.', priority: 'high', estimatedHours: 20, tag: 'deployment', phase: 2 },
    { title: 'Monitoring & Drift Detection', description: 'Set up model performance monitoring and data drift alerts.', priority: 'medium', estimatedHours: 12, tag: 'monitoring', phase: 2 },
  ],
  desktop: [
    { title: 'Requirements & Tech Stack Selection', description: 'Define requirements, choose framework (Electron/Qt/WPF) and architecture.', priority: 'high', estimatedHours: 12, tag: 'planning', phase: 0 },
    { title: 'UI Design & Prototyping', description: 'Design application layout, navigation and key screens.', priority: 'high', estimatedHours: 20, tag: 'design', phase: 0 },
    { title: 'Core Application Framework', description: 'Set up project, configure build system, implement main window and navigation.', priority: 'high', estimatedHours: 16, tag: 'development', phase: 0 },
    { title: 'Core Feature Implementation', description: 'Build all primary features and business logic.', priority: 'critical', estimatedHours: 50, tag: 'development', phase: 1 },
    { title: 'Data Persistence Layer', description: 'Implement local database, file I/O and data sync if needed.', priority: 'high', estimatedHours: 16, tag: 'backend', phase: 1 },
    { title: 'Cross-platform Testing', description: 'Test on Windows, macOS and Linux, fix platform-specific issues.', priority: 'high', estimatedHours: 20, tag: 'testing', phase: 2 },
    { title: 'Installer & Auto-update', description: 'Build installer packages and implement auto-update mechanism.', priority: 'medium', estimatedHours: 12, tag: 'deployment', phase: 2 },
  ],
  other: [
    { title: 'Project Planning & Kickoff', description: 'Define scope, milestones, team roles and communication plan.', priority: 'high', estimatedHours: 12, tag: 'planning', phase: 0 },
    { title: 'Technical Architecture Design', description: 'Design system architecture, choose tech stack and document decisions.', priority: 'high', estimatedHours: 16, tag: 'design', phase: 0 },
    { title: 'Environment Setup', description: 'Set up development, staging and production environments.', priority: 'medium', estimatedHours: 8, tag: 'devops', phase: 0 },
    { title: 'Core Development - Phase 1', description: 'Implement foundational features and core business logic.', priority: 'critical', estimatedHours: 40, tag: 'development', phase: 1 },
    { title: 'Core Development - Phase 2', description: 'Implement secondary features and integrations.', priority: 'high', estimatedHours: 30, tag: 'development', phase: 1 },
    { title: 'Testing & QA', description: 'Comprehensive testing including unit, integration and end-to-end tests.', priority: 'high', estimatedHours: 24, tag: 'testing', phase: 2 },
    { title: 'Deployment & Handover', description: 'Deploy to production and hand over to client/operations team.', priority: 'high', estimatedHours: 10, tag: 'deployment', phase: 2 },
  ],
};

/**
 * Complexity multipliers for cost and time
 */
const COMPLEXITY_MULTIPLIERS = {
  low: 1.0,
  medium: 1.4,
  high: 1.9,
  critical: 2.5,
};

/**
 * Base cost per team member per day (USD)
 */
const BASE_COST_PER_MEMBER_PER_DAY = 150;

/**
 * Predict project cost and timeline using historical data + heuristics
 */
const predict = async ({ type, complexity, teamSize, budget, expectedDeadline }) => {
  try {
    // Fetch similar historical projects
    const historicalData = await HistoricalProject.find({
      type: { $regex: type, $options: 'i' },
      complexity,
    });

    const multiplier = COMPLEXITY_MULTIPLIERS[complexity] || 1.4;
    const expectedDays = Math.ceil(
      (new Date(expectedDeadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    let predictedCost;
    let predictedTimeline;

    if (historicalData.length >= 2) {
      // Use historical averages
      const avgCostRatio =
        historicalData.reduce((sum, p) => sum + p.actualCost / p.estimatedCost, 0) /
        historicalData.length;
      const avgTimeRatio =
        historicalData.reduce((sum, p) => sum + p.actualDuration / p.estimatedDuration, 0) /
        historicalData.length;

      predictedCost = Math.round(budget * avgCostRatio * multiplier);
      predictedTimeline = Math.round(expectedDays * avgTimeRatio);
    } else {
      // Fallback heuristic
      predictedCost = Math.round(
        BASE_COST_PER_MEMBER_PER_DAY * teamSize * expectedDays * multiplier
      );
      predictedTimeline = Math.round(expectedDays * multiplier * 0.9);
    }

    const costRisk = predictedCost > budget;
    const timeRisk = predictedTimeline > expectedDays;

    let riskLevel = 'low';
    if (costRisk && timeRisk) riskLevel = 'high';
    else if (costRisk || timeRisk) riskLevel = 'medium';

    return {
      predictedCost,
      predictedTimeline,
      costRisk,
      timeRisk,
      riskLevel,
      historicalSampleSize: historicalData.length,
    };
  } catch (error) {
    // Return safe defaults on error
    return {
      predictedCost: budget,
      predictedTimeline: 30,
      costRisk: false,
      timeRisk: false,
      riskLevel: 'low',
      historicalSampleSize: 0,
    };
  }
};

/**
 * Analyze risk for an existing project
 */
const analyzeRisk = async (project) => {
  const risks = [];

  const daysRemaining = Math.ceil(
    (new Date(project.expectedDeadline) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (project.timeRisk) {
    risks.push({
      type: 'TIME',
      severity: 'high',
      message: `Predicted timeline (${project.predictedTimeline} days) exceeds expected deadline`,
    });
  }

  if (project.costRisk) {
    const overrun = project.predictedCost - project.budget;
    risks.push({
      type: 'COST',
      severity: 'high',
      message: `Predicted cost ($${project.predictedCost.toLocaleString()}) exceeds budget by $${overrun.toLocaleString()}`,
    });
  }

  if (daysRemaining < 7 && project.completionPercentage < 80) {
    risks.push({
      type: 'DEADLINE',
      severity: 'critical',
      message: `Only ${daysRemaining} days remaining with ${project.completionPercentage}% completion`,
    });
  }

  if (project.completionPercentage < 30 && daysRemaining < project.predictedTimeline / 2) {
    risks.push({
      type: 'PROGRESS',
      severity: 'medium',
      message: 'Project progress is significantly behind schedule',
    });
  }

  return risks;
};

/**
 * Generate AI tasks for a project based on type, complexity, team members and deadline
 */
const generateTasks = ({ type, complexity, teamMembers, expectedDeadline, predictedTimeline, projectId, adminId }) => {
  const templates = TASK_TEMPLATES[type] || TASK_TEMPLATES.other;

  // Scale estimated hours based on complexity
  const COMPLEXITY_HOUR_MULTIPLIERS = { low: 0.7, medium: 1.0, high: 1.4, critical: 1.8 };
  const hourMultiplier = COMPLEXITY_HOUR_MULTIPLIERS[complexity] || 1.0;

  const totalDays = predictedTimeline || 30;
  const startDate = new Date();
  const members = teamMembers && teamMembers.length > 0 ? teamMembers : [adminId];

  // Divide timeline into 3 phases (25% / 65% / 100%)
  const phase0End = new Date(startDate.getTime() + (totalDays * 0.25) * 86400000);
  const phase1End = new Date(startDate.getTime() + (totalDays * 0.65) * 86400000);
  const phase2End = new Date(expectedDeadline);

  const phaseDueDates = [phase0End, phase1End, phase2End];

  // Round-robin assign members
  let memberIndex = 0;

  const tasks = templates.map((template) => {
    const assignedTo = members[memberIndex % members.length];
    memberIndex++;

    return {
      title: template.title,
      description: template.description,
      project: projectId,
      assignedTo,
      assignedBy: adminId,
      priority: template.priority,
      dueDate: phaseDueDates[template.phase] || phase2End,
      estimatedHours: Math.round(template.estimatedHours * hourMultiplier),
      tags: [template.tag, type, complexity],
      status: 'pending',
    };
  });

  return tasks;
};

module.exports = { predict, analyzeRisk, generateTasks };
