/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import { Icon, Button, Collapse } from 'antd';
import { connect } from 'dva';
import Radio from './componnet/Radio/index';
import List from './componnet/List/index';
import Styles from './TaskTab.less';

const Panel = Collapse.Panel;

class TaskTab extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      taskWays: this.props.taskWays
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      taskWays: nextProps.taskWays
    });
  }

  componentWillMount() {

  }

  taskWayChangeHandler(way) {
    const newTaskWays = this.props.taskWays.map((item) => {
      if (item.name === way) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    })
    this.props.taskWayChange && this.props.taskWayChange(newTaskWays);
  }


  render() {
    const taskWays = this.props.taskWays;
    const listData = [{ type: 'task', time: '18:00', title: '工作汇报' }, { type: 'task', time: '18:00', title: '工作汇报' }, { type: 'task', time: '18:00', title: '工作汇报' }]
    return (
      <div className={Styles.TaskTab} style={{ height: this.props.height }}>
        <div style={{ padding: '20px' }}>
          <div className={Styles.Header}>
            <div className={Styles.Title}><Icon type="schedule" /><span>任务</span><Icon type="plus" /></div>
            <Radio data={taskWays} onChange={this.taskWayChangeHandler.bind(this)} />
          </div>
          {
            taskWays[0].active ? <Collapse bordered={false} defaultActiveKey={['1']} accordion>
              <Panel header="今天" key="1">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
              <Panel header="将来" key="2">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
              <Panel header="已完成" key="3">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
              <Panel header="已过期" key="4">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
            </Collapse> : null
          }
          {
            taskWays[1].active ? <Collapse bordered={false} defaultActiveKey={['1']} accordion>
              <Panel header="进行中" key="1">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
              <Panel header="已完成" key="2">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
              <Panel header="已过期" key="3">
                <List data={listData} className="taskList" firstKey="time" secondKey="title" />
              </Panel>
            </Collapse> : null
          }
        </div>
      </div>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      taskWayChange(newTaskWays) {
        dispatch({ type: 'schedule/putState', payload: { taskWays: newTaskWays } });
      }
    };
  }
)(TaskTab);
