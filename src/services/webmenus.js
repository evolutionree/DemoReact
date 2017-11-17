import request from '../utils/request';

/**
 * 获取菜单
 * @param type 0 用户系统 1 配置系统
 * @returns {Promise.<Object>}
 */
export async function getGlobalMenus(type) {
  return request('/api/webmenu/menutree', {
    method: 'post',
    body: JSON.stringify({ type })
  });
}
