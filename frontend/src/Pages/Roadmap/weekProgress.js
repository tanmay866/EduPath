/**
 * One definition of where a learner is in their plan.
 *
 * The weekly plan and the overview both have to answer "which week is this
 * person on" and "is that week finished". Two copies of that rule would drift
 * the first time either changed — and the same page already carried two
 * competing ideas of a completed week before ticking existed.
 */

/** Ticks recorded against a week, as a Set of task indices. */
export const ticksFor = (week) => new Set((week?.completed_tasks || []).map(Number));

/** Skills the learner has marked complete, by name. */
export const completedSkillNames = (skills = []) =>
  new Set(skills.filter((s) => s?.status === 'completed').map((s) => s.skill));

export const allTasksTicked = (week, ticks = ticksFor(week)) =>
  (week?.tasks || []).length > 0 && ticks.size >= week.tasks.length;

export const allSkillsDone = (week, doneSkills) =>
  (week?.skills || []).length > 0 && week.skills.every((s) => doneSkills.has(s));

/**
 * A week is done when its own tasks are all ticked, or when every skill it
 * covers is complete.
 *
 * Two conditions rather than one because roadmaps generated before ticking
 * existed carry no ticks. Reading those as untouched would have silently
 * un-completed work the learner had already finished and marked.
 */
export const isWeekDone = (week, doneSkills, ticksByWeek = {}) => {
  const ticks = ticksByWeek[week?.week_number] ?? ticksFor(week);
  return allTasksTicked(week, ticks) || allSkillsDone(week, doneSkills);
};

/**
 * The week to work on: the first one not finished.
 *
 * Null when every week is done — a finished plan has no current week, and
 * saying "week 1" there would be worse than saying nothing.
 */
export const currentWeek = (weeks = [], skills = [], ticksByWeek = {}) => {
  const doneSkills = completedSkillNames(skills);
  return weeks.find((w) => !isWeekDone(w, doneSkills, ticksByWeek)) || null;
};

/** How many weeks are finished, for a "3 / 14" style count. */
export const doneWeekCount = (weeks = [], skills = [], ticksByWeek = {}) => {
  const doneSkills = completedSkillNames(skills);
  return weeks.filter((w) => isWeekDone(w, doneSkills, ticksByWeek)).length;
};
