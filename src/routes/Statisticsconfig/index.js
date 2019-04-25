import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Select, message, Popconfirm } from 'antd';
import Page from '../../components/Page';
import { getIntlText } from '../../components/UKComponent/Form/IntlText';
import EditList from './EditList';
import styles from './index.less';

const Option = Select.Option;

class Statisticsconfig extends Component {
  state = {

  }

  onSubmit = () => {
    message.success('提交成功');
  }

  render() {
    const { list = [{ id: 1, name: 1 }, { id: 2, name: 2 }, { id: 3, name: 3 }] } = this.state;

    return (
      <Page title="统计界面配置">
        <div className={styles.wrap}>
          <div style={{ marginRight: 20 }}>
            <EditList
              tips='支持变量"{NOW}"'
              list={[{}, {}]}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.box}>
              <div className={styles.row}>
                <div className={styles.chiid}>序号</div>
                <div className={styles.chiid}>统计项</div>
              </div>
              {
                Array.isArray(list) && list.map(item => {
                  return (
                    <div className={styles.row}>
                      <div className={styles.chiid}>{item.id}</div>
                      <div className={styles.chiid}>
                        <Select
                          showSearch
                          style={{ width: 300 }}
                          placeholder="Select a person"
                          optionFilterProp="children"
                          // onChange={handleChange}
                          // onFocus={handleFocus}
                          // onBlur={handleBlur}
                          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                          <Option value="jack">Jack</Option>
                          <Option value="lucy">Lucy</Option>
                          <Option value="tom">Tom</Option>
                        </Select>
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

export default connect(state => state.statisticsconfig)(Statisticsconfig);

