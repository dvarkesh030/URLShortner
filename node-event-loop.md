# Node.js Event Loop - Complete Deep Dive

## Table of Contents
1. Introduction to the Event Loop
2. Architecture Overview
3. The Six Phases in Detail
4. Microtask Queues
5. Execution Order and Priority
6. Real-World Examples
7. Common Gotchas and Best Practices

---

## 1. Introduction to the Event Loop

The **Node.js Event Loop** is the heart of Node's asynchronous, non-blocking architecture. It allows Node.js to handle thousands of concurrent operations on a **single thread** by offloading I/O operations to the system kernel and using callbacks to process results when they're ready.

### Key Concepts
- **Single-threaded:** Node runs JavaScript on one main thread.
- **Non-blocking I/O:** Operations like file reads, network requests don't freeze the program.
- **Event-driven:** The event loop continuously checks for completed tasks and executes their callbacks.
- **Powered by libuv:** A C library that provides the event loop implementation and thread pool for certain operations.

The event loop allows Node.js to scale efficiently without creating new threads for each connection (unlike traditional multi-threaded servers).

---

## 2. Architecture Overview

### Components
1. **V8 Engine:** Executes JavaScript code
2. **libuv:** Provides the event loop, thread pool, and async I/O
3. **Node.js Bindings:** Connect JavaScript to C++ libraries
4. **Event Loop:** Orchestrates the execution of callbacks across multiple phases

### How It Works
```
┌───────────────────────────┐
│        Call Stack         │  ← JavaScript execution
└───────────────────────────┘
              ↓
┌───────────────────────────┐
│  Node.js Runtime (V8)     │
└───────────────────────────┘
              ↓
┌───────────────────────────┐
│   libuv Event Loop        │  ← Manages async operations
│   (6 phases + microtasks) │
└───────────────────────────┘
              ↓
┌───────────────────────────┐
│  OS Kernel / Thread Pool  │  ← Handles I/O
└───────────────────────────┘
```

When you run a Node.js script:
1. Synchronous code executes immediately on the call stack
2. Async operations are delegated to libuv
3. When operations complete, their callbacks enter the event loop queues
4. The event loop processes these callbacks in a specific order across multiple phases

---

## 3. The Six Phases in Detail

The event loop cycles through **six phases** repeatedly until there's no more work to do. Each phase has a specific purpose and its own queue of callbacks.

```
   ┌───────────────────────┐
┌─>│        timers         │  Phase 1
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │  pending callbacks    │  Phase 2
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │   idle, prepare       │  Phase 3
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │       poll            │  Phase 4 ← Most important
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │       check           │  Phase 5
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │   close callbacks     │  Phase 6
│  └──────────┬────────────┘
└─────────────┘
```

### Phase 1: Timers
**Purpose:** Executes callbacks scheduled by `setTimeout()` and `setInterval()`

**How it works:**
- Timers specify a **threshold** (minimum delay), not an exact time
- When the specified time elapses, callbacks move to the timers queue
- The event loop executes all expired timer callbacks in this phase

**Example:**
```js
console.log('Start');

setTimeout(() => {
  console.log('Timer callback executed');
}, 100);

console.log('End');
```

**Output:**
```
Start
End
Timer callback executed
```

**Important:** The poll phase controls when timers actually execute. If the poll phase is busy, timer callbacks may run later than their threshold.

---

### Phase 2: Pending Callbacks (I/O Callbacks)
**Purpose:** Executes I/O callbacks deferred from the previous event loop cycle

**What runs here:**
- Certain system-level callbacks (e.g., TCP errors like `ECONNREFUSED`)
- Deferred I/O operations from the previous loop iteration
- NOT regular I/O callbacks (those run in the poll phase)

**Example:**
```js
const net = require('net');
const client = net.connect({ port: 9999 });

client.on('error', (err) => {
  console.log('Connection error:', err.code);
  // This callback runs in pending callbacks phase
});
```

---

### Phase 3: Idle, Prepare
**Purpose:** Internal use only by Node.js

**Details:**
- Used for internal housekeeping and performance optimization
- Not directly exposed to developers
- You don't need to worry about this phase in application code

---

### Phase 4: Poll (Most Critical Phase)
**Purpose:** 
1. Retrieve new I/O events and execute their callbacks
2. Determine how long to wait for new I/O events

**What runs here:**
- File system operations (`fs.readFile`, `fs.writeFile`)
- Network operations (HTTP requests, database queries)
- Most asynchronous callbacks execute here

**How it works:**
1. If the poll queue has callbacks → execute them synchronously until queue is empty or system limit
2. If poll queue is empty:
   - If `setImmediate()` callbacks are queued → move to check phase
   - Otherwise → wait for new I/O events (with a calculated timeout)
3. Between each callback, microtask queues are drained

**Example:**
```js
const fs = require('fs');

console.log('Start');

fs.readFile('file.txt', 'utf8', (err, data) => {
  console.log('File read complete');
  // This callback executes in poll phase
});

console.log('End');
```

**Output:**
```
Start
End
File read complete
```

**Important:** The poll phase prevents starvation by having a system-dependent maximum limit before moving to the next phase.

---

### Phase 5: Check
**Purpose:** Executes `setImmediate()` callbacks

**How it works:**
- `setImmediate()` is a special timer that runs immediately after the poll phase
- If the poll phase becomes idle and `setImmediate()` callbacks exist, the loop continues to the check phase

**Example:**
```js
console.log('Start');

setImmediate(() => {
  console.log('Immediate callback');
});

console.log('End');
```

**Output:**
```
Start
End
Immediate callback
```

**setImmediate vs setTimeout(fn, 0):**
```js
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));
```

- **Outside I/O cycle:** Order is unpredictable (depends on system performance)
- **Inside I/O cycle:** `setImmediate()` ALWAYS executes first

```js
const fs = require('fs');

fs.readFile('file.txt', () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
});
```

**Output (guaranteed):**
```
setImmediate
setTimeout
```

---

### Phase 6: Close Callbacks
**Purpose:** Executes callbacks for closed resources

**What runs here:**
- `socket.on('close')` callbacks
- Cleanup for streams, servers, and connections
- Any resource that emits a 'close' event

**Example:**
```js
const net = require('net');
const server = net.createServer();

server.on('close', () => {
  console.log('Server closed');
  // Runs in close callbacks phase
});

server.listen(3000);
server.close();
```

---

## 4. Microtask Queues (Priority Queues)

In addition to the six main phases, Node.js has **two microtask queues** that run **between every phase** and have the **highest priority**.

### The Two Microtask Queues

#### 1. nextTick Queue
- Holds callbacks from `process.nextTick()`
- **Highest priority** in the entire event loop
- Runs immediately after the current operation, before moving to the next phase

#### 2. Promise Queue
- Holds callbacks from resolved promises (`.then()`, `.catch()`, `.finally()`)
- Runs after `process.nextTick()` queue is empty
- Native Promises and async/await use this queue

### Execution Order
```
After each phase:
1. Execute ALL process.nextTick() callbacks
2. Execute ALL Promise callbacks
3. Move to next phase
```

**Example demonstrating priority:**
```js
console.log('Start');

setTimeout(() => console.log('setTimeout'), 0);

setImmediate(() => console.log('setImmediate'));

process.nextTick(() => console.log('nextTick'));

Promise.resolve().then(() => console.log('Promise'));

console.log('End');
```

**Output:**
```
Start
End
nextTick
Promise
setTimeout
setImmediate
```

**Explanation:**
1. Synchronous code runs first: `Start`, `End`
2. Microtasks run before any phase:
   - `process.nextTick()` first
   - `Promise` second
3. Event loop phases:
   - `setTimeout` (timers phase)
   - `setImmediate` (check phase)

---

## 5. Execution Order and Priority

### Complete Priority Hierarchy (High to Low)

```
1. Synchronous code on call stack
2. process.nextTick() queue
3. Promise microtask queue
4. Timer phase (setTimeout, setInterval)
5. Pending callbacks phase
6. Idle, prepare phase
7. Poll phase (I/O callbacks)
8. Check phase (setImmediate)
9. Close callbacks phase
```

### Comprehensive Example
```js
console.log('1. Sync start');

setTimeout(() => console.log('2. setTimeout 0'), 0);

setImmediate(() => console.log('3. setImmediate'));

process.nextTick(() => {
  console.log('4. nextTick 1');
  process.nextTick(() => console.log('5. nextTick nested'));
});

Promise.resolve()
  .then(() => console.log('6. Promise 1'))
  .then(() => console.log('7. Promise 2'));

process.nextTick(() => console.log('8. nextTick 2'));

console.log('9. Sync end');
```

**Output:**
```
1. Sync start
9. Sync end
4. nextTick 1
8. nextTick 2
5. nextTick nested
6. Promise 1
7. Promise 2
2. setTimeout 0
3. setImmediate
```

---

## 6. Real-World Examples

### Example 1: File Reading with Timers
```js
const fs = require('fs');

console.log('Start');

setTimeout(() => console.log('Timer 100ms'), 100);

fs.readFile('large-file.txt', () => {
  console.log('File read complete');
  
  setTimeout(() => console.log('Timer inside file read'), 0);
  setImmediate(() => console.log('Immediate inside file read'));
});

console.log('End');
```

**Output:**
```
Start
End
Timer 100ms
File read complete
Immediate inside file read
Timer inside file read
```

**Why?**
- `setImmediate` always runs before `setTimeout` when inside an I/O callback
- Poll phase moves to check phase when `setImmediate` exists

---

### Example 2: Recursive nextTick (Dangerous!)
```js
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}

recursiveNextTick();

setTimeout(() => console.log('This will NEVER run'), 0);
```

**Warning:** This creates an infinite loop in the nextTick queue, **starving** the event loop. The timer never executes because the event loop never moves past the microtask queue.

**Solution:** Use `setImmediate()` for recursive async operations:
```js
function recursiveImmediate() {
  setImmediate(recursiveImmediate);
}

recursiveImmediate();

setTimeout(() => console.log('This WILL run'), 0);
```

---

### Example 3: Database Query + Timer
```js
const db = require('./database');

console.log('Querying database...');

db.query('SELECT * FROM users', (err, results) => {
  console.log('Query complete');
  
  process.nextTick(() => console.log('Processing results'));
  
  Promise.resolve().then(() => console.log('Caching results'));
  
  setImmediate(() => console.log('Logging analytics'));
});

setTimeout(() => console.log('Timeout'), 0);
```

**Output:**
```
Querying database...
Query complete
Processing results
Caching results
Logging analytics
Timeout
```

---

## 7. Common Gotchas and Best Practices

### ❌ Mistake 1: Blocking the Event Loop
```js
// BAD: Synchronous operation blocks everything
const fs = require('fs');
const data = fs.readFileSync('huge-file.txt'); // Blocks!
```

**✅ Solution:** Always use async versions
```js
const fs = require('fs').promises;
const data = await fs.readFile('huge-file.txt');
```

---

### ❌ Mistake 2: process.nextTick() Starvation
```js
// BAD: Infinite nextTick loop
process.nextTick(function loop() {
  process.nextTick(loop);
});
```

**✅ Solution:** Use `setImmediate()` for recursive async calls
```js
setImmediate(function loop() {
  setImmediate(loop);
});
```

---

### ❌ Mistake 3: Assuming Exact Timer Delays
```js
// BAD: Expecting exactly 100ms
setTimeout(() => {
  // Might run after 105ms or more
}, 100);
```

**✅ Understanding:** Timers specify minimum delay, not exact time

---

### Best Practices

1. **Prefer async/await over callbacks**
   - Cleaner, easier to debug
   - Better error handling

2. **Use setImmediate() for deferring work**
   - Yields to the event loop
   - Prevents blocking

3. **Avoid long-running computations on main thread**
   - Use Worker Threads for CPU-intensive tasks
   - Consider breaking work into chunks with setImmediate()

4. **Understand promise vs nextTick priority**
   - Use `process.nextTick()` sparingly
   - Promises are safer and more standard

5. **Monitor event loop lag**
   - Use tools like `clinic.js` or `0x`
   - Track event loop delay in production

---

## Summary

The Node.js Event Loop:
- Runs on a **single thread** with **six phases**
- Uses **libuv** for async I/O and thread pool management
- Executes **microtasks** (nextTick, Promises) between every phase
- Follows strict **priority ordering** for callback execution
- Enables **non-blocking, scalable** applications

**Key Takeaway:** Understanding the event loop helps you write performant, predictable Node.js applications by knowing exactly when your code will execute and avoiding common pitfalls that block the loop.
