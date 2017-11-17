import _ from 'lodash';
import departmentData from './department.json';

export async function queryDepartmentData () {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ data: transformDepartmentData(departmentData.Dept) });
    }, 350);
  });
}

function transformDepartmentData(data) {
  const root = _.find(data, item => item.nodepath === 0);
  const tree = [root];
  loopChildren(tree);
  return tree;

  function loopChildren(nodes) {
    nodes.forEach((node, index) => {
      const id = node.deptid;
      const children = data.filter(item => item.ancestor === id);
      nodes[index].children = children;
      loopChildren(children);
    });
  }
}
