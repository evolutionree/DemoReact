/**
 * Created by 0291 on 2017/7/28.
 */
import React, { PropTypes, Component } from 'react';
import { Modal, Row, Col, Button, Icon, message } from 'antd';
import _ from 'lodash';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import styles from './Transfer.less';

const DragHandle = SortableHandle(props => {
  return props.children;
});

const SortableItem = SortableElement(({ item, textField, removeField }) =>
  <li className={styles.item}>
    <DragHandle>
      <Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />
    </DragHandle>
    <span title={item[textField]}>{item[textField]}</span>
    <Icon
      type="close"
      onClick={() => { removeField && removeField(item) }}
    />
  </li>
);

const SortableList = SortableContainer(props => {
  const { items, className, removeField, textField, ...rest } = props;
  return (
    <ul className={className} {...rest}>
      {items.map((item, index) => (
        <SortableItem key={`item-${index}`} textField={textField} index={index} item={item} removeField={() => { removeField && removeField(item) }}/>
      ))}
    </ul>
  );
});


class Transfer extends Component {
  static propTypes = {
    data: PropTypes.object.isRequired,
    visibleKey: PropTypes.string,
    noVisibleKey: PropTypes.string,
    textField: PropTypes.string
  };
  static defaultProps = {
    visibleKey: 'salesstageoppinfovi',
    noVisibleKey: 'salesstageoppinfo',
    textField: 'fieldlabel'
  };

  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data
    })
  }


  pickField = (field) => {
    let newData = _.cloneDeep(this.state.data);
    newData[this.props.noVisibleKey] = newData[this.props.noVisibleKey].filter((item) => {
      return item.fieldid !== field.fieldid;
    });
    newData[this.props.visibleKey].push(field);
    this.setState({
      data: newData
    });
  };

  removeField = (field) => {
    let newData = _.cloneDeep(this.state.data);
    newData[this.props.visibleKey] = newData[this.props.visibleKey].filter((item) => {
      return item.fieldid !== field.fieldid;
    });
    newData[this.props.noVisibleKey].push(field);
    this.setState({
      data: newData
    });
  };

  pickAll = () => {
    let newData = _.cloneDeep(this.state.data);
    newData[this.props.noVisibleKey].map((field) => {
      newData[this.props.visibleKey].push(field);
    });
    newData[this.props.noVisibleKey] = [];

    this.setState({
      data: newData
    });
  };

  removeAll = () => {
    let newData = _.cloneDeep(this.state.data);
    newData[this.props.visibleKey].map((field) => {
      newData[this.props.noVisibleKey].push(field);
    });
    newData[this.props.visibleKey] = [];
    this.setState({
      data: newData
    });
  };

  onSortEnd = ({ oldIndex, newIndex }) => {
    let newData = _.cloneDeep(this.state.data);
    newData[this.props.visibleKey] = arrayMove(this.state.data[this.props.visibleKey], oldIndex, newIndex);
    this.setState({
      data: newData
    });
  };

  getData() {
    return this.state.data;
  }

  render() {
    return (
      <Row gutter={10}>
        <Col span={10}>
          <div>
            <p className={styles.title}>待选字段</p>
            <ul className={styles.list}>
              {this.state.data[this.props.noVisibleKey].map(field => (
                <li className={styles.item} key={field.fieldid}>
                  <span title={field[this.props.textField]}>{field[this.props.textField]}</span>
                  <Icon type="plus" onClick={() => {
                    this.pickField(field);
                  }}/>
                </li>
              ))}
            </ul>
          </div>
        </Col>
        <Col span={4} style={{textAlign: 'center'}}>
          <Button className={styles.btn} type="default" onClick={this.pickAll}>
            <Icon type="right"/>
          </Button>
          <Button className={styles.btn} type="default" onClick={this.removeAll}>
            <Icon type="left"/>
          </Button>
        </Col>
        <Col span={10}>
          <div>
            <p className={styles.title}>已选字段</p>
            <SortableList textField={this.props.textField} items={this.state.data[this.props.visibleKey]} onSortEnd={this.onSortEnd} className={styles.list} useDragHandle removeField={this.removeField}/>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Transfer;
