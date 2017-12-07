import React from 'react';
import { connect } from 'dva';
import { Button, Modal, message } from 'antd';
import Styles from './index.less';
import FuncTree from './FuncTree';
import Form from './Form';
import _ from "lodash";

class EntcommFunc extends React.Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount () {

  }

  getTreeData() {
    const data = _.cloneDeep(this.props.functionList);

    let treeData = [];
    let webData = data && data.web instanceof Array && data.web.filter((item) => {
      item.type = 'web';
      return item.funcid !== item.parentid; //去掉脏数据 否则会死循环
    });
    let mobileData = data && data.mobile instanceof Array && data.mobile.filter((item) => {
      item.type = 'mobile';
      return item.funcid !== item.parentid;
    });
    if (webData && webData instanceof Array) {
      for (let i = 0; i < webData.length; i++) {
        if (webData[i].parentid === '00000000-0000-0000-0000-000000000000') {
          webData[i].parentid = 'web';
        }
      }
    }

    if (mobileData && mobileData instanceof Array) {
      for (let i = 0; i < mobileData.length; i++) {
        if (mobileData[i].parentid === '00000000-0000-0000-0000-000000000000') {
          mobileData[i].parentid = 'mobile';
        }
      }
    }

    if (webData && webData instanceof Array && mobileData && mobileData instanceof Array) {
      treeData = [
        ...webData,
        ...mobileData,
        {
          funcid: 'web',
          parentid: '00000000-0000-0000-0000-000000000000',
          funcname: 'web',
          disabled: true
        },
        {
          funcid: 'mobile',
          parentid: '00000000-0000-0000-0000-000000000000',
          funcname: 'mobile',
          disabled: true
        },
        {
          funcid: '00000000-0000-0000-0000-000000000000',
          parentid: '11111111',
          funcname: '功能设置',
          disabled: true
        }
      ];
    }

    return treeData;
  }

  submitData(data) {
    if (this.props.treeValue) { //必须选了树节点
      const functionList = this.props.functionList;
      let submitData = {
        ...data,
        islastchild: data.islastchild ? -1 : 0
      };

      if (this.props.submitType === 'add') {
        if (this.props.treeType === 'web') {
          submitData = {
            WebFuncs: [
              ...functionList.web,
              submitData
            ],
            MobileFuncs: functionList.mobile
          };
        } else if (this.props.treeType === 'mobile') {
          submitData = {
            WebFuncs: functionList.web,
            MobileFuncs: [
              ...functionList.mobile,
              submitData
            ]
          };
        }
      } else if (this.props.submitType === 'edit') {
        if (this.props.treeType === 'web') {
          submitData = {
            WebFuncs: functionList.web.map((item) => {
              if (item.funcid === submitData.funcid) {
                return submitData;
              } else {
                return item;
              }
            }),
            MobileFuncs: functionList.mobile
          };
        } else if (this.props.treeType === 'mobile') {
          submitData = {
            WebFuncs: functionList.web,
            MobileFuncs: functionList.mobile.map((item) => {
              if (item.funcid === submitData.funcid) {
                return submitData;
              } else {
                return item;
              }
            })
          };
        }
      }
      this.props.save && this.props.save(submitData);
    } else {
      message.error('请先选择需要操作的节点');
    }
  }

  delFunc() {
    if (this.props.treeValue) { //必须选了树节点
      const functionList = this.props.functionList;
      let submitData = null;
      if (this.props.treeType === 'web') {
        submitData = {
          WebFuncs: functionList.web.filter((item) => {
            return item.funcid !== this.props.treeValue.funcid;
          }),
          MobileFuncs: functionList.mobile
        };
      } else if (this.props.treeType === 'mobile') {
        submitData = {
          WebFuncs: functionList.web,
          MobileFuncs: functionList.mobile.filter((item) => {
            return item.funcid !== this.props.treeValue.funcid;
          })
        };
      }

      if (submitData) {
        this.props.save && this.props.save(submitData);
      }
    } else {
      message.error('请先选择需要操作的节点');
    }
  }

  add() {
    if (this.props.treeValue) {
      this.props.add && this.props.add();
    } else {
      message.error('请先选择需要操作的节点');
    }
  }

  render() {
    return (
      <div className={Styles.Wrap}>
        <div>
          <Button size="default" onClick={this.add.bind(this)}>新增</Button>
          <Button type="danger" size="default" onClick={this.delFunc.bind(this)}>删除</Button>
        </div>
        <div>
          <ul className={Styles.functionSetWrap}>
            <li>
              <div className={Styles.treeWrap}>
                <FuncTree
                 value={this.props.treeValue && this.props.treeValue.funcid}
                  data={this.getTreeData()}
                  onChange={this.props.treeSelect}
                />
              </div>
            </li>
            <li>
              {
                (this.props.treeValue && this.props.treeValue.funcid) ? <Form entityType={this.props.entityType}
                                             submitType={this.props.submitType}
                                             treeType={this.props.treeType}
                                             value={this.props.treeValue}
                                             submit={this.submitData.bind(this)} /> : null
              }
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      ...state.entityFunc
    };
  },
  dispatch => {
    return {
      treeSelect(key, obj) {
        if (!obj) {
          dispatch({ type: 'entityFunc/putState', payload: { treeValue: null, treeType: '', submitType: '' } });
          return;
        }
        if (obj.disabled) {
          message.info('该节点不允许操作');
          return;
        } else {
          const treeValue = {
            entityid: obj.entityid,
            funccode: obj.funccode,
            funcid: obj.funcid,
            funcname: obj.funcname,
            islastchild: obj.islastchild,
            parentid: (obj.parentid === 'web' || obj.parentid === 'mobile') ? '00000000-0000-0000-0000-000000000000' : obj.parentid,
            relationvalue: obj.relationvalue,
            routepath: obj.routepath
          }

          dispatch({ type: 'entityFunc/putState', payload: { treeValue, treeType: obj.type, submitType: 'edit' } }); //treeType:记录当前点击的树的类型（web or mobile）
        }
      },
      add() {
        dispatch({ type: 'entityFunc/putState', payload: { submitType: 'add' } });
      },
      save(submitData) {
        dispatch({ type: 'entityFunc/save', payload: submitData });
      },
      dispatch
    };
  }
)(EntcommFunc);
