/**
 * Created by 0291 on 2018/8/21.
 */
import React, { PropTypes, Component } from 'react';
import { Icon, message, Spin } from 'antd';
import classnames from 'classnames';
import styles from './index.less';
import { gettemporarylist, deletetemporarylist } from '../../../services/structure';
import { queryWorkflow } from '../../../services/entcomm';
import { queryEntityDetail } from '../../../services/entity';
import EntcommAddModal from '../../../components/EntcommAddModal';

class TemporaryStorage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panelVisible: false,
      list: [],
      showModals: '',
      addModalInfo: {},
      workFlow: null
    };
  }
  componentWillReceiveProps(nextProps) {

  }

  componentDidMount() {
    document.body.addEventListener('mouseup', this.clickOutsideClose, false);
  }

  componentWillUnmount() {
    document.body.removeEventListener('mouseup', this.clickOutsideClose);
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
    this.setState({
      loading: true
    });
    if (this.state.panelVisible) {
      gettemporarylist({}).then(result => {
        this.setState({
          list: result.data,
          loading: false
        });
      }).catch(e => {
        console.error(e.message);
        message.error(e.message);
        this.setState({
          list: [],
          loading: false
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

  queryWorkFlow = (entityid) => {
    queryEntityDetail(entityid).then(result => {
      const entityType = result.data.entityproinfo[0].modeltype;
      if (entityType === 2 || entityType === 3) { //TODO: 只有简单实体和动态实体才需要判断实体是否关联审批流，然后提交完表单后 走审批流
        queryWorkflow(entityid).then(flowResult => {
          this.setState({
            workFlow: flowResult.data
          });
        });
      }
    }).catch(e => {
      console.error(e.message);
    });
  }

  openAddModal = (item) => {
    this.setState({
      showModals: 'add',
      addModalInfo: item,
      panelVisible: false
    }, () => {
      this.queryWorkFlow(item.entityid);
    });
  }

  onCancel = () => {
    this.setState({
      showModals: ''
    });
  }

  onDone = (result, type) => {
    this.setState({
      showModals: ''
    });
    if (type !== 'storage') { //非暂存则  刷新整个页面
      window.location.reload(true);
    };
  }

  deleteStorage = (cacheid, e) => {
    e.stopPropagation();
    deletetemporarylist(cacheid).then(result => {
      message.success('删除成功');
      this.getList();
    }).catch(e => {
      console.error(e.message);
      message.error(e.message);
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
            ...fieldconfig,
            isRequiredJS: fieldconfig.isRequired,
            isReadOnlyJS: fieldconfig.isReadOnly,
            isVisibleJS: fieldconfig.isHidden === 0 ? 1 : 0
          };
        }
        return newItem;
      });
    }
    return fields_;
  };

  render() {
    const { list, showModals, addModalInfo, workFlow } = this.state;
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
              <Spin spinning={this.state.loading}>
                <ul className={styles.listWrap}>
                  {
                    list instanceof Array && list.map(item => {
                      return (
                        <li key={item.cacheid} onClick={this.openAddModal.bind(this, item)}>
                          <div>
                            <span>{item.title}</span>
                            <span>{item.categoryname}</span>
                          </div>
                          <div>
                            <span>{item.createdtime}</span>
                            <span onClick={this.deleteStorage.bind(this, item.cacheid)}><a>删除</a></span>
                          </div>
                        </li>
                      );
                    })
                  }
                </ul>
              </Spin>
            </div>
          </div>
        </div>
        <div onClick={this.clickOutsideClose} className={classnames(styles.MaskModal, { [styles.MaskModalVisible]: this.state.panelVisible })}></div>
        <EntcommAddModal
          visible={/add/.test(showModals)}
          entityId={addModalInfo.entityid}
          entityName={addModalInfo.entityname}
          refRecord={addModalInfo.recrelateid}
          refEntity={addModalInfo.relateentityid}
          entityTypeId={addModalInfo.typeid} //TODO: 暂存数据 已经确定了实体类型
          cacheId={addModalInfo.cacheid}
          flow={workFlow}
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
