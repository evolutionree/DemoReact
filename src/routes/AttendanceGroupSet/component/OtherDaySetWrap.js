/**
 * Created by 0291 on 2018/3/19.
 */
import React, { PropTypes, Component } from 'react';
import OtherDaySet from './OtherDaySet';

class OtherDaySetWrap extends Component {
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

  changeNeedHandler = (data) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      specworkdayset: data
    });
  }

  changeNoNeedHandler = (data) => {
    this.props.onChange && this.props.onChange({
      ...this.props.value,
      ondutyset: data
    });
  }

  render() {
    const { specworkdayset, ondutyset } = this.props.value;
    return (
      <div>
        <OtherDaySet value={specworkdayset} onChange={this.changeNeedHandler} />
        <OtherDaySet value={ondutyset} onChange={this.changeNoNeedHandler} />
      </div>
    );
  }
}

export default OtherDaySetWrap;
