// User management utility functions for the blocker extension

async function getFromStoredList(listName) {
  try {
    const result = await browser.storage.local.get(listName);
    return result[listName] || [];
  } catch (error) {
    console.error(`Error loading ${listName}:`, error);
    return [];
  }
}

async function getBannedUsers() {
  return getFromStoredList('bannedUsers');
}

async function getFavBlockedEntries() {
  return getFromStoredList('favBlockedEntries');
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
      await browser.storage.local.set({ "bannedUsers" : bannedUsers });
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

// Add a user to the banned list
async function addEntryToFavBlockList(entry_id) {
  if(!entry_id || !entry_id.trim()){
    return false;
  }
  
  try {
    const favBlockedEntries = await getFavBlockedEntries();
    
    // Only add if not already in list
    if (!favBlockedEntries.includes(entry_id)) {
      favBlockedEntries.push(entry_id);
      await browser.storage.local.set({ "favBlockedEntries" : favBlockedEntries });
      console.log(`${entry_id} idli entry'yi favlayanlar engellendi`);
      return true;
    } else {
      console.log(`${entry_id} idli entry'yi favlayanlar zaten engellendi`);
      return false;
    }
  } catch (error) {
    console.error(`${entry_id} idli entry'yi favlayanlar engellenerken hata oluştu: `, error);
    return false;
  }
}

async function removeEntryFromFavBlockList(entry_id) {
  try {
    const favBlockedEntries = await getFavBlockedEntries();
    const updatedList = favBlockedEntries.filter(entry => entry !== entry_id);
    await browser.storage.local.set({ favBlockedEntries: updatedList });
    console.log(`${entry_id} idli entry'nin favlayanlar engellenmesi kaldırıldı`);
    return true;
  } catch (error) {
    console.error('Error removing entry from fav block list:', error);
    return false;
  }
}

// Import list of users from JSON file
async function importUsersToBlockList(usernames) {
  const result = await batchAddUsersToBlockList(usernames);
  return {
    success: result.success,
    message: result.message,
    importedCount: result.addedCount || 0
  };
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

// Add multiple users to the block list at once (without duplication)
async function batchAddUsersToBlockList(usernames) {
  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return { success: false, message: "No valid usernames to add", addedCount: 0 };
  }
  
  try {
    const bannedUsers = await getBannedUsers();
    
    // Filter out duplicates and empty usernames
    const newUsers = usernames.filter(username => 
      username && 
      username.trim() && 
      !bannedUsers.includes(username)
    );
    
    if (newUsers.length === 0) {
      console.log("Tüm kullanıcılar zaten engel listesinde");
      return { 
        success: true, 
        message: "Tüm kullanıcılar zaten engel listesinde", 
        addedCount: 0 
      };
    }
    
    // Add new users to the banned list
    const updatedList = [...bannedUsers, ...newUsers];
    await browser.storage.local.set({ bannedUsers: updatedList });
  
    return { 
      success: true, 
      message: `${newUsers.length} kullanıcı başarıyla engellendi`,
      addedCount: newUsers.length,
      addedUsers: newUsers
    };
  } catch (error) {
    console.error('Error adding users to block list:', error);
    return { 
      success: false, 
      message: "Kullanıcıları engellerken bir hata oluştu",
      addedCount: 0
    };
  }
}

async function batchRemoveUsersFromBlockList(usernames){
  if (!usernames || !Array.isArray(usernames) || usernames.length === 0) {
    return { success: false, message: "No usernames to remove", removedCount: 0 };
  }
  try {
    const bannedUsers = await getBannedUsers();
    const usersToRemove = usernames.filter(username => 
      username && 
      username.trim() && 
      bannedUsers.includes(username)
    );
    // Remove users from the banned list
    const updatedList = bannedUsers.filter(user => !usersToRemove.includes(user));
    await browser.storage.local.set({ bannedUsers: updatedList });
    return { 
      success: true, 
      message: `${usersToRemove.length} kullanıcı başarıyla engel listesinden kaldırıldı`,
      removedCount: usersToRemove.length,
      removedUsers: usersToRemove
    };
  } catch (error) {
    console.error('Error removing users from block list:', error);
    return { 
      success: false, 
      message: "Engellenen kullacıları kaldırırken bir hata oluştu",
      removedCount: 0
    };
  }
}

// Export the functions for use in other scripts
const userManager = {
  getBannedUsers,
  addUserToBlockList,
  getFavBlockedEntries,
  addEntryToFavBlockList,
  removeEntryFromFavBlockList,
  removeUserFromBlockList,
  importUsersToBlockList,
  exportBlockList,
  batchAddUsersToBlockList,
  batchRemoveUsersFromBlockList
};

// Make sure userManager is available in the global scope
if (typeof window !== 'undefined') {
  window.userManager = userManager;
}
