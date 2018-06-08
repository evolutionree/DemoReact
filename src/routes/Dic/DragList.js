/**
 * Created by 0291 on 2018/6/7.
 */
import React, { Component } from 'react';
import { Modal, Button, Row, Col, Input, Switch, Checkbox, Icon } from 'antd';
import _ from 'lodash';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import Styles from './DragList.less';

let customTableBodyRef;
const SortableItem = SortableElement(({ column, item, widthChange }) => {
  const inputChange = (value) => {
    widthChange(value);
  }

  return (
    <div className={Styles.row}>
      <Row>
        {
          column.map((columnItem, index) => {
            return (
              <Col span={columnItem.span} key={index}>
                {
                  item[columnItem.key]
                }
              </Col>
            );
          })
        }

        {/*<Col span={6}>*/}
          {/*<div className={Styles.tableColumn}>*/}
            {/*<Input value={item.dataval}*/}
                   {/*onChange={inputChange} /></div>*/}
        {/*</Col>*/}
      </Row>
    </div>
  );
});
const SortableList = SortableContainer(({ column, items, widthChange }) => {
  return (
    <div className={Styles.body} ref={ref => customTableBodyRef = ref}>
      {
        items instanceof Array && items.map((item, index) => {
          return <SortableItem key={index} column={column} index={index} item={item} widthChange={widthChange.bind(this, index)} />;
        })
      }
    </div>
  );
});

class DragList extends Component {
  static propTypes = {

  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.setSeqNum(this.props.dataSource)
    };
  }

  setSeqNum(data) {
    const cloneData = _.cloneDeep(data);
    return cloneData instanceof Array && cloneData.map((item, index) => {
      item.recorder = index + 1;
      return item;
    });
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.dataSource) !== this.props.dataSource) {
      this.setState({
        dataSource: this.setSeqNum(nextProps.dataSource)
      });
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      dataSource: this.setSeqNum(arrayMove(this.state.dataSource, oldIndex, newIndex))
    });
  };

  getScrollWidth() {
    let noScroll = document.createElement('DIV');
    let scroll = document.createElement('DIV');
    let oDiv = document.createElement('DIV');
    oDiv.style.cssText = 'position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;';
    noScroll = document.body.appendChild(oDiv).clientWidth;
    oDiv.style.overflowY = 'scroll';
    scroll = oDiv.clientWidth;
    document.body.removeChild(oDiv);
    return noScroll - scroll;
  }

  hasScrolled(el, direction = 'vertical') {
    if (el && el.scrollHeight && el.clientHeight) {
      if (direction === 'vertical') {
        return el.scrollHeight > el.clientHeight;
      } else if (direction === 'horizontal') {
        return el.scrollWidth > el.clientWidth;
      }
    }
  }

  componentDidUpdate() {
    // let innerWidth = 800;
    // if (this.hasScrolled(customTableBodyRef)) { //存在滚动条
    //   innerWidth = 800 - this.getScrollWidth();
    // }
    // if (this.customTableHeaderRef) {
    //   this.customTableHeaderRef.style.width = innerWidth + 'px';
    // }
  }

  widthChange(rowIndex, value) {
    let newDataSource = this.state.dataSource;
    newDataSource[rowIndex].columnConfig.width = value;
    this.setState({
      dataSource: newDataSource
    });
  }

  render() {
    let dataSource = this.state.dataSource;
    return (
      <div className={Styles.Wrap}>
        <div className={Styles.Header} ref={ref => this.customTableHeaderRef = ref}>
          <Row>
            {
              this.props.column.map((item, index) => {
                return <Col span={item.span} key={index}>{item.name}</Col>;
              })
            }
          </Row>
        </div>
        <SortableList column={this.props.column} items={dataSource} onSortEnd={this.onSortEnd} widthChange={this.widthChange.bind(this)} />
      </div>
    );
  }
}

export default DragList;
