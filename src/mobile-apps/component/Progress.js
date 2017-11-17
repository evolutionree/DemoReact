/**
 * Created by 0291 on 2017/9/11.
 */
import React from 'react';
import Styles from './css/Progress.less';

class Progress extends  React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rate: 0,
      percent: 0
    }
  }

  componentWillMount() {
    // this.fetchUnReadCount();
    // this.interval = setInterval(() => this.fetchUnReadCount(), 1);
    setTimeout(()=>{
      this.setState({
        percent: this.props.percent
      })
    },1000)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.percent !== this.state.percent) {
      // clearInterval(this.interval);
      // this.fetchUnReadCount();
      // this.interval = setInterval(() => this.fetchUnReadCount(), 1);
      this.setState({
        percent: nextProps.percent,
        rate: 0
      })
    }
  }

  fetchUnReadCount() {
    let rate = this.state.rate;
    rate += 13;
    if (rate >= this.state.percent) {
      clearInterval(this.interval);
      rate = this.state.percent;
    }
    this.setState({
      rate: rate
    });
  }
  componentDidMount() {

  }


  render() {
    return (
      <div className={Styles.progressWrap}>
        <div className={Styles.showPercent} style={{ bottom: `${((this.state.percent * 2.1) / 100) + 0.7 }rem` }}>{this.props.value}</div>
        <div className={Styles.progress} style={{ height: `${(120 / 100) * 2.1}rem` }}>
          <div className={Styles.active} style={{ height: `${((this.state.percent * 2.1) / 100)}rem` }}></div>
        </div>
        <div className={Styles.category}>{this.props.category}</div>
      </div>
    );
  }
}

Progress.propTypes = {

}

Progress.defaultProps = {
  percent: 100
}

export default Progress;
