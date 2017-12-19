/**
 * Created by 0291 on 2017/11/6.
 */
import React, { Component } from 'react';
import Styles from './DataBlock.less';
import { Icon, Input } from 'antd';
import classnames from 'classnames';
import InputSearch from './InputSearch';

class DataBlock extends Component {
  static propTypes = {
    value: React.PropTypes.any
  };
  static defaultProps = {
    value: ''
  };

  constructor(props) {
    super(props);
    this.state = {
       isEditing: false,
       value: this.props.value
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }


  editDataHandler() {
    this.setState({
      isEditing: true
    });
  }


  completeEdit(value, type) {
    this.setState({
      isEditing: false
    });
    this.props.onChange && this.props.onChange(value);

    if (type === 'blur') {
      this.props.onBlur && this.props.onBlur();
    }
  }


  // componentDidMount() {
  //   document.addEventListener('keydown', this.keyDownHandler.bind(this));
  // }
  //
  // componentWillUnmount() {
  //   document.removeEventListener('keydown', this.keyDownHandler);
  // }

  keyDownHandler(e) {

  }

  componentDidUpdate() {
    if (this.state.isEditing) {
      try {
        this.dataBlockInput.refs.wrappedInstance.focus();
      } catch (e) {}
    }
  }

  regTest(value) {
    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return reg.test(value);
  }

  selectDataHandler(e) {
    this.props.onSelect && this.props.onSelect(e);
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  focusHandler() {
    this.props.onFocus && this.props.onFocus();
  }

  render() {
    if (this.state.isEditing) {
      return (
        <div style={{ display: 'inline-block', maxWidth: '300px', margin: '0 10px' }}>
          <InputSearch ref={(ref) => this.dataBlockInput = ref}
                       onFocus={this.focusHandler.bind(this)}
                       value={this.state.value && this.state.value.email}
                       completeInput={this.completeEdit.bind(this)}
                       onClick={this.stopPropagation.bind(this)}
          />
        </div>
      );
    } else {
      const cls = classnames({
        [Styles.simpleShowTheme]: true,
        [Styles.formaterror]: !this.regTest(this.state.value && this.state.value.email),
        [Styles.select]: this.props.isSelect
      });
      return (
        <span className={cls} onDoubleClick={this.editDataHandler.bind(this)} onClick={this.selectDataHandler.bind(this)}>
          <span title={this.regTest(this.state.value && this.state.value.email) ? '双击可修改邮箱' : '该邮箱格式有错误,请双击修改'}>
            {
              (this.state.value && this.state.value.name) ? <span>{`${this.state.value && this.state.value.name} <${this.state.value && this.state.value.email}>`}</span> : <span>{this.state.value && this.state.value.email}</span>
            }
          </span>;
        </span>
      );

      // return (
      //   <span className={Styles.dataBlockWrap}>
      //     <span>{this.state.value}</span>
      //     <Icon type="edit" onClick={this.editDataHandler.bind(this)} />
      //   </span>
      // );
    }
  }
}

export default DataBlock;
