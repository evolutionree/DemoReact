/**
 * Created by 0291 on 2017/11/7.
 */
import React, { Component } from 'react';
import Styles from './multipleInput.less';
import { Input } from 'antd';

class NormalInput extends Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      inputValue: this.props.data
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      inputValue: nextProps.data
    })
  }

  inputFocus() {
    this.InputRef.focus();
  }

  inputChangeHandler(e) {
    this.props.changeData && this.props.changeData(e.target.value);
  }


  getData() {
    return this.state.inputValue;
  }

  render() {
    return (
      <div className={Styles.inputWrap} onClick={this.inputFocus.bind(this)}>
        <span>{this.props.label}</span>
        <div style={{ display: 'inline-block', width: 'calc(100% - 120px)' }}>
          <Input value={this.state.inputValue}
                 ref={(ref) => this.InputRef = ref}
                 onChange={this.inputChangeHandler.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default NormalInput;
