/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import Calendar from './componnet/Calendar/index';
import List from './componnet/List/index';
import WeekList from './componnet/WeekList/index';
import MonthList from './componnet/MonthList/index';
import SelectUser from '../../components/DynamicForm/controls/SelectUser';
import classnames from 'classnames';
import Styles from './ScheduleTab.less';

const ScheduleWays = ['日', '周', '月']

class ScheduleTab extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      scheduleWaysActive: ScheduleWays[0],
      searchPanelShow: false
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      searchPanelShow: false
    });
  }

  componentWillMount() {

  }

  scheduleWayChangeHandler(way) {
    this.setState({
      scheduleWaysActive: way
    });
  }

  toggleSearchPanel() {
    this.setState({
      searchPanelShow: !this.state.searchPanelShow
    });
  }

  render() {
    return (
      <div className={Styles.ScheduleTab} style={{ height: this.props.height }}>
        <div style={{ padding: '20px' }}>
          <div className={Styles.Header}>
            <div className={Styles.Title}><Icon type="schedule" /><span>我的日程</span><Icon type="down" onClick={this.toggleSearchPanel.bind(this)} /><Icon type="plus" /></div>
            <div className={Styles.SearchWrap} style={{ display: this.state.searchPanelShow ? 'block' : 'none' }}>
              <div>我的日程</div>
              <div>
                <SelectUser />
              </div>
            </div>
            <ul>
              {
                ScheduleWays.map((item, index) => {
                  const cls = classnames([{
                    [Styles.active]: item === this.state.scheduleWaysActive
                  }]);
                  return <li className={cls} key={index} onClick={this.scheduleWayChangeHandler.bind(this, item)}>{item}</li>;
                })
              }
            </ul>
          </div>
          {
            this.state.scheduleWaysActive === ScheduleWays[0] ? <div style={{ padding: '0 17px' }}><Calendar /></div> : null
          }
          {
            this.state.scheduleWaysActive === ScheduleWays[1] ? <WeekList /> : null
          }
          {
            this.state.scheduleWaysActive === ScheduleWays[2] ? <MonthList /> : null
          }
        </div>
        {
          this.state.scheduleWaysActive === ScheduleWays[0] ? <List data={[
            { type: 'schedule', time: '10:30-11:30', title: '拜访客户' },
            { type: 'schedule', time: '14:30-15:30', title: '需求会议' },
            { type: 'schedule', time: '18:00', title: '工作汇报' }
          ]} /> : null
        }
      </div>
    );
  }
}


export default ScheduleTab;
