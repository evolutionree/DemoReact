/**
 * Created by 0291 on 2017/8/2.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Spin, message, Select, Button } from 'antd';
import Page from '../../../components/Page';
import FilterConfigBoard, { parseRuleDetail, ruleListToItems } from '../../../components/FilterConfigBoard';
import { hashHistory } from 'react-router';
import styles from './detailSet.less';


const Option = Select.Option;

function DetailSet({
                     bizDateField, //设置业务日期字段
                     ruleList,
                     ruleSet,
                     entities,
                     entityFieldData,
                     datacursor,
                     btnLoading,
                     entityId,
                     fieldname,
                     bizdatefieldname,
                     normid,
                     normtypename,
                     submit,
                     onRulesChange,
                     onRuleSetChange,
                     entitySelectHandler,
                     putState,
  checkFunc
                   }) {
  let filterConfigBoard;
  const submitHandler = () => {
    const result = filterConfigBoard.validate();
    if (!result) return;
    const submitData = {
      entityId,
      fieldname,
      calcutetype,
      bizdatefieldname,
      normid,
      ruleitems: ruleList,
      ruleset: {
        ruleSet,
        ruleformat: '',
        userid: 0
      },
      rulename: '',
      typeid: 0
    };
    submit(submitData);
  };

  let calcutetype;
  for (let i = 0; i < datacursor.length; i++) {
    if (datacursor[i].fieldName === fieldname) {
      calcutetype = datacursor[i].caculatetype.toString();
    }
  }
  return (
    <Page title={`销售指标设置-${normtypename}`}
          showGoBack
          goBackPath={'/targetsetting'}>
      <div className={styles.header}>指标统计规则设置</div>
      <div className={styles.title}>第一步：统计字段设置</div>
      <div className={styles.selectComponentWrap}>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="请先选择实体"
          optionFilterProp="children"
          value={entityId}
          onChange={(value) => { entitySelectHandler(value) }}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            entities.map((item) => {
              return <Option key={item.entityid} value={item.entityid}>{item.entityname}</Option>;
            })
          }
        </Select>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="请选择字段"
          optionFilterProp="children"
          value={fieldname}
          onChange={(value) => { putState({ fieldname: value }) }}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            datacursor.map((item) => {
              return <Option key={item.fieldId} value={item.fieldName}>{item.displayName}</Option>;
            })
          }
        </Select>
      </div>
      <div className={styles.title}>第二步：统计方式设置</div>
      <div className={styles.selectComponentWrap}>
        <Select
          showSearch
          style={{ width: 200 }}
          optionFilterProp="children"
          value={calcutetype}
          disabled={true}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          <Option value='1' key={1}>数量统计</Option>
          <Option value='0' key={0}>累计求和</Option>
        </Select>
      </div>
      <div className={styles.title}>第三步：设置业务日期字段</div>
      <div className={styles.selectComponentWrap}>
        <Select
          showSearch
          style={{ width: 200 }}
          placeholder="请设置业务日期字段"
          optionFilterProp="children"
          value={bizdatefieldname}
          onChange={(value) => { putState({ bizdatefieldname: value }) }}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        >
          {
            bizDateField.map((item) => {
              return <Option key={item.fieldid} value={item.fieldname}>{item.displayname}</Option>;
            })
          }
        </Select>
      </div>
      <div className={styles.title}>第四步：统计过滤条件</div>
      <div className={styles.FilterConfigBoardWrap}>
        <FilterConfigBoard
          ref={ (node) => { filterConfigBoard = node }}
          allFields={entityFieldData}
          title1="定义规则:"
          title2="定义集合规则:"
          ruleList={ruleList}
          ruleSet={ruleSet ? ruleSet : ''}
          onRulesChange={(val) => { onRulesChange(val) }}
          onRuleSetChange={(val) => { onRuleSetChange(val) }} />
      </div>
      {checkFunc('IndexSettingEdit') && <div className={styles.btnWrap}>
        <Button type="primary" htmlType="submit"><Link to='/targetsetting'>取消</Link></Button>
        <Button type="primary" htmlType="submit" loading={btnLoading} onClick={submitHandler}>确定</Button>
      </div>}
    </Page>
  );
};

export default connect (
  state => state.targetSettingDetailSet,
  dispatch => {
    return {
      onRulesChange(val) {
        dispatch({ type: 'targetSettingDetailSet/ruleChange', payload: val });
      },
      onRuleSetChange(val) {
        dispatch({ type: 'targetSettingDetailSet/ruleSetChange', payload: val });
      },
      entitySelectHandler(value) {
        dispatch({ type: 'targetSettingDetailSet/entitySelect', payload: value });
      },
      putState(obj) {
        dispatch({ type: 'targetSettingDetailSet/putState', payload: obj });
      },
      submit(submitData) {
        dispatch({ type: 'targetSettingDetailSet/saveNormTypeRule', payload: submitData });
      }
    }
  }
)(DetailSet);
