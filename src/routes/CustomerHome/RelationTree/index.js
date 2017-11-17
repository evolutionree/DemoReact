/**
 * Created by 0291 on 2017/7/10.
 */
import React from 'react';
import { connect } from 'dva';
import { Modal, Button, Form, Input, Table, message, Icon } from 'antd';
import TreeNode from './TreeNode';
import styles from './styles.less';
import {customertransformArrayToTree} from '../../../utils/index';


function CustomerRelationTree({relationTreeData, custid}) {
  const transformData=relationTreeData.length>0 ? customertransformArrayToTree( relationTreeData ) : [];
  if(transformData.length > 0){
    return (
      <ul>
        {transformData.map((item, index) => {
          return <TreeNode key={item.id} data={item} custid={custid}/>
        })}
      </ul>
    )
  }else{
    return <div><Icon type="frown-o" /> 暂无数据</div>
  }
}

export default connect(
  state => state.relationtree,
  dispatch => {
    return {

    };
  }
)(CustomerRelationTree);
