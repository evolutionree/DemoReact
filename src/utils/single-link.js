class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class SingleArrayLink {
  constructor() {
    this.head = new Node();
  }
  insert(data) {
    let tail = this.head;
    while (tail.next) {
      tail = tail.next;
    }
    tail.next = new Node(data);
  }
  remove(node) {
    if (node === this.head) {
      this.head = this.head.next;
      return;
    }
    let p = this.head;
    while (p.next) {
      if (p.next === node) {
        p.next = node.next;
        return;
      }
      p = p.next;
    }
  }
}
