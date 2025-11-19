/*

// lockManager.js
import { Mutex } from 'async-mutex';

const locks = {};

export async function acquireLock(symbol) {
  if (!locks[symbol]) {
    locks[symbol] = new Mutex();
  }
  return locks[symbol].acquire();
}
*/

// lockManager.js
import { Mutex } from "async-mutex";

// Mutex global — apenas um lock para tudo
const globalLock = new Mutex();

// Aguarda o lock global
export async function acquireLock() {
  return globalLock.acquire(); // retorna release()
}