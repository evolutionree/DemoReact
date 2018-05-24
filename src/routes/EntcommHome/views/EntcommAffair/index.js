/**
 * Created by 0291 on 2018/5/23.
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Select, Button, DatePicker, Input } from 'antd';
import Toolbar from '../../../../components/Toolbar';
import moment from 'moment';

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


function EntcommAffair({
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
                           pageSize,
                           title
                         },
                         list,
                         total
                        }) {
  function search(payload) {
    dispatch({ type: 'entcommAffair/search', payload });
  }

  function handleSearchClick() {
    const fn = flowNameInput.getValue();
    const cn = creatorNameInput.getValue();
    const tn = titleNameInput.getValue();
    search({ flowName: fn, creatorName: cn, title: tn });
  }
  let flowNameInput;
  let creatorNameInput;
  let titleNameInput;

  const inputStyle = {
    width: '120px',
    marginRight: '8px'
  };
  return (
    <div>
      <Toolbar>
        <Select style={{ minWidth: '110px' }} value={menuId} onChange={val => search({ menuId: val })}>
          {menus.map(menu => (
            <Option key={menu.menuId}>{menu.menuName}</Option>
          ))}
        </Select>&nbsp;
        <span>状态</span>
        <Select style={{ minWidth: '110px' }} value={auditStatus} onChange={val => search({ auditStatus: val })}>
          <Option key="-1">全部</Option>
          <Option key="0">审批中</Option>
          <Option key="1">通过</Option>
          <Option key="2">不通过</Option>
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
          <InputWithInitValue style={inputStyle} initValue={title} ref={ref => titleNameInput = ref} placeholder="搜索主题" />
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
      >
        <Column title="流水号" key="reccode" dataIndex="reccode" />
        <Column title="流程名称" key="flowname" dataIndex="flowname" />
        <Column title="审批主题" key="title" dataIndex="title" />
        <Column title="申请人" key="reccreator_name" dataIndex="reccreator_name" />
        <Column title="步骤/处理人" key="handleuser_name" dataIndex="handleuser_name" />
        <Column title="状态" key="auditstatus_name" dataIndex="auditstatus_name" />
        <Column title="最新处理时间" key="recupdated" dataIndex="recupdated" />
        <Column title="提交时间" key="reccreated" dataIndex="reccreated" />
      </Table>
    </div>
  );
}

export default connect(
  state => state.entcommAffair,
  dispatch => {
    return {
      dispatch
    };
  }
)(EntcommAffair);
