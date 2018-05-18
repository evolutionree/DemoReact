/**
 * Created by 0291 on 2018/5/18.
 */
import React from 'react';
import { Form, Select, Input, Radio, Checkbox, message, Icon, Modal, Table } from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './RelBusDataSource.less';

const Option = Select.Option;
class RelBusDataSource extends React.Component {
  static propTypes = {
    value: React.PropTypes.oneOfType([
      React.PropTypes.shape({
        type: React.PropTypes.oneOf(['local', 'network']),
        // sourceKey: React.PropTypes.string,
        sourceId: React.PropTypes.string
      }),
      React.PropTypes.shape({
        sourceId: React.PropTypes.string,
        sourceName: React.PropTypes.string,
        entityId: React.PropTypes.string,
        entityName: React.PropTypes.string
      })
    ]),
    onChange: React.PropTypes.func,
    multiple: React.PropTypes.bool
  };

  static defaultProps = {
    multiple: false
  };

  constructor(props) {
    super(props);
    this.state = {
      options: [],
      currItems: [],
      formItemValue: this.props.value
    };
    this.fetchOptions();
  }

  componentWillReceiveProps(nextprops) {
    this.setState({
      formItemValue: nextprops.value
    });
  }

  fetchOptions = () => {
    // const params = {
    //   datasourcename: '',
    //   recstatus: 1,
    //   pageindex: 1,
    //   pagesize: 999
    // };
    // queryDataSource(params).then(result => {
    //   const options = result.data.pagedata.map(item => ({
    //     id: item.datasourceid + '',
    //     label: item.datasourcename,
    //     entityId: item.entityid,
    //     entityName: item.entityname
    //   }));
    //   this.setState({ options: options.filter(item => item.entityId) }); //过滤掉没有entityid 的数据
    // });
  };

  showModal = () => {
    this.props.onFocus && this.props.onFocus();
    if (this.props.isReadOnly === 1) return;
    this.setState({ modalVisible: true });
  };

  iconClearHandler = (e) => {
    e.stopPropagation();
    this.props.onChange();
  };

  parseValue = () => {
    // const users = [];
    // const { userNameMap } = this.state;
    // let { value } = this.props;
    // if (typeof value === 'number') value += '';
    // if (value) {
    //   value.split(',').forEach(userId => {
    //     users.push({
    //       id: +userId,
    //       name: userNameMap[userId] || ''
    //     });
    //   });
    // }
    // return {
    //   users,
    //   text: users.map(u => u.name).join(',')
    // };
    return {
      text: 'test'
    }
  };

  onSelectDataSource = (index, value) => {
    let newFormItemValue = _.cloneDeep(this.state.formItemValue);
    newFormItemValue[index].sourceid = value;
    this.setState({
      formItemValue: newFormItemValue
    });
  }

  handleChange = () => {
    this.props.onChange && this.props.onChange(this.state.formItemValue);
    this.setState({
      modalVisible: false
    });
  };

  onCancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  render() {
    const { text } = this.parseValue();
    const cls = classnames([styles.wrap, {
      [styles.empty]: !text,
      [styles.disabled]: this.props.isReadOnly === 1
    }]);
    const iconCls = classnames([styles.iconClose, {//非禁用状态且有值得时候  支持删除操作
      [styles.iconCloseShow]: text !== '' && this.props.isReadOnly !== 1
    }]);

    const option = [{text: '所属商机', value: '0'}, {text: '所属客户', value: '1'}]
    const columns = [{
      title: '实体',
      dataIndex: 'entityid'
    }, {
      title: '数据源',
      dataIndex: 'sourceid',
      width: 260,
      render: (text, record, index) => {
        return (
          <Select style={{ width: '100%' }} onChange={this.onSelectDataSource.bind(this, index)} value={(this.state.formItemValue[index] && this.state.formItemValue[index].sourceid) || option[0].value}>
            {
              option.map((item, itemIndex) => {
                return <Option value={item.value} key={itemIndex}>{item.text}</Option>;
              })
            }
          </Select>
        );
      }
    }];

    const dataSource = [{
      key: '1',
      entityid: '客户',
      sourceid: '0'
    }, {
      key: '2',
      entityid: '商机',
      sourceid: '1'
    }];

    return (
      <div className={cls} style={{ ...this.props.style }}>
        <div className="ant-input" onClick={this.showModal} title={text}>
          {
            text || this.props.placeholder
          }
          <Icon type="close-circle" className={iconCls} onClick={this.iconClearHandler} />
        </div>
        <Modal
          title="选择"
          visible={this.state.modalVisible}
          onOk={this.handleChange}
          onCancel={this.onCancel}
        >
          <Table rowSelection={{
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                currItems: selectedRows
              });
            },
            selectedRowKeys: this.state.currItems.map(item => item.key)
          }} columns={columns} dataSource={dataSource} pagination={false} />
        </Modal>
      </div>
    );
  }
}

export default RelBusDataSource;
