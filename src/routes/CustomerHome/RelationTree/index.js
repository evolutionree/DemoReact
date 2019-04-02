/**
 * Created by 0291 on 2017/7/10.
 */
import React from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';
import TreeNode from './TreeNode';
import DetailModal from '../../../components/DynamicModal/DetailModal';
import { customertransformArrayToTree } from '../../../utils/index';
import styles from './styles.less';

function CustomerRelationTree({ relationTreeData, custid, nodeExpand, expandedKeys, controlDetailModal, recordId, recordName, detailModalVisible, onCancelDetailModal }) {
  const transformData = relationTreeData.length > 0 ? customertransformArrayToTree(relationTreeData) : [];
  if (transformData.length > 0) {
    return (
      <div>
        <ul className={styles.wrap}>
          {transformData.map((item) => {
            return (
              <TreeNode
                key={item.id}
                data={item}
                custid={custid}
                onExpand={nodeExpand}
                onControlDetailModal={controlDetailModal}
                expandedKeys={expandedKeys}
              />
            );
          })}
        </ul>
        <DetailModal
          entityId="f9db9d79-e94b-4678-a5cc-aa6e281c1246" // 客户
          title={recordName}
          recordId={recordId}
          visible={detailModalVisible}
          onCancel={onCancelDetailModal}
        />
      </div>
    );
  } else {
    return <div><Icon type="frown-o" /> 暂无数据</div>;
  }
}

export default connect(
  state => {
    const { relationtree } = state;
    return {
      ...relationtree
    };
  },
  dispatch => {
    return {
      nodeExpand: (data) => {
        dispatch({ type: 'relationtree/updateExpandedKeys', payload: data.id });
      },
      controlDetailModal: (data) => {
        dispatch({ type: 'relationtree/updateCustomerData', payload: data });
      },
      onCancelDetailModal: () => {
        dispatch({ type: 'relationtree/updateDetailModalVisible', payload: false });
      }
    };
  }
)(CustomerRelationTree);
