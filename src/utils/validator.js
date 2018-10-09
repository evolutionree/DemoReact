/**
 * Created by 0291 on 2018/7/19.
 */

export function IntlInputRequireValidator(rule, value, callback) {
  let langlist = JSON.parse(window.localStorage.getItem('langlist'));
  langlist instanceof Array && langlist.map(item => {
    if (!(value && value[item.key])) {
      callback(item.dispaly + '必填');
    }
  });
  callback();
}
