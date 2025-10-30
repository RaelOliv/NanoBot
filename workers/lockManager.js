// lockManager.js
import { Mutex } from 'async-mutex';

const locks = {};

export async function acquireLock(symbol) {
  if (!locks[symbol]) {
    locks[symbol] = new Mutex();
  }
  return locks[symbol].acquire();
}