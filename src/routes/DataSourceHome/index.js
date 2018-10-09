import React from 'react';
import { Input, Form, Button, Modal } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Page from '../../components/Page';
import styles from './styles.less';
import MobileViewStyleSelect from './MobileViewStyleSelect';
import DragList from '../../components/UKComponent/Data/DragList';
import FormModal from './FormModal';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';

const FormItem = Form.Item;

const DataSourceHome = ({
  dispatch,
  dataSourceName,
  rawDetailData,
  sqlContent,
  mobViewConfig,
                          columnsDataSource
}) => {
  function onSqlContentChange(event) {
    dispatch({ type: 'dSourceHome/sqlContent', payload: event.target.value });
  }
  function onMobViewConfigChange(val) {
    dispatch({ type: 'dSourceHome/mobViewConfig', payload: val });
  }
  function onSave() {
    dispatch({ type: 'dSourceHome/save' });
  }

  function addColumn() {
    dispatch({ type: 'dSourceHome/showModals', payload: 'add' });
  }
  function updateColumn(rowData) {
    dispatch({ type: 'dSourceHome/putState', payload: { showModals: 'edit', editData: rowData } });
  }
  function delColumn(rowData) {
    Modal.confirm({
      title: '确认删除该数据吗？',
      onOk() {
        const newColumnsDataSource = columnsDataSource.filter(item => item.recorder * 1 !== rowData.recorder * 1);
        dispatch({ type: 'dSourceHome/updateColumnsDataSource', payload: newColumnsDataSource });
      }
    });
  }

  function listSortEnd(list) {
    dispatch({ type: 'dSourceHome/updateColumnsDataSource', payload: list });
  }
  const column = [
    {
      key: 'recorder',
      name: '序号',
      span: 7
    },
    {
      key: 'fieldname',
      name: '字段名',
      span: 7
    },
    {
      key: 'displayname',
      name: '显示名',
      span: 7
    },
    {
      key: 'operate',
      name: '操作',
      span: 3,
      render: (text, rowData, rowIndex) => {
        return (
          <div>
            <a onClick={updateColumn.bind(this, rowData)}>编辑</a>
            <a onClick={delColumn.bind(this, rowData)} style={{ marginLeft: '10px' }}>删除</a>
          </div>
        );
      }
    }
  ];

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
            <Button onClick={addColumn} className={styles.addColumn}>新增</Button>
            <DragList dataSource={columnsDataSource}
                      column={column}
                      onSortEnd={listSortEnd}
                      delayDragColumn={['operate']} />
            <FormModal />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button onClick={onSave}>保存</Button>
        </div>
      </div>
    </Page>
  );
};

export default connect(
  state => state.dSourceHome
)(DataSourceHome);
