import React from 'react';
import { Button, MicroLabel, type } from '../design';

/**
 * Recovers from a route chunk that is no longer on the CDN.
 *
 * Routes load on demand, so each screen is a separate hashed file fetched at
 * the moment it is opened. A deploy replaces those files with new hashes. An
 * open tab is still running the old index, so the first navigation after a
 * deploy asks for a chunk that no longer exists, the import rejects, and React
 * unmounts the tree — a blank page, on a click that used to work.
 *
 * It is specific to lazy loading: with one eager bundle a stale tab simply ran
 * old code until it was reloaded. So the recovery belongs with the splitting
 * that introduced it.
 *
 * A reload fixes it completely, because it fetches the new index and with it
 * the new hashes. That is what this does, once.
 */

/**
 * Browsers word this differently and none of them give it a code, so matching
 * the message is the only option available. Chrome, Firefox, Safari and Vite's
 * own preload helper in that order.
 */
const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

const isChunkError = (error) =>
  Boolean(error && CHUNK_ERROR.test(error.message || String(error)));

/**
 * Marks that a reload has already been tried, so a chunk error that survives
 * one cannot put the tab in a refresh loop.
 *
 * sessionStorage rather than a field on the component: the reload throws this
 * instance away, so anything held in memory is gone exactly when it is needed.
 * The timestamp is what lets a genuine second incident — a later deploy, in a
 * tab left open for hours — still get its own reload.
 */
const RELOAD_KEY = 'edupath:chunk-reload-at';
const RELOAD_WINDOW_MS = 20000;

const reloadedRecently = () => {
  try {
    const at = Number(sessionStorage.getItem(RELOAD_KEY));
    return Boolean(at) && Date.now() - at < RELOAD_WINDOW_MS;
  } catch {
    // Private browsing can throw on storage. Treating that as "already tried"
    // is the safe way round: no reload, just the message and a manual button.
    return true;
  }
};

const markReloaded = () => {
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Ignored deliberately — see above.
  }
};

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Real bugs keep reaching the console. This boundary exists for stale
    // chunks; it should not quietly become the place render errors go to die.
    if (!isChunkError(error)) {
      console.error('Unhandled render error:', error, info?.componentStack);
      return;
    }

    if (reloadedRecently()) {
      console.error('Chunk failed to load again after a reload:', error);
      return;
    }

    markReloaded();
    window.location.reload();
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    // The reload is already on its way; rendering nothing avoids showing a
    // failure notice for a tenth of a second on the way out.
    if (isChunkError(error) && !reloadedRecently()) return null;

    const stale = isChunkError(error);

    return (
      <div style={{ padding: '120px 20px', textAlign: 'center' }}>
        <MicroLabel size={11} tracking="0.13em" color="var(--color-text-4)">
          {stale ? 'THIS PAGE IS OUT OF DATE' : 'SOMETHING WENT WRONG'}
        </MicroLabel>
        <p style={{ ...type.body, maxWidth: 420, margin: '14px auto 22px' }}>
          {stale
            ? 'EduPath was updated while this tab was open, so part of it could not be loaded. Reloading picks up the new version.'
            : 'This screen could not be displayed. Reloading usually clears it.'}
        </p>
        <Button
          onClick={() => {
            markReloaded();
            window.location.reload();
          }}
        >
          Reload
        </Button>
      </div>
    );
  }
}

export default ChunkErrorBoundary;
