/**
 * Created by 0291 on 2018/1/4.
 */
import React, { Component } from 'react';
import classnames from 'classnames';
import Styles from './CheckBox.less';

class CheckBox extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked
    };
  }

  componentDidMount() {

  }


  componentWillReceiveProps(nextProps) {
    this.setState({
      checked: nextProps.checked
    });
  }

  componentWillMount() {

  }

  onChange(e) {
    this.setState({
      checked: !this.state.checked
    });
    e.nativeEvent.stopImmediatePropagation();//阻止冒泡
  }

  render() {
    const cls = classnames(Styles.checkbox, {
      [Styles.Checked]: this.state.checked,
      [Styles.blue]: this.props.theme === 'blue',
      [Styles.orange]: this.props.theme === 'orange',
      [Styles.purple]: this.props.theme === 'purple'
    });
    return (
      <div className={cls} onClick={this.onChange.bind(this)} style={this.props.style}></div>
    );
  }
}


export default CheckBox;
