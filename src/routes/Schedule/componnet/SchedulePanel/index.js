/**
 * Created by 0291 on 2017/12/21.
 */
import React, { Component } from 'react';
import { Icon } from 'antd';
import Filter from '../Filter';
import Styles from './index.less';

const otherHeight = 60 + 48 + 10; //60：系统logo栏  48：页标栏  10： padding

class ScheduleModal extends Component {
  static propTypes = {

  };
  static defaultProps = {
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      height: document.body.clientHeight - otherHeight
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.setState({
      height: document.body.clientHeight - otherHeight
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });
  }

  componentWillMount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  closeModal() {
    this.props.onClose && this.props.onClose();
  }


  render() {
    return (
      <div className={Styles.ScheduleModal} style={{ height: this.state.height, width: 'calc(100% - 420px)', display: this.props.visible ? 'block' : 'none' }}>
        <div className={Styles.Wrap}>
          <div className={Styles.header}>
            {
              this.props.header
            }
            <Filter />
            <Icon type="close" onClick={this.closeModal.bind(this)} />
          </div>
          <div className={Styles.body} style={{ height: this.state.height - 50 }}>
            {
              this.props.children
            }
          </div>
        </div>
      </div>
    );
  }
}


export default ScheduleModal;
