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

  componentWillUnmount() {
    document.removeEventListener('keydown', this.docKeyDownHandler);
  }

  docKeyDownHandler(e) {
    if (e.keyCode === 8) {
      if (document.activeElement.tagName && document.activeElement.tagName.toUpperCase() === 'BODY') {
        this.setState({
          data: this.state.data.filter((item, index) => {
            return index !== this.state.dataBlockSelectIndex;
          }),
          dataBlockSelectIndex: ''
        });
      }
    }
  }

  componentWillReceiveProps(nextProps) {

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
      this.setState({
        data: [
          ...this.state.data,
          value
        ]
      });
    }

    console.log(type)
    //this.InputRef.focus();
  }

  getData() {
    return this.state.data;
  }

  deleteData() {
    this.setState({
      data: this.state.data.filter((item, index) => {
        return index !== this.state.data.length - 1;
      })
    });
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
    this.setState({
      data: newData,
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
