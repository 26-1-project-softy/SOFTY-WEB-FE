const clickDownloadLink = (url: string, fileName: string, openInNewTab = false) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  if (openInNewTab) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const reportDownloadService = {
  downloadPdfFromPresignedUrl: async (downloadUrl: string, fileName: string) => {
    try {
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();

      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error('Downloaded blob is empty');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      clickDownloadLink(blobUrl, fileName);
      window.URL.revokeObjectURL(blobUrl);
      return;
    } catch {
      clickDownloadLink(downloadUrl, fileName, true);
    }
  },
};
