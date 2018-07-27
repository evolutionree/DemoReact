import React from 'react';
import { connect } from 'dva';
import Toolbar from '../../../../components/Toolbar';
import NewFieldTypeForm from './NewFieldTypeForm';
import ParamsBoard from '../../../../components/ParamsBoard/ParamsBoard';

function EntityTypes({
  dispatch,
  entityId,
  list,
  createBtnLoading
}) {
  function handleCreate(data) {
    dispatch({
      type: 'entityTypes/create',
      payload: {
        entityId,
        categoryname_lang: data.categoryname_lang
      }
    });
  }
  function handleUpdate(data) {
    dispatch({
      type: 'entityTypes/update',
      payload: {
        CategoryId: data.categoryid,
        categoryname_lang: data.categoryname_lang
      }
    });
  }
  function handleOrderUp(item, index) {
    swapOrder(index, index - 1);
  }
  function handleOrderDown(item, index) {
    swapOrder(index, index + 1);
  }
  function swapOrder(index, aIndex) {
    dispatch({
      type: 'entityTypes/order',
      payload: [{
        categoryid: list[index].categoryid,
        recorder: aIndex
      }, {
        categoryid: list[aIndex].categoryid,
        recorder: index
      }]
    });
  }
  function handleSwitch(item, index) {
    const params = {
      RecStatus: item.recstatus === 1 ? 0 : 1,
      CategoryId: item.categoryid
    };
    dispatch({
      type: 'entityTypes/switch',
      payload: params
    });
  }
  function handleDel(item, index) {
    const params = {
      RecStatus: 2,
      CategoryId: item.categoryid
    };
    dispatch({
      type: 'entityTypes/del',
      payload: params
    });
  }

  const fields = [{
    key: 'categoryname',
    name: '类型名称',
    intl: true
  }];
  return (
    <div>
      <ParamsBoard
        items={list}
        fields={fields}
        itemKey="categoryid"
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onOrderUp={handleOrderUp}
        onOrderDown={handleOrderDown}
        onSwitch={handleSwitch}
        ondel={handleDel}
      />
    </div>
  );
}

export default connect(({ entityTypes }) => entityTypes)(EntityTypes);
