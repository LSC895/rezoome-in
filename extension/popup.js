// Popup script for Rezoome Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

async function initializePopup() {
  const authSection = document.getElementById('authSection');
  const userSection = document.getElementById('userSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const uploadResumeBtn = document.getElementById('uploadResumeBtn');
  const userEmail = document.getElementById('userEmail');
  
  // Check if user is already authenticated
  const result = await chrome.storage.sync.get(['authToken', 'userEmail', 'sessionId', 'masterResume']);
  
  if (result.authToken && result.sessionId) {
    showUserSection(result.userEmail || 'Connected User');
  } else {
    showAuthSection();
  }
  
  // Event listeners
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);
  uploadResumeBtn.addEventListener('click', handleUploadResume);
  
  function showAuthSection() {
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
  
  function showUserSection(email) {
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    userEmail.textContent = email;
  }
}

async function handleLogin() {
  showStatus('Connecting to Rezoome...', 'info');
  
  try {
    // Open Rezoome website for authentication
    const authUrl = 'https://rezoome.lovable.app/extension-auth';
    
    // Create new tab for authentication
    const tab = await chrome.tabs.create({ url: authUrl });
    
    // Listen for tab updates to catch the authentication result
    const listener = (tabId, changeInfo, updatedTab) => {
      if (tabId === tab.id && changeInfo.url) {
        // Check if URL contains auth success parameters
        const url = new URL(changeInfo.url);
        const token = url.searchParams.get('token');
        const sessionId = url.searchParams.get('sessionId');
        const email = url.searchParams.get('email');
        
        if (token && sessionId) {
          // Store authentication data
          chrome.storage.sync.set({
            authToken: token,
            sessionId: sessionId,
            userEmail: email
          });
          
          // Close auth tab
          chrome.tabs.remove(tabId);
          chrome.tabs.onUpdated.removeListener(listener);
          
          // Update popup UI
          showStatus('Successfully connected to Rezoome!', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    };
    
    chrome.tabs.onUpdated.addListener(listener);
    
    // Close popup
    window.close();
    
  } catch (error) {
    console.error('Login failed:', error);
    showStatus('Connection failed. Please try again.', 'error');
  }
}

async function handleLogout() {
  // Clear stored authentication data
  await chrome.storage.sync.clear();
  await chrome.storage.local.clear();
  
  showStatus('Disconnected from Rezoome', 'success');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

async function handleUploadResume() {
  try {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      showStatus('Uploading resume...', 'info');
      
      try {
        // Read file content
        const fileContent = await readFileContent(file);
        
        // Store master resume content
        await chrome.storage.sync.set({
          masterResume: fileContent,
          masterResumeFileName: file.name
        });
        
        showStatus('Master resume uploaded successfully!', 'success');
        
      } catch (error) {
        console.error('Upload failed:', error);
        showStatus('Upload failed. Please try again.', 'error');
      }
    };
    
    input.click();
    
  } catch (error) {
    console.error('Upload error:', error);
    showStatus('Upload failed. Please try again.', 'error');
  }
}

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function showStatus(message, type) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.className = `status ${type}`;
  statusElement.textContent = message;
  statusElement.classList.remove('hidden');
  
  // Hide after 3 seconds for success/error messages
  if (type !== 'info') {
    setTimeout(() => {
      statusElement.classList.add('hidden');
    }, 3000);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showGeneratedResume') {
    // Show generated resume in popup
    showGeneratedResume(request.resume);
  }
});

function showGeneratedResume(resume) {
  const content = document.querySelector('.content');
  const previewDiv = document.createElement('div');
  previewDiv.className = 'resume-preview';
  previewDiv.innerHTML = `
    <strong>Generated Resume:</strong>
    <pre style="white-space: pre-wrap; margin-top: 8px;">${resume.content.substring(0, 200)}...</pre>
    <button id="downloadBtn" class="button button-primary" style="margin-top: 8px;">Download Full Resume</button>
  `;
  
  content.appendChild(previewDiv);
  
  document.getElementById('downloadBtn').addEventListener('click', () => {
    downloadResume(resume.content, resume.id);
  });
}

function downloadResume(content, id) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rezoome-resume-${id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}