import React from 'react';
import { Input, Form, Button } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Page from '../../components/Page';
import styles from './styles.less';
import MobileViewStyleSelect from './MobileViewStyleSelect';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';

const FormItem = Form.Item;

const DataSourceHome = ({
  dispatch,
  dataSourceName,
  rawDetailData,
  sqlContent,
  mobViewConfig,
  colNames
}) => {
  function onSqlContentChange(event) {
    dispatch({ type: 'dSourceHome/sqlContent', payload: event.target.value });
  }
  function onMobViewConfigChange(val) {
    dispatch({ type: 'dSourceHome/mobViewConfig', payload: val });
  }
  function onColNameChange(index) {
    return event => {
      const newVal = _.clone(colNames);
      newVal[index] = event.target.value;
      dispatch({ type: 'dSourceHome/colNames', payload: newVal })
    };
  }
  function onSave() {
    dispatch({ type: 'dSourceHome/save' });
  }
  return (
    <Page title={`数据源设置 - ${getIntlText('datasrcname', rawDetailData)}`} showGoBack goBackPath="/data-source">
      <div style={{ width: '900px', margin: '0 auto' }}>
        <div>
          <div className={styles.subtitle} style={{ marginTop: 10 }}>
            <span className={styles.step}>第一步</span>
            <span>设置数据源内容</span>
          </div>
          <div>
            <Input type="textarea" value={sqlContent} onChange={onSqlContentChange} placeholder="请输入数据源内容" />
          </div>
        </div>
        <MobileViewStyleSelect
          mobViewConfig={mobViewConfig}
          onChange={onMobViewConfigChange}
        />
        <div>
          <div className={styles.subtitle} style={{ marginTop: 10 }}>
            <span className={styles.step}>第三步</span>
            <span>定义显示列名</span>
          </div>
          <div>
            <Form style={{ width: '482px' }}>
              <FormItem label="列名1">
                <Input value={colNames[0]} onChange={onColNameChange(0)} placeholder="请输入字段列名" />
              </FormItem>
              <FormItem label="列名2">
                <Input value={colNames[1]} onChange={onColNameChange(1)} placeholder="请输入字段列名" />
              </FormItem>
              <FormItem label="列名3">
                <Input value={colNames[2]} onChange={onColNameChange(2)} placeholder="请输入字段列名" />
              </FormItem>
              <FormItem label="列名4">
                <Input value={colNames[3]} onChange={onColNameChange(3)} placeholder="请输入字段列名" />
              </FormItem>
            </Form>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Button onClick={onSave}>保存</Button>
        </div>
      </div>
    </Page>
  );
};

export default connect(
  state => state.dSourceHome
)(DataSourceHome);
