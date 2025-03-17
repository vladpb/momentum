/**
 * IndexedDB Manager Utility
 * 
 * Provides a simple interface for storing and retrieving data from IndexedDB.
 * This is a more robust alternative to localStorage for larger datasets.
 */

// Database configuration
const DB_NAME = 'momentumApp';
const DB_VERSION = 1;
const STORES = {
  TASKS: 'tasks',
  PROJECTS: 'projects', 
  SETTINGS: 'settings'
};

/**
 * Opens a connection to the IndexedDB database
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.TASKS)) {
        db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Saves data to a specific store in IndexedDB
 */
export const saveToIndexedDB = async <T>(storeName: string, data: T[]): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data
    await clearStore(storeName);
    
    // Add new data
    data.forEach(item => {
      store.add(item);
    });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      
      transaction.onerror = (event) => {
        db.close();
        reject((event.target as IDBTransaction).error);
      };
    });
  } catch (error) {
    console.error(`Error saving to IndexedDB (${storeName}):`, error);
    throw error;
  }
};

/**
 * Retrieves all data from a specific store in IndexedDB
 */
export const getFromIndexedDB = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result as T[]);
      };
      
      request.onerror = (event) => {
        db.close();
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error(`Error getting data from IndexedDB (${storeName}):`, error);
    throw error;
  }
};

/**
 * Clears all data from a specific store in IndexedDB
 */
export const clearStore = async (storeName: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve();
      };
      
      request.onerror = (event) => {
        db.close();
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error(`Error clearing store in IndexedDB (${storeName}):`, error);
    throw error;
  }
};

/**
 * Interface for app settings
 */
export interface AppSettings {
  id: string;
  [key: string]: unknown;
}

/**
 * Saves settings to IndexedDB
 */
export const saveSettings = async (settings: Record<string, unknown>): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    
    // Clear existing settings
    store.clear();
    
    // Add with a fixed ID to ensure we only have one settings object
    const settingsWithId = { id: 'app-settings', ...settings };
    store.add(settingsWithId);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      
      transaction.onerror = (event) => {
        db.close();
        reject((event.target as IDBTransaction).error);
      };
    });
  } catch (error) {
    console.error('Error saving settings to IndexedDB:', error);
    throw error;
  }
};

/**
 * Retrieves settings from IndexedDB
 */
export const getSettings = async (): Promise<AppSettings | null> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get('app-settings');
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result as AppSettings || null);
      };
      
      request.onerror = (event) => {
        db.close();
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error('Error getting settings from IndexedDB:', error);
    throw error;
  }
};

// Export store names for easy access
export const STORE_NAMES = STORES; 