import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Select, message, Popconfirm, Form } from 'antd';
import Page from '../../components/Page';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import EditList from './EditList';
import styles from './index.less';
import { resolve } from 'url';

const Option = Select.Option;

const NAMESPACE = 'statisticsconfig';

class Statisticsconfig extends Component {
  state = {
    isReadOnlys: [0, 0, 0]
  }

  componentDidMount() {
    const { dispatch } = this.props;

    // new Promise((resolve) => {
    //   dispatch({ type: `${NAMESPACE}/Init`, payload: { resolve } })
    //     .then(res => {

    //     });
    // });
  }

  onChangeItem = (record, e) => {
    const { updateList } = this.props;
    updateList(record);
  }

  handleSelectChange = (value, index) => {
    const { isReadOnlys: _list } = this.state;
    const min = 0;
    for (const k in _list) {
      if (k === min) break;
      if (value !== '') {
        if (k < index) _list[k] = 1;
      } else {
        _list[index - 1] = 0;
        break;
      }
    }
    console.log(value);
    this.setState({ isReadOnlys: _list });
  }

  onSubmit = () => {
    const { form: { validateFields }, submit } = this.props;
    validateFields((err, values) => {
      if (err) return;
      const params = {};
      submit(params);
    });
    message.success('提交成功');
  }

  render() {
    const { groupList, form: { getFieldDecorator } } = this.props;
    const { isReadOnlys, list = [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }] } = this.state;

    return (
      <Page title="统计界面配置">
        <div className={styles.wrap}>
          <div style={{ marginRight: 20, height: '100%' }}>
            <EditList
              title="分组名称"
              tips='支持变量"{NOW}"'
              list={groupList}
              onChange={this.onChangeItem}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.box}>
              <div className={styles.row}>
                <div className={styles.chiid}>序号</div>
                <div className={styles.chiid}>统计项</div>
              </div>
              {
                Array.isArray(list) && list.map((item, index) => {
                  return (
                    <div className={styles.row}>
                      <div className={styles.chiid}>{item.id}</div>
                      <div className={styles.chiid}>
                        {
                          getFieldDecorator(item.name + '', {
                            initialValue: ''
                          })(
                            <Select
                              showSearch
                              disabled={isReadOnlys[index]}
                              style={{ width: 300 }}
                              placeholder="Select a person"
                              optionFilterProp="children"
                              onChange={(val) => this.handleSelectChange(val, index)}
                              // onFocus={handleFocus}
                              // onBlur={handleBlur}
                              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                              <Option value="">请选择</Option>
                              {
                                list.map(obj => (<Option key={obj.id} value={obj.id}>{obj.name}</Option>))
                              }
                            </Select>
                          )
                        }
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <Popconfirm title="确认提交?" onConfirm={this.onSubmit}>
              <div title="点击提交" className={styles.footer}>
                提交
              </div>
            </Popconfirm>
          </div>
        </div>
      </Page>
    );
  }
}

export default connect(
  state => state[NAMESPACE],
  dispatch => ({
    updateList(record) {
      dispatch({ type: `${NAMESPACE}/UpdateList`, payload: { record } });
    },
    submit(params) {
      dispatch({ type: `${NAMESPACE}/Submit`, payload: { params } });
    },
    dispatch
  })
)(Form.create({})(Statisticsconfig));

