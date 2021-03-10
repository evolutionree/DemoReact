import React, { Component } from 'react';
import { Modal, Table, Select, Button, Popconfirm, message, Input } from 'antd';
import { randomStr } from '../../../../utils';
import CodeEditor from '../../../../components/CodeEditor';
import { queryFields, savenestedtablesentity } from '../../../../services/entity';

const Option = Select.Option;

const requireKey = [
  { name: 'sourcefieldid', text: '来源字段' }, 
  { name: 'nestedtablesfieldid', text: '来源表格字段' },
  { name: 'btn', text: '按钮名称' },
  { name: 'sourceagreement', text: '来源协议' }
];

class PickerModal extends Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      selList: []
    };
    this.fieldObj = {};
  }

  componentWillReceiveProps(nextProps) {
    const thisVisible = this.props.visible;
    const nextVisible = nextProps.visible;
    const isOpening = !thisVisible && nextVisible;
    const isClosing = thisVisible && !nextVisible;
    if (isOpening) {
      const { fieldList, openPickItem } = nextProps;
      const selList = fieldList.filter(f => f.controltype === 18);
      const nested = openPickItem.fieldconfig.nested || [];
      // console.log(openPickItem, nested);
      if (nested.length) {
        this.setState({ openLoading: true });
        const items = [];
        const promises = [];
        nested.forEach(n => {
          items.push({ ...n, id: randomStr() });
          promises.push(queryFields(n.sourceentityid));
          Promise.all(promises).then(res => {
            res.forEach((r, i) => {
              const list = r.data.entityfieldpros;
              this.fieldObj[items[i].sourceentityid] = list.filter(f => f.controltype === 24);
            });
            this.setState({ selList, items, openLoading: false });
          });
        });
      } else {
        this.setState({ selList });
      }
    }
    if (isClosing) {
      this.setState({ items: [] });
    }
  }

  handleOk = async () => {
    this.setState({ modalPending: true });
    const { openPickItem: { fieldid }, dispatch } = this.props;
    const { items } = this.state;

    const hasValidateError = [];
    const nestedtables = items.map((v, i) => {
      const item = { ...v };
      delete item.id;
      if (!hasValidateError.length) {
        requireKey.forEach(r => {
          if (!item[r.name]) hasValidateError.push({ ...r, index: i + 1 });
        });
      }
      return item;
    });

    if (hasValidateError.length) {
      const warnText = hasValidateError.map(h => h.text).join('、');
      const warnIndex = hasValidateError[0].index;
      message.warn(`请输入第${warnIndex}项${warnText}的值`);
      this.setState({ modalPending: false });
      return;
    }
    
    try {
      const res = await savenestedtablesentity({ fieldid, nestedtables });
      if (res.error_code === 0) {
        message.success('保存成功！');
        dispatch({ type: 'entityFields/query' }); // 刷新列表
        this.setState({ modalPending: false }, this.handleCancel);
      } else {
        this.setState({ modalPending: false });
      }
    } catch (err) {
      console.log(err);
      this.setState({ modalPending: false });
    }
  };

  handleCancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  addItem = () => {
    const { items } = this.state;
    const newItems = items.concat();
    newItems.push({ id: randomStr() });
    this.setState({ items: newItems });
  }

  itemChange = async (index, key, value) => {
    const { items } = this.state;
    const { fieldList } = this.props;
    const newItems = items.concat();
    const target = { ...items[index], [key]: value };
    if (key === 'sourcefieldid') {
      const field = fieldList.find(f => f.fieldid === value);
      target.sourceentityid = field.fieldconfig.dataSource.entityid;
      target.sourcefieldname = field.fieldname;
      target.sourcedisplayname = field.displayname;
      if (!this.fieldObj[target.sourceentityid]) {
        const res = await queryFields(target.sourceentityid);
        const list = res.data.entityfieldpros;
        const sList = list.filter(f => f.controltype === 24);
        this.fieldObj[target.sourceentityid] = sList;
      }
      // 默认第二列的第一项
      const sField = this.fieldObj[target.sourceentityid][0] || { fieldconfig: {} };
      target.nestedtablesfieldid = sField.fieldid;
      target.nestedtablesentityid = sField.fieldconfig.entityId;
      target.btn = sField.displayname;
    } else if (key === 'nestedtablesfieldid') {
      const field = this.fieldObj[target.sourceentityid].find(f => f.fieldid === value);
      target.nestedtablesentityid = field.fieldconfig.entityId;
      target.btn = field.displayname;
    } else if (key === 'filterjs' || key === 'acceptjs') {
      this.editJS(); // 关闭弹窗
    }
    newItems[index] = target;
    this.setState({ items: newItems }); 
  }

  editJS = (editJS) => {
    this.setState({ editJS });
  }

  editJSChange = (value) => {
    const { editJS } = this.state;
    this.setState({ editJS: { ...editJS, value } });
  }

  onDeleteItem = (index) => {
    const { items } = this.state;
    const newItems = items.concat();
    newItems.splice(index, 1);
    this.setState({ items: newItems });
  }

  render() {
    const { items, editJS, selList, modalPending, openLoading } = this.state;
    const { visible, flag } = this.props;
    const columns = [
      {
        title: '序号',
        key: 'id',
        render: (text, record, index) => <span>{index + 1}</span>
      }, 
      {
        title: '来源字段',
        dataIndex: 'sourcefieldid',
        key: 'sourcefieldid',
        render: (text, record, index) => (
          <Select 
            placeholder={'请选择字段'}
            style={{ width: '100%', minWidth: '120px' }} 
            onChange={(v) => this.itemChange(index, 'sourcefieldid', v)} 
            value={text}
          >
            {selList.map(l => (
              <Option 
                key={l.fieldid} 
                value={l.fieldid}
                // disabled={items.some(v => v.sourcefieldid === l.fieldid)}
              >{l.displayname}</Option>
            ))}
          </Select>
        )
      }, 
      {
        title: '来源表格字段',
        dataIndex: 'nestedtablesfieldid',
        key: 'nestedtablesfieldid',
        render: (text, record, index) => (
          <Select 
            placeholder={'请选择字段'}
            style={{ width: '100%', minWidth: '120px' }} 
            onChange={(v) => this.itemChange(index, 'nestedtablesfieldid', v)} 
            value={text}
          >
            {record.sourceentityid && this.fieldObj[record.sourceentityid] && this.fieldObj[record.sourceentityid].map(l => (
              <Option 
                key={l.fieldid} 
                value={l.fieldid}
              >{l.displayname}</Option>
            ))}
          </Select>
        )
      }, 
      {
        title: '来源协议',
        dataIndex: 'sourceagreement',
        key: 'sourceagreement',
        render: (text, record, index) => (
          <Select 
            placeholder={'请选择来源'}
            style={{ width: '100%', minWidth: '110px' }} 
            onChange={(v) => this.itemChange(index, 'sourceagreement', v)} 
            value={text}
          >
            <Option value={1}>源协议</Option>
            <Option value={2}>目标协议</Option>
          </Select>
        )
      }, 
      {
        title: 'Url',
        dataIndex: 'url',
        key: 'url',
        render: (text, record, index) => (
          <Input 
            placeholder={'请输入链接'}
            style={{ width: '100%', minWidth: '180px' }} 
            onChange={(v) => this.itemChange(index, 'url', v.target.value)} 
            value={text}
          />
        )
      },
      {
        title: '按钮名称',
        dataIndex: 'btn',
        key: 'btn',
        render: (text, record, index) => (
          <Input 
            placeholder={'请输入名称'}
            style={{ width: '100%' }} 
            onChange={(v) => this.itemChange(index, 'btn', v.target.value)} 
            value={text}
          />
        )
      },
      {
        title: '数据过滤JS',
        dataIndex: 'filterjs',
        key: 'filterjs',
        render: (value, record, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              <a 
                href="javascript:;" 
                onClick={() => this.editJS({ index, key: 'filterjs', value })}
              >编辑</a> &nbsp;
              {value ? flag : null}
            </div>
          );
        }
      },
      {
        title: '数据接收JS',
        dataIndex: 'acceptjs',
        key: 'acceptjs',
        render: (value, record, index) => {
          return (
            <div style={{ textAlign: 'center' }}>
              <a 
                href="javascript:;" 
                onClick={() => this.editJS({ index, key: 'acceptjs', value })}
              >编辑</a> &nbsp;
              {value ? flag : null}
            </div>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        render: (text, record, index) => (
          <Popconfirm 
            title="是否确定删除该配置项" 
            onConfirm={() => this.onDeleteItem(index)}  
            okText="确定" 
            cancelText="取消"
          >
            <a href="javascript:;" >删除</a>
          </Popconfirm>
        )
      }
    ];
    return (
      <Modal
        title={'选单'}
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={modalPending}
        onCancel={this.handleCancel}
        width={'80vw'}
      >
        <Button type="primary" onClick={this.addItem} style={{ marginBottom: '12px' }} >增加</Button>
        <Table 
          dataSource={items} 
          columns={columns}
          rowKey={'id'}
          loading={openLoading}
          pagination={false}
        />
        {editJS && (
          <Modal
            title={'配置脚本'}
            visible={!!editJS}
            onOk={() => this.itemChange(editJS.index, editJS.key, editJS.value)}
            onCancel={() => this.editJS()}
            wrapClassName="code-editor-modal"
            width={'65vw'}
          >
            <CodeEditor
              style={{ height: '75vh' }}
              value={editJS.value}
              onChange={this.editJSChange}
            />
          </Modal>
        )}
      </Modal>
    );
  }
}

export default PickerModal;
