// Function to block posts from banned users
function blockPosts(bannedUsers) {
  // Select all <li> elements with the id "entry-item"
  const listItems = document.querySelectorAll('li#entry-item');

  // Loop through each item and filter blocked posts
  listItems.forEach(item => {
    const nickname = item.getAttribute("data-author");
    if (bannedUsers.includes(nickname)) {
      // Add blur class
      item.classList.add('eksi-blocker-blur');
      
      // Check if button already exists to prevent duplicates
      if (!item.querySelector('.eksi-blocker-show-btn')) {
        // Create show button
        const showButton = document.createElement('button');
        showButton.textContent = 'Göster';
        showButton.className = 'eksi-blocker-show-btn';
        
        showButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const parent = e.target.closest('li#entry-item');
          
          if (parent.classList.contains('eksi-blocker-shown')) {
            // Hide content again
            parent.classList.remove('eksi-blocker-shown');
            showButton.textContent = 'Göster';
          } else {
            // Show content
            parent.classList.add('eksi-blocker-shown');
            showButton.textContent = 'Gizle';
          }
        });
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'eksi-blocker-btn-container';
        buttonContainer.appendChild(showButton);
        
        // Add button to item
        item.appendChild(buttonContainer);
      }
    } else {
      // If user is not in banned list, make sure we remove any previously applied blur
      item.classList.remove('eksi-blocker-blur', 'eksi-blocker-shown');
      
      // Remove button if it exists
      const btnContainer = item.querySelector('.eksi-blocker-btn-container');
      if (btnContainer) {
        btnContainer.remove();
      }
    }
  });
}

// Add CSS for blur effect and button styling
function injectCSS() {
  const style = document.createElement('style');
  style.textContent = `
    .eksi-blocker-blur {
      position: relative;
      pointer-events: auto;
    }

    .eksi-blocker-blur > *:not(.eksi-blocker-btn-container) {
      filter: blur(8px);
    }

    .eksi-blocker-shown.eksi-blocker-blur > *:not(.eksi-blocker-btn-container) {
      filter: none;
    }
    
    .eksi-blocker-shown {
      filter: none;
    }
    
    .eksi-blocker-btn-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 1001;
    }
    
    .eksi-blocker-show-btn {
      background-color: rgb(35, 30, 30);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s ease;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    
    .eksi-blocker-show-btn:hover,
    .eksi-blocker-show-btn:active,
    .eksi-blocker-show-btn:focus  {
      background-color: rgb(10, 10, 10);
    }

    .eksi-blocker-show-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
    }

  `;
  document.head.appendChild(style);
}

// Inject CSS when script runs
injectCSS();

// Get banned users from storage and apply blocking
browser.storage.local.get('bannedUsers')
  .then((result) => {
    const bannedUsers = result.bannedUsers || [];
    blockPosts(bannedUsers);
  })
  .catch((error) => {
    console.error('Error loading banned users:', error);
  });

// Listen for changes to the banned users list
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.bannedUsers) {
    blockPosts(changes.bannedUsers.newValue);
  }
});
