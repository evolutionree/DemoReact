/**
 * Created by 0291 on 2018/1/25.
 * desc: 设置自定义表头 Table
 */
import React, { Component, PropTypes } from 'react';
import { Modal, Table, Button, Icon, Row, Col, InputNumber, Switch } from 'antd';
import { connect } from 'dva';
import _ from 'lodash';
import classnames from 'classnames';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { saveCustomHeaders } from '../services/entcomm';
import Styles from './CustomHeaderModal.less';

let customTableBodyRef;
const SortableItem = SortableElement(({ item, isDisplayChange, widthChange }) => {
  const inputNumberChange = (value) => {
    const reg = /^[1-9]+\d*$/;
    if ((!isNaN(value) && reg.test(value))) {
      widthChange(value);
    }
  }

  return (
    <div className={Styles.customTableRow}>
      <Row>
        <Col span={4}>
          <div className={Styles.customTableColumn}>{item.columnConfig.seq}</div>
        </Col>
        <Col span={8}>
          <div className={Styles.customTableColumn}>{item.displayname}</div>
        </Col>
        <Col span={6}>
          <div className={Styles.customTableColumn}>
            <InputNumber min={100} step={1} value={item.columnConfig.width}
                         onChange={inputNumberChange}
                         style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: '-39px', marginTop: '-16px' }} /></div>
        </Col>
        <Col span={6}>
          <div className={Styles.customTableColumn}>
            <Switch defaultChecked={item.columnConfig.isdisplay === 1 ? true : false} onChange={() => {console.log(111); isDisplayChange()}} />
          </div>
        </Col>
      </Row>
    </div>
  );
});
const SortableList = SortableContainer(({ items, isDisplayChange, widthChange }) => {
  return (
    <div className={Styles.customTableBody} ref={ref => customTableBodyRef = ref}>
      {
        items.map((item, index) => {
          return <SortableItem key={index} index={index} item={item} isDisplayChange={isDisplayChange.bind(this, index)} widthChange={widthChange.bind(this, index)} />;
        })
      }
    </div>
  );
});

class CustomHeaderModal extends Component {
  static propTypes = {

  }

  constructor(props) {
    super(props);
    this.state = {
      dataSource: this.setSeqNum(this.props.dataSource),
      innerWidth: 800,
      FixedColumnCount: 0 //开发测试
    };
  }

  setSeqNum(data) {
    return data instanceof Array && data.map((item, index) => {
      item.columnConfig.seq = index + 1;
      return item;
    });
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.setSeqNum(nextProps.dataSource)
    });
  }

  saveCustomHeaders() {

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
    let innerWidth = 800;
    if (this.hasScrolled(customTableBodyRef)) { //存在滚动条
      innerWidth = 800 - this.getScrollWidth();
    }
    if (innerWidth !== this.state.innerWidth) {
      this.setState({
        innerWidth: innerWidth
      });
    }
  }

  widthChange(rowIndex, value) {
    let newDataSource = this.state.dataSource;
    newDataSource[rowIndex].columnConfig.width = value;
    this.setState({
      dataSource: newDataSource
    });
  }

  isDisplayChange(a, b) {
    console.log(a);
    console.log(b)
  }

  FixedColumnCountChange(value) {
    const reg = /^[1-9]+\d*$/;
    if ((!isNaN(value) && reg.test(value))) {
      this.setState({
        FixedColumnCount: value
      });
    }
  }

  render() {
    let dataSource = this.state.dataSource;
    return (
      <Modal
        wrapClassName="setHeaderModal"
        width={800}
        title="设置显示字段"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        footer={
          <div className={Styles.setHeaderModalFooter}>
            <div>
              固定列数：<InputNumber min={0} step={1} value={this.state.FixedColumnCount} onChange={this.FixedColumnCountChange.bind(this)} />
              <button>还原默认设置</button>
            </div>
            <div>
              <Button key="back" type="default" onClick={this.props.onCancel}>取消</Button>,
              <Button key="submit" type="primary" loading={false} onClick={this.saveCustomHeaders}>确定</Button>
            </div>
          </div>
        }>
        <div>
          <div className={Styles.customTableHeader} style={{ width: this.state.innerWidth }}>
            <Row>
              <Col span={4}><div className={Styles.customTableColumn}>序号</div></Col>
              <Col span={8}><div className={Styles.customTableColumn}>列名</div></Col>
              <Col span={6}><div className={Styles.customTableColumn}>列宽</div></Col>
              <Col span={6}><div className={Styles.customTableColumn}>显示</div></Col>
            </Row>
          </div>
          <SortableList items={dataSource} onSortEnd={this.onSortEnd} widthChange={this.widthChange.bind(this)} isDisplayChange={this.isDisplayChange.bind(this)} />
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => state.app,
  null,
  undefined,
  { withRef: true }
)(CustomHeaderModal);
