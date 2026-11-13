import { Injectable } from '@angular/core';

// The only place in the app that talks to localStorage
@Injectable({ providedIn: 'root' })
export class StorageService {
  // Read a saved list. Returns [] if nothing is saved, the JSON is broken,
  // or storage is blocked. Items that fail the check are dropped.
  getList<T>(key: string, isValid: (item: unknown) => item is T): T[] {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return [];

      const data: unknown = JSON.parse(saved);
      return Array.isArray(data) ? data.filter(isValid) : [];
    } catch {
      return [];
    }
  }

  // Save a list. Never crashes the app (storage can be full or blocked).
  setList<T>(key: string, list: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      console.warn(`Could not save "${key}" to the browser storage.`);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // nothing to do
    }
  }
}
