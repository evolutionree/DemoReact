/**
 * Created by 0291 on 2017/11/7.
 */
import React, { Component } from 'react';
import Styles from './multipleInput.less';
import DataBlock from './DataBlock';
import InputSearch from './InputSearch';
import _ from 'lodash';
import { connect } from 'dva';

class MultipleInput extends Component {
  static propTypes = {
    label: React.PropTypes.string.isRequired
  };
  static defaultProps = {
      data: []
  };

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
      dataBlockSelectIndex: ''
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.docKeyDownHandler.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    });
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.docKeyDownHandler);
  }

  docKeyDownHandler(e) {
    if (e.keyCode === 8) { //删除最后一条数据
      if (document.activeElement.tagName && document.activeElement.tagName.toUpperCase() === 'BODY') {
        const newData = this.state.data.filter((item, index) => {
          return index !== this.state.dataBlockSelectIndex;
        });

        this.setState({
          dataBlockSelectIndex: ''
        });

        this.props.changeData && this.props.changeData(newData);
      }
    }
  }

  inputFocus() {
    try {
      this.InputRef.refs.wrappedInstance.focus();
    } catch (e) {}
    this.setState({
      dataBlockSelectIndex: ''
    });
  }

  completeInput(value, type) {
    if (value && value.email) {
      this.props.changeData && this.props.changeData([
        ...this.state.data,
        value
      ]);
    }

    if (type === 'blur') {
      this.props.onBlur && this.props.onBlur();
    }
  }

  getData() {
    return this.state.data;
  }

  deleteData() {
    const newData = this.state.data.filter((item, index) => {
      return index !== this.state.data.length - 1;
    });

    this.props.changeData && this.props.changeData(newData);
  }

  dataBlockSelect(index, e) {
    e.stopPropagation();
    this.setState({
      dataBlockSelectIndex: index
    });
    try {
      this.InputRef.refs.wrappedInstance.blur();
    } catch (e) {}
  }


  dataChangeHandler(index, value) {
    let newData = this.state.data;
    if (value && value.email) {
      newData[index] = value;
    }

    this.props.changeData && this.props.changeData(newData)
    this.setState({
      dataBlockSelectIndex: ''
    });
  }

  focusHandler() {
    this.props.onFocus && this.props.onFocus();
    this.setState({
      dataBlockSelectIndex: ''
    });
  }

  blurHandler() {
    this.props.onBlur && this.props.onBlur();
  }

  render() {
    let listData = this.state.data;
    listData = listData && listData instanceof Array && _.uniqBy(listData, 'email');
    return (
      <div className={Styles.inputWrap} onClick={this.inputFocus.bind(this)}>
        <span>{this.props.label}</span>
        <div style={{ width: 'calc(100% - 60px)', display: 'inline-block' }} >
          {
            listData.map((item, index) => {
              if (item === '') {
                return null;
              } else {
                return (
                  <DataBlock key={index}
                             isSelect={this.state.dataBlockSelectIndex === index}
                             value={item}
                             onFocus={this.focusHandler.bind(this)}
                             onBlur={this.blurHandler.bind(this)}
                             onChange={this.dataChangeHandler.bind(this, index)}
                             onSelect={this.dataBlockSelect.bind(this, index)} />
                );
              }
            })
          }
          <div style={{ maxWidth: '200px', display: 'inline-block' }}>
            <InputSearch ref={(ref) => this.InputRef = ref}
                         onFocus={this.focusHandler.bind(this)}
                         completeInput={this.completeInput.bind(this)}
                         deleteData={this.deleteData.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.mails,
  dispatch => {
    return {
      dispatch
    };
  },
  undefined,
  { withRef: true }
)(MultipleInput);
