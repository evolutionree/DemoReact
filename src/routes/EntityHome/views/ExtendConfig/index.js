/**
 * Created by 0291 on 2018/5/11.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Button, Row, Col, Menu, Input, message } from 'antd';
import ConfigTable from './component/ConfigTable';
import RadioGroupWrap from './component/RadioGroupWrap';
import InputGroupWrap from './component/InputGroupWrap';
import _ from 'lodash';
import Styles from './index.less';

const MenuItem = Menu.Item;
class ExtendConfig extends Component {
  static propTypes = {
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  handleSave = () => {
    this.props.dispatch({ type: 'extendconfig/submitfuncconfig' });
  };

  handleMenuSelect = ({ key }) => {
    this.props.dispatch({ type: 'extendconfig/selectMenu', payload: key });
  }


  modifyReplaceFuncname = (index, e) => {
    const { currentMenu, functionconfig } = this.props;
    let cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.funcevent[currentMenu][index].funcname = e.target.value;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  addRow =() => {
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.acconfig.push({
      routepath: '',
      front: {
        routepath: '',
        implementtype: -1
      },
      end: {
        routepath: '',
        implementtype: -1
      }
    });
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  radiogroupChange = (type, index, value) => {
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.acconfig[index][type].implementtype = value;
    cloneFunctionconfig.acconfig[index][type].assemblyname = '';
    cloneFunctionconfig.acconfig[index][type].classtypename = '';
    cloneFunctionconfig.acconfig[index][type].funcname = '';
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  modifyAcconfigRoutepate = (index, e) => {
    const apiArray = ['api/dynamicentity/add', 'api/dynamicentity/edit', 'api/dynamicentity/delete'];
    if (apiArray.indexOf(e.target.value) > -1) {
      return message.error('禁止填写' + e.target.value);
    }
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.acconfig[index].routepath = e.target.value;
    cloneFunctionconfig.acconfig[index].front.routepath = e.target.value;
    cloneFunctionconfig.acconfig[index].end.routepath = e.target.value;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  modifyAcconfigFuncname = (index, type, e) => {
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.acconfig[index][type].funcname = e.target.value;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  modifyAcconfigInput = (index, type, fieldName, value) => {
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.acconfig[index][type][fieldName] = value;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  delAcconfig = (index) => {
    const { functionconfig } = this.props;
    let cloneFunctionconfig = _.cloneDeep(functionconfig);
    let newAcconfig = cloneFunctionconfig.acconfig.filter((item, itemIndex) => {
      return itemIndex !== index;
    });
    cloneFunctionconfig.acconfig = newAcconfig;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }


  addExtfunction = () => {
    const { functionconfig } = this.props;
    const cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.extfunction.push({});
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  extInputChange = (index, type, e) => {
    const { functionconfig } = this.props;
    let cloneFunctionconfig = _.cloneDeep(functionconfig);
    cloneFunctionconfig.extfunction[index][type] = e.target.value;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  delExt = (index) => {
    const { functionconfig } = this.props;
    let cloneFunctionconfig = _.cloneDeep(functionconfig);
    let newExtfunction = cloneFunctionconfig.extfunction.filter((item, itemIndex) => {
      return itemIndex !== index;
    });
    cloneFunctionconfig.extfunction = newExtfunction;
    this.props.dispatch({ type: 'extendconfig/modifyFuncionConfig', payload: cloneFunctionconfig });
  }

  render() {
    const { entityType, menus, currentMenu, functionconfig } = this.props;
    if (!functionconfig) {
      return null;
    }
    const showMenu = entityType === '0';

    const funcreplaceColumns = [
      {
        title: '功能',
        dataIndex: 'operatetype',
        width: 200,
        render: (text, record, index) => { //0新增 1修改 2详情 3列表 4删除
          const operatetype = {
            0: '新增',
            1: '修改',
            2: '详情',
            3: '列表',
            4: '删除'
          }
          return <span>{operatetype[text]}</span>;
        }
      },
      {
        title: '替换函数',
        dataIndex: 'funcname',
        render: (text, record, index) => <Input type='text' onChange={this.modifyReplaceFuncname.bind(this, index)} value={text} />
      }
    ];

    const apiArray = ['api/dynamicentity/add', 'api/dynamicentity/edit', 'api/dynamicentity/delete'];
    const acconfigColumns = [
      { title: '功能', dataIndex: 'routepath', width: 200, render: (text, record, index) => {
        if (apiArray.indexOf(record.routepath) > -1) {
          return text;
        } else {
          return <Input onChange={this.modifyAcconfigRoutepate.bind(this, index)} value={record.routepath} />;
        }
      } },
      {
        title: '前置函数',
        children: [
          { title: '类型', dataIndex: 'front', key: 'type', render: (text, record, index) => {
            return (
              <RadioGroupWrap value={record.front.implementtype} onChange={this.radiogroupChange.bind(this, 'front', index)} />
            );
          } },
          { title: '字段', dataIndex: 'front', width: 300, key: 'field', render: (text, record, index) => {
            switch (record.front.implementtype) {
              case -1:
                return null;
              case 0:
                return (
                  <div>
                    数据库函数名
                    <Input type='text' value={record.front.funcname} onChange={this.modifyAcconfigFuncname.bind(this, index, 'front')} />
                  </div>
                );
              case 1:
                return <InputGroupWrap value={record.front} onChange={this.modifyAcconfigInput.bind(this, index, 'front')} />;
              default:
                return null;
            }
          } }
        ]
      },
      {
        title: '后置函数',
        children: [
          { title: '类型', dataIndex: 'end', key: 'type1', render: (text, record, index) => {
            return (
              <RadioGroupWrap value={record.end.implementtype} onChange={this.radiogroupChange.bind(this, 'end', index)} />
            );
          } },
          { title: '字段', dataIndex: 'end', width: 300, key: 'field1', render: (text, record, index) => {
            switch (record.end.implementtype) {
              case -1:
                return null;
              case 0:
                return (
                  <div>
                    数据库函数名
                    <Input type='text' value={record.end.funcname} onChange={this.modifyAcconfigFuncname.bind(this, index, 'end')} />
                  </div>
                );
              case 1:
                return <InputGroupWrap value={record.end} onChange={this.modifyAcconfigInput.bind(this, index, 'end')} />;
              default:
                return null;
            }
          }}
        ]
      },
      {
        title: '操作',
        dataIndex: 'operate',
        render: (text, record, index) => {
          if (apiArray.indexOf(record.routepath) > -1) {
            return null;
          } else {
            return <a onClick={this.delAcconfig.bind(this, index)}>删除</a>;
          }
        }
      }
    ];

    const extfuncColumns = [
      {
        title: '数据库函数名',
        dataIndex: 'functionname',
        render: (text, record, index) => {
          return <Input onChange={this.extInputChange.bind(this, index, 'functionname')} value={text} />;
        }
      },
      {
        title: '参数列表',
        dataIndex: 'parameters',
        render: (text, record, index) => {
          return <Input onChange={this.extInputChange.bind(this, index, 'parameters')} value={text} />;
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => {
          return <Input onChange={this.extInputChange.bind(this, index, 'remark')} value={text} />;
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        render: (text, record, index) => {
          return <a onClick={this.delExt.bind(this, index)}>删除</a>;
        }
      }
    ];
    return (
      <div>
        <div className={Styles.btnWrap}>
          <Button onClick={this.handleSave}>保存</Button>
        </div>
        <div className={Styles.title}>功能替换配置</div>
        <Row gutter={10}>
          {showMenu && <Col span={4}>
            <Menu selectedKeys={[currentMenu]}
                  onSelect={this.handleMenuSelect}>
              {menus.map(menu => (
                <MenuItem key={menu.menuId}>{menu.menuName}</MenuItem>
              ))}
            </Menu>
          </Col>}
          <Col span={showMenu ? 20 : 24}>
            <ConfigTable columns={funcreplaceColumns} addRow={false} list={functionconfig.funcevent[currentMenu]} rowKey="operatetype" />
          </Col>
        </Row>
        <ConfigTable title="前置后置函数配置" columns={acconfigColumns} list={functionconfig.acconfig} add={this.addRow} />
        <ConfigTable title="功能扩展配置" columns={extfuncColumns} list={functionconfig.extfunction} add={this.addExtfunction} />
      </div>
    );
  }
}

export default connect(
  state => state.extendconfig
)(ExtendConfig);
