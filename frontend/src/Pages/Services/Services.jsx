import React from 'react';
import { Link } from 'react-router-dom';
import StartLink from '../../component/StartLink';
import { EditorialShell, Button, MicroLabel, type } from '../../design';
import IndexRows from '../../component/marketing/IndexRows';
import { TRACKS, TRACK_PACE_HOURS, TRACK_PACE_LEVEL } from '../Home/tracks';

/**
 * Spec §7 Marketing · index page — the six role tracks.
 *
 * The tracks come from the same module the landing index reads, so the two
 * pages cannot disagree about how many weeks a track takes.
 */
const Services = () => (
  <EditorialShell>
    <section style={{ padding: '80px 0 0' }}>
      <MicroLabel size={11} tracking="0.14em" color="var(--color-text-4)" style={{ display: 'block', marginBottom: 16 }}>
        Tracks
      </MicroLabel>

      <h1 style={{ ...type.marketingHeading, margin: '0 0 20px', maxWidth: 720 }}>
        Six destinations. The plan narrows to what you are missing.
      </h1>

      <p style={{ ...type.prose, margin: '0 0 40px', maxWidth: 680 }}>
        Every track is a dependency-sorted sequence of skills, not a reading list. The week counts
        below assume {TRACK_PACE_HOURS} h/week from {TRACK_PACE_LEVEL} — the same figures the
        landing page quotes. Give it fewer hours and the plan stretches rather than falling apart,
        and anything you already know is not scheduled at all.
      </p>

      <IndexRows
        rows={TRACKS.map((track) => ({
          name: track.name,
          description: track.summary,
          stack: track.stack,
          meta: `${track.weeks} WKS · ${track.nodes} NODES`,
        }))}
      />
    </section>

    <section style={{ padding: '56px 0 80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
      <p style={{ ...type.body, margin: 0, maxWidth: 460 }}>
        Not sure which one? Pick the closest — these are broad, and the assessment then narrows the
        plan to what you personally are missing, which matters more than the label. You can change
        your track in your profile at any time.
      </p>
      <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
        <StartLink>
          <Button>Take the assessment</Button>
        </StartLink>
        <Link to="/work" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">How it works</Button>
        </Link>
      </div>
    </section>
  </EditorialShell>
);

export default Services;
