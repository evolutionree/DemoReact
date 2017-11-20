/**
 * Created by 0291 on 2017/11/7.
 */
import React, { Component } from 'react';
import Styles from './multipleInput.less';
import { Input } from 'antd';
import DataBlock from './DataBlock';
import InputSearch from './InputSearch';
import _ from 'lodash';

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

        this.props.changeData && this.props.changeData(newData)
      }
    }
  }


  inputFocus() {
    try {
      this.InputRef.focus();
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
      ])
    }
  }

  getData() {
    return this.state.data;
  }

  deleteData() {
    const newData = this.state.data.filter((item, index) => {
      return index !== this.state.data.length - 1;
    });

    this.props.changeData && this.props.changeData(newData)
  }

  dataBlockSelect(index, e) {
    e.stopPropagation();
    this.setState({
      dataBlockSelectIndex: index
    });
    try {
      this.InputRef.blur();
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
                             onChange={this.dataChangeHandler.bind(this, index)}
                             onSelect={this.dataBlockSelect.bind(this, index)} />
                );
              }
            })
          }
          <div style={{ maxWidth: '200px', display: 'inline-block' }}>
            <InputSearch ref={(ref) => this.InputRef = ref}
                         completeInput={this.completeInput.bind(this)}
                         deleteData={this.deleteData.bind(this)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default MultipleInput;
