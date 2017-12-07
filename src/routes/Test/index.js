/**
 * Created by 0291 on 2017/12/7.
 */
import React from 'react';
import { connect } from 'dva';
import { Select, Button, Table } from 'antd';
import Page from '../../components/Page';
import SeriesTree from '../ProductManager/SeriesTree';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import Styles from './index.less';
import DataGrid from './DataGrid';

const Option = Select.Option;

const contentStyle = {
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  padding: 0
};

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name'
}, {
  title: 'Age',
  dataIndex: 'age',
  key: 'age'
}, {
  title: 'Address',
  dataIndex: 'address',
  key: 'address'
}, {
  title: 'Action',
  key: 'action'
}];

const data = [{
  key: '1',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park'
}, {
  key: '2',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park'
}, {
  key: '3',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park'
}];

function Test({
                treeData,
                changeTreeValue,
                queries,
                search
                         }) {
  return (
    <Page title="TEST页" contentStyle={contentStyle}>
      <div className={Styles.wrap}>
        <div className={Styles.left}>
          <SeriesTree
            data={treeData}
            value={queries.productSeriesId}
            onChange={changeTreeValue}
          />
        </div>
        <div className={Styles.right}>
          <Toolbar
            actions={[
              { label: '编辑' },
              { label: '启用' },
              { label: '停用' }
            ]}
          >
            <Select style={{ width: 200 }} value={queries.recStatus ? queries.recStatus + '' : ''} onChange={search.bind(this, 'recStatus')}>
              <Option key="1">启用</Option>
              <Option key="0">停用</Option>
            </Select>
            <Button>生成</Button>
            <Button>导出</Button>
            <Toolbar.Right>
              <Search
                value={queries.searchKey}
                onSearch={search.bind(this, 'searchKey')}
                placeholder="请输入产品名称"
              />
            </Toolbar.Right>
          </Toolbar>
          <DataGrid columns={columns} pagination={true} rowSelection={false} dataSource={data} params={queries} url="/api/products/getproducts" />
        </div>
      </div>
    </Page>
  );
}

export default connect(
  state => state.test,
  dispatch => {
    return {
      changeTreeValue(value) {
        dispatch({ type: 'test/search', payload: { key: 'productSeriesId', value } });
      },
      search(key, value) {
        dispatch({ type: 'test/search', payload: { key, value } });
      }
    };
  }
)(Test);
