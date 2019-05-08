import React, { Component } from 'react';
import { connect } from 'dva';
import { Select, message, Popconfirm, Form, Button } from 'antd';
import Page from '../../components/Page';
import EditList from './EditList';
import styles from './index.less';

const Option = Select.Option;

const NAMESPACE = 'statisticsconfig';

class Statisticsconfig extends Component {
  state = {
    isReadOnlys: [0, 1, 1]
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${NAMESPACE}/Init` });
  }

  componentWillReceiveProps(nextProps) {
    const { form: { getFieldsValue, setFieldsValue }, resList } = nextProps;
    const { resList: oldResList } = this.props;
    let isSame = true;
    if (resList.length === oldResList.length) {
      for (let i = 0; i < resList.length; i += 1) {
        if (resList[i] !== oldResList[i]) {
          isSame = false;
          break;
        }
      }
    } else {
      isSame = false;
    }
    if (!resList.length || isSame) return;

    const arr = resList.map(i => 1);

    for (let i = 0; i < resList.length; i += 1) {
      if (!resList[i].anafuncid) {
        arr[i] = 0;
        arr[i - 1] = 0;
        break;
      }
    }

    this.setState({ resList, isReadOnlys: resList[0].anafuncid ? arr : [0, 1, 1] }, () => {
      const keys = getFieldsValue();
      const result = {};
      Object.keys(keys).forEach((field, index) => (result[field] = resList[index].anafuncid));
      setFieldsValue(result);
    });
  }

  onChangeItem = (record, value, e) => {
    const { updateList, dispatch, groupList } = this.props;
    if (e === undefined) {
      const newRecord = {
        ...record,
        groupmark: value ? value.cn : '',
        groupmark_lang: value || {}
      };
      const result = [...groupList].map(item => (item.id === record.id ? newRecord : item));

      dispatch({
        type: `${NAMESPACE}/putState`,
        payload: {
          groupList: result,
          record: newRecord
        }
      });
    } else {
      updateList(record);
    }
  }

  handleSelectChange = (value, index) => {
    const { isReadOnlys: _list } = this.state;

    for (const k in _list) {
      if (value !== '') {
        if (k < index) _list[k] = 1;
        if (k * 1 === index + 1) _list[k] = 0;
      } else {
        setTimeout(() => { // 获取改变后的value值
          const { form: { validateFields } } = this.props;
          validateFields((err, values) => {
            if (err) return;
            for (const idx in values) {
              if (idx - 1 < index) _list[idx - 1] = Object.values(values)[idx] === '' ? 0 : 1;
              if (idx * 1 === index + 1) _list[idx] = 1;
            }
            this.setState({ isReadOnlys: _list });
          });
        }, 0);
        return;
      }
    }
    this.setState({ isReadOnlys: _list });
  }

  onSubmit = () => {
    const { form: { validateFields }, submit, record } = this.props;
    validateFields((err, values) => {
      if (err) return;
      if (!(record && Object.keys(record).length)) {
        message.warn('请先填写分组名称！');
        return;
      }
      submit(values);
    });
  }

  onActive = active => {
    const { Active } = this.props;
    if (Active) Active(active);
  }

  addRow = (groupList) => {
    const { dispatch, cacheList } = this.props;
    dispatch({ type: `${NAMESPACE}/putState`, payload: { groupList, resList: cacheList } });
  }

  restFunc = () => {
    const { dispatch, cacheGroupList } = this.props;
    dispatch({ type: `${NAMESPACE}/putState`, payload: { groupList: cacheGroupList } });
  }

  render() {
    const {
      groupList, selectList, resList, checkFunc,
      form: { getFieldDecorator, getFieldsValue }, active: isAcitve
    } = this.props;
    const { isReadOnlys } = this.state;

    return (
      <Page title="统计界面配置">
        <div className={styles.wrap}>
          <div style={{ marginRight: 20, height: '100%' }}>
            <EditList
              title="分组名称"
              tips='支持变量"{NOW}"'
              getFieldsValue={getFieldsValue}
              list={groupList}
              addRow={this.addRow}
              restFunc={this.restFunc}
              checkFunc={checkFunc}
              onChange={this.onChangeItem}
              onActive={active => this.onActive(active)}
            />
          </div>
          <div className={styles.right}>
            <Form>
              <div className={styles.box}>
                <div className={styles.row}>
                  <div className={styles.child}>序号</div>
                  <div className={styles.child}>统计项</div>
                </div>
                {
                  Array.isArray(resList) && resList.map((item, index) => {
                    return (
                      <div key={index} className={styles.row}>
                        <div className={styles.child}>{index + 1}</div>
                        <div className={styles.child}>
                          <Form.Item>
                            {
                              getFieldDecorator(index + '', {
                                initialValue: ''
                              })(
                                <Select
                                  showSearch
                                  disabled={!checkFunc('EditCountRow') || isReadOnlys[index]}
                                  style={{ width: 300 }}
                                  placeholder="Select a person"
                                  optionFilterProp="children"
                                  onChange={(val) => this.handleSelectChange(val, index)}
                                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                  <Option value="">请选择</Option>
                                  {
                                    selectList.map(obj => (<Option key={obj.anafuncid} value={obj.anafuncid + ''}>{obj.anafuncname}</Option>))
                                  }
                                </Select>
                              )
                            }
                          </Form.Item>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
              <Popconfirm title="确认提交?" onConfirm={!isAcitve ? this.onSubmit : () => { }}>
                <Button disabled={isAcitve} title="点击提交" type="dashed" className={styles.footer}>
                  提交
              </Button>
              </Popconfirm>
            </Form>
          </div>
        </div>
      </Page >
    );
  }
}

export default connect(
  state => state[NAMESPACE],
  dispatch => ({
    updateList(record) {
      dispatch({ type: `${NAMESPACE}/UpdateList`, payload: { record } });
    },
    submit(values) {
      dispatch({ type: `${NAMESPACE}/Submit`, payload: { values } });
    },
    Active(active) {
      dispatch({ type: `${NAMESPACE}/putState`, payload: { active } });
    },
    dispatch
  })
)(Form.create({})(Statisticsconfig));

