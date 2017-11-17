const dev = /dev/.test(location.search);
const debug = /debug/.test(location.search);

export default {
  dev,
  debug
};
