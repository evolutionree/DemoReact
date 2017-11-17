import { guid } from './common';

const GLOBAL_NS = 'GLOBAL_NS';
const messageStacks = {};
const subscribers = [];

function subscribe(callback, namespace = GLOBAL_NS) {
  const subscriber = {
    namespace,
    callback
  };
  subscribers.push(subscriber);
  return function unsubscribe() {
    const index = subscribers.indexOf(subscriber);
    if (index === -1) return;
    subscribers.splice(index, 1);
  };
}

function log(message, namespace = GLOBAL_NS) {
  let stack = messageStacks[namespace];
  if (!stack) {
    stack = [];
    messageStacks[namespace] = stack;
  }
  stack.push({
    content: message,
    ts: new Date().getTime() + guid()
  });
  const subs = subscribers.filter(item => item.namespace === namespace);
  console.log(message);
  subs.forEach(subscriber => subscriber.callback(stack));
}

export default {
  subscribe,
  log
};
