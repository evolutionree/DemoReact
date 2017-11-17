import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Dropdown, Menu, Modal } from 'antd';
import ImpProgress from './ImpProgress';
import styles from './styles.less';


class ImportTask extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTaskIcon: 'none',
      percent: 0,
      impTask: [],
      callTaskList: [],
      fileName: '',
      displayTask: null
    };
  }
  componentWillReceiveProps(nextProps) {
    const openingCount = nextProps.impTask.length;
    // 完成任务数
    let finishCount = 0;
    let displayTask = null;
    for (const item of nextProps.callTaskList) {
      if (item.dealrowscount === item.totalrowscount) {
        finishCount++;
      }
      if (displayTask === null && item.dealrowscount !== item.totalrowscount ){
        displayTask = item;
      }
    }
    if (openingCount > 0) {
      if (finishCount === openingCount) {
        this.clearIntervalTask();
      } else if (!this.timer) {
        this.queryTaskList();
        this.timer = setInterval(() => this.queryTaskList(), 1000);
      }
      if (openingCount > finishCount && displayTask !== null) {
            // 取第一个在进行中的任务显示名称
        const lableName = '正在导入' + displayTask.taskname;
        const impTask = nextProps.impTask;
        const callTaskList = nextProps.callTaskList;
        this.setState({
          impTask,
          callTaskList,
          fileName: lableName,
          showTaskIcon: 'block',
          displayTask
        });
      } else if (openingCount > 0) {
        const lableName = '' + openingCount + '个任务完成';
        const impTask = nextProps.impTask;
        const callTaskList = nextProps.callTaskList;
        this.setState({
          impTask,
          callTaskList,
          fileName: lableName,
          showTaskIcon: 'block',
          displayTask: null
        });
      }else {
        const impTask = nextProps.impTask;
        const callTaskList = nextProps.callTaskList;
        this.setState({
          impTask,
          callTaskList,
          displayTask: null
        });
      }
    } else {
      this.resetState();
    }
  }

  queryTaskList(){
    const taskLen = this.state.impTask.length;
    const impTask = this.state.impTask;
    if (taskLen > 0) {
    let taskIds = [];
    for (const item of impTask) {
      taskIds = [...taskIds, item.taskId];
    }
    this.props.queryTaskList(taskIds);
    }
  }

  componentWillUnmount() {
    this.clearIntervalTask();
  }

  clearIntervalTask=() => {
         // 如果存在this.timer，则使用clearTimeout清空。
        // 如果你使用多个timer，那么用多个变量，或者用个数组来保存引用，然后逐个clear
    this.timer && clearInterval(this.timer);
    this.timer = undefined;
  }

  componentDidMount=() => {
  }

  resetState = () => {
    this.setState({
      showTaskIcon: 'none',
      percent: 0,
      impTask: [],
      callTaskList: [],
      fileName: ''
    });
  }

  sumPercent = (taskObj) => {
    if (!taskObj) { return 0; }
    if (taskObj.resultfileid) { return 100; }
    const totalrowscount = taskObj.totalrowscount > 0 ? taskObj.totalrowscount : 0;
    const dealrowscount = taskObj.dealrowscount > 0 ? taskObj.dealrowscount : 0;
    if (totalrowscount === 0) { return 0; }
    return Math.floor(dealrowscount / totalrowscount * 100);
  }

  handleMenuClick=(event) => {
    const entity = event.item.props.children.props.entity;
    this.props.selectTask(entity);
    this.props.impProgross();
  }


  render() {
    const lableName = this.state.fileName;
    let percentLable = this.state.percent + '%';
    const entities = this.state.callTaskList;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {entities.map(entity => {
          const entityPercent = this.sumPercent(entity);
          if (this.state.displayTask == null ) {
            percentLable = '100%';
          } else if (this.state.displayTask.taskid === entity.taskid) {
            percentLable = entityPercent + '%';
          }
          return (<Menu.Item key={entity.taskid}><ImpProgress entity={entity} entryname={entity.taskname} percent={entityPercent} /></Menu.Item>);
        })}
      </Menu>
        );
    return (
      <div style={{
        display: this.state.showTaskIcon
      }}
            >
        <Dropdown overlay={menu}>
          <div className={styles.importDropdown}>
            <div className={styles.progressText}><span title={lableName} >{lableName}</span></div>
            <div className={styles.progressCount}><span title={percentLable} >{percentLable}</span></div>
          </div>
        </Dropdown>
      </div>
    );
  }
}

export default connect(state => state.task,
    dispatch => {
      return {
        queryTaskList(taskIds) {
          dispatch({
            type: 'task/queryTaskList__',
            payload: taskIds
          });
        },
        selectTask(selectTask) {
          dispatch({
            type: 'task/selectTask',
            payload: selectTask
          });
        },
        impProgross() {
          dispatch({
            type: 'task/showModals',
            payload: 'impProgross'
          });
        }
      };
    })(ImportTask);
