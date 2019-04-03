import React, { PropTypes, Component } from 'react';
import * as _ from 'lodash';
import { is } from 'immutable';
import { Modal, message, Spin, Button, Tabs, Table } from 'antd';
import Search from '../../../components/Search';
import Toolbar from '../../../components/Toolbar';
import { queryDataSourceData, queryDatasourceInfo } from '../../../services/datasource';
import EntcommAddModal from '../../../components/EntcommAddModal';
import styles from './SelectData.less';
import { queryTypes } from '../../../services/entity';
import { queryPermission } from '../../../services/functions';

const TabPane = Tabs.TabPane;

class DataSourceSelectModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    sourceId: PropTypes.string,
    selected: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string
    })),
    designateDataSource: PropTypes.object,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    multiple: PropTypes.bool
  };
  static defaultProps = {
    visible: false,
    selected: [],
    multiple: true
  };

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
      list: [],
      pageIndex: 1,
      total: 0,
      addModalVisible: false,
      entityTypes: [],
      refEntity: '',
      refEntityName: '',
      allowadd: false,
      columns: [], //控件列定义
      currentTabsKey: '1',
      filterKeyWord: '',
      currentSelected: [...props.selected],
      selectedRows: [...props.selected] //因为antd 表格前的checkbox控件选择时，第二个参数只会记录当前页的选中的值，所有需要记录所有分页的选中的数据
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this.queryDatasourceEntityAndPession(nextProps);
    }
    if (nextProps.visible) {
      this.setState({
        keyword: '',
        currentSelected: [...nextProps.selected],
        selectedRows: [...nextProps.selected], //因为antd 表格前的checkbox控件选择时，第二个参数只会记录当前页的选中的值，所有需要记录所有分页的选中的数据
        pageIndex: 1
      }, this.fetchList.bind(this, nextProps));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  queryDatasourceEntityAndPession = (props) => {
    const sourceId = props.sourceId;
    if (sourceId) {
      queryDatasourceInfo(sourceId).then(result => { //获取数据源关联实体
        const entityId = result.data.entityid;
        const entityname = result.data.entityname;
        if (entityId) {
          queryPermission(entityId).then(perssionResult => {
            const hasAddPermission = _.find(perssionResult.data, item => item.funccode === 'EntityDataAdd');
            if (hasAddPermission) { //先查看 用户是否有 新增该数据源数据的权限 再判断该数据源表单字段是否支持 快速新增 数据源数据的功能
              if (props.allowadd) {
                this.queryEntityTypes(entityId);
              }
              this.setState({
                allowadd: props.allowadd,
                refEntity: entityId,
                refEntityName: entityname
              });
            }
          });
        }
      });
    }
  }

  queryEntityTypes = (entityId) => { //支持快速新增的情况下  查询 实体类型
    queryTypes({ entityId: entityId }).then(result => {
      const entityTypes = result.data.entitytypepros;
      this.setState({
        entityTypes
      });
    }, err => { });
  }

  fetchList = (props = this.props) => {
    this.setState({ loading: true });
    const params = {
      sourceId: props.sourceId,
      keyword: this.state.keyword,
      pageSize: 10,
      pageIndex: this.state.pageIndex,
      queryData: []
    };
    const { designateDataSource } = props;
    if (designateDataSource && typeof designateDataSource === 'object') {
      Object.keys(designateDataSource).forEach(key => {
        params.queryData.push({
          [key]: designateDataSource[key],
          islike: 0
        });
      });
    }

    queryDataSourceData(params).then(result => {
      if (result.data.dsconfig) {
        const columnsConfig = result.data.dsconfig[0] && result.data.dsconfig[0].columns;
        if (columnsConfig) {
          const columns = JSON.parse(columnsConfig);
          const tableColumns = columns instanceof Array && columns.map(item => {
            return {
              key: item.fieldname,
              dataIndex: item.fieldname,
              title: item.displayname
            };
          });
          this.setState({
            columns: tableColumns
          });
        } else {
          message.error('缺少必要字段');
        }
      }
      const list = result.data.page;
      const total = result.data.pagecount[0].total;
      this.setState({ loading: false, list, total });
    }, err => {
      this.setState({ loading: false });
      message.error(err.message || '加载数据失败');
    });
  };

  handleOk = () => {
    const selected = this.state.currentSelected.map(
      item => ({ id: item.id, name: item.name })
    );
    if (selected.length === 0) {
      message.error('请先选择数据');
      return false;
    }
    this.props.onOk(selected);
  };

  onSearch = keyword => {
    if (this.state.currentTabsKey === '1') {
      this.setState({ keyword, pageIndex: 1 }, this.fetchList);
    } else {
      this.setState({
        filterKeyWord: keyword
      });
    }
  };

  tabsKeyChange = (key) => {
    this.setState({
      currentTabsKey: key
    });
  }

  handleTableChange = (pagination) => {
    this.setState({ pageIndex: pagination.current }, this.fetchList);
  }

  onSelectItems = (keys, selectedRows) => {
    //因为selectedRows只会记录当前页选中的数据  则需存储所有选择过的数据 然后配合key选出当前所有页选中的数据
    const allData = _.uniqBy([...this.state.selectedRows, ...selectedRows], 'id');
    const currentSelected = allData.filter(item => keys.indexOf(item.id) > -1);
    this.setState({
      currentSelected: currentSelected,
      selectedRows: allData
    });
  }

  tableRowDoubleClick = (record) => {
    if (!this.props.multiple) { //单选支持 双击点击单行 确定选择
      this.props.onOk([record]);
    }
  }

  removeCurentItems = (record) => { //移除 已选列表中  的数据
    const currentSelected = this.state.currentSelected.filter(item => item.id !== record.id);
    this.setState({
      currentSelected: currentSelected
    });
  }

  addDataSource = () => {
    this.setState({
      addModalVisible: true
    });
  }

  onAddModalCanel = () => {
    this.setState({
      addModalVisible: false
    });
  }

  onAddModalDone = () => {
    this.setState({
      addModalVisible: false
    }, this.fetchList);
  }

  render() {
    const { visible, onCancel, multiple } = this.props;
    const { currentSelected, allowadd, list } = this.state;
    const filterSelectedItems = currentSelected.filter(item => item.name.indexOf(this.state.filterKeyWord) > -1);

    const alreadyColumns = [
      ...this.state.columns,
      {
        key: 'operate',
        dataIndex: 'operate',
        title: '操作',
        render: (text, record) => {
          return <a onClick={this.removeCurentItems.bind(this, record)}>删除</a>;
        }
      }
    ];

    return (
      <Modal
        title="请选择"
        width={700}
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        wrapClassName="dataSourceSelectModal"
      >
        <Toolbar style={{ position: 'absolute', zIndex: 9 }}>
          <Search
            width="220px"
            value={this.state.currentTabsKey === '1' ? this.state.keyword : this.state.filterKeyWord}
            onSearch={this.onSearch}
            placeholder="请输入关键字"
          >
            搜索
          </Search>
          {
            allowadd ? <Button onClick={this.addDataSource}>新增</Button> : null
          }
        </Toolbar>
        <Tabs defaultActiveKey="1" onChange={this.tabsKeyChange}>
          <TabPane tab="可选" key="1">
            <Spin spinning={this.state.loading}>
              <Table columns={this.state.columns}
                dataSource={list}
                onRowDoubleClick={this.tableRowDoubleClick}
                pagination={{
                  total: this.state.total,
                  pageSize: 10,
                  current: this.state.pageIndex,
                  showSizeChanger: false
                }}
                onChange={this.handleTableChange}
                rowSelection={{
                  type: multiple ? 'checkbox' : 'radio',
                  selectedRowKeys: currentSelected.map(item => item.id),
                  onChange: (keys, items) => this.onSelectItems(keys, items)
                }}
                rowKey="id" />
            </Spin>
          </TabPane>
          <TabPane tab="已选" key="2">
            <Table columns={alreadyColumns}
              dataSource={filterSelectedItems}
              pagination={false}
              rowKey="id" />
          </TabPane>
        </Tabs>
        <EntcommAddModal
          visible={this.state.addModalVisible}
          entityId={this.state.refEntity}
          entityName={this.state.refEntityName}
          entityTypes={this.state.entityTypes}
          cancel={this.onAddModalCanel}
          done={this.onAddModalDone}
        />
      </Modal>
    );
  }
}

export default DataSourceSelectModal;
