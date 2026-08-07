import { useLayoutEffect, useRef } from 'react';

/**
 * Reveals a list one row at a time as it scrolls into view.
 *
 * The hiding is done by JavaScript, not by the stylesheet, and that is the
 * important part. A list that starts at opacity zero in CSS is invisible to
 * anyone whose JavaScript failed, who has an extension that broke the
 * observer, or who is reading it through something that never fires one — the
 * content would simply not be there. Here the rows are visible until this
 * hook decides it can animate them, so every one of those cases degrades to a
 * list that is merely static.
 *
 * It hides them in a layout effect rather than an ordinary one, which runs
 * before the browser paints, so there is no flash of the visible list being
 * snatched away.
 *
 * Someone who has asked for reduced motion gets nothing at all: not a fast
 * animation, no animation. The global rule in index.css collapses durations
 * to almost zero, but relying on that would still mean hiding the content and
 * hoping the transition brings it back.
 *
 * Returns a ref for the container. Rows are found by `selector`, and the
 * per-row delay is written as a custom property the stylesheet reads, so the
 * timing lives with the rest of the styling.
 */
export const useStaggeredReveal = ({ selector, step = 70, max = 8 } = {}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container || !selector) return undefined;

    const wantsMotion = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!wantsMotion || typeof IntersectionObserver === 'undefined') return undefined;

    const rows = Array.from(container.querySelectorAll(selector));
    if (!rows.length) return undefined;

    rows.forEach((row, i) => {
      // Capped, so a long list does not leave the last rows waiting seconds
      // after the first — the stagger is there to give the eye an order to
      // read in, not to make anyone wait for the content.
      row.style.setProperty('--reveal-delay', `${Math.min(i, max) * step}ms`);
    });

    // Only now does anything become invisible, and only because we are about
    // to bring it back.
    container.classList.add('is-staggered');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          // Revealed once. Re-hiding on the way back up turns a scroll into a
          // flicker for anyone who scrolls past and returns.
          observer.unobserve(entry.target);
        });
      },
      // A little margin up from the bottom edge, so a row starts moving as it
      // arrives rather than after it is already fully on screen.
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [selector, step, max]);

  return ref;
};

export default useStaggeredReveal;
