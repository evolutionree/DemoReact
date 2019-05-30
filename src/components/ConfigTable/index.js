import React, { Component } from 'react';
import { Table } from 'antd';
import { getColumns } from './columns';
import { Option } from './formData';
import { LoopList } from './columns/columns';

const initClientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
const tableDomWdith = document.body.offsetWidth && document.documentElement.clientWidth - 300;

class ConfigTable extends Component {
  constructor(props) {
    super(props);
    const selectedRowKeys = props.selectedRows && props.rowKey ? props.selectedRows.map(o => o[props.rowKey]) : [];

    this.state = {
      clientHeight: initClientHeight,
      FilterVisibles: {},
      selectedRowKeys,
      selectedRows: props.selectedRows || [],
      OptionList: Option
    };
    this.tableWidth = 1080;
    this.onWindowResize = this.onWindowResize.bind(this);
  }

  setStateAsync = state => new Promise(resolve => this.setState(state, resolve));

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize, false);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize, false);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedRows: oldRows, rowKey } = this.props;
    const { selectedRows: newRows } = nextProps;

    if (Array.isArray(newRows) && (oldRows !== newRows)) {
      const selectedRowKeys = newRows.map(o => o[rowKey]);
      this.setState({ selectedRowKeys, selectedRows: newRows });
    }
  }

  onWindowResize() {
    const clientHeight = document.body.offsetHeight && document.documentElement.clientHeight;
    this.setState({ clientHeight });
  }

  importTableParmas() {
    const { initParams: { searchOrder, columnFilter } } = this.props;
    const { FilterVisibles } = this.state;
    const toggleFilter = this.toggleFilter;
    const onFilter = this.onFilter;
    return { onFilter, toggleFilter, columnFilter, FilterVisibles, searchOrder };
  }

  // 设置过滤值
  onFilter = async (fieldname, value) => {
    const { onSeach, initParams } = this.props;
    const { FilterVisibles } = this.state;

    const newFilterVisibles = {
      ...FilterVisibles,
      [fieldname]: false
    };
    await this.setStateAsync({ FilterVisibles: newFilterVisibles });

    const newcolumnFilter = {
      ...initParams.columnFilter,
      [fieldname]: value
    };
    onSeach({ ...initParams, columnFilter: newcolumnFilter });
  }

  // 控制过滤组件
  toggleFilter = (fieldname, value) => {
    const { FilterVisibles } = this.state;
    const newFilters = { ...FilterVisibles };
    Object.keys(newFilters).forEach(info => newFilters[info] = false);
    newFilters[fieldname] = value;
    this.setState({ FilterVisibles: newFilters });
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { onSeach, initParams } = this.props;
    const searchOrder = sorter.field ? (sorter.field + (sorter.order === 'ascend' ? ' asc' : ' desc')) : '';
    const newPramas = {
      ...initParams,
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      searchOrder
    };
    onSeach(newPramas);
  }

  onSelectListChange = async (selectedRowKeys, selectedRows) => {
    const { CBSelectRow } = this.props;

    await this.setStateAsync({ selectedRowKeys, selectedRows });
    if (CBSelectRow) CBSelectRow(selectedRows);
  }

  onSelectAllListChange = async (selected, selectedRows) => {
    const { rowKey, CBSelectRow } = this.props;
    const selectedRowKeys = selectedRows.map(o => o[rowKey]);

    await this.setStateAsync({ selectedRowKeys, selectedRows });
    if (CBSelectRow) CBSelectRow(selectedRows);
  }

  render() {
    const {
      dataSource, rowKey = 'recid', columns: propColumns,
      rowSelect, rowSelection, pwidth = tableDomWdith
    } = this.props;
    const { selectedRowKeys, clientHeight } = this.state;

    const screenHeight = clientHeight;
    const modalHeight = screenHeight * 0.7;
    const Div1Height = 15;
    const Div2Height = 50;
    const Div3Height = modalHeight - Div1Height - Div2Height;

    const columnParams = this.importTableParmas();
    const columns = getColumns(columnParams, (propColumns || LoopList), width => this.tableWidth = width);

    return (
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        onChange={this.handleTableChange}
        scroll={{
          x: (pwidth > this.tableWidth ? '100%' : (rowSelect ? this.tableWidth + 62 : this.tableWidth)),
          y: Div3Height - 130
        }}
        rowSelection={rowSelect ? {
          selectedRowKeys,
          onChange: this.onSelectListChange,
          onSelectAll: this.onSelectAllListChange,
          ...rowSelection
        } : null}
      />
    );
  }
}

export default ConfigTable;
