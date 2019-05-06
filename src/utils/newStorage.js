function setLocalItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getLocalItem(key) {
  const value = JSON.parse(localStorage.getItem(key));
  return value;
}

function removeLocalItem(key) {
  localStorage.removeItem(key);
}

function setSessionItem(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getSessionItem(key) {
  const value = JSON.parse(sessionStorage.getItem(key));
  return value;
}

function removeSessionItem(key) {
  sessionStorage.removeItem(key);
}

function getCacheData(key, data, id) {
  const obj = { ...data };
  let list = getSessionItem(key);
  if (!list) list = [];
  if (list.length > 10) list.splice(0, 5);
  if (id && list.some(o => o[id] === obj[id])) {
    return list.map(item => (item[id] === obj[id] ? obj : item));
  }
  list.push(obj);
  return list;
}

export default {
  setLocalItem,
  getLocalItem,
  removeLocalItem,
  setSessionItem,
  getSessionItem,
  removeSessionItem,
  getCacheData
};

