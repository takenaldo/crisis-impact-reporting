const DB_NAME = 'undp-tile-cache';
const STORE_NAME = 'tiles';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function cacheTile(url, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, url);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function getCachedTile(url) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(url);
    request.onsuccess = (event) => resolve(event.target.result ?? null);
    request.onerror = (event) => reject(event.target.error);
    transaction.oncomplete = () => db.close();
  });
}

export async function isTileCached(url) {
  const result = await getCachedTile(url);
  return result !== null;
}
