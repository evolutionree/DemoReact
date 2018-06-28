/**
 * Created by 0291 on 2018/6/27.
 */
import React, { Component } from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import { SortableContainer, SortableElement, arrayMove, SortableHandle } from 'react-sortable-hoc';
import Styles from './DragList.less';

let tableBodyRef;
const DragHandle = SortableHandle(props => {
  return props.children;
});

const SortableItem = SortableElement(({ column, item, rowIndex, preventDefault }) => {
  const renderCell = (columnItem, rowData) => {
    if (typeof columnItem.render === 'function') {
      return columnItem.render(rowData[columnItem.key], rowData, rowIndex);
    } else {
      return rowData[columnItem.key];
    }
  }

  const cellMouseOver = (columnItem) => {
    if (columnItem.key === 'operate') { //操作栏  阻止组件默认事件  让其可以点击
      preventDefault(200);
    } else {
      preventDefault(0);
    }
  }

  return (
    <div className={Styles.row}>
      <Row>
        {
          column.map((columnItem, index) => {
            return (
              <Col span={columnItem.span} key={index}>
                <div className={Styles.tableColumn} onMouseOver={cellMouseOver.bind(this, columnItem)}>
                  {
                    renderCell(columnItem, item)
                  }
                </div>
              </Col>
            );
          })
        }
      </Row>
    </div>
  );
});

const SortableList = SortableContainer(({ column, items, preventDefault, ...props }) => {
  return (
    <div className={Styles.body} ref={ref => tableBodyRef = ref} {...props}>
      {
        items instanceof Array && items.map((item, index) => {
          return <SortableItem key={index} column={column} index={index} rowIndex={index} item={item} preventDefault={preventDefault} />;
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
      pressDelay: 0
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

  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const newDataSource = this.setSeqNum(arrayMove(this.props.dataSource, oldIndex, newIndex));
    this.props.onSortEnd(newDataSource);
  };

  preventDefault = (time) => {
    this.setState({
      pressDelay: time
    });
  }

  render() {
    let dataSource = this.setSeqNum(this.props.dataSource);
    return (
      <div className={Styles.Wrap}>
        <div className={Styles.Header} ref={ref => this.customTableHeaderRef = ref}>
          <Row>
            {
              this.props.column.map((item, index) => {
                return <Col span={item.span} key={index}><div className={Styles.tableColumn}>{item.name}</div></Col>;
              })
            }
          </Row>
        </div>
        <SortableList column={this.props.column}
                      items={dataSource}
                      onSortEnd={this.onSortEnd}
                      pressDelay={this.state.pressDelay}
                      preventDefault={this.preventDefault} />
      </div>
    );
  }
}

export default DragList;
