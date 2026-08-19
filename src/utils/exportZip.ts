import JSZip from 'jszip';
import { RepoFile } from '../types';

export async function exportRepoAsZip(files: RepoFile[], repoName = 'aws-zero-trust-infra'): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder(repoName);

  if (!rootFolder) return;

  files.forEach((file) => {
    // Handle subpaths if any
    const relativePath = file.path.startsWith('/') ? file.path.slice(1) : file.path;
    rootFolder.file(relativePath, file.content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${repoName}-main.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(file: RepoFile): void {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
