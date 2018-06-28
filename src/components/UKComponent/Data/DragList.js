/**
 * Created by 0291 on 2018/6/7.
 */
import React, { Component } from 'react';
import { Row, Col } from 'antd';
import _ from 'lodash';
import { SortableContainer, SortableElement, arrayMove, SortableHandle } from 'react-sortable-hoc';
import classnames from 'classnames';
import Styles from './DragList.less';

let tableBodyRef;
// const DragHandle = SortableHandle(props => {
//   return props.children;
// });

const SortableItem = SortableElement(({ column, item, rowIndex, preventDefault, delayDragColumn }) => {
  const renderCell = (columnItem, rowData) => {
    if (typeof columnItem.render === 'function') {
      return columnItem.render(rowData[columnItem.key], rowData, rowIndex);
    } else {
      return rowData[columnItem.key];
    }
  }

  const cellMouseOver = (columnItem) => {
    if (delayDragColumn.indexOf(columnItem.key) > -1) { //操作栏  阻止组件默认事件  让其可以点击
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
            const isDelayDragColumn = delayDragColumn.indexOf(columnItem.key) > -1;
            return (
              <Col span={columnItem.span} key={index}>
                <div className={classnames(Styles.tableColumn, { [Styles.delayDragColumn]: isDelayDragColumn })} onMouseOver={cellMouseOver.bind(this, columnItem)}>
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

const SortableList = SortableContainer(({ column, items, preventDefault, delayDragColumn, ...props }) => {
  return (
    <div className={Styles.body} ref={ref => tableBodyRef = ref} {...props}>
      {
        items instanceof Array && items.map((item, index) => { //一定要加Index属性 否则拖拽不了 preventDefault： 延时拖拽
          return <SortableItem key={index} column={column} index={index} rowIndex={index} item={item} preventDefault={preventDefault} delayDragColumn={delayDragColumn} />;
        })
      }
    </div>
  );
});

class DragList extends Component {
  static propTypes = {
    onSortEnd: React.PropTypes.func,
    column: React.PropTypes.array,
    /*
     [{
       key: React.PropTypes.string,
       name: React.PropTypes.string,
       span: React.PropTypes.number
     }]
     */
    dataSource: React.PropTypes.array,
    delayDragColumn: React.PropTypes.oneOfType([ //列的key值 延时拖拽的列（当插件拖拽时，不允许用户点击，所以采用pressDelay，让用户可以点击操作当前列进行一些行为）
      React.PropTypes.array,
      React.PropTypes.string
    ])
  }

  static defaultProps = {
    delayDragColumn: []
  };

  constructor(props) {
    super(props);
    this.state = {
      pressDelay: 0,
      list: this.setSeqNum(this.props.dataSource)
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
    this.setState({
      list: this.setSeqNum(nextProps.dataSource)
    });
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const newDataSource = this.setSeqNum(arrayMove(this.state.list, oldIndex, newIndex));
    this.setState({
      list: newDataSource
    });
    this.props.onSortEnd && this.props.onSortEnd(newDataSource);
  };

  preventDefault = (time) => {
    this.setState({
      pressDelay: time
    });
  }

  getData = () => {
    return this.state.list;
  }

  render() {
    return (
      <div className={Styles.DragListWrap}>
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
                      items={this.state.list}
                      onSortEnd={this.onSortEnd}
                      pressDelay={this.state.pressDelay}
                      preventDefault={this.preventDefault}
                      delayDragColumn={this.props.delayDragColumn} />
      </div>
    );
  }
}

export default DragList;

