import React from 'react';
import { Table, Select, Button, Form, DatePicker, Input } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { Link } from 'dva/router';
import Page from '../../components/Page';
import Toolbar from '../../components/Toolbar';
import Search from '../../components/Search';
import NewAffairModal from './NewAffairModal';

const Column = Table.Column;
const Option = Select.Option;

class InputWithInitValue extends React.Component {
  static propTypes = {
    initValue: React.PropTypes.string
  };
  static defaultProps = {
    initValue: ''
  };
  constructor(props) {
    super(props);
    this.state = { value: props.initValue };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.initValue !== this.props.initValue) {
      this.setState({ value: nextProps.initValue });
    }
  }
  getValue = () => this.state.value;
  render() {
    const { initValue, ...rest } = this.props;
    return <Input value={this.state.value} onChange={evt => this.setState({ value: evt.target.value })} {...rest} />;
  }
}

function EntcommList({
    dispatch,
    entityName,
    menus,
    protocol,
    queries: {
      menuId,
      auditStatus,
      searchBegin,
      searchEnd,
      // keyword,
      flowName,
      creatorName,
      pageIndex,
      pageSize
    },
    list,
    total,
    currItems
  }) {
  function selectItems(items) {
    dispatch({ type: 'affairList/currItems', items });
  }
  function search(payload) {
    dispatch({ type: 'affairList/search', payload });
  }
  function openAdd() {
    dispatch({ type: 'affairList/showModals', payload: 'add' });
  }
  function handleSearchClick() {
    const fn = flowNameInput.getValue();
    const cn = creatorNameInput.getValue();
    search({ flowName: fn, creatorName: cn });
  }
  let flowNameInput;
  let creatorNameInput;

  const inputStyle = {
    width: '120px',
    marginRight: '8px'
  };

  return (
    <Page title="审批申请">
      <Toolbar
        selectedCount={currItems.length}
      >
        <Select style={{ minWidth: '110px' }} value={menuId} onChange={val => search({ menuId: val })}>
          {menus.map(menu => (
            <Option key={menu.menuId}>{menu.menuName}</Option>
          ))}
        </Select>&nbsp;
        <span>状态</span>
        <Select style={{ minWidth: '110px' }} value={auditStatus} onChange={val => search({ auditStatus: val })}>
          <Option key="0">审批中</Option>
          <Option key="1">通过</Option>
          <Option key="2">不通过</Option>
          <Option key="-1">全部</Option>
        </Select>&nbsp;&nbsp;
        <span>提交时间</span>&nbsp;
        <DatePicker
          style={{ width: '125px', marginRight: '5px' }}
          placeholder="开始日期"
          value={searchBegin ? moment(searchBegin, 'YYYY-MM-DD') : undefined}
          onChange={(date, dateStr) => {
            search({ searchBegin: date ? moment(date).format('YYYY-MM-DD') : '' });
          }}
        />
        <DatePicker
          style={{ width: '125px' }}
          placeholder="结束日期"
          value={searchEnd ? moment(searchEnd, 'YYYY-MM-DD') : undefined}
          onChange={(date, dateStr) => {
            search({ searchEnd: date ? moment(date).format('YYYY-MM-DD') : '' });
          }}
        />
        <Button onClick={openAdd}>新增</Button>
        <Toolbar.Right>
          {/*<Search*/}
            {/*placeholder="流程名称、申请人姓名"*/}
            {/*value={keyword}*/}
            {/*onSearch={val => search({ keyword: val })}*/}
          {/*>*/}
            {/*搜索*/}
          {/*</Search>*/}
          <InputWithInitValue style={inputStyle} initValue={flowName} ref={ref => flowNameInput = ref} placeholder="流程名称" />
          <InputWithInitValue style={inputStyle} initValue={creatorName} ref={ref => creatorNameInput = ref} placeholder="申请人姓名" />
          <Button onClick={handleSearchClick}>搜索</Button>
        </Toolbar.Right>
      </Toolbar>
      <Table
        rowKey="caseid"
        dataSource={list}
        total={total}
        pagination={{
          total,
          pageSize,
          current: pageIndex,
          onChange: val => search({ pageIndex: val }),
          onShowSizeChange: (curr, size) => search({ pageSize: size })
        }}
        rowSelection={{
          selectedRowkeys: currItems.map(item => item.caseid),
          onChange: (keys, items) => selectItems(items)
        }}
      >
        <Column title="流水号" key="reccode" dataIndex="reccode" render={(text, record) => (
          <Link to={`/affair/${record.caseid}`}>{text}</Link>
        )} />
        <Column title="流程名称" key="flowname" dataIndex="flowname" />
        <Column title="申请人" key="reccreator_name" dataIndex="reccreator_name" />
        <Column title="步骤/处理人" key="handleuser_name" dataIndex="handleuser_name" />
        <Column title="状态" key="auditstatus_name" dataIndex="auditstatus_name" />
        <Column title="最新处理时间" key="recupdated" dataIndex="recupdated" />
        <Column title="提交时间" key="reccreated" dataIndex="reccreated" />
      </Table>
      <NewAffairModal />
    </Page>
  );
}

export default connect(
  state => state.affairList
)(EntcommList);
