import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Topic from '../models/Topic.js';
import Category from '../models/Category.js';
import { TOPIC_SKILL_MAP } from '../utils/skillTopicMap.js';

dotenv.config();

/**
 * Creates a quiz topic for every curriculum skill that has none.
 *
 * Half the curriculum could not be assessed. Twenty-five of the fifty-one
 * skills across the six tracks had no topic behind them, so they could never
 * be shown as known and never came off a plan however much the learner
 * already knew — and the roadmap's offer to test a skill simply did not
 * appear for them.
 *
 * The alternative was to let a neighbouring quiz stand in, which is what used
 * to happen and is what let a Python basics quiz excuse someone from Python
 * for Security. Naming a topic exactly as the skill is named keeps the two at
 * the same scope by construction.
 *
 * Questions are generated per topic at quiz time rather than held in a bank,
 * so a topic is data and nothing else has to be authored for it to work.
 *
 * Safe to re-run — it skips topics that already exist. Pass --dry to preview.
 */
const CATEGORY_FOR_TOPIC = {
    // Web Development
    'ES6+ & Modern JS': 'Web Development',
    'Async JS (Promises, async/await)': 'Web Development',
    'React Hooks & State Management': 'Web Development',
    'React Router': 'Web Development',
    'REST API Design': 'Web Development',
    'JWT Authentication': 'Web Development',
    'Full Stack Integration': 'Web Development',
    'Deployment (Vercel + Render)': 'Web Development',
    // AI & ML
    'LLMs & Prompt Engineering': 'Artificial Intelligence & Machine Learning',
    'MLOps Basics': 'Artificial Intelligence & Machine Learning',
    // Data Science
    'Python for Data Science': 'Data Science',
    'SQL Fundamentals': 'Data Science',
    'Feature Engineering & Model Evaluation': 'Data Science',
    'Model Deployment Basics': 'Data Science',
    // DevOps & Cloud
    'Linux & Shell Scripting': 'DevOps & Cloud',
    'Git & GitHub Workflows': 'DevOps & Cloud',
    'Infrastructure as Code (Terraform)': 'DevOps & Cloud',
    'Monitoring & Observability': 'DevOps & Cloud',
    // Mobile
    'Programming Fundamentals': 'Mobile Development',
    'OOP & App Architecture': 'Mobile Development',
    'Mobile UI/UX Basics': 'Mobile Development',
    'API Integration & State Management': 'Mobile Development',
    'Testing & App Deployment': 'Mobile Development',
    // Cybersecurity
    'Python for Security': 'Cybersecurity',
    'SIEM & Incident Response': 'Cybersecurity',
};

const DETAIL = {
    'ES6+ & Modern JS': ['✨', 'beginner', 'Destructuring, modules, spread and modern syntax'],
    'Async JS (Promises, async/await)': ['⏳', 'intermediate', 'Promises, async/await and the event loop'],
    'React Hooks & State Management': ['🪝', 'intermediate', 'useState, useEffect, context and shared state'],
    'React Router': ['🧭', 'intermediate', 'Client-side routing, params and nested routes'],
    'REST API Design': ['🔌', 'intermediate', 'Resources, verbs, status codes and versioning'],
    'JWT Authentication': ['🔐', 'intermediate', 'Tokens, sessions, refresh and route protection'],
    'Full Stack Integration': ['🧩', 'advanced', 'Wiring a frontend, an API and a database together'],
    'Deployment (Vercel + Render)': ['🚀', 'beginner', 'Shipping a full stack app to production'],
    'LLMs & Prompt Engineering': ['💬', 'intermediate', 'Prompting, context windows and model behaviour'],
    'MLOps Basics': ['♻️', 'advanced', 'Experiment tracking, versioning and model pipelines'],
    'Python for Data Science': ['🐍', 'beginner', 'Python for analysis, notebooks and the scientific stack'],
    'SQL Fundamentals': ['🗃️', 'beginner', 'Queries, joins, grouping and schema basics'],
    'Feature Engineering & Model Evaluation': ['⚗️', 'advanced', 'Building features and judging whether a model works'],
    'Model Deployment Basics': ['📦', 'intermediate', 'Serving a trained model and keeping it running'],
    'Linux & Shell Scripting': ['🐚', 'intermediate', 'The shell, permissions, pipes and scripting'],
    'Git & GitHub Workflows': ['🌿', 'beginner', 'Branching, merging, reviews and release flow'],
    'Infrastructure as Code (Terraform)': ['🏗️', 'advanced', 'Declaring infrastructure and managing state'],
    'Monitoring & Observability': ['📈', 'intermediate', 'Metrics, logs, traces and alerting'],
    'Programming Fundamentals': ['🧱', 'beginner', 'Types, control flow, functions and data structures'],
    'OOP & App Architecture': ['🏛️', 'intermediate', 'Objects, patterns and structuring an app'],
    'Mobile UI/UX Basics': ['📱', 'beginner', 'Layout, navigation and platform conventions'],
    'API Integration & State Management': ['🔗', 'intermediate', 'Talking to an API and holding the result'],
    'Testing & App Deployment': ['🧪', 'intermediate', 'Testing a mobile app and getting it to a store'],
    'Python for Security': ['🛡️', 'intermediate', 'Scripting for security tooling and automation'],
    'SIEM & Incident Response': ['🚨', 'advanced', 'Detection, triage and responding to incidents'],
};

const run = async () => {
    const dryRun = process.argv.includes('--dry');

    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const categories = await Category.find({}).select('name').lean();
    const categoryId = new Map(categories.map((c) => [c.name, c._id]));

    const wanted = Object.keys(CATEGORY_FOR_TOPIC);
    // Guard against a rename drifting the two lists apart silently: every
    // topic seeded here must be one the skill map actually knows about.
    const unknown = wanted.filter((name) => !TOPIC_SKILL_MAP[name]);
    if (unknown.length) {
        throw new Error(`not in the skill map: ${unknown.join(', ')}`);
    }

    const existing = new Set(
        (await Topic.find({ name: { $in: wanted } }).select('name').lean()).map((t) => t.name)
    );

    let created = 0;
    for (const name of wanted) {
        if (existing.has(name)) {
            console.log(`   skip  ${name} (already there)`);
            continue;
        }

        const catName = CATEGORY_FOR_TOPIC[name];
        const cat = categoryId.get(catName);
        if (!cat) {
            console.log(`   SKIP  ${name} — no category named "${catName}"`);
            continue;
        }

        const [icon, difficulty, description] = DETAIL[name];
        console.log(`   add   ${name}  [${catName}]`);
        created += 1;

        if (!dryRun) {
            await Topic.create({
                name,
                categoryId: cat,
                description,
                icon,
                difficulty,
                isActive: true,
            });
        }
    }

    console.log(dryRun ? `\n--dry: would create ${created} topic(s)` : `\ncreated ${created} topic(s)`);
    console.log(`topics now: ${await Topic.countDocuments()}`);

    await mongoose.disconnect();
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
