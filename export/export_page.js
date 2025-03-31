// DOM Elements
const exportTitleInput = document.getElementById('export-title');
const userCountElement = document.getElementById('user-count');
const exportButton = document.getElementById('export-button');
const cancelButton = document.getElementById('cancel-button');
const statusMessage = document.getElementById('status-message');
const resultSection = document.getElementById('result-section');
const exportSummary = document.getElementById('export-summary');
const jsonPreview = document.getElementById('json-preview');
const backButton = document.getElementById('back-button');

// Load user count on page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const bannedUsers = await userManager.getBannedUsers();
    userCountElement.textContent = bannedUsers.length;
  } catch (error) {
    userCountElement.textContent = "Hata oluştu";
    showStatus('Kullanıcı listesi yüklenirken hata oluştu.', 'error');
  }
});

// Export button click handler
exportButton.addEventListener('click', async () => {
  const title = exportTitleInput.value.trim() || "Eksi Blocker Export";
  
  try {
    showStatus('Kullanıcı listesi dışa aktarılıyor...', 'info');
    
    const result = await userManager.exportBlockList(title);
    
    if (result.success) {
      const exportData = result.data;
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eksi_blocker_export_${formatDate(new Date())}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message and preview
      showStatus('Kullanıcı listesi başarıyla dışa aktarıldı.', 'success');
      exportSummary.innerHTML = `
        <p><strong>İşlem tamamlandı!</strong></p>
        <p>Dosya adı: ${a.download}</p>
        <p>Toplam engellenen kullanıcı: ${exportData.count}</p>
        <p>Liste adı: ${exportData.title}</p>
      `;
      
      // Show JSON preview
      jsonPreview.textContent = jsonString;
      
      // Show result section, hide export section
      resultSection.classList.remove('hidden');
      document.querySelector('.export-section').style.display = 'none';
    } else {
      showStatus(result.message || 'Dışa aktarma sırasında bir hata oluştu.', 'error');
    }
  } catch (error) {
    showStatus(`Dışa aktarma işlemi sırasında hata oluştu: ${error.message}`, 'error');
  }
});

// Cancel button returns to extension popup
cancelButton.addEventListener('click', () => {
  window.close();
});

// Back button after export is complete
backButton.addEventListener('click', () => {
  window.close();
});

// Helper function to format date for filename
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Helper function to show status messages
function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
}
