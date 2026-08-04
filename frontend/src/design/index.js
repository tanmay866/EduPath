/**
 * The EduPath design system — design_handoff_edupath_redesign/DESIGN_SPEC.md
 *
 * One import site for every token-bound component, so screens never reach for
 * a raw colour or type value of their own.
 */

export { Logo, Wordmark, MicroLabel, Badge, StatusBox, ProgressBar, Avatar } from './primitives';
export { Button } from './Button';
export { Card, CardHeader, CardFooterNote, StatStrip, InkPanel, RuledGrid, RuledCell, Loading, Empty } from './Card';
export {
  Field, FieldLabel, FieldGroup, Input, PasswordInput, PasswordRequirements,
  InlineMessage, Toggle, Stepper, SegmentedFilter,
} from './form';
export { TableHead, TableRow, NumCell, ActionCell, OrdinalRow, ListItem } from './Table';
export { Modal } from './Modal';
export { BarChart, ShareChart, LabelledBar } from './charts';
export { AuthShell, LearnerShell, AdminShell, EditorialShell, EditorialSection, SiteFooter } from './shells';

/* Typography helpers — the recurring roles from §3, so screens do not
   re-declare font stacks and tracking by hand. */
export const type = {
  authHeading: { fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.1 },
  marketingHeading: { fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.1 },
  masthead: { fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05 },
  cardHeading: { fontFamily: 'var(--font-display)', fontSize: 27, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.2 },
  question: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.015em', lineHeight: 1.3 },
  panelHeading: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.2 },
  body: { fontSize: 15, lineHeight: 1.55, color: 'var(--color-text-2)' },
  prose: { fontSize: 17, lineHeight: 1.65, color: 'var(--color-text-2)' },
  listTitle: { fontSize: 15.5, fontWeight: 500, color: 'var(--color-ink)' },
  metric: { fontFamily: 'var(--font-mono)', fontSize: 30, letterSpacing: '-0.02em' },
  heroMetric: { fontFamily: 'var(--font-mono)', fontSize: 56, letterSpacing: '-0.03em' },
};
