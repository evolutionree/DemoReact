/**
 * Created by 0291 on 2017/7/10.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message, Icon, Button } from 'antd';
import TreeNode from './TreeNode';
import _ from 'lodash';

class DeptTree extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  depttransformArrayToTree(array, idKey = 'recid') {
    const root = _.find(array, item => item.recid === '0000-0000-0000-0000-0000');
    const tree = [root];
    loopChildren(tree);
    return tree;

    function loopChildren(nodes) {
      nodes.forEach((node, index) => {
        const id = node[idKey];
        const children = array.filter(item => item.parentdept && item.parentdept.id === id);
        nodes[index].children = children;
        loopChildren(children);
      });
    }
  }

  getDeptTreeData() {
    const { deptTreeData } = this.props;
    const transformData = deptTreeData.map(item => {
      if (item.parentdept) {
        return item;
      } else {
        return {
          ...item,
          parentdept: {
            id: '0000-0000-0000-0000-0000',
            name: ''
          }
        };
      }
    });

    const returnData = [
      {
        recid: '0000-0000-0000-0000-0000',
        recname: this.props.recname,
        customer: {
          id: 'ad390af6-bc42-4950-9c50-b2ef434a0951',
          name: '中国招商银行石牌支行'
        }
      },
      ...transformData
    ];
    return returnData;
  }

  render() {
    let deptTreeData = this.getDeptTreeData();
    const transformData = deptTreeData.length > 0 ? this.depttransformArrayToTree(deptTreeData) : [];
    return (
      <div>
        {
          transformData.length > 0 ? <ul>
            {transformData.map((item, index) => {
              return <TreeNode key={item.recid} data={item} />;
            })}
          </ul> : <div><Icon type="frown-o" /> 暂无数据</div>
        }
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      deptTreeData: state.entcommRel.list,
      recname: state.entcommHome.recordDetail.recname
    };
  }
)(DeptTree);
