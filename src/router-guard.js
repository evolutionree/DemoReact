import { checkPagePermission } from './services/authentication';

import pathToRegexp from "path-to-regexp";

const patternCache = {};
const cacheLimit = 10000;
let cacheCount = 0;

const compilePath = (pattern, options) => {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

  if (cache[pattern]) return cache[pattern];

  const keys = [];
  const re = pathToRegexp(pattern, keys, options);
  const compiledPattern = { re, keys };

  if (cacheCount < cacheLimit) {
    cache[pattern] = compiledPattern;
    cacheCount++;
  }

  return compiledPattern;
};

/**
 * Public API for matching a URL pathname to a path pattern.
 */
const matchPath = (pathname, options = {}) => {
  if (typeof options === "string") options = { path: options };

  const {
    path = "/",
    exact = false,
    strict = false,
    sensitive = false
  } = options;
  const { re, keys } = compilePath(path, { end: exact, strict, sensitive });
  const match = re.exec(pathname);

  if (!match) return null;

  const [url, ...values] = match;
  const isExact = pathname === url;

  if (exact && !isExact) return null;

  return {
    path, // the path pattern used to match
    url: path === "/" && url === "" ? "/" : url, // the matched portion of the URL
    isExact, // whether or not we matched exactly
    params: keys.reduce((memo, key, index) => {
      memo[key.name] = values[index];
      return memo;
    }, {})
  };
};

const matchRoutes = (routes, pathname, /*not public API*/ branch = []) => {
  routes.forEach(route => {
    const match = route.path
      ? matchPath(pathname, route)
      : branch.length
        ? branch[branch.length - 1].match // use parent match
        // : computeMatch(pathname); // use default "root" match
        : {
          path: "/",
          url: "/",
          params: {},
          isExact: pathname === "/"
        }; // use default "root" match

    if (match) {
      branch.push({ route, match });

      if (route.routes) {
        matchRoutes(route.routes, pathname, branch);
      }
    }

    return match;
  });

  return branch;
};

export default (routes) => (nextState, replace, next) => {
  // const { pathname } = nextState.location;
  // const result = matchRoutes(routes, pathname.replace(/^\//, ''));
  // if (result.length) {
  //   const { match, route } = result[result.length - 1];
  //   const { params, path, url } = match;
  //   console.log(
  //     `检查页面${pathname}权限, path: ${path}, url: ${url}, params: ${JSON.stringify(params)}`
  //   );
  //   checkPagePermission({ pageid: path, extradata: { params } }).then(res => {
  //     if (res) {
  //       next();
  //     } else {
  //       alert('没有权限进入该页面');
  //     }
  //   });
  // } else {
    next();
  // }
}
