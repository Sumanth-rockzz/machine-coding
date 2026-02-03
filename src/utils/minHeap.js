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
    if (this.heap.length === 1) return this.heap.pop();
    if (this.heap.length === 0) return null;

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
    const length = this.heap.length;
    while (true) {
      let left = index * 2 + 1;
      let right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.heap[left].time < this.heap[smallest].time)
        smallest = left;

      if (right < length && this.heap[right].time < this.heap[smallest].time)
        smallest = right;

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

module.exports = MinHeap;
