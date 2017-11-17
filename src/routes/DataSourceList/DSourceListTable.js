import React from 'react';
import { Link } from 'dva/router';
import { Table, Menu, Dropdown, Button, Icon, Modal } from 'antd';

const SystemRole = 0;

function DSourceListTable(props) {
  function handleMenuClick(record, e) {
    if (e.key === '1') {
      onEdit(record);
    } else {
      Modal.confirm({
        title: '您确定删除该记录吗？',
        onOk() {
          onDel(record);
        }
      });
    }
  }

  const { onEdit, onDel } = props;

  const columns = [{
    title: '数据源名称',
    dataIndex: 'sourcename',
    key: 'sourcename',
    render: (text, record) => {
      return <Link to={`/dsource/${record.id}`}>{text}</Link>;
    }
  }, {
    title: '类型',
    dataIndex: 'groupname',
    key: 'groupname'
  }, {
    title: '状态',
    dataIndex: 'roleremark',
    key: 'roleremark'
  }, {
    title: '描述',
    dataIndex: 'roleremark2',
    key: 'roleremark2'
  }, {
    title: '操作',
    key: 'operation',
    width: 100,
    render: (text, record) => {
      if (record.roletype === SystemRole) return '';
      const menu = (
        <Menu onClick={(e) => handleMenuClick(record, e)}>
          <Menu.Item key="1">编辑</Menu.Item>
          <Menu.Item key="2">删除</Menu.Item>
        </Menu>
      );
      return (
        <Dropdown overlay={menu}>
          <Button style={{ border: 'none' }}>
            <Icon style={{ marginRight: 2 }} type="bars" />
            <Icon type="down" />
          </Button>
        </Dropdown>
      );
    }
  }];

  const paginationOpts = {
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: val => `共${val}条记录`,
    ...props.pagination
  };

  return (
    <Table columns={columns}
           rowKey="roleid"
           pagination={paginationOpts}
           {...props} />
  );
}

export default DSourceListTable;
