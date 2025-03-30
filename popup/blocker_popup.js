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
});
