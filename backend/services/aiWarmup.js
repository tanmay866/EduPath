import axios from 'axios';

/**
 * Keeps the Python service awake while this one is.
 *
 * Both services sit on Render's free tier, which stops a service after about
 * fifteen minutes of quiet and takes upwards of two and a half minutes to
 * start it again — measured, not guessed: a cold root request answered in
 * 162 seconds. Every call the backend makes to it had a twenty or thirty
 * second timeout, so the first person to generate a roadmap after a quiet
 * spell always got "the analysis service is not reachable", and the service
 * they were told was unreachable was in fact starting up perfectly well.
 *
 * Raising the timeout alone would only move the problem: it would turn a
 * failure into a three minute wait. So the service is woken from here
 * instead, while this process is awake and before anybody asks it for
 * anything.
 *
 * It is fire and forget on purpose. A ping that fails means the other service
 * is still starting, which is the state this exists to get out of, and
 * nothing about a failed warm-up should reach a request.
 */
// Comfortably inside Render's idle window, so the service is pinged again
// well before it is put to sleep.
const EVERY_MS = 10 * 60 * 1000;

const ping = async (url) => {
    try {
        await axios.get(`${url}/`, { timeout: 20000 });
    } catch {
        // Starting, or down. Either way the next ping tries again and a
        // request that needs it waits on its own generous timeout.
    }
};

export const startAiWarmup = () => {
    // Read here rather than at import, so the value tested and the value
    // pinged are always the same one. Captured at import they can differ,
    // which is only invisible because dotenv happens to load first.
    const url = process.env.AI_SERVICE_URL;

    // Local development runs the service by hand and does not need this; the
    // ping is harmless there but the log line is noise.
    if (!url) return null;

    ping(url);
    const timer = setInterval(() => ping(url), EVERY_MS);
    // Not a reason to hold the process open by itself.
    timer.unref?.();

    console.log(`AI service warm-up every ${EVERY_MS / 60000} min: ${url}`);
    return timer;
};

export default startAiWarmup;
