const DB_NAME = "social-demo-db";
const DB_VERSION = 1;
const POSTS_STORE = "posts";

let db = null;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(POSTS_STORE)) {
        const store = database.createObjectStore(POSTS_STORE, {
          keyPath: "id"
        });

        store.createIndex("createdAt", "createdAt");
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

function getStore(mode = "readonly") {
  return db.transaction(POSTS_STORE, mode).objectStore(POSTS_STORE);
}

export function getMyPosts() {
  return new Promise((resolve, reject) => {
    const request = getStore("readonly").getAll();

    request.onsuccess = () => {
      const posts = request.result || [];
      posts.sort((a, b) => b.createdAt - a.createdAt);
      resolve(posts);
    };

    request.onerror = () => reject(request.error);
  });
}

export function addMyPost(post) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").add(post);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function deleteMyPost(postId) {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").delete(postId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function clearMyPosts() {
  return new Promise((resolve, reject) => {
    const request = getStore("readwrite").clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
