/**
 * Created by 0291 on 2018/3/6.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, message, Spin, Button, Row, Col, Icon, Radio } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import Styles from './SelectBar.less';

const RadioGroup = Radio.Group;

class SelectBar extends Component {
  static propTypes = {
    value: PropTypes.any
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      value: this.props.value
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.docClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.docClick);
  }

  docClick = (e) => {
    this.setState({
      visible: false
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }

  showList = (e) => {
    e.nativeEvent.stopImmediatePropagation();
    this.setState({
      visible: !this.state.visible
    });
  }

  hideList = () => {
    this.setState({
      visible: false
    });
  }

  RadioChange = (e) => {
    this.setState({
      visible: false
    });
    const value = _.find(this.props.dataSource, item => item.id === e.target.value)
    this.props.onChange && this.props.onChange({
      id: value.id,
      name: value.name
    });
  }

  render() {
    const iconStyle = this.state.visible ? { transform: 'rotate(180deg)' } : {};

    const showObj = _.find(this.props.dataSource, item => item.id === this.state.value);
    return (
      <div className={Styles.Wrap}>
        <div onClick={this.showList}><span style={{ color: '#3398db' }}>{this.props.defaultText ? this.props.defaultText : showObj && showObj.worktime ? `${showObj.name}(${showObj.worktime})` : `${showObj.name}`}</span> <Icon type="down" style={{ fontSize: 6, color: '#767f8b', ...iconStyle }} /></div>
        <div className={Styles.panel} style={{ display: this.state.visible ? 'block' : 'none' }} onClick={e => { e.nativeEvent.stopImmediatePropagation() }}>
          <RadioGroup onChange={this.RadioChange} value={this.state.value}>
            {
              this.props.dataSource instanceof Array && this.props.dataSource.map((item, index) => {
                return <Radio key={index} value={item.id} style={{ width: '100%' }}>{item.worktime ? `${item.name}(${item.worktime})` : `${item.name}`}</Radio>;
              })
            }
          </RadioGroup>
        </div>
      </div>
    );
  }
}

export default SelectBar;
