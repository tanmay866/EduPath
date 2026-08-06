/**
 * Which week a learner is on, and whether it is finished.
 *
 * A deliberate mirror of frontend/src/Pages/Roadmap/weekProgress.js. The rule
 * has to exist on both sides — the browser needs it to move the card the
 * instant a task is ticked, and the weekly email needs it hours later with no
 * browser involved — and it cannot be shared across the language boundary.
 *
 * Two implementations of one rule is a drift risk, so both are tested against
 * the same cases: backend/tests/weekProgress.test.js and
 * frontend/src/Pages/Roadmap/weekProgress.test.js assert the same behaviour.
 * Change one and change the other, or the email will describe a different week
 * from the one on screen.
 */

export const ticksFor = (week) => new Set((week?.completed_tasks || []).map(Number));

export const completedSkillNames = (skills = []) =>
  new Set(skills.filter((s) => s?.status === "completed").map((s) => s.skill));

export const allTasksTicked = (week, ticks = ticksFor(week)) =>
  (week?.tasks || []).length > 0 && ticks.size >= week.tasks.length;

export const allSkillsDone = (week, doneSkills) =>
  (week?.skills || []).length > 0 && week.skills.every((s) => doneSkills.has(s));

/**
 * Done when its own tasks are all ticked, or when every skill it covers is
 * complete — the second because roadmaps generated before ticking existed
 * carry no ticks, and reading those as untouched would restart finished work.
 */
export const isWeekDone = (week, doneSkills) =>
  allTasksTicked(week) || allSkillsDone(week, doneSkills);

/** The first unfinished week, or null when the plan is complete. */
export const currentWeek = (weeks = [], skills = []) => {
  const doneSkills = completedSkillNames(skills);
  return weeks.find((w) => !isWeekDone(w, doneSkills)) || null;
};

export const doneWeekCount = (weeks = [], skills = []) => {
  const doneSkills = completedSkillNames(skills);
  return weeks.filter((w) => isWeekDone(w, doneSkills)).length;
};

export default currentWeek;
