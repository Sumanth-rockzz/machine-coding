// Design a server capable of generating, assigning, and managing API keys with specific functionalities.

// The server should offer various endpoints for interaction.

// Create new keys

// An endpoint to create new keys.

// Each generated key has a life of 5 minutes, after which it gets deleted automatically if a keep-alive operation is not run for that key.

// Retrieve an available key

// An endpoint to retrieve an available key, ensuring:

// The key is randomly selected

// The key is not currently in use

// Once served, the key should be blocked from being served again until its status changes.

// If no keys are available, a 404 error should be returned.

// Unblock a key

// An endpoint to unblock a previously assigned key, making it available for reuse.

// Delete a key

// An endpoint to permanently remove a key from the system.

// Keep-alive

// An endpoint for key keep-alive functionality.

// Clients must signal every 5 minutes to prevent the key from being deleted.

// Automatic behavior

// Blocked keys should be automatically released within 60 seconds if not explicitly unblocked.

// Expired keys should be deleted automatically.

// Constraints

// Efficient key management without iterating through all keys for any operation.

// Time complexity of endpoint operations should be O(1) or O(log n) for scalability.

// API Endpoints

// POST /keys
// Generate new keys
// Status: 201

// GET /keys
// Retrieve an available key for client use
// Status: 200 / 404

// Response:

// { "keyId": "<keyID>" }


// or

// {}


// GET /keys/:id
// Retrieve information about a specific key
// Status: 200 / 404

// Response:

// {
//   "isBlocked": "<true> / <false>",
//   "blockedAt": "<blockedTime>",
//   "createdAt": "<createdTime>"
// }


// or

// {}


// PUT /keys/:id
// Unblock a key for further use
// Status: 200 / 404

// DELETE /keys/:id
// Remove a specific key from the system
// Status: 200 / 404

// PUT /keepalive/:id
// Keep the specified key from being deleted
// Status: 200 / 404