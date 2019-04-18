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
    isReadOnlys: [0, 0, 0],
    resList: []
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${NAMESPACE}/Init` });
  }

  componentWillReceiveProps(nextProps) {
    const { form: { getFieldsValue, setFieldsValue }, resList } = nextProps;
    const { resList: oldResList } = this.state;

    for (const item in resList) {
      if (resList[item] !== oldResList[item]) {
        this.setState({ resList }, () => {
          const keys = getFieldsValue();
          const result = {};
          Object.keys(keys).forEach((field, index) => (result[field] = resList[index].anafuncid));
          setFieldsValue(result);
        });
      }
    }
  }

  onChangeItem = (record, e) => {
    const { updateList } = this.props;
    updateList(record, e);
  }

  handleSelectChange = (value, index) => {
    const { isReadOnlys: _list } = this.state;
    const min = 0;
    for (const k in _list) {
      if (k === min) break;
      if (value !== '') {
        if (k < index) _list[k] = 1;
      } else {
        setTimeout(() => { // 获取改变后的value值
          const { form: { validateFields } } = this.props;
          validateFields((err, values) => {
            if (err) return;
            for (const idx in values) {
              if (idx - 1 < index) _list[idx - 1] = Object.values(values)[idx] === '' ? 0 : 1;
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
    const { form: { validateFields }, submit, groupObj } = this.props;
    validateFields((err, values) => {
      if (err) return;
      const _list = Object.values(values).map((anafuncid, index) => {
        return ({
          groupname: groupObj.groupmark || '',
          anafuncid: anafuncid || null,
          recorder: index,
          groupname_lang: JSON.stringify(groupObj.groupmark_lang ? groupObj.groupmark_lang : { cn: '', en: '', tw: '' })
        });
      });

      if (_list.every(item => !item.anafuncid)) {
        message.warn('请至少需要选择一个统计项');
        return;
      }

      const params = { data: _list };

      submit(params);
    });
  }

  render() {
    const { groupList, selectList, resList, form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { isReadOnlys } = this.state;

    return (
      <Page title="统计界面配置">
        <div className={styles.wrap}>
          <div style={{ marginRight: 20, height: '100%' }}>
            <EditList
              getFieldsValue={getFieldsValue}
              title="分组名称"
              tips='支持变量"{NOW}"'
              list={groupList.map(o => ({ ...o, name: o.groupmark }))}
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
                Array.isArray(resList) && resList.map((item, index) => {
                  return (
                    <div key={index} className={styles.row}>
                      <div className={styles.chiid}>{index + 1}</div>
                      <div className={styles.chiid}>
                        {
                          getFieldDecorator(index + '', {
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
                                selectList.map(obj => (<Option key={obj.anafuncid} value={obj.anafuncid + ''}>{obj.anafuncname}</Option>))
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
    updateList(record, e) {
      dispatch({ type: `${NAMESPACE}/UpdateList`, payload: { record, logic: e } });
    },
    submit(params) {
      dispatch({ type: `${NAMESPACE}/Submit`, payload: { params } });
    },
    dispatch
  })
)(Form.create({})(Statisticsconfig));

