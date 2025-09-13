// Content script for extracting job descriptions from job portals

// Job description selectors for different platforms
const JOB_SELECTORS = {
  'linkedin.com': [
    '.jobs-description-content__text',
    '.jobs-box__html-content',
    '.description__text',
    '[data-job-description]'
  ],
  'glassdoor.com': [
    '.jobDescriptionContent',
    '.desc',
    '.jobDescription',
    '#JobDescContainer'
  ],
  'indeed.com': [
    '.jobsearch-jobDescriptionText',
    '.jobsearch-JobComponent-originalJobDescription',
    '#jobDescriptionText'
  ],
  'naukri.com': [
    '.JDtext',
    '.job-description',
    '.other-details'
  ],
  'monster.com': [
    '.job-description',
    '.description'
  ],
  'ziprecruiter.com': [
    '.job_description',
    '.jobDescriptionSection'
  ]
};

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobDescription") {
    const jobDescription = extractJobDescription(request.selectedText);
    
    if (jobDescription) {
      // Show notification
      showNotification("Generating resume...", "success");
      
      // Send to background script for processing
      chrome.runtime.sendMessage({
        action: "generateResumeFromExtension",
        jobDescription: jobDescription
      }, (response) => {
        if (response.success) {
          showNotification("Resume generated successfully!", "success");
          // Optionally open download dialog
          downloadResume(response.resume.content, response.resume.id);
        } else {
          showNotification(`Error: ${response.error}`, "error");
        }
      });
    } else {
      showNotification("Could not extract job description. Please select the job description text and try again.", "error");
    }
    
    sendResponse({success: true});
  }
});

function extractJobDescription(selectedText) {
  // If user selected text, use that
  if (selectedText && selectedText.trim().length > 50) {
    return selectedText.trim();
  }
  
  // Otherwise, try to automatically extract from the page
  const hostname = window.location.hostname;
  const domain = Object.keys(JOB_SELECTORS).find(d => hostname.includes(d));
  
  if (!domain) {
    return null;
  }
  
  const selectors = JOB_SELECTORS[domain];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.innerText || element.textContent;
      if (text && text.trim().length > 50) {
        return text.trim();
      }
    }
  }
  
  return null;
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

function downloadResume(content, id) {
  // Create download link
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rezoome-resume-${id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Add visual indicator when extension is active on job sites
function addExtensionIndicator() {
  const hostname = window.location.hostname;
  const isJobSite = Object.keys(JOB_SELECTORS).some(d => hostname.includes(d));
  
  if (isJobSite) {
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #8b5cf6, #3b82f6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      color: white;
      font-weight: bold;
      font-size: 20px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    `;
    
    indicator.innerHTML = 'R';
    indicator.title = 'Rezoome Extension - Select job description and right-click to generate resume';
    
    indicator.addEventListener('mouseenter', () => {
      indicator.style.opacity = '1';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.opacity = '0.8';
    });
    
    document.body.appendChild(indicator);
  }
}

// Initialize extension indicator
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addExtensionIndicator);
} else {
  addExtensionIndicator();
}
