import React from 'react';
import { Modal, Icon } from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import _ from 'lodash';
import { getIntlText } from './../../../../components/UKComponent/Form/IntlText';

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
    <span>{getIntlText('name', props.data)}</span>
  </li>
));
const SortableList = SortableContainer(props => {
  const items = props.items;
  return (
    <ul style={{ height: '420px', paddingTop: '1px', overflow: 'auto', width: '300px' }}>
      {items.map((item, index) => (
        <SortableItem key={item.id} index={index} data={item} />
      ))}
    </ul>
  );
});

class FieldSortModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.string,
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
    const isOpening = !/FieldSortModal$/.test(this.props.visible) && /FieldSortModal$/.test(nextProps.visible);
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
        name: field.displayname,
        name_lang: field.displayname_lang,
        id: field.fieldid
      };
    });
  };

  handleOk = () => {
    const data = this.state.sortFields;
    this.props.onOk(data);
  };

  render() {
    const { visible, onCancel, modalPending } = this.props;
    return (
      <Modal
        title="排序"
        visible={/FieldSortModal$/.test(visible)}
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
