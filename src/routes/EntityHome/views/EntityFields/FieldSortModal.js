import React from 'react';
import { Modal, Icon } from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import _ from 'lodash';

const styles = {
  sortli: {
    lineHeight: '32px',
    padding: '0 10px',
    border: '1px solid #d9d9d9',
    zIndex: 100000,
    marginTop: -1,
    background: '#fff',
    cursor: 'pointer'
  }
};
const SortableItem = SortableElement(props => (
  <li style={styles.sortli}>
    <Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />
    <span>{props.name}</span>
  </li>
));
const SortableList = SortableContainer(props => {
  const items = props.items;
  return (
    <ul style={{ height: '420px', paddingTop: '1px', overflow: 'auto', width: '300px' }}>
      {items.map((item, index) => (
        <SortableItem key={item.id} index={index} name={item.name} />
      ))}
    </ul>
  );
});

class FieldSortModal extends React.Component {
  static propTypes = {
    showModals: React.PropTypes.string,
    modalPending: React.PropTypes.bool,
    fields: React.PropTypes.array,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      sortFields: this.resetSortFields()
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !/sort/.test(this.props.showModals) && /sort/.test(nextProps.showModals);
    if (isOpening) {
      this.setState({ sortFields: this.resetSortFields() });
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      sortFields: arrayMove(this.state.sortFields, oldIndex, newIndex)
    });
  };

  resetSortFields = () => {
    return _.cloneDeep(this.props.fields).map(field => {
      return {
        name: field.fieldlabel,
        id: field.fieldid
      };
    });
  };

  handleOk = () => {
    const data = this.state.sortFields;
    this.props.onOk(data);
  };

  render() {
    const { showModals, onCancel, modalPending } = this.props;
    return (
      <Modal
        title="排序"
        visible={/sort/.test(showModals)}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={modalPending}
      >
        <SortableList items={this.state.sortFields} onSortEnd={this.onSortEnd} />
      </Modal>
    );
  }
}

export default FieldSortModal;
