 
/************************************************
 * Imports & Constants
 ************************************************/
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const EXPIRY_TIME = 5 * 60 * 1000;   // 5 minutes
const BLOCK_TIME = 60 * 1000;        // 60 seconds

const app = express();
app.use(express.json());


/************************************************
 * In-memory Data Stores
 ************************************************/
const keyStore = new Map();       // keyId -> keyObject
const availableKeys = new Set(); // unblocked keys


/************************************************
 * MinHeap Utility (for O(log n) cleanup)
 ************************************************/
class MinHeap {
  constructor() {
    this.heap = [];
  }

  peek() {
    return this.heap.length ? this.heap[0] : null;
  }

  push(node) {
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._bubbleDown(0);
    return root;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[parent].time <= this.heap[index].time) break;
      [this.heap[parent], this.heap[index]] =
        [this.heap[index], this.heap[parent]];
      index = parent;
    }
  }

  _bubbleDown(index) {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      let left = 2 * index + 1;
      let right = 2 * index + 2;

      if (left < n && this.heap[left].time < this.heap[smallest].time)
        smallest = left;
      if (right < n && this.heap[right].time < this.heap[smallest].time)
        smallest = right;

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}


/************************************************
 * Heaps for time-based operations
 ************************************************/
const expiryHeap = new MinHeap();  // { time, keyId }
const blockHeap = new MinHeap();   // { time, keyId }


/************************************************
 * Helper / Business Logic Functions
 ************************************************/
function createKey() {
  const now = Date.now();
  const key = {
    id: uuidv4(),
    createdAt: now,
    lastKeepAlive: now,
    isBlocked: false,
    blockedAt: null
  };

  keyStore.set(key.id, key);
  availableKeys.add(key.id);
  expiryHeap.push({ time: now + EXPIRY_TIME, keyId: key.id });

  return key.id;
}

function assignKey() {
  if (availableKeys.size === 0) return null;

  const ids = Array.from(availableKeys);
  const keyId = ids[Math.floor(Math.random() * ids.length)];
  const key = keyStore.get(keyId);

  key.isBlocked = true;
  key.blockedAt = Date.now();
  availableKeys.delete(keyId);
  blockHeap.push({ time: key.blockedAt + BLOCK_TIME, keyId });

  return keyId;
}

function unblockKey(id) {
  const key = keyStore.get(id);
  if (!key) return false;

  key.isBlocked = false;
  key.blockedAt = null;
  availableKeys.add(id);
  return true;
}

function keepAlive(id) {
  const key = keyStore.get(id);
  if (!key) return false;

  key.lastKeepAlive = Date.now();
  expiryHeap.push({ time: key.lastKeepAlive + EXPIRY_TIME, keyId: id });
  return true;
}

function deleteKey(id) {
  if (!keyStore.has(id)) return false;
  keyStore.delete(id);
  availableKeys.delete(id);
  return true;
}


/************************************************
 * Background Cleanup Jobs
 ************************************************/

//Remove expired keys
setInterval(() => {
  const now = Date.now();
  while (expiryHeap.peek() && expiryHeap.peek().time <= now) {
    const { keyId } = expiryHeap.pop();
    const key = keyStore.get(keyId);
    if (!key) continue;

    if (key.lastKeepAlive + EXPIRY_TIME <= now) {
      keyStore.delete(keyId);
      availableKeys.delete(keyId);
    }
  }
}, 1000);



//Unblock keys
setInterval(() => {
  const now = Date.now();
  while (blockHeap.peek() && blockHeap.peek().time <= now) {
    const { keyId } = blockHeap.pop();
    const key = keyStore.get(keyId);
    if (key && key.isBlocked) {
      key.isBlocked = false;
      key.blockedAt = null;
      availableKeys.add(keyId);
    }
  }
}, 1000);


/************************************************
 * API Routes
 ************************************************/

// POST /keys → create new key
app.post("/keys", (req, res) => {
  const keyId = createKey();
  res.status(201).json({ keyId });
});

// GET /keys → get available key
app.get("/keys", (req, res) => {
  const keyId = assignKey();
  if (!keyId) return res.sendStatus(404);
  res.json({ keyId });
});

// GET /keys/:id → key info
app.get("/keys/:id", (req, res) => {
  const key = keyStore.get(req.params.id);
  if (!key) return res.sendStatus(404);

  res.json({
    isBlocked: key.isBlocked,
    blockedAt: key.blockedAt,
    createdAt: key.createdAt
  });
});

// PUT /keys/:id → unblock key
app.put("/keys/:id", (req, res) => {
  if (!unblockKey(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
});

// PUT /keepalive/:id → keep key alive
app.put("/keepalive/:id", (req, res) => {
  if (!keepAlive(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
});

// DELETE /keys/:id → delete key
app.delete("/keys/:id", (req, res) => {
  if (!deleteKey(req.params.id)) return res.sendStatus(404);
  res.sendStatus(200);
});


/************************************************
 * Server
 ************************************************/
app.listen(4000, () => {
  console.log("API Key Server running on port 4000");
});

