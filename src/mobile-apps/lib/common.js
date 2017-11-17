export function guid(opts) {
  const uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  if (opts && opts.noDash) {
    return uid.replace(/-/g, '');
  }
  return uid;
}

export function genRandomCode() {
  return 'asdf12345';
}
