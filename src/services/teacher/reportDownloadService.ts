import axios from 'axios';

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
      const response = await axios.get<Blob>(downloadUrl, {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
      });
      const blob = response.data;

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
