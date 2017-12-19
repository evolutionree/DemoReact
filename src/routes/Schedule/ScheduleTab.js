/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import Styles from './ScheduleTab.less';
import Date from './Date/index';

class ScheduleTab extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {

  }

  componentWillMount() {

  }

  render() {
    return (
      <div className={Styles.ScheduleTab}>
        <div className={Styles.Header}>
          <div className={Styles.Title}>我的日程</div>
          <ul>
            <li>日</li>
            <li>周</li>
            <li>月</li>
          </ul>
        </div>
        <Date />
      </div>
    );
  }
}


export default ScheduleTab;
