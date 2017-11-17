import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import log from '../lib/log';
import styles from './main.less';

class DebugLog extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      show: true,
      messageList: []
    };
  }

  componentDidMount() {
    log.subscribe(messageList => {
      this.setState({ messageList });
    });
  }

  togglePanel = () => {
    this.setState({ show: !this.state.show });
  };

  render() {
    const wrapCls = classnames(styles.debugLog, { [styles.collapsed]: !this.state.show });
    return (
      <div className={wrapCls}>
        <div className={styles.debugLogTitle} onClick={this.togglePanel}>app log</div>
        <ul>
          {this.state.messageList.map(item => <li key={item.ts}>{item.content}</li>)}
        </ul>
      </div>
    );
  }
}

export default DebugLog;

