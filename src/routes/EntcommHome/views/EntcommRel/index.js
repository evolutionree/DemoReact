import React from 'react';
import { connect } from 'dva';
import { Button, Icon } from 'antd';
import classnames from 'classnames';
import * as _ from 'lodash';
import styles from './styles.less';
import DetailModal from './DetailModal';
import Avatar from '../../../../components/Avatar';
import RelEntityAddModal from './RelEntityAddModal';
import connectPermission from "../../../../models/connectPermission";
import DynamicTable from '../../../../components/DynamicTable/index';

function EntcommRel({
  list,
  listFields,
  relEntityId,
  relEntityName,
  iconField,
  showDetail,
  addRelEntity,
  tabInfo,
  checkFunc,
  call, //拨打客户联系人电话
  protocol
}) {
  const callHandler = (mobilephone, e) => {
    e.stopPropagation();
    call(mobilephone);
  }

  function handleTableChange(pagination, filters, sorter) {
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : ''
    // search({
    //   pageIndex: pagination.current,
    //   pageSize: pagination.pageSize,
    //   searchOrder: searchOrder
    // });
  }

  return (
    <div className={styles.pagecontainer}>
      {checkFunc('EntityDataAdd') && <Button onClick={addRelEntity} style={{ marginBottom: '10px' }}>{`新增${tabInfo.entityname || ''}`}</Button>}
      {list.length ? (
        <ul className={styles.list}>
          {list.map(item => (
            <li
              key={item.recid}
              className={classnames([styles.item, { [styles.hasIcon]: !!iconField }])}
              onClick={() => { showDetail(item); }}
            >
              {iconField && (
                <Avatar
                  className={styles.listIcon}
                  style={{ width: '50px', height: '50px' }}
                  image={`/api/fileservice/read?fileid=${item[iconField.fieldName]}&filetype=3`}
                />
              )}
              {listFields.map(({ fieldName, color, font }) => {
                const text = item[fieldName + '_name'] !== undefined ? item[fieldName + '_name'] : item[fieldName];
                return (
                  <span
                    key={fieldName}
                    title={text}
                    style={{ color, fontSize: font + 'px' }}
                  >
                    {text}
                  </span>
                );
              })}
              {
                relEntityId === 'e450bfd7-ff17-4b29-a2db-7ddaf1e79342' ? <span className={styles.call} onClick={callHandler.bind(this, item.mobilephone)}><Icon type="phone" /></span> : null
              }
            </li>
          ))}
        </ul>
      ) : (
        <div><Icon type="frown-o" /> 暂无数据</div>
      )}
      <DynamicTable
        sorter={true}
        sortFieldAndOrder={null}
        entityId={tabInfo.relentityid}
        protocol={protocol}
        rowKey="recid"
        dataSource={list}
        total={10}
        fixedHeader={true}
        pagination={{
          total: 10,
          pageSize: 10,
          current: 1
          // onChange: val => search({ pageIndex: val }),  改用table提供的onChange事件
          // onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
        onChange={handleTableChange}
        // rowSelection={{
        //   selectedRowKeys: currItems.map(item => item.recid),
        //   onChange: (keys, items) => selectItems(items)
        // }}
      />
      <DetailModal />
      <RelEntityAddModal />
    </div>
  );
}

export default connect(
  state => {
    const { relTabs } = state.entcommHome;
    const { relId, relEntityId, protocol } = state.entcommRel;
    let tabInfo = {};
    if (relTabs.length && relId && relEntityId) {
      tabInfo = _.find(relTabs, item => {
        return item.relid === relId && item.relentityid === relEntityId;
      }) || tabInfo;
    }
    return {
      ...state.entcommRel,
      tabInfo,
      protocol
    };
  },
  dispatch => {
    return {
      showDetail(item) {
        dispatch({ type: 'entcommRel/putState', payload: { currItem: item.recid } });
      },
      addRelEntity() {
        dispatch({ type: 'entcommRel/putState', payload: { showModals: 'add' } });
      },
      call(mobilephone) {
        dispatch({ type: 'entcommRel/call', payload: mobilephone });
      }
    };
  }
)(connectPermission(props => props.relEntityId, EntcommRel));
