/**
 * Created by 0291 on 2018/1/25.
 * desc: 设置自定义表头 Table
 */
import React, { Component } from 'react';
import { Modal, Button, Row, Col, InputNumber, Switch, Checkbox } from 'antd';
import _ from 'lodash';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
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
            <Checkbox onChange={isDisplayChange} checked={item.columnConfig.isdisplay === 1 ? true : false} />
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
      FixedColumnCount: this.props.fixedColumnCount
    };
  }

  setSeqNum(data) {
    const cloneData = _.cloneDeep(data);
    return cloneData instanceof Array && cloneData.map((item, index) => {
      item.columnConfig.seq = index + 1;
      return item;
    });
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        dataSource: this.setSeqNum(nextProps.dataSource),
        FixedColumnCount: nextProps.fixedColumnCount
      });
    }
  }

  saveCustomHeaders() {
    const columnsConfig = this.state.dataSource.map((item) => {
      return item.columnConfig;
    });

    this.props.saveCustomHeaders && this.props.saveCustomHeaders(columnsConfig, this.state.FixedColumnCount);
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
    if (this.customTableHeaderRef) {
      this.customTableHeaderRef.style.width = innerWidth + 'px';
    }
  }

  widthChange(rowIndex, value) {
    let newDataSource = this.state.dataSource;
    newDataSource[rowIndex].columnConfig.width = value;
    this.setState({
      dataSource: newDataSource
    });
  }

  isDisplayChange(rowIndex, e) {
    let newDataSource = this.state.dataSource;
    newDataSource[rowIndex].columnConfig.isdisplay = e.target.checked ? 1 : 0;
    this.setState({
      dataSource: newDataSource
    });
  }

  FixedColumnCountChange(value) {
    const reg = /^[0-9]+\d*$/;
    if ((!isNaN(value) && reg.test(value))) {
      this.setState({
        FixedColumnCount: value
      });
    }
  }

  reset() {
    this.setState({
      dataSource: this.setSeqNum(this.props.dataSource),
      FixedColumnCount: this.props.fixedColumnCount
    });
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
              固定列数：<InputNumber min={0} max={Math.min(5, dataSource.length)} step={1} value={this.state.FixedColumnCount} onChange={this.FixedColumnCountChange.bind(this)} />
              <button onClick={this.reset.bind(this)}>还原默认设置</button>
            </div>
            <div>
              <Button key="back" type="default" onClick={this.props.onCancel}>取消</Button>,
              <Button key="submit" type="primary" loading={false} onClick={this.saveCustomHeaders.bind(this)}>确定</Button>
            </div>
          </div>
        }>
        <div className={Styles.bodyWrap}>
          <div className={Styles.customTableHeader} ref={ref => this.customTableHeaderRef = ref}>
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

export default CustomHeaderModal;
