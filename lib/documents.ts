import { apiFetch } from './api';
import type { Document } from './types';

export async function getDocsByProjectId(projectId: string): Promise<Document[]> {
  const res = await apiFetch(`/api/projects/${projectId}/documents`);
  if (!res.ok) {
    throw new Error(`Failed to fetch documents: ${res.status}`);
  }
  const data = await res.json();
  return (data.documents || data || []) as Document[];
}

export async function createDoc(projectId: string, doc: { title: string; doc_type: Document['doc_type'] }): Promise<Document> {
  const res = await apiFetch(`/api/projects/${projectId}/documents`, {
    method: 'POST',
    body: JSON.stringify(doc),
  });
  if (!res.ok) {
    throw new Error(`Failed to create document: ${res.status}`);
  }
  return res.json();
}

export async function updateDoc(docId: string, updates: Partial<{ title: string; doc_type: Document['doc_type'] }>): Promise<Document> {
  const res = await apiFetch(`/api/documents/${docId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Failed to update document: ${res.status}`);
  }
  return res.json();
}

export async function deleteDoc(docId: string): Promise<void> {
  const res = await apiFetch(`/api/documents/${docId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete document: ${res.status}`);
  }
}
