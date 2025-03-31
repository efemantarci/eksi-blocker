// Function to load and display banned users
function loadBannedUsers() {
  userManager.getBannedUsers()
    .then(bannedUsers => {
      displayBannedUsers(bannedUsers);
    });
}

// Function to display banned users in the popup
function displayBannedUsers(bannedUsers) {
  const list = document.getElementById('blocked-users-list');
  list.innerHTML = '';
  
  bannedUsers.forEach((user) => {
    const listItem = document.createElement('li');
    listItem.className = 'blocked-user';
    
    const userName = document.createElement('span');
    userName.textContent = user;
    listItem.appendChild(userName);
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.textContent = 'Kaldır';
    removeButton.addEventListener('click', () => removeUser(user));
    listItem.appendChild(removeButton);
    
    list.appendChild(listItem);
  });
}

// Function to add a user to the banned list
function addUser(user) {
  if (!user.trim()) {
    return; // Don't add empty usernames
  }
  
  userManager.addUserToBlockList(user)
    .then(added => {
      if (added) {
        loadBannedUsers();
        document.getElementById('user-input').value = '';
      }
    });
}

// Function to remove a user from the banned list
function removeUser(user) {
  userManager.removeUserFromBlockList(user)
    .then(removed => {
      if (removed) {
        loadBannedUsers();
      }
    });
}

// Function to handle JSON file import
function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  // Show loading status
  showStatus('Dosya yükleniyor...', 'info');

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      
      // Check if the JSON has a usernames array
      if (Array.isArray(jsonData)) {
        importUsers(jsonData);
      } else if (jsonData.usernames && Array.isArray(jsonData.usernames)) {
        importUsers(jsonData.usernames);
      } else {
        showStatus('JSON dosyası geçerli bir kullanıcı listesi içermiyor.', 'error');
      }
    } catch (error) {
      showStatus('JSON dosyası ayrıştırılırken hata oluştu: ' + error.message, 'error');
    }
  };
  reader.onerror = function() {
    showStatus('Dosya okunamadı.', 'error');
  };
  reader.readAsText(file);
  
  // Reset the file input so the same file can be selected again
  event.target.value = '';
}

// Function to import users from a JSON array
function importUsers(usernames) {
  userManager.importUsersToBlockList(usernames)
    .then(result => {
      if (result.success) {
        showStatus(result.message, 'success');
        loadBannedUsers(); // Refresh the list
      } else {
        showStatus(result.message, 'error');
      }
    })
    .catch(error => {
      showStatus('İçe aktarma sırasında hata oluştu: ' + error.message, 'error');
    });
}

// Function to display status messages - adding 'info' type
function showStatus(message, type) {
  const statusElement = document.getElementById('import-status');
  statusElement.textContent = message;
  statusElement.className = 'status-message ' + type;
  statusElement.style.display = 'block';
  
  // Auto-hide the message after 5 seconds if not loading info
  if (type !== 'info') {
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 5000);
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Load banned users when popup opens
  loadBannedUsers();
  
  // Add user when add button is clicked
  document.getElementById('add-button').addEventListener('click', () => {
    const userInput = document.getElementById('user-input').value.trim();
    addUser(userInput);
  });
  
  // Add user when Enter key is pressed in the input field
  document.getElementById('user-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      const userInput = document.getElementById('user-input').value.trim();
      addUser(userInput);
    }
  });
  
  // Import/Export buttons for the new tab
  document.getElementById('import-button').addEventListener('click', () => {
    browser.tabs.create({ url: "/import/import_page.html" });
    window.close(); // Close the popup
  });

  document.getElementById('export-button').addEventListener('click', () => {
    browser.tabs.create({ url: "/export/export_page.html" });
    window.close(); // Close the popup
  });
});
