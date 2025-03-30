// Variables to store file data
let selectedFile = null;
let parsedData = null;

// DOM Elements
const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');
const importButton = document.getElementById('import-button');
const cancelButton = document.getElementById('cancel-button');
const statusMessage = document.getElementById('status-message');
const resultSection = document.getElementById('result-section');
const importSummary = document.getElementById('import-summary');
const backButton = document.getElementById('back-button');

// Handle file selection
fileInput.addEventListener('change', (event) => {
  selectedFile = event.target.files[0];
  if (!selectedFile) {
    resetFileSelection();
    return;
  }
  
  // Display the selected file name
  fileNameDisplay.textContent = selectedFile.name;
  
  // Validate file type
  if (!selectedFile.name.toLowerCase().endsWith('.json')) {
    showStatus('Lütfen geçerli bir JSON dosyası seçin.', 'error');
    importButton.disabled = true;
    return;
  }
  
  // Read and parse the file
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      parsedData = JSON.parse(content);
      
      // Validate the JSON structure
      if (parsedData && parsedData.usernames && Array.isArray(parsedData.usernames)) {
        // Object format: { "usernames": ["user1", "user2", ...] }
        showStatus(`${parsedData.usernames.length} kullanıcı bulundu. İçe aktarmaya hazır.`, 'info');
        importButton.disabled = false;
      } else {
        showStatus('Geçersiz JSON formatı. Lütfen doğru formatta bir dosya seçin.', 'error');
        importButton.disabled = true;
      }
    } catch (error) {
      showStatus(`JSON ayrıştırma hatası: ${error.message}`, 'error');
      importButton.disabled = true;
    }
  };
  
  reader.onerror = () => {
    showStatus('Dosya okuma hatası oluştu.', 'error');
    importButton.disabled = true;
  };
  
  reader.readAsText(selectedFile);
});

// Import users from the parsed data
importButton.addEventListener('click', async () => {
  if (!parsedData) {
    showStatus('İçe aktarılacak veri bulunamadı.', 'error');
    return;
  }
  
  showStatus('Kullanıcılar içe aktarılıyor...', 'info');
  
  try {
    // Import users using the userManager
    const result = await userManager.importUsersToBlockList(parsedData.usernames);
    
    // Display results
    if (result.success) {
      // Show success message
      showStatus(result.message, 'success');
      
      // Show summary and result section
      importSummary.innerHTML = `
        <p><strong>İşlem tamamlandı!</strong></p>
        <p>Toplam kullanıcı: ${usersToImport.length}</p>
        <p>İçe aktarılan kullanıcı: ${result.importedCount}</p>
        <p>Zaten mevcut kullanıcı: ${usersToImport.length - result.importedCount}</p>
      `;
      
      resultSection.classList.remove('hidden');
      
      // Hide the import section elements
      document.querySelector('.import-section').style.display = 'none';
    } else {
      showStatus(result.message, 'error');
    }
  } catch (error) {
    showStatus(`İçe aktarma işlemi sırasında hata oluştu: ${error.message}`, 'error');
  }
});

// Cancel button returns to extension popup
cancelButton.addEventListener('click', () => {
  window.close();
});

// Back button after import is complete
backButton.addEventListener('click', () => {
  window.close();
});

// Helper function to show status messages
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
}

// Helper function to reset file selection
function resetFileSelection() {
  fileNameDisplay.textContent = '';
  importButton.disabled = true;
  selectedFile = null;
  parsedData = null;
}
