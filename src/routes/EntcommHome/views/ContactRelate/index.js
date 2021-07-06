/*
 * @Author: mikey.zhaopeng 
 * @Date: 2018-11-15 16:10:40 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-12-12 11:05:58
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import _ from 'lodash';
import TreeNode from '../../../CustomerHome/RelationTree/TreeNode';
import DetailModal from '../../../../components/DynamicModal/DetailModal';
import request from '../../../../utils/request';
import Styles from './styles.less';

class ContactRelate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      expandedKeys: [],
      recordId: '',
      recordName: '详细信息',
      detailModalVisible: false
    };
    this.updateExpandedKeys = this.updateExpandedKeys.bind(this);
    this.controlDetailModal = this.controlDetailModal.bind(this);
    this.cancelDetailModal = this.cancelDetailModal.bind(this);
  }

  componentDidMount() {
    this.queryData(this.props.recordId);
  }

  queryData(custId) {
    request('/api/customer/getcustcontacttree', {
      method: 'post', body: JSON.stringify({ CustId: custId })
    }).then((result) => {
      this.setState({
        treeData: this.customertransformArrayToTree(result.data || [])
      });
    });
  }

  customertransformArrayToTree(array, idKey = 'id') {
    const root = _.find(array, item => item.parent_id === '00000000-0000-0000-0000-000000000000');
    const tree = [root];
    loopChildren(tree);
    return tree;

    function loopChildren(nodes) {
      nodes.forEach((node, index) => {
        const id = node[idKey];
        const children = array.filter(item => item.parent_id === id);
        nodes[index].children = children;
        loopChildren(children);
      });
    }
  }

  updateExpandedKeys(data) {
    console.log('currentExpandKey')
    const { id: currentExpandKey } = data;
    const { expandedKeys } = this.state;
    let newExpandedKeys = [];
    if (expandedKeys.indexOf(currentExpandKey) > -1) {
      newExpandedKeys = expandedKeys.filter(item => item !== currentExpandKey);
    } else {
      newExpandedKeys.push(currentExpandKey);
    }
    this.setState({ expandedKeys: newExpandedKeys });
  }

  controlDetailModal(data) {
    const { id: recordId, name: recordName } = data;
    this.setState({ recordId, recordName, detailModalVisible: true });
  }

  cancelDetailModal() {
    this.setState({ detailModalVisible: false });
  }

  getHTML() {
    const props = {
      itemKey: 'id',
      nameKey: 'name',
      secondNameKey: 'custdept',
      thirdNameKey: 'position'
    };
    const { recordId: custid } = this.props;
    const { treeData: data, expandedKeys, recordId, recordName, detailModalVisible } = this.state;
    console.log(expandedKeys);
    if (data.length > 0) {
      return (
        <ul className={Styles.decisionTreeWrap}>
          {data.map((item) => {
            return (
              <div>
                <TreeNode
                  key={item[props.itemKey]}
                  custid={custid}
                  data={item}
                  onExpand={this.updateExpandedKeys}
                  onControlDetailModal={this.controlDetailModal}
                  expandedKeys={expandedKeys}
                  {...props}
                />
                <DetailModal
                  entityId="e450bfd7-ff17-4b29-a2db-7ddaf1e79342"
                  title={recordName}
                  recordId={recordId}
                  visible={detailModalVisible}
                  onCancel={this.cancelDetailModal}
                />
              </div>

            );
          })}
        </ul>
      );
    } else {
      return <div><Icon type="frown-o" /> 暂无数据</div>;
    }
  }

  render() {
    return <div>{this.getHTML()}</div>;
  }
}

export default connect(
  state => {
    const { recordId } = state.entcommHome;
    return { recordId };
  }
)(ContactRelate);
