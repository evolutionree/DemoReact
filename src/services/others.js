import request from '../utils/request';

/**
 * 根据id拿选项值
 * @param id
 * @returns {Promise.<Object>}
 */
export async function queryOptions(id) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { label: '选项1', value: '123' },
        { label: '选项2', value: '124' }
      ]);
    }, 300);
  });
  // return request('/api/queryoptions', {
  //   method: 'post',
  //   body: JSON.stringify({ id })
  // });
}
