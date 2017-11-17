const u = navigator.userAgent;

export default {
  isAndroid: () => u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
  isiOS: () => !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
};
