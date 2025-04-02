let blockedUsers = [];
let favBlockedEntries = [];

const BLOCK_MESSAGE = "Kullanıcıyı Engelle";
const UNBLOCK_MESSAGE = "Engeli Kaldır";
const FAVLAR_BLOCK_MESSAGE = "Favlayanları Engelle";
const FAVLAR_UNBLOCK_MESSAGE = "Favlayanları Engellemeyi Kaldır";
const BLOCKER_ID = "eksi-blocker-block-user";
const BLOCKER_FAVLAR_ID = "eksi-blocker-block-favlayanlar";
const loggedIn = document.querySelector(".loggedoff") == null;

function blockButtonClick(event, nickname, blockUserLink) {
  event.stopPropagation();

  if (blockedUsers.includes(nickname)) {
    // Remove from block list
    userManager.removeUserFromBlockList(nickname)
      .then(removed => {
        if (removed) {
          blockUserLink.textContent = BLOCK_MESSAGE;
        }
      });
  } else {
    // Add to block list
    userManager.addUserToBlockList(nickname)
      .then(added => {
        if (added) {
          blockUserLink.textContent = UNBLOCK_MESSAGE;
        }
      });
  }

  // Close the dropdown menu
  const parent = blockUserLink.closest('.dropdown-menu');
  if (parent) {
    parent.classList.remove('open');
  }
}

function parseFavlayanlar(html, accumulatedFavlayanlar = []) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function getFavlayanlarFromText(text) {
    return text.replace("/biri/", "");
  }
  // Yes there is a typo in the class in eksisozluk. It should have been 'seperated' :D
  const currentFavlayanlar = Array.from(doc.querySelectorAll('li:not(.separated) > a'))
    .map(el => getFavlayanlarFromText(el.getAttribute('href')));
  const allFavlayanlar = [...accumulatedFavlayanlar, ...currentFavlayanlar];
  const caylakLink = doc.querySelector('li.separated > a');
  if (caylakLink) {
    return fetch(`https://eksisozluk.com${caylakLink.getAttribute("href")}`, {
      credentials: 'include', // We need cookies for validation
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error with status: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        return parseFavlayanlar(html, allFavlayanlar);
      })
      .catch(error => {
        console.error('Error fetching favlayanlar:', error);
        return allFavlayanlar;
      });
  } else {
    return Promise.resolve(allFavlayanlar);
  }
}

function favlarButtonClick(event, entry_id, blockUserLink) {
  event.stopPropagation();

  // Show processing status
  const isBlocked = favBlockedEntries.includes(entry_id);
  const originalText = blockUserLink.textContent;
  blockUserLink.textContent = "İşleniyor...";

  fetch(`https://eksisozluk.com/entry/favorileyenler?entryId=${entry_id}`, {
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      return parseFavlayanlar(html);
    })
    .then(favlayanlarArray => {
      if(isBlocked) {
        return userManager.batchRemoveUsersFromBlockList(favlayanlarArray);
      }
      else{
        return userManager.batchAddUsersToBlockList(favlayanlarArray);
      }
    })
    .then(result => {
      // Get the updated list of blocked users
      return browser.storage.local.get('bannedUsers').then(storageResult => {
        return {
          batchResult: result,
          storageResult: storageResult
        };
      });
    })
    .then(({ batchResult, storageResult }) => {
      blockedUsers = storageResult.bannedUsers || [];
      if(!isBlocked){
        // Show message
        if (batchResult.addedCount > 0) {
          blockUserLink.textContent = FAVLAR_UNBLOCK_MESSAGE;
          console.log(`Başarıyla ${batchResult.addedCount} kullanıcı engellendi`);
        } else {  
          blockUserLink.textContent = "Tümü Zaten Engelli";
          setTimeout(() => {
            blockUserLink.textContent = originalText;
          }, 2000);
        }
      }
      else{
        if (batchResult.removedCount > 0) {
          blockUserLink.textContent = FAVLAR_BLOCK_MESSAGE;
          console.log(`Başarıyla ${batchResult.removedCount} kullanıcının engeli kaldırıldı`);
        } else {
          blockUserLink.textContent = "Hiçbiri Engelli Değil";
          console.log(batchResult);
          console.log(storageResult);
          setTimeout(() => {
            blockUserLink.textContent = originalText;
          }, 2000);
        }
      }
      (async () => {
        if (!isBlocked) await addEntryToFavBlockList(entry_id);
        else await removeEntryFromFavBlockList(entry_id);
        const newFavBlockedEntries = await userManager.getFavBlockedEntries();
        favBlockedEntries = newFavBlockedEntries || [];
        // Re-apply blocking to update UI
        blockPosts(blockedUsers);
      })();
    })
    .catch(error => {
      console.error('Error fetching or blocking favlayanlar:', error);
      blockUserLink.textContent = "Hata!";
      setTimeout(() => {
        blockUserLink.textContent = originalText;
      }, 2000);
    });
}

function addBlockDropdown(postContainer) {
  // Add block button
  const feedbackBlock = postContainer.querySelector(".feedback");
  let blockButton = null;
  if (!feedbackBlock.querySelector(".block")) {
    blockButton = document.createElement("div");
    blockButton.style.display = "inline-block";
    blockButton.classList.add("block", "dropdown");
    blockButton.onclick = function (e) {
      e.stopPropagation();
      const actionList = blockButton.querySelector(".dropdown-menu");
      if (actionList) {
        actionList.classList.toggle("open");
      }
    }

    const actionList = document.createElement("ul");
    actionList.classList.add("dropdown-menu", "right", "toggles-menu");

    blockButton.appendChild(actionList);
    feedbackBlock.appendChild(blockButton);
    blockButton.appendChild(actionList);
    const link = document.createElement("a");

    // Create and configure SVG element - using correct namespace
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    // Updated viewBox to match the path data's coordinate system
    svg.classList.add("eksi-blocker-svg");
    svg.setAttribute("viewBox", "0 0 206.559 206.559");
    svg.style.display = "block"; // Ensure the SVG is displayed

    // Create path element with the SVG data
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M0,103.279c0,56.948,46.331,103.279,103.279,103.279s103.279-46.331,103.279-103.279S160.228,0,103.279,0S0,46.331,0,103.279z M170,103.279c0,36.79-29.931,66.721-66.721,66.721c-11.765,0-22.821-3.072-32.429-8.439L161.56,70.85C166.927,80.458,170,91.514,170,103.279z M103.279,36.559c11.765,0,22.821,3.072,32.429,8.439l-90.709,90.711c-5.368-9.608-8.44-20.664-8.44-32.43C36.559,66.489,66.489,36.559,103.279,36.559z");

    // Append path to SVG
    svg.appendChild(path);

    link.appendChild(svg);
    blockButton.appendChild(link);
  }
  else {
    blockButton = feedbackBlock.querySelector(".block");
  }
  return blockButton;
}

// This would replace both addBlockButton and addFavlayanlarButton functions
function createBlockButton(postContainer, nickname, buttonType) {
  
  const feedbackBlock = postContainer.querySelector(".feedback");
  
  // Get or create the dropdown container
  let blockButton = feedbackBlock.querySelector(".block");
  let actionList = null;
  
  if (!blockButton) {
    addBlockDropdown(postContainer);
    blockButton = feedbackBlock.querySelector(".block");
  }
  actionList = blockButton.querySelector("ul");
  
  // Create the appropriate button based on type
  if (buttonType === 'user' && !feedbackBlock.querySelector("#" + BLOCKER_ID)) {
    const blockUser = document.createElement("li");
    const blockUserLink = document.createElement("a");
    blockUser.id = BLOCKER_ID;
    blockUser.classList.add("share-links");
    
    // Set text based on current blocked status
    blockUserLink.textContent = blockedUsers.includes(nickname) ? UNBLOCK_MESSAGE : BLOCK_MESSAGE;
    
    blockUser.appendChild(blockUserLink);
    actionList.appendChild(blockUser);
    blockUser.onclick = (e) => blockButtonClick(e, nickname, blockUserLink);
    
    return blockUserLink;
  } 
  else if (buttonType === 'favlayanlar' && !feedbackBlock.querySelector("#" + BLOCKER_FAVLAR_ID)) {
    const blockFavlayan = document.createElement("li");
    const blockFavlayanLink = document.createElement("a");
    blockFavlayan.id = BLOCKER_FAVLAR_ID;
    blockFavlayan.classList.add("share-links");
    
    const entry_id = postContainer.getAttribute("data-id");
    blockFavlayanLink.textContent = favBlockedEntries.includes(entry_id) ? 
      FAVLAR_UNBLOCK_MESSAGE : FAVLAR_BLOCK_MESSAGE;
    
    blockFavlayan.appendChild(blockFavlayanLink);
    actionList.appendChild(blockFavlayan);
    blockFavlayan.onclick = (e) => favlarButtonClick(e, entry_id, blockFavlayanLink);
    
    return blockFavlayanLink;
  }
  
  // Return existing button if already present
  return buttonType === 'user' ? 
    feedbackBlock.querySelector("#" + BLOCKER_ID + " a") : 
    feedbackBlock.querySelector("#" + BLOCKER_FAVLAR_ID + " a");
}

// Function to block posts from banned users
function blockPosts(bannedUsers) {
  // Update the global variable
  blockedUsers = bannedUsers || [];

  // Select all <li> elements with the id "entry-item"
  const listItems = document.querySelectorAll('li#entry-item');

  listItems.forEach(item => {
    const nickname = item.getAttribute("data-author");

    createBlockButton(item, nickname, "user");
    if (loggedIn) createBlockButton(item, nickname, "favlayanlar");

    if (blockedUsers.includes(nickname)) {
      // Add blur class
      item.classList.add('eksi-blocker-blur');
      // Prevent duplicates
      if (!item.querySelector('.eksi-blocker-btn-container')) {
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
            showButton.classList.remove("eksi-blocker-transparent-btn");
            // Force immediate style update
            showButton.style.backgroundColor = "rgb(35, 30, 30)";
            setTimeout(() => {
              showButton.style.backgroundColor = "";
            }, 50);
          } else {
            // Show content
            parent.classList.add('eksi-blocker-shown');
            showButton.textContent = 'Gizle';
            showButton.classList.add("eksi-blocker-transparent-btn");
            // Force immediate style update
            showButton.style.backgroundColor = "rgba(10, 10, 10, 0.2)";
            setTimeout(() => {
              showButton.style.backgroundColor = "";
            }, 50);
          }
        });

        // Create button container for central button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'eksi-blocker-btn-container';
        buttonContainer.appendChild(showButton);

        // Create info text element at the bottom
        const infoText = document.createElement("div");
        infoText.className = 'eksi-blocker-info-text';
        infoText.textContent = "Engellenen Kullanıcı: " + nickname;

        // Create info container for bottom placement
        const infoContainer = document.createElement('div');
        infoContainer.className = 'eksi-blocker-info-container';
        infoContainer.appendChild(infoText);

        // Add both containers to item
        item.appendChild(buttonContainer);
        item.appendChild(infoContainer);
      }
    } else {
      // If user is not in banned list, make sure we remove any previously applied blur
      item.classList.remove('eksi-blocker-blur', 'eksi-blocker-shown');

      // Remove button and info if they exist
      const btnContainer = item.querySelector('.eksi-blocker-btn-container');
      const infoContainer = item.querySelector('.eksi-blocker-info-container');

      if (btnContainer) {
        btnContainer.remove();
      }

      if (infoContainer) {
        infoContainer.remove();
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

    .eksi-blocker-blur > *:not(.eksi-blocker-btn-container):not(.eksi-blocker-info-container) {
      filter: blur(8px);
    }

    .eksi-blocker-shown.eksi-blocker-blur > *:not(.eksi-blocker-btn-container):not(.eksi-blocker-info-container) {
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
    
    .eksi-blocker-info-container {
      position: absolute;
      bottom: 10px;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      pointer-events: none;
      z-index: 1002;
    }
    
    .eksi-blocker-info-text {
      color: white;
      background-color: rgba(35, 30, 30, 0.9);
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 12px;
      pointer-events: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      max-width: 80%;
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
    
    .eksi-blocker-transparent-btn {
      background-color: rgba(10, 10, 10, 0.2) !important;
    }
    
    .eksi-blocker-show-btn:hover,
    .eksi-blocker-show-btn:active,
    .eksi-blocker-show-btn:focus  {
      background-color: rgb(10, 10, 10);
    }

    .eksi-blocker-transparent-btn:hover,
    .eksi-blocker-transparent-btn:active,
    .eksi-blocker-transparent-btn:focus {
      background-color: rgba(10, 10, 10, 0.1) !important;
    }

    .eksi-blocker-show-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
    }
    
    li#entry-item {
      overflow: visible !important;
    }

    .block {
      display: inline-block;
      vertical-align: top;
    }

    .eksi-blocker-svg {
      fill: #333333 !important;
      background-color: #F5F5F5;
      background-position: right;
      width: 28px;
      height: 28px;
      border-radius: 100px;
      padding: 6px;
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);
}

// Inject CSS when script runs
injectCSS();

// Get banned users from storage and apply blocking
browser.storage.local.get(["bannedUsers", "favBlockedEntries"])
  .then((result) => {
    blockedUsers = result.bannedUsers || [];
    favBlockedEntries = result.favBlockedEntries || [];
    blockPosts(result.bannedUsers || []);
  })
  .catch((error) => {
    console.error('Error loading banned users:', error);
  });

// Listen for changes to the banned users list
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.bannedUsers) {
      blockedUsers = changes.bannedUsers.newValue || [];
      blockPosts(blockedUsers);
    }
    if (changes.favBlockedEntries) {
      favBlockedEntries = changes.favBlockedEntries.newValue || [];
      blockPosts(blockedUsers);
    }
  }
});
