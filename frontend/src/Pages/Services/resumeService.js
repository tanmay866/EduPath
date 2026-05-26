const API_URL = 'http://localhost:4000/api/resume';

export const uploadResume = async (resumeData, onProgress) => {
  return new Promise((resolve, reject) => {
    try {
      const token = sessionStorage.getItem('token');
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (err) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.message || 'Failed to upload resume'));
          } catch (err) {
            reject(new Error('Failed to upload resume'));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send request
      xhr.open('POST', API_URL);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(JSON.stringify(resumeData));
    } catch (error) {
      reject(error);
    }
  });
};

export const getResumes = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch resumes');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteResume = async (resumeId) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${API_URL}/${resumeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete resume');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
