/**
 * DOCX -> PDF conversion via FreeConvert.
 *
 * This ran in the browser with the API key inlined in the bundle, so the key was
 * readable by anyone who opened devtools or the public repo. The flow is
 * unchanged; it just runs here, where the key stays server-side.
 */

const API_BASE = 'https://api.freeconvert.com/v1';
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60; // ~3 minutes

const authHeaders = () => {
  const apiKey = process.env.FREECONVERT_API_KEY;
  if (!apiKey) {
    throw new Error('FREECONVERT_API_KEY is not configured');
  }
  return { Authorization: `Bearer ${apiKey}` };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** FreeConvert returns tasks as either an array or a keyed object. */
const findTask = (tasks, name, operation) => {
  const list = Array.isArray(tasks) ? tasks : Object.values(tasks || {});
  return list.find((t) => t.name === name || t.operation === operation);
};

/**
 * Convert a DOCX at a public URL into a PDF and return the PDF's URL.
 *
 * @param {string} docxUrl - publicly readable DOCX (Cloudinary)
 * @returns {Promise<string>} URL of the converted PDF
 */
export const convertDocxUrlToPdf = async (docxUrl) => {
  const headers = authHeaders();

  const fileResponse = await fetch(docxUrl);
  if (!fileResponse.ok) {
    throw new Error(`Could not download the generated resume (${fileResponse.status})`);
  }
  const fileBlob = await fileResponse.blob();

  const jobResponse = await fetch(`${API_BASE}/process/jobs`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tasks: {
        'upload-my-file': { operation: 'import/upload' },
        'convert-to-pdf': { operation: 'convert', input: 'upload-my-file', output_format: 'pdf' },
        'export-pdf': { operation: 'export/url', input: 'convert-to-pdf' },
      },
    }),
  });

  if (!jobResponse.ok) {
    const detail = await jobResponse.text();
    throw new Error(`Conversion job could not be created: ${detail.slice(0, 200)}`);
  }

  const job = await jobResponse.json();
  const uploadTaskId = findTask(job.tasks, 'upload-my-file', 'import/upload')?.id;
  if (!uploadTaskId) {
    throw new Error('Conversion job did not return an upload task');
  }

  const taskResponse = await fetch(`${API_BASE}/process/tasks/${uploadTaskId}`, { headers });
  if (!taskResponse.ok) {
    throw new Error('Could not read the upload task details');
  }

  const uploadForm = (await taskResponse.json())?.result?.form;
  if (!uploadForm?.url) {
    throw new Error('Upload form missing from the conversion task');
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(uploadForm.parameters || {})) {
    formData.append(key, value);
  }
  formData.append('file', fileBlob, 'resume.docx');

  const uploadResponse = await fetch(uploadForm.url, { method: 'POST', body: formData });
  if (!uploadResponse.ok) {
    throw new Error(`Uploading the resume for conversion failed (${uploadResponse.status})`);
  }

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const statusResponse = await fetch(`${API_BASE}/process/jobs/${job.id}`, { headers });
    if (!statusResponse.ok) {
      continue;
    }

    const status = await statusResponse.json();

    if (status.status === 'completed') {
      const url = findTask(status.tasks, 'export-pdf', 'export/url')?.result?.url;
      if (!url) {
        throw new Error('Conversion completed but returned no PDF URL');
      }
      return url;
    }

    if (status.status === 'error' || status.status === 'failed') {
      throw new Error(`Conversion failed: ${status.message || status.status}`);
    }
  }

  throw new Error('Conversion timed out');
};

export default { convertDocxUrlToPdf };
