document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('preview-container');
  const actions = document.getElementById('actions');
  const originalPreview = document.getElementById('original-preview');
  const webpPreview = document.getElementById('webp-preview');
  const originalSize = document.getElementById('original-size');
  const webpSize = document.getElementById('webp-size');
  const downloadBtn = document.getElementById('download-btn');
  const resetBtn = document.getElementById('reset-btn');

  let currentWebPBlob = null;
  let originalFileName = '';

  // Drag and Drop events
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
      alert('Please select a JPG image.');
      return;
    }

    originalFileName = file.name.replace(/\.[^/.]+$/, "");
    originalSize.textContent = formatBytes(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Show original preview
        originalPreview.src = e.target.result;
        
        // Convert to WebP
        convertToWebP(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function convertToWebP(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      currentWebPBlob = blob;
      const url = URL.createObjectURL(blob);
      webpPreview.src = url;
      webpSize.textContent = formatBytes(blob.size);
      
      // Show UI
      dropZone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      actions.classList.remove('hidden');
    }, 'image/webp', 0.8); // 0.8 quality
  }

  downloadBtn.addEventListener('click', () => {
    if (currentWebPBlob) {
      const url = URL.createObjectURL(currentWebPBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${originalFileName}.webp`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });

  resetBtn.addEventListener('click', () => {
    currentWebPBlob = null;
    originalFileName = '';
    fileInput.value = '';
    dropZone.classList.remove('hidden');
    previewContainer.classList.add('hidden');
    actions.classList.add('hidden');
    originalPreview.src = '';
    webpPreview.src = '';
  });

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
});
