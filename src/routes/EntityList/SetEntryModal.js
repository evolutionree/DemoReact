import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Row, Col, Button, Icon } from 'antd';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from 'react-sortable-hoc';
import _ from 'lodash';
import classnames from 'classnames';
import { queryEntries } from '../../services/entity';
import styles from './SetEntryModal.less';

function getRandomId() {
  const randomNum = Math.random() * 9999;
  return `${new Date().getTime()}-${randomNum}`;
}

const DragHandle = SortableHandle(props => {
  return props.children;
});
const SortableLi = SortableElement(props => {
  const { children, className, useDragHandle, key, index, ...rest } = props;
  return (
    <li
      style={{ zIndex: 10000 }}
      className={className}
      {...rest}
    >
      {children}
    </li>
  );
});
const SortableUl = SortableContainer(props => {
  const { className, children, ...rest } = props;
  return (
    <ul className={className} {...rest}>
      {children}
    </ul>
  );
});

class SetEntryModal extends Component {
  static propTypes = {
    modalVisible: PropTypes.bool.isRequired,
    modalPending: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      allEntries: [],
      leftIds: [], // id
      rightIds: [], // id
      selectedId: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.modalVisible && nextProps.modalVisible) {
      queryEntries(this.props.entityId).then(result => {
        const { crm, office, standbychoose } = result.data;

        standbychoose.forEach(item => {
          item.isgroup = 0;
          item.entranceid = item.entityid;
          item.entryname = item.entityname;
        });
        const allEntries = [...crm, ...office, ...standbychoose];
        this.setState({
          allEntries,
          leftIds: _.map(crm, 'entranceid'),
          rightIds: _.map(office, 'entranceid')
        });
      });
    }
  }

  onConfirm = () => {
    const { allEntries, leftIds, rightIds } = this.state;

    const crm = idsToEntries(leftIds, 0);
    const office = idsToEntries(rightIds, 1);

    this.props.submit([...crm, ...office]);

    function idsToEntries(ids, type) {
      return ids.map((id, index) => {
        const entry = _.find(allEntries, ['entranceid', id]);
        return {
          entryname: entry.entryname,
          entrytype: type,
          entityid: entry.entityid,
          isgroup: entry.isgroup,
          recorder: index
        };
      });
    }
  };

  onSortEndLeft = ({ oldIndex, newIndex }) => {
    this.setState({
      leftIds: arrayMove(this.state.leftIds, oldIndex, newIndex)
    });
  };

  onSortEndRight = ({ oldIndex, newIndex }) => {
    this.setState({
      rightIds: arrayMove(this.state.rightIds, oldIndex, newIndex)
    });
  };

  selectEntry = id => {
    this.setState({ selectedId: id });
  };

  selectedToLeft = () => {
    const { selectedId, leftIds } = this.state;
    if (!selectedId) return;
    if (_.includes(leftIds, selectedId)) return;
    this.setState({
      leftIds: [...leftIds, selectedId]
    });
  };

  selectedToRight = () => {
    const { selectedId, rightIds } = this.state;
    if (!selectedId) return;
    if (_.includes(rightIds, selectedId)) return;
    this.setState({
      rightIds: [...rightIds, selectedId]
    });
  };

  createGroupToLeft = () => {
    const entranceid = getRandomId();
    const newEntry = {
      entranceid,
      entityid: '00000000-0000-0000-0000-000000000000',
      isgroup: 1,
      entryname: '分组'
    };
    const { allEntries, leftIds } = this.state;
    this.setState({
      allEntries: [...allEntries, newEntry],
      leftIds: [...leftIds, entranceid]
    });
  };

  createGroupToRight = () => {
    const entranceid = getRandomId();
    const newEntry = {
      entranceid,
      entityid: '00000000-0000-0000-0000-000000000000',
      isgroup: 1,
      entryname: '分组'
    };
    const { allEntries, rightIds } = this.state;
    this.setState({
      allEntries: [...allEntries, newEntry],
      rightIds: [...rightIds, entranceid]
    });
  };

  removeEntry = (id) => {
    let { allEntries, leftIds, rightIds } = this.state;
    leftIds = _.without(leftIds, id);
    rightIds = _.without(rightIds, id);
    const entry = _.find(allEntries, ['entranceid', id]);
    if (entry.isgroup) {
      _.remove(allEntries, ['entranceid', id]);
    }
    this.setState({
      allEntries,
      leftIds,
      rightIds
    });
  };

  renderEntries = (leftOrRight) => {
    const { allEntries, leftIds, rightIds } = this.state;
    const ids = leftOrRight === 'left' ? leftIds : rightIds;
    const entries = ids.map(id => _.find(allEntries, ['entranceid', id]));
    return entries.map((entry, index) => {
      const { entranceid, entryname } = entry;
      return (
        <SortableLi key={entranceid} index={index} className={styles.entry}>
          <DragHandle>
            <Icon type="bars" style={{ cursor: 'move', marginRight: '5px' }} />
          </DragHandle>
          <span className={styles.entrytext} title={entryname}>{entryname}</span>
          <Icon
            type="close"
            className={styles.entryctrl}
            onClick={this.removeEntry.bind(this, entranceid)}
          />
        </SortableLi>
      );
    });
  };

  renderRestEntries = () => {
    const { allEntries, leftIds, rightIds, selectedId } = this.state;
    const entries = allEntries.filter(({ entranceid }) => {
      return [...leftIds, ...rightIds].indexOf(entranceid) === -1;
    });
    const selectedCls = classnames([styles.selected, styles.entry]);
    return entries.map(entry => {
      const { entranceid, entryname } = entry;
      return (
        <li
          key={entranceid}
          style={{ cursor: 'pointer' }}
          className={entranceid === selectedId ? selectedCls : styles.entry}
          onClick={this.selectEntry.bind(this, entranceid)}
        >
          <span className={styles.entrytext} title={entryname}>{entryname}</span>
          {/* <Icon type="close" className={styles.entryctrl} /> */}
        </li>
      );
    });
  };

  render() {
    const { modalVisible, modalPending, cancel } = this.props;
    return (
      <Modal
        wrapClassName="ant-modal-custom-large"
        title="入口定义"
        visible={modalVisible}
        onOk={this.onConfirm}
        onCancel={cancel}
        confirmLoading={modalPending}
      >
        <Row gutter={8}>
          <Col span={6}>
            <div className={styles.title}>CRM</div>
            <SortableUl className={styles.entrylist} onSortEnd={this.onSortEndLeft} useDragHandle>
              {this.renderEntries('left')}
            </SortableUl>
          </Col>
          <Col span={3} className={styles.controlcol}>
            <Button onClick={this.selectedToLeft}><Icon type="left" /></Button>
            <Button onClick={this.createGroupToLeft}>添加分组</Button>
          </Col>
          <Col span={6}>
            <div className={styles.title}>待选实体</div>
            <ul className={styles.entrylist}>
              {this.renderRestEntries()}
            </ul>
          </Col>
          <Col span={3} className={styles.controlcol}>
            <Button onClick={this.selectedToRight}><Icon type="right" /></Button>
            <Button onClick={this.createGroupToRight}>添加分组</Button>
          </Col>
          <Col span={6}>
            <div className={styles.title}>办公</div>
            <SortableUl className={styles.entrylist} onSortEnd={this.onSortEndRight} useDragHandle>
              {this.renderEntries('right')}
            </SortableUl>
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { showModals, modalPending } = state.entityList;
    return {
      modalVisible: /setEntry/.test(showModals),
      modalPending
    };
  },
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'entityList/showModals', payload: '' });
      },
      submit: data => {
        dispatch({ type: 'entityList/saveEntries', payload: data });
      }
    };
  }
)(SetEntryModal);
