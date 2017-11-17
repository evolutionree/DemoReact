import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import * as _ from 'lodash';
import { Modal, Row, Col, Button, Avatar, message, Checkbox } from 'antd';
// import classnames from 'classnames';
import EntcommAddModal from '../../../../components/EntcommAddModal';
import styles from './RelEntityAddModal.less';
import { parseConfigData } from '../../../../components/ListStylePicker';
import { queryRelAddList, addRelByList } from '../../../../services/entcomm';

class RelEntityAddModal extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      listModalVisible: false,
      addModalVisible: false,
      itemList: [],
      selectedItems: [],
      listModalPending: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      if (nextProps.shouldShowList) {
        this.setState({ listModalVisible: true });
        this.fetchItemList();
      } else {
        this.setState({ addModalVisible: true });
      }
    } else if (isClosing) {
      this.setState({
        listModalVisible: false,
        addModalVisible: false,
        itemList: [],
        selectedItems: [],
        listModalPending: false
      });
    }
  }

  processProtocol = fields => {
    let fields_ = fields;
    const readOnlyFieldKeys = Object.keys(this.props.initFormData);
    if (readOnlyFieldKeys.length) {
      fields_ = fields.map(field => {
        if (_.includes(readOnlyFieldKeys, field.fieldname)) {
          return {
            ...field,
            fieldconfig: {
              ...field.fieldconfig,
              isReadOnly: 1
            }
          };
        }
        return field;
      });
    }
    return fields_;
  };

  fetchItemList = () => {
    const params = {
      recid: this.props.recordId,
      relid: this.props.relId
    };
    queryRelAddList(params).then(result => {
      this.setState({ itemList: result.data });
    }, err => {
      message.error(err.message || '获取列表数据失败');
    });
  };

  handleAddFromList = () => {
    if (!this.state.selectedItems.length) {
      return message.error('未选择数据');
    }
    const params = {
      relid: this.props.relId,
      recid: this.props.recordId,
      idstr: this.state.selectedItems.join(',')
    };
    this.setState({ listModalPending: true });
    addRelByList(params).then(result => {
      this.setState({ listModalPending: false });
      message.success('添加成功');
      this.props.onAddDone();
    }, err => {
      this.setState({ listModalPending: false });
      message.error(err.message || '提交数据失败');
    });
  };

  toggleSelect = (item, event) => {
    const { selectedItems } = this.state;
    // const isSelected = selectedItems.indexOf(item.id) !== -1;
    if (!event.target.checked) {
      this.setState({ selectedItems: selectedItems.filter(id => id !== item.id) });
    } else {
      this.setState({ selectedItems: [...selectedItems, item.id] });
    }
  };

  showAddNew = () => {
    if (this.state.listModalPending) {
      return message.error('提交数据中，请稍候');
    }
    this.setState({
      addModalVisible: true
    });
  };

  handleAddNewCancel = () => {
    if (this.props.shouldShowList) {
      this.setState({ addModalVisible: false });
    } else {
      this.props.cancel();
    }
  };

  // renderItem = (item) => {
  //   const { iconField, listFields } = parseConfigData(this.state.config);
  //   // const { fieldkeys } = this.state.config;
  //   // const keys = fieldkeys.split(',');
  //   return (
  //     <div className={classnames([styles.listrow, { [styles.hasIcon]: !!iconField }])}>
  //       {iconField && (
  //         <Avatar
  //           className={styles.listIcon}
  //           style={{ width: '28px', height: '28px' }}
  //           image={`/api/fileservice/read?fileid=${item[iconField.fieldName]}`}
  //         />
  //       )}
  //       <Row gutter={10}>
  //         {/*{keys.map(key => (*/}
  //           {/*<Col span={12} key={key}><span title={item[key]}>{item[key]}</span></Col>*/}
  //         {/*))}*/}
  //         {listFields.map(({ fieldName, color, font }) => {
  //           const text = item[fieldName + '_name'] !== undefined ? item[fieldName + '_name'] : item[fieldName];
  //           return (
  //             <Col span={12} key={fieldName}>
  //               <span
  //                 title={text}
  //                 style={{ color, fontSize: font + 'px' }}
  //               >
  //                 {text}
  //               </span>
  //             </Col>
  //           );
  //         })}
  //       </Row>
  //     </div>
  //   );
  // };

  render() {
    return (
      <div>
        <Modal
          title={`添加${this.props.entityName}`}
          visible={this.state.listModalVisible}
          onOk={this.handleAddFromList}
          onCancel={this.props.cancel}
          confirmLoading={this.state.listModalPending}
        >
          <Row style={{ padding: '0 6px 8px' }}>
            <Col span={12} style={{ lineHeight: '28px' }}>{this.props.showListTitle || '从列表中选择'}</Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button onClick={this.showAddNew}>新增{this.props.entityName}</Button>
            </Col>
          </Row>
          {this.state.itemList.length ? <ul className={styles.dataList}>
            {this.state.itemList.map(item => {
              const isSelected = this.state.selectedItems.indexOf(item.id) !== -1;
              return (
                <li key={item.id}>
                  <Checkbox
                    style={{ display: 'block' }}
                    checked={isSelected}
                    onChange={this.toggleSelect.bind(this, item)}
                  >{item.name}</Checkbox>
                </li>
              );
            })}
          </ul> : <ul className={styles.dataList}>
            <li style={{ color: '#999' }}>没有数据可选，请新建</li>
          </ul>}
        </Modal>
        <EntcommAddModal
          visible={this.state.addModalVisible}
          entityId={this.props.relEntityId}
          entityName={this.props.entityName}
          refEntity={undefined && this.props.entityId}
          initFormData={this.props.initFormData}
          entityTypes={this.props.entityTypes}
          cancel={this.handleAddNewCancel}
          done={this.props.onAddDone}
          processProtocol={this.processProtocol}
        />
      </div>
    );
  }
}

export default connect(
  state => {
    const { entityId, recordId, relId, relEntityId, showModals,entityTypes } = state.entcommRel;
    const { relTabs, recordDetail } = state.entcommHome;

    let initFormData = null;
    let tabInfo = {};
    if (relTabs.length && relId && relEntityId) {
      tabInfo = _.find(relTabs, item => {
        return item.relid === relId && item.relentityid === relEntityId;
      });
      if (tabInfo) {
        const { fieldname } = tabInfo;
        initFormData = {
          [fieldname]: { id: recordId, name: recordDetail.recname }
        };
      }
    }

    return {
      entityId, recordId, relId, relEntityId,
      entityTypes,
      entityName: (tabInfo && tabInfo.entityname) || '',
      visible: /add/.test(showModals),
      initFormData,
      shouldShowList: !!(tabInfo && tabInfo.ismanytomany),
      showListTitle: tabInfo && tabInfo.srctitle,
      fieldId: tabInfo && tabInfo.fieldid
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entcommRel/putState', payload: { showModals: '' } });
      },
      onAddDone() {
        dispatch({ type: 'entcommRel/onAddDone' });
      }
    };
  }
)(RelEntityAddModal);

