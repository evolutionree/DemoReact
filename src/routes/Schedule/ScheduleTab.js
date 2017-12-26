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
    this.props.scheduleWayChange && this.props.scheduleWayChange(way);
  }

  toggleSearchPanel() {
    this.setState({
      searchPanelShow: !this.state.searchPanelShow
    });
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
            this.state.scheduleWaysActive === ScheduleWays[0].name ? <div style={{ padding: '0 17px' }}><Calendar /></div> : null
          }
          {
            this.state.scheduleWaysActive === ScheduleWays[1].name ? <WeekList /> : null
          }
          {
            this.state.scheduleWaysActive === ScheduleWays[2].name ? <MonthList /> : null
          }
        </div>
        {
          this.state.scheduleWaysActive === ScheduleWays[0].name ? <List data={[
            { type: 'schedule', time: '10:30-11:30', title: '拜访客户' },
            { type: 'schedule', time: '14:30-15:30', title: '需求会议' },
            { type: 'schedule', time: '18:00', title: '工作汇报' }
          ]} /> : null
        }
      </div>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      scheduleWayChange(way) {
        dispatch({ type: 'schedule/putState', payload: { scheduleWays: way } });
      }
    };
  }
)(ScheduleTab);
