import { useState, useCallback } from 'react';
import { updateTaskStatus } from '../Services/roadmapService';
import { ticksFor } from './weekProgress';

/**
 * Ticking a task, shared by the weekly plan and the overview card.
 *
 * The tick lands immediately and the save follows: waiting on a round trip to
 * fill a checkbox makes the page feel broken, and this is an action people
 * take four times in a sitting. A failed save puts the tick back and says so.
 */
export const useWeekTicks = () => {
  const [ticksByWeek, setTicksByWeek] = useState({});
  const [error, setError] = useState('');

  const ticksOf = useCallback(
    (week) => ticksByWeek[week?.week_number] ?? ticksFor(week),
    [ticksByWeek],
  );

  const toggle = useCallback(async (week, index) => {
    const before = ticksByWeek[week.week_number] ?? ticksFor(week);
    const after = new Set(before);
    const done = !after.has(index);
    if (done) after.add(index);
    else after.delete(index);

    setTicksByWeek((prev) => ({ ...prev, [week.week_number]: after }));
    setError('');

    try {
      await updateTaskStatus(week.week_number, index, done);
    } catch (err) {
      setTicksByWeek((prev) => ({ ...prev, [week.week_number]: before }));
      // The service throws the server's payload when there is one and the raw
      // axios error when there is not — and that one's message is the literal
      // string "Network Error", which tells a learner nothing.
      const fromServer = err && err.success === false && err.message;
      setError(fromServer || 'That did not save. Check your connection and try again.');
    }
  }, [ticksByWeek]);

  return { ticksByWeek, ticksOf, toggle, error };
};

export default useWeekTicks;
