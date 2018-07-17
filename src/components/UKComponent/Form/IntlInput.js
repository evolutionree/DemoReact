/**
 * Created by 0291 on 2018/7/16.
 */
import React, { PropTypes, Component } from 'react';
import { Select, Input, Icon } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import styles from './IntlInput.less';

const Option = Select.Option;

class IntlInput extends Component {
  static propTypes = {

  };
  static defaultProps = {
    value: {}
  };
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      currentLocale: props.langlist[0].key,
      value: this.props.value,
      inputValue: this.props.value[props.langlist[0].key] || ''
    }
  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    if ($(event.target).closest('#dropdownPanel').length) {
      return;
    }
    this.setState({
      panelVisible: false
    });
  };

  componentWillReceiveProps(nextProps) {
    console.log(nextProps.value)
    const inputValue = JSON.parse(nextProps.value)
    this.setState({
      value: inputValue,
      inputValue: inputValue[this.state.currentLocale] || ''
    })
  }

  openPanel = () => {
    this.setState({
      panelVisible: true
    })
  }

  onSelectLocale = (item) => {
    this.setState({
      inputValue: this.state.value[item.key] || '',
      currentLocale: item.key,
      panelVisible: false
    })
  }

  inputChange = (e) => {
    this.setState({
      value: {
        ...this.state.value,
        [this.state.currentLocale]: e.target.value
      },
      inputValue: e.target.value,
      panelVisible: this.state.value ? false : true
    })
  }

  inputBlur = (e) => {
    let val = {
      ...this.state.value,
      [this.state.currentLocale]: e.target.value
    };
    this.props.onChange && this.props.onChange(JSON.stringify(val));
  }

  render() {
    return (
      <div className={styles.wrap} id="dropdownPanel" onClick={this.openPanel}>
        <Input onChange={this.inputChange} onBlur={this.inputBlur} value={this.state.inputValue}
               addonAfter={<span onClick={this.openPanel} className={styles.inputAddoAfter}>
                                {this.state.currentLocale}
                                <Icon type="down" style={{ transform: this.state.panelVisible ? 'scale(0.75) rotate(180deg)' : 'scale(0.75) rotate(0deg)'}} />
                             </span>} />
        <div  className={classnames(styles.dropdownPanel, {[styles.visible] : this.state.panelVisible})}>
          <ul>
            {
              this.props.langlist instanceof Array && this.props.langlist.map((item, index) => {
                return <li onClick={this.onSelectLocale.bind(this, item)} key={index}>
                  <span>{this.state.value[item.key]}</span>
                  <span className={styles.localName}>{item.dispaly}</span>
                </li>;
              })
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(
  state => {
    return {
      currentLocale: state.app.currentLocale,
      langlist: state.app.langlist
    };
  }
)(IntlInput);
