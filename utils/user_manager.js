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

// Add multiple users to the banned list at once
async function importUsersToBlockList(usernames) {
  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return { success: false, message: "No valid usernames to import" };
  }
  
  try {
    const bannedUsers = await getBannedUsers();
    let importCount = 0;
    
    // Filter out duplicates and empty usernames
    const validUsernames = usernames.filter(username => 
      username && 
      username.trim() && 
      !bannedUsers.includes(username)
    );
    
    if (validUsernames.length === 0) {
      return { success: false, message: "Tüm kullanıcılar zaten engel listesinde" };
    }
    
    // Add new users to the banned list
    const updatedList = [...bannedUsers, ...validUsernames];
    await browser.storage.local.set({ bannedUsers: updatedList });
    
    console.log(`${validUsernames.length} kullanıcı engellendi`);
    return { 
      success: true, 
      message: `${validUsernames.length} kullanıcı başarıyla engellendi`,
      importedCount: validUsernames.length
    };
  } catch (error) {
    console.error('Error importing users to block list:', error);
    return { success: false, message: "Kullanıcıları içe aktarırken bir hata oluştu" };
  }
}

// Export the list of banned users as a JSON object
async function exportBlockList(title = "Eksi Blocker Export") {
  try {
    const bannedUsers = await getBannedUsers();
    
    // Create JSON structure
    const exportData = {
      title: title,
      usernames: bannedUsers,
      exportDate: new Date().toISOString(),
      count: bannedUsers.length
    };
    
    return {
      success: true,
      data: exportData
    };
  } catch (error) {
    console.error('Error exporting block list:', error);
    return {
      success: false,
      message: "Engellenen kullanıcı listesi dışa aktarılırken bir hata oluştu"
    };
  }
}

// Export the functions for use in other scripts
const userManager = {
  getBannedUsers,
  addUserToBlockList,
  removeUserFromBlockList,
  importUsersToBlockList,
  exportBlockList
};

// Make sure userManager is available in the global scope
if (typeof window !== 'undefined') {
  window.userManager = userManager;
}
