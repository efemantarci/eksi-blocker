// User management utility functions for the blocker extension

// Get the current list of banned users
async function getBannedUsers() {
  try {
    const result = await browser.storage.local.get('bannedUsers');
    return result.bannedUsers || [];
  } catch (error) {
    console.error('Error loading banned users:', error);
    return [];
  }
}

// Add a user to the banned list
async function addUserToBlockList(username) {
  if (!username || !username.trim()) {
    return false; // Don't add empty usernames
  }
  
  try {
    const bannedUsers = await getBannedUsers();
    
    // Only add if not already in list
    if (!bannedUsers.includes(username)) {
      bannedUsers.push(username);
      await browser.storage.local.set({ bannedUsers });
      console.log("Kullanıcı engellendi: " + username);
      return true;
    } else {
      console.log("Kullanıcı zaten engellendi: " + username);
      return false;
    }
  } catch (error) {
    console.error('Error adding user to block list:', error);
    return false;
  }
}

// Remove a user from the banned list
async function removeUserFromBlockList(username) {
  try {
    const bannedUsers = await getBannedUsers();
    const updatedList = bannedUsers.filter(user => user !== username);
    
    await browser.storage.local.set({ bannedUsers: updatedList });
    console.log("Kullanıcı engellenmesi kaldırıldı: " + username);
    return true;
  } catch (error) {
    console.error('Error removing user from block list:', error);
    return false;
  }
}

// Export the functions for use in other scripts
const userManager = {
  getBannedUsers,
  addUserToBlockList,
  removeUserFromBlockList
};

// Make sure userManager is available in the global scope
if (typeof window !== 'undefined') {
  window.userManager = userManager;
}
