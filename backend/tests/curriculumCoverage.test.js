import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { topicForSkill } from '../utils/skillTopicMap.js';
import { topicsForRole } from '../utils/roleTopicMap.js';

/**
 * The two taxonomies have to stay level.
 *
 * Skills live in the AI service's Python role templates; the topics that test
 * them live here. Nothing links the files, so a skill added to a track simply
 * arrives with no way to assess it — which is how half the curriculum came to
 * be untestable without anyone noticing. That is silent in the worst way: the
 * roadmap still schedules the skill, it just never offers a quiz and the
 * learner can never show they already know it.
 *
 * So this reads the templates directly rather than keeping a copy that would
 * drift in the same way.
 */
const TEMPLATES = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '..',
    'ai_service',
    'data',
    'role_templates.py'
);

/** Skill names are the keys one level inside each track's "skills" dict. */
const curriculumSkills = () => {
    const source = fs.readFileSync(TEMPLATES, 'utf8');
    const names = new Set();
    for (const line of source.split('\n')) {
        const match = line.match(/^ {12}"(.+)": \{$/);
        if (match) names.add(match[1]);
    }
    return [...names];
};

/** The same file read per track: role name at four spaces, skills at twelve. */
const skillsByRole = () => {
    const source = fs.readFileSync(TEMPLATES, 'utf8');
    const byRole = {};
    let current = null;
    for (const line of source.split('\n')) {
        const role = line.match(/^ {4}"(.+)": \{$/);
        if (role) {
            current = role[1];
            byRole[current] = [];
            continue;
        }
        const skill = line.match(/^ {12}"(.+)": \{$/);
        if (skill && current) byRole[current].push(skill[1]);
    }
    return byRole;
};

test('the templates are actually being read', () => {
    // Without this the regex could quietly match nothing and every assertion
    // below would pass over an empty list — a green suite proving nothing.
    // The count only has to be obviously-not-zero, not exact.
    const skills = curriculumSkills();
    assert.ok(skills.length > 40, `only found ${skills.length} skills — the parse has drifted`);
    assert.ok(skills.includes('React Basics'), 'a known skill is missing from the parse');
    assert.ok(skills.includes('Python Basics'), 'a known skill is missing from the parse');
});

test('every skill in the curriculum has a quiz that can prove it', () => {
    const orphans = curriculumSkills().filter((skill) => !topicForSkill(skill));
    assert.deepEqual(
        orphans,
        [],
        `no topic assesses these, so they can never be tested or shown as known: ${orphans.join(', ')}`
    );
});

test('a topic is never offered for a skill it does not assess', () => {
    // The reverse direction: resolving to something approximate is how a
    // learner gets sent to a quiz that cannot settle the question.
    for (const skill of curriculumSkills()) {
        const topic = topicForSkill(skill);
        if (!topic) continue;
        assert.ok(
            typeof topic === 'string' && topic.length > 0,
            `${skill} resolved to something unusable`
        );
    }
});

test('a track recommends the quizzes for its own curriculum', () => {
    // A third hand-kept list, and the one that drifted last: twenty-five new
    // topics were selectable but recommended to nobody, so the learner had to
    // already know the skill's name to find the quiz for it. Recommendations
    // may be wider than the curriculum — TypeScript and Big Data are here on
    // purpose — but never narrower.
    const byRole = skillsByRole();
    assert.ok(Object.keys(byRole).length >= 6, 'the per-track parse has drifted');

    for (const [role, skills] of Object.entries(byRole)) {
        const recommended = new Set(topicsForRole(role));
        if (!recommended.size) continue; // aliases of a canonical role

        const unrecommended = [
            ...new Set(skills.map(topicForSkill).filter(Boolean)),
        ].filter((topic) => !recommended.has(topic));

        assert.deepEqual(
            unrecommended,
            [],
            `${role} schedules these but never suggests testing them: ${unrecommended.join(', ')}`
        );
    }
});
