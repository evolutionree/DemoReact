/**
 * Created by 0291 on 2017/8/2.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Spin, message, Select } from 'antd';
import Page from '../../../components/Page';
import { hashHistory } from 'react-router';
import styles from '../../../components/ParamsBoard/styles.less';
import Toolbar from '../../../components/Toolbar';
import ParamsList from '../../../components/ParamsBoard/ParamsList';
import NewParamForm from '../../../components/ParamsBoard/NewParamForm';

function TargetSet({
  fieldClickHandler,
  onCreate,
  onUpdate,
  onDel,
  listData,
  checkFunc
}) {
  const fields = [{
    key: 'normtypename',
    name: '指标名称',
    link: checkFunc('IndexSettingEdit'),
    maxLength: 10
  }];

  return (
    <Page title="销售指标设置">
      <div className={styles.board}>
        {checkFunc('IndexSettingAdd') && <Toolbar>
          <NewParamForm onSubmit={onCreate} fields={fields} />
        </Toolbar>}
        <ParamsList
          items={listData}
          delTipInfo="删除销售指标后, 会一并删除已设置好的销售目标数据，确认删除?"
          fields={fields}
          itemKey="groupId"
          onUpdate={onUpdate}
          onDel={onDel}
          onClick={fieldClickHandler}
          showDel={item => checkFunc('IndexSettingDelete') && item.isdefault === 0}
          showEdit={item => checkFunc('IndexSettingEdit')}
        />
      </div>
    </Page>
  );
}

export default connect(
  state => state.targetSetting,
  dispatch => {
    return {
      fieldClickHandler(item) {
        hashHistory.push('/targetsetting/' + item.normtypeid + '?normtypename=' + item.normtypename);
      },
      onCreate(value) {
        dispatch({ type: 'targetSetting/addTarget', payload: value });
      },
      onUpdate(item) {
        dispatch({ type: 'targetSetting/updateTarget', payload: item });
      },
      onDel(item) {
        dispatch({ type: 'targetSetting/delTarget', payload: item });
      }
    }
  }
)(TargetSet);
