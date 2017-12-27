/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import { Icon, Button } from 'antd';
import Calendar from './componnet/Calendar/index';
import List from './componnet/List/index';
import WeekList from './componnet/WeekList/index';
import MonthList from './componnet/MonthList/index';
import SelectUser from '../../components/DynamicForm/controls/SelectUser';
import Radio from './componnet/Radio/index';
import { connect } from 'dva';
import classnames from 'classnames';
import Styles from './ScheduleTab.less';

class ScheduleTab extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      scheduleWays: this.props.scheduleWays,
      searchPanelShow: false,
      userIds: ''
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      scheduleWays: nextProps.scheduleWays,
      searchPanelShow: false,
      userIds: ''
    });
  }

  componentWillMount() {

  }

  scheduleWayChangeHandler(way) {
    const newScheduleWays = this.props.scheduleWays.map((item) => {
      if (item.name === way) {
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    })
    this.props.scheduleWayChange && this.props.scheduleWayChange(newScheduleWays);
  }

  toggleSearchPanel() {
    this.setState({
      searchPanelShow: !this.state.searchPanelShow
    });
  }

  calendarSelectHandler(date) {
    this.props.openSchedulePanel && this.props.openSchedulePanel();
  }

  render() {
    const ScheduleWays = this.props.scheduleWays;
    return (
      <div className={Styles.ScheduleTab} style={{ height: this.props.height }}>
        <div style={{ padding: '20px' }}>
          <div className={Styles.Header}>
            <div className={Styles.Title}><Icon type="schedule" /><span>我的日程</span><Icon type="down" onClick={this.toggleSearchPanel.bind(this)} /><Icon type="plus" /></div>
            <div className={Styles.SearchWrap} style={{ display: this.state.searchPanelShow ? 'block' : 'none' }}>
              <div>我的日程</div>
              <div>
                <SelectUser style={{ height: '38px', width: '240px' }}
                            placeholder="请输入并选择"
                            multiple={1}
                            value={this.state.userIds}
                            onChange={(userIds) => { this.setState({ userIds }) }} />
                <Button type="primary">确定</Button>
              </div>
            </div>
            <Radio data={ScheduleWays} onChange={this.scheduleWayChangeHandler.bind(this)} />
          </div>
          {
            ScheduleWays[0].active ? <div style={{ padding: '0 17px' }}><Calendar onSelect={this.calendarSelectHandler.bind(this)} /></div> : null
          }
          {
            ScheduleWays[1].active ? <WeekList /> : null
          }
          {
            ScheduleWays[2].active ? <MonthList /> : null
          }
        </div>
        {
          ScheduleWays[0].active ? <List data={[
            { type: 'info', time: '10:30-11:30', title: '拜访客户' },
            { type: 'warning', time: '14:30-15:30', title: '需求会议' },
            { type: 'task', time: '18:00', title: '工作汇报' }
          ]} firstKey="time" secondKey="title" /> : null
        }
      </div>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      scheduleWayChange(newScheduleWays) {
        dispatch({ type: 'schedule/putState', payload: { scheduleWays: newScheduleWays } });
      },
      openSchedulePanel() {
        dispatch({ type: 'schedule/putState', payload: { schedulePanelVisible: true } });
      }
    };
  }
)(ScheduleTab);
