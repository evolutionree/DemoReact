/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col } from 'antd';
import { connect } from 'dva';

class WorkDaySet extends Component {
  static propTypes = {
    visible: PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentWillReceiveProps(nextProps) {

  }


  render() {
    return (
      <div>

      </div>
    );
  }
}

export default WorkDaySet;
