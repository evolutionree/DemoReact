import React, { PropTypes, Component } from 'react';
import { Icon, Checkbox, Button, message, Modal, Row, Col } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import _ from 'lodash';
import { DynamicFormEdit } from '../../components/DynamicForm';
import styles from './styles.less';
import { getGeneralProtocol, queryEntityStage, queryStageInfo, saveStageData, pushStage, backStage, restartSaleStage } from '../../services/entcomm';
import StageFlowModal from './StageFlowModal';
import StageBarUpload from "./StageBarUpload";
import IntlText from '../../components/UKComponent/Form/IntlText';
import { formatFileSize } from '../../utils';

class StageBar extends Component {
  static propTypes = {
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    recordDetail: PropTypes.object,
    refreshRecordDetail: PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      highSetting: 0,
      stageList: [],
      showingStageId: '', // 当前展示的阶段stageid
      showingStageDetail: {
        keyEvents: [], // 关键事件
        entityFields: [], // 完善实体字段
        entityFieldsData: {},
        customFields: [], // 完善自定义字段
        customFieldsData: {},
        rawInfo: null
      },
      flowModalVisible: false, // 控制审批弹窗是否可见
      excutingJSLoading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const { entityId: lastEntityId, recordDetail: lastRecordDetail, recordId: lastRecordId } = this.props;
    const { entityId, recordDetail, recordId } = nextProps;
    if (!recordDetail.rectype) {
      this.resetState();
      return;
    }
    if (entityId !== lastEntityId || recordId !== lastRecordId) {
      this.resetState();
    }
    if (lastRecordDetail.rectype !== recordDetail.rectype) {
      queryEntityStage(recordDetail.rectype).then(result => {
        this.setState({
          highSetting: result.data.highsetting,
          stageList: result.data.salesstage
        });
      });
    }
  }

  resetState = () => {
    this.setState({
      highSetting: 0,
      stageList: [],
      showingStageId: '',
      showingStageDetail: {
        keyEvents: [],
        entityFields: [],
        entityFieldsData: {},
        customFields: [],
        customFieldsData: {},
        rawInfo: null
      },
      flowModalVisible: false
    });
  };

  /**
   * 查询阶段列表
   */
  fetchStageList = () => {
    const { entityId, recordDetail } = this.props;
    queryEntityStage(recordDetail.rectype || entityId).then(result => {
      this.setState({
        highSetting: result.data.highsetting,
        stageList: result.data.salesstage
      });
    });
  };

  /**
   * 查询阶段详情数据
   */
  fetchStageInfo = stageId => {
    const { entityId, recordDetail } = this.props;
    const params = {
      SalesStageTypeId: recordDetail.rectype || entityId,
      recid: recordDetail.recid,
      SalesStageId: stageId
    };
    return queryStageInfo(params).then(result => result.data);
  };

  /**
   * 解析阶段详情数据
   * @param stageInfo
   * @returns {Promise<R>|Promise<R2|R1>|Promise.<TResult>}
   */
  parseStageInfo = stageInfo => {
    const { eventset, oppinfoset, dynamicentityset, dynamicvalcursor } = stageInfo;
    if (oppinfoset && oppinfoset.length) {
      this.setState({
        entityTypeId: oppinfoset[0].typeid || oppinfoset[0].entityid
      });
    } else if (dynamicentityset && dynamicentityset[0] && dynamicentityset[0].typeid) {
      this.setState({
        entityTypeId: dynamicentityset[0].typeid
      });
    }

    const fetchEntityFields = (oppinfoset && oppinfoset.length)
      ? getGeneralProtocol({
        typeid: oppinfoset[0].typeid || oppinfoset[0].entityid,
        operatetype: 1
      })
      : new Promise(res => res());
    const fetchCustomFields = (dynamicentityset && dynamicentityset[0] && dynamicentityset[0].typeid)
      ? getGeneralProtocol({
        typeid: dynamicentityset[0].typeid,
        operatetype: 0
      })
      : new Promise(res => res());

    return Promise.all([
      fetchEntityFields,
      fetchCustomFields
    ]).then(([res1, res2]) => {
      let keyEvents = [];
      let entityFields = [];
      const entityFieldsData = {};
      let customFields = [];
      let customFieldsData = {};

      if (eventset && eventset.length) {
        keyEvents = eventset;
      }

      if (res1) {
        entityFields = oppinfoset.map(item => {
          const match = _.find(res1.data, ['fieldid', item.fieldid]);
          if (match && match.controltype !== 20) { //分组不必填
            match.isrequire = true;
          }
          return match;
        }).filter(item => !!item);
        oppinfoset.forEach(item => {
          entityFieldsData[item.fieldname] = item.fieldvalue;
        });
      }

      if (res2) {
        customFields = res2.data;
        if (dynamicvalcursor && dynamicvalcursor.length) {
          customFieldsData = dynamicvalcursor[0];
        }
      }

      return {
        keyEvents,
        entityFields,
        entityFieldsData: this.getEditData(entityFieldsData, entityFields),
        customFields,
        customFieldsData: this.getEditData(customFieldsData, customFields),
        rawInfo: stageInfo
      };
    });
  };

  /**
   * 保存当前阶段详情数据
   */
  saveStageDetail = () => {
    if (this.checkCurrentIsLose()) {
      message.error('当前为输单状态，请重新启动阶段推进');
      return;
    }
    if (this.checkCurrentIsWin()) {
      message.error('商机已赢单!');
      return;
    }
    const fn = () => {
      Promise.all([
        this.checkForm(this.entityForm),
        this.checkForm(this.customForm)
      ]).then(() => {
        const { recordDetail } = this.props;
        const { showingStageId, showingStageDetail } = this.state;
        const {
          keyEvents,
          entityFields,
          entityFieldsData,
          customFields,
          customFieldsData,
          rawInfo
        } = showingStageDetail;

        const params = {
          recid: recordDetail.recid,
          typeid: recordDetail.rectype,
          salesstageids: showingStageId,
          relEntityId: this.props.entityId,
          relRecId: this.props.recordDetail.recid,
          isweb: 1
        };
        const stageName = this.getStageName(showingStageId);
        if (stageName === '赢单' || stageName === '输单') {
          params.SalesStageFlag = 1;
        }
        if (keyEvents.length) {
          params.event = keyEvents.map(item => {
            return {
              ...item,
              isuploadfile: item.isuploadfile ? 1 : 0
            };
          });
        }
        if (entityFields.length) {
          params.info = {
            typeid: recordDetail.rectype,
            fielddata: entityFieldsData
          };
        }
        /** *
         * 处理默认值的问题
         */
        if (customFields.length) {
          customFields.forEach(item => {
            if (!(!item.defaultvalue) && item.defaultvalue !== '') {
              if (!customFieldsData[item.fieldname] || customFieldsData[item.fieldname] === '') {
                customFieldsData[item.fieldname] = item.defaultvalue;
              }
            }
          });
        }
        if (customFields.length) {
          params.dynentity = {
            typeid: rawInfo.dynamicentityset[0].typeid,
            fielddata: customFieldsData
          };
        }
        this.postStageData(params);
      }, err => {
        message.error('请检查表单');
      });
    };
    // TODO 若是赢单，检查是否需要提交流程。。
    if (this.getStageName(this.state.showingStageId) === '赢单') {
      this.checkCurrentStageNeedFlow(fn);
    } else {
      fn();
    }
  };
  restartStage = () => {
    if (this.checkCurrentIsLose()) {
      const { recordDetail } = this.props;
      const params = {
        recid: recordDetail.recid,
        typeid: recordDetail.rectype
      };
      this.postRestartStageData(params);
    } else {
      message.error('商机不处于输单状态！');
    }
  };
  postRestartStageData = data => {
    restartSaleStage(data).then(result => {
      this.props.refreshRecordDetail();
      message.success('重启成功');
      this.refreshStageDetail();
    }, err => {
      message.error(err.message || '重启失败');
    });
  };
  postStageData = data => {
    saveStageData(data).then(result => {
      this.props.refreshRecordDetail();
      message.success('提交成功');
      this.refreshStageDetail();
      // if (data.SalesStageFlag === 1) {
      //   this.props.refreshRecordDetail && this.props.refreshRecordDetail();
      // }
    }, err => {
      message.error(err.message || '提交失败');
    });
  };

  onKeyEventToggle = (keyEvent, event) => {
    keyEvent.isfinish = event.target.checked ? 1 : 0;
    this.setState({
      showingStageDetail: {
        ...this.state.showingStageDetail
      }
    });
  };

  /**
   * 校验表单
   * @param form
   * @returns {Promise}
   */
  checkForm = form => {
    return new Promise((resolve, reject) => {
      if (!form) return resolve();
      form.validateFields(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  };

  /**
   * 推进到某个阶段
   * @param stageId
   */
  pushToStage = stageId => {
    if (this.checkCurrentIsLose()) {
      message.error('当前为输单状态，请重新启动阶段推进');
      return;
    }
    if (this.state.highSetting === 1) { // 未开启高级模式，不能跨阶段推进
      const currStageId = this.getRecordCurrentStage();
      if (currStageId) {
        const diff = this.compareStageIndex(stageId, currStageId);
        if (diff > 1) {
          return message.error('高级模式下不能跨阶段推进');
        }
      }
    }
    Modal.confirm({
      title: `确定推进销售阶段至${this.getStageName(stageId)}？`,
      onOk: () => {
        // TODO 检查是否需要提交流程。。
        this.checkCurrentStageNeedFlow(() => {
          const ids = [];
          const targetStageIndex = _.findIndex(this.state.stageList, ['salesstageid', stageId]);
          for (let i = 0; i <= targetStageIndex; i++) {
            ids.push(this.state.stageList[i].salesstageid);
          }
          const params = {
            recid: this.props.recordDetail.recid,
            typeid: this.props.recordDetail.rectype,
            SalesStageIds: ids.join(',')
          };
          pushStage(params).then(result => {
            this.props.refreshRecordDetail();
            message.success('操作成功');
            // this.props.refreshRecordDetail && this.props.refreshRecordDetail();
          }, error => {
            message.error(error.message || '提交数据失败');
          });
        });
      }
    });
  };


  /**
   * 退回到某个阶段
   * @param stageId
   */
  backToStage = stageId => {
    if (this.checkCurrentIsLose()) {
      message.error('当前为输单状态，请重新启动阶段推进');
      return;
    }
    if (this.checkCurrentIsWin()) {
      message.error('商机已赢单!');
      return;
    }

    Modal.confirm({
      title: `确定回退销售阶段至${this.getStageName(stageId)}？`,
      onOk: () => {
        const params = {
          recid: this.props.recordDetail.recid,
          typeid: this.props.recordDetail.rectype,
          SalesStageId: stageId
        };
        backStage(params).then(result => {
          this.props.refreshRecordDetail();
          message.success('操作成功');
          // this.props.refreshRecordDetail && this.props.refreshRecordDetail();
        }, error => {
          message.error(error.message || '提交数据失败');
        });
      }
    });
  };

  /**
   * 获取商机当前所处阶段
   */
  getRecordCurrentStage = () => {
    return this.props.recordDetail.recstageid;
  };

  /**
   * 切换显示商机阶段详情
   * @param stageId
   */
  toggleStageDetail = stageInfo => {
    const stageId = stageInfo.salesstageid;
    if (this.state.showingStageId === stageId) {
      // 隐藏
      this.setState({
        showingStageId: '',
        showingStageDetail: {
          keyEvents: [],
          entityFields: [],
          entityFieldsData: {},
          customFields: [],
          customFieldsData: {},
          stageInfo: null
        }
      });
      return;
    }

    this.setState({
      showingStageId: stageId,
      showingStageDetail: {
        keyEvents: [],
        entityFields: [],
        entityFieldsData: {},
        customFields: [],
        customFieldsData: {},
        stageInfo: null
      }
    });

    if (this.state.highSetting === 0 && stageInfo.stagename !== '赢单' && stageInfo.stagename !== '输单') return; // 没开启高级模式
    this.fetchStageInfo(stageId)
      .then(this.parseStageInfo)
      .then(showingStageDetail => {
        this.setState({
          showingStageDetail
        });
      });
  };

  refreshStageDetail = () => {
    const stageId = this.state.showingStageId;
    if (!stageId) return;
    this.fetchStageInfo(stageId)
      .then(this.parseStageInfo)
      .then(showingStageDetail => {
        this.setState({
          showingStageDetail
        });
      });
  };

  /**
   * 当前是否输单
   */
  checkCurrentIsLose = () => {
    const currStage = this.getRecordCurrentStage();
    if (!currStage) return false;
    return this.getStageName(currStage) === '输单';
  };
  /** *
   * 判断当期阶段是否为赢单
   * @returns {boolean}
   */
  checkCurrentIsWin = () => {
    const currStage = this.getRecordCurrentStage();
    if (!currStage) return false;
    return this.getStageName(currStage) === '赢单';
  };
  getStageName = stageId => {
    const { stageList } = this.state;
    const stageObj = _.find(stageList, ['salesstageid', stageId]);
    if (!stageObj) return '';
    return stageObj.stagename;
  };

  compareStageIndex = (stageId, anotherStageId) => {
    if (!stageId || !anotherStageId) return 0;
    if (stageId === anotherStageId) return 0;
    const stageIndex = _.findIndex(this.state.stageList, ['salesstageid', stageId]);
    const anotherStageIndex = _.findIndex(this.state.stageList, ['salesstageid', anotherStageId]);
    // return stageIndex > anotherStageIndex ? 1 : -1;
    return stageIndex - anotherStageIndex;
  };

  /**
   * 阶段推进，赢单时，检查当前阶段是否需要流程
   */
  checkCurrentStageNeedFlow = (callback) => {
    if (this.state.highSetting === 0) {
      callback(); // 未开启高级模式，不检查流程
      return;
    }
    this.fetchStageInfo(this.getRecordCurrentStage()).then(stageInfo => {
      const dyEntity = stageInfo.dynamicentityset && stageInfo.dynamicentityset[0];
      const eventset = stageInfo.eventset;
      const currentStageName = this.getStageName(this.getRecordCurrentStage());

      if (eventset && eventset.length) {
        const notFinishedEvents = eventset
          .filter(item => !item.isfinish)
          .map(item => item.eventname)
          .join(', ');
        const notUploadedEvents = eventset
          .filter(item => item.isneedupfile && !item.isuploadfile)
          .map(item => item.eventname)
          .join(', ');
        if (notFinishedEvents) {
          message.error(`阶段"${currentStageName}"尚未完成阶段任务，请完善后再推进`);
          return;
        }
        if (notUploadedEvents) {
          message.error(`阶段"${currentStageName}"不满足阶段推进条件(文件未上传)，请完善后再推进`);
          return;
        }
      }

      if (dyEntity && dyEntity.flowid) {
        if (!dyEntity.recid) {
          message.error(`阶段"${currentStageName}"尚未提交数据，请完善后再推进`);
          return;
        }
        if (dyEntity.auditstatus === 0 || dyEntity.auditstatus === 3) {
          message.error('阶段推进流程正在审批中，不能保存');
          return;
        }
        message.success(`阶段"${currentStageName}"需要提交审批`, 3);
        this.setState({
          flowEntity: dyEntity
        });
        return;
      }
      callback();
    });
  };

  onFlowCancel = () => {
    this.setState({ flowEntity: null });
  };

  onFlowDone = () => {
    this.setState({ flowEntity: null }, this.props.refreshRecordDetail);
  };

  onFileUpload = (eventsetid, { fileId, fileName, fileSize }) => {
    const { keyEvents } = this.state.showingStageDetail;
    const evt = _.find(keyEvents, ['eventsetid', eventsetid]);
    let fileArray = [];
    try {
      fileArray = JSON.parse(evt.fileid);
    } catch (e) { }
    fileArray = fileArray || [];
    fileArray.push({
      fileId,
      fileName,
      fileSize
    });
    evt.fileid = JSON.stringify(fileArray);
    evt.isuploadfile = fileArray.length > 0 ? 1 : 0;
    this.setState({
      showingStageDetail: {
        ...this.state.showingStageDetail,
        keyEvents: [...keyEvents]
      }
    });
  };

  onFileDel = (eventsetid, fileId) => {
    const { keyEvents } = this.state.showingStageDetail;
    const evt = _.find(keyEvents, ['eventsetid', eventsetid]);
    let fileArray = [];
    try {
      fileArray = JSON.parse(evt.fileid);
    } catch (e) { }
    fileArray = fileArray || [];
    fileArray = fileArray.filter(file => file.fileId !== fileId);
    evt.isuploadfile = fileArray.length > 0 ? 1 : 0;
    evt.fileid = JSON.stringify(fileArray);
    this.setState({
      showingStageDetail: {
        ...this.state.showingStageDetail,
        keyEvents: [...keyEvents]
      }
    });
  };

  renderFlowModal = () => {
    let i = 0;
    const { flowEntity } = this.state;
    const relEntityId = this.props.entityId;
    const relRecId = this.props.recordDetail.recid;
    const stageList = [];
    for (i = 0; i < this.state.stageList.length; i += 1) {
      const item = this.state.stageList[i];
      if (item.salesstageid === this.state.showingStageId || this.state.showingStageId === '') {
        stageList.push(item);
        break;
      }
      stageList.push(item);
    }
    return (
      <StageFlowModal
        visible={!!(flowEntity && flowEntity.recid)}
        entityId={flowEntity && flowEntity.typeid}
        recordId={flowEntity && flowEntity.recid}
        typeId={flowEntity && flowEntity.typeid}
        entityName={flowEntity && flowEntity.entityname}
        relentityid={relEntityId}
        relrecid={relRecId}
        salesstageids={stageList.map(item => item.salesstageid).join(',')}
        currPlugin={{
          type: 'audit',
          flowid: flowEntity && flowEntity.flowid
        }}
        cancel={this.onFlowCancel}
        done={this.onFlowDone}
      />
    );
  };

  renderStageList = () => {
    if (!this.state.stageList.length) return null;
    const currentStageId = this.getRecordCurrentStage();
    return (
      <ul className={styles.stagelist}>
        {this.state.stageList.map((item, index) => {
          const liCls = classnames([styles.stageitem, {
            [styles.currentstage]: currentStageId === item.salesstageid,
            [styles.laststage]: index === this.state.stageList.length - 1
          }]);
          return (
            <li className={liCls} key={item.salesstageid}
              onClick={() => { this.toggleStageDetail(item); }}>
              <div className={styles.stagetext}><IntlText name="stagename" value={item} /></div>
              <div className={styles.stageicon}>
                <Icon type="down" />
              </div>
              <Icon className={styles.stagearrow} type="double-right" />
              {item.salesstageid === this.state.showingStageId
                && <Icon type="caret-up" className={styles.stagemark} />}
            </li>
          );
        })}
        {this.checkCurrentIsLose() && (
          <li
            className={classnames([styles.stageitem, styles.restart])}
            onClick={this.restartStage}
          >
            重新启动
          </li>
        )}
      </ul>
    );
  };

  getEditData(recordDetail, protocol) { //表格数据 需要再套一层
    const retData = { ...recordDetail };
    protocol.forEach(field => {
      const { controltype, fieldname, fieldconfig } = field;
      if (controltype === 24 && retData[fieldname]) {
        retData[fieldname] = retData[fieldname].map(item => {
          return {
            TypeId: fieldconfig.entityId,
            FieldData: item
          };
        });
      }
    });
    return retData;
  }

  excutingJSStatusChange = (status) => {
    this.setState({
      excutingJSLoading: status
    });
  }

  renderStageDetail = () => {
    const { showingStageId, excutingJSLoading } = this.state;
    if (!showingStageId) return null;

    const currentStageId = this.getRecordCurrentStage();
    const stageIndex = this.compareStageIndex(this.state.showingStageId, currentStageId);
    const showingStageName = this.getStageName(this.state.showingStageId);
    if (this.state.highSetting === 0 && showingStageName !== '赢单' && showingStageName !== '输单') {
      if (stageIndex === 0) return null;
    }

    const {
      keyEvents,
      entityFields, entityFieldsData,
      customFields, customFieldsData
    } = this.state.showingStageDetail;
    return (
      <div className={styles.stagedropdown}>
        {
          keyEvents.length !== 0 && stageIndex <= 0 &&
          <div className={styles.detailsection}>
            <div className={styles.title}>阶段任务</div>
            {keyEvents.map(evt => {
              let fileArray = [];
              try {
                fileArray = JSON.parse(evt.fileid);
              } catch (e) { }
              fileArray = fileArray || []
              return (
                <div key={evt.eventsetid}>
                  <Checkbox
                    checked={evt.isfinish}
                    style={{ marginBottom: '15px' }}
                    onChange={(e) => { this.onKeyEventToggle(evt, e); }}
                  >
                    <span>{evt.eventname}</span>
                  </Checkbox>
                  {evt.isneedupfile === 1 && (
                    <span title="上传附件" style={{ marginLeft: '-12px', cursor: 'pointer', display: 'inline-block' }}>
                      <StageBarUpload
                        onUpload={this.onFileUpload.bind(this, evt.eventsetid)}
                        uploaded={!!evt.isuploadfile}
                      />
                    </span>
                  )}
                  {fileArray.length > 0 && (
                    <ul style={{ width: '420px', background: '#eee' }}>
                      {fileArray.map(file => {
                        const style = {
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          padding: '5px 10px',
                          fontSize: '12px'
                        };
                        return (
                          <li key={file.fileId} style={style}>
                            <Row>
                              <Col span={20}>
                                <Icon type="link" style={{ marginRight: '3px' }} />
                                {/*<a href={`/api/fileservice/read?fileid=${file.fileId}`}>*/}
                                <span>{file.fileName}({formatFileSize(file.fileSize)})</span>
                                {/*</a>*/}
                              </Col>
                              <Col span={4} style={{ textAlign: 'right' }}>
                                <a href={`/api/fileservice/read?fileid=${file.fileId}`} style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>
                                  {/*<span>{file.fileName}({formatFileSize(file.fileSize)})</span>*/}
                                  <Icon type="download" />
                                </a>
                                <Icon
                                  type="close"
                                  style={{ cursor: 'pointer' }}
                                  onClick={this.onFileDel.bind(this, evt.eventsetid, file.fileId)}
                                />
                              </Col>
                            </Row>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        }
        {
          entityFields.length !== 0 && stageIndex <= 0 &&
          <div className={styles.detailsection}>
            <div className={styles.title}>关键信息</div>
            <div className={styles.stageform}>
              <DynamicFormEdit
                horizontal
                ref={form => this.entityForm = form}
                entityId={this.props.entityId}
                entityTypeId={this.state.entityTypeId}
                fields={entityFields}
                value={entityFieldsData}
                refEntityData={this.props.recordDetail}
                onChange={val => this.setState({
                  showingStageDetail: { ...this.state.showingStageDetail, entityFieldsData: val }
                })}
                excutingJSStatusChange={this.excutingJSStatusChange}
              />
            </div>
          </div>
        }
        {
          customFields.length !== 0 && stageIndex <= 0 &&
          <div className={styles.detailsection}>
            <div className={styles.title}>补充信息</div>
            <div className={styles.stageform}>
              <DynamicFormEdit
                horizontal
                ref={form => this.customForm = form}
                entityId={this.props.entityId}
                entityTypeId={this.state.entityTypeId}
                fields={customFields}
                value={customFieldsData}
                refEntityData={this.props.recordDetail}
                onChange={val => this.setState({
                  showingStageDetail: { ...this.state.showingStageDetail, customFieldsData: val }
                })}
                excutingJSStatusChange={this.excutingJSStatusChange}
              />
            </div>
          </div>
        }
        {this.renderSubmitButton(excutingJSLoading)}
      </div>
    );
  };

  renderSubmitButton = (excutingJSLoading) => {
    const currentStageId = this.getRecordCurrentStage();
    const { showingStageId } = this.state;
    const showingStageName = this.getStageName(showingStageId);
    if (showingStageName !== '赢单' && showingStageName !== '输单') {
      const result = this.compareStageIndex(showingStageId, currentStageId);
      if (result === 0) {
        return <Button loading={excutingJSLoading} onClick={this.saveStageDetail}>保存</Button>;
      } else if (result < 0) {
        return <Button onClick={() => { this.backToStage(showingStageId); }}>回退到此阶段</Button>;
      } else {
        return <Button onClick={() => { this.pushToStage(showingStageId); }}>推进到此阶段</Button>;
      }
    } else {
      const text = showingStageName === '赢单' ? '确认赢单' : '确认输单';
      return <Button onClick={this.saveStageDetail}>{text}</Button>;
    }
  };

  render() {
    return (
      <div className={styles.stages}>
        {this.renderStageList()}
        {this.renderStageDetail()}
        {this.renderFlowModal()}
      </div>
    );
  }
}

export default connect(
  state => {
    const { entityId, recordId, recordDetail } = state.entcommHome;
    return {
      entityId,
      recordId,
      recordDetail
    };
  },
  dispatch => {
    return {
      refreshRecordDetail() {
        dispatch({ type: 'entcommHome/fetchRecordDetail' });
      }
    };
  }
)(StageBar);
