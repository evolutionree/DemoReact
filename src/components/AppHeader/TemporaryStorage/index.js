/**
 * Created by 0291 on 2018/8/21.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Icon, message } from 'antd';
import classnames from 'classnames';
import _ from 'lodash';
import styles from './index.less';
import { queryTypes } from '../../../services/entity';
import { gettemporarylist } from '../../../services/structure';
import EntcommAddModal from '../../../components/EntcommAddModal';

class TemporaryStorage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      list: [],
      showModals: '',
      addModalInfo: {},
      entityTypes: null
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
    document.body.addEventListener('click', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.clickOutsideClose);
  }

  clickOutsideClose = (event) => {
    if ($(event.target).closest('#TemporaryStorageWrap').length) {
      return;
    }
    this.setState({
      panelVisible: false
    });
  };

  componentDidUpdate() {

  }


  getList = () => {
    if (this.state.panelVisible) {
      gettemporarylist({}).then(result => {
        this.setState({
          list: result.data
        });
      }).catch(e => {
        console.error(e.message);
        message.error(e.message);
        this.setState({
          list: []
        });
      });
    }
  }


  togglePanelVisible = () => {
    this.setState({
      panelVisible: !this.state.panelVisible
    }, () => {
      this.getList();
    });
  }

  openAddModal = (item) => {
    this.setState({
      showModals: 'add',
      addModalInfo: item
    });
    // queryTypes({ entityId: item.entityid }).then(result => {
    //   this.setState({
    //     entityTypes: result.data.entitytypepros
    //   });
    // });
  }

  onCancel = () => {
    this.setState({
      showModals: ''
    });
  }

  onDone = () => {
    this.setState({
      showModals: ''
    });
  }

  processProtocol = fields => {
    const { addModalInfo } = this.state;
    const fieldjson = addModalInfo.fieldjson;

    let fields_ = fields;
    if (fieldjson) {
      fields_ = fields.map(item => {
        let newItem = item;
        if (fieldjson[item.fieldid]) {
          const fieldconfig = fieldjson[item.fieldid];
          newItem.fieldconfig = {
            ...item.fieldconfig,
            isRequiredJS: fieldconfig.isRequired,
            isReadOnlyJS: fieldconfig.isReadOnly,
            isVisibleJS: fieldconfig.isHidden === 0 ? 1 : 0,
            designateDataSource: fieldconfig.designateDataSource,
            designateDataSourceByName: fieldconfig.designateDataSourceByName,
            designateFilterDataSource: fieldconfig.designateFilterDataSource,
            designateFilterDataSourceByName: fieldconfig.designateFilterDataSourceByName,
            designateNodes: fieldconfig.designateNodes,
            designateFilterNodes: fieldconfig.designateFilterNodes
          };
        }
        return newItem;
      });
    }
    return fields_;
  };

  render() {
    // flow={selectedFlowObj}
    const { list, showModals, addModalInfo, entityTypes } = this.state;
    return (
      <div>
        <div id="TemporaryStorageWrap">
          <Icon
            type="inbox"
            title="暂存列表"
            style={{ fontSize: 26, cursor: 'pointer', verticalAlign: 'middle', marginLeft: '10px' }}
            onClick={this.togglePanelVisible}
          />
          <div className={classnames(styles.panelWrap, { [styles.panelVisible]: this.state.panelVisible })}>
            <div className={styles.header}>暂存列表</div>
            <div className={styles.body}>
              <ul className={styles.listWrap}>
                {
                  list instanceof Array && list.map(item => {
                    return (
                      <li key={item.cacheid} onClick={this.openAddModal.bind(this, item)}>
                        <div>
                          <span>{item.title}</span>
                          <span>{item.categoryname}</span>
                        </div>
                        <div>{item.createdtime}</div>
                      </li>
                    );
                  })
                }
              </ul>
            </div>
          </div>
        </div>
        <div className={classnames(styles.MaskModal, { [styles.MaskModalVisible]: this.state.panelVisible })}></div>
        <EntcommAddModal
          visible={/add/.test(showModals)}
          entityId={addModalInfo.entityid}
          entityName={addModalInfo.entityname}
          entityTypeId={addModalInfo.typeid}
          cacheId={addModalInfo.cacheid}
          initFormData={addModalInfo.datajson && addModalInfo.datajson.expandfields}
          extradata={addModalInfo.datajson && addModalInfo.datajson.extraData}
          processProtocol={this.processProtocol}
          cancel={this.onCancel}
          done={this.onDone}
        />
      </div>
    );
  }
}

export default TemporaryStorage;
