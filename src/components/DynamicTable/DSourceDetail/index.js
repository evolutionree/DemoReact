/**
 * Created by 0291 on 2018/5/9.
 * desc: 查看数据源详情
 */
import React, { PropTypes, Component, PureComponent } from 'react';
import { message, Spin } from 'antd';
import { Link } from 'dva/router';
import { DynamicFormView } from '../../DynamicForm';
import { queryEntityDetail } from '../../../services/entity';
import { getGeneralProtocol, getEntcommDetail } from '../../../services/entcomm';
import classnames from 'classnames';
import Styles from './index.less';

class DSourceDetail extends PureComponent {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    entityId: PropTypes.string,
    recordId: PropTypes.string,
    title: PropTypes.string
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      protocol: [], // 协议字段
      data: {}, // 表单数据
      visible: this.props.visible,
      pemissonLink: false,
      loading: false,
      errData: [] //部分客户查询报错  存这部分数据
    };
  }

  componentWillMount() {
    const { entityId, recordId } = this.props;
    if (entityId && recordId) {
      this.fetchDetailAndProtocol(entityId, recordId);
      this.fetchEntityDetail(entityId);
    } else {
      message.error('缺少必要参数');
    }
  }

  componentWillReceiveProps(nextProps) {
    const { entityId, recordId } = nextProps;
    if (entityId && recordId && (entityId !== this.props.entityId || recordId !== this.props.recordId)) { //&& (this.props.recordId !== recordId) || this.props.entityId !== entityId  考虑到可能关联对象已经被删除了，查无数据就需要关闭窗口，所有，用户重新点击同一个数据源，需要继续请求
      this.fetchDetailAndProtocol(entityId, recordId);
      this.fetchEntityDetail(entityId);
    }

    if (this.state.errData.indexOf(entityId + 'and' + recordId) > -1) {
      message.error('无权限查看或者数据已删');
      this.setState({
        visible: false,
        data: {}
      });
    } else {
      this.setState({
        visible: nextProps.visible
      });
    }
  }

  fetchEntityDetail = (entityId) => {
    queryEntityDetail(entityId).then(result => {
      const { data: { entityproinfo } } = result;
      this.setState({
        pemissonLink: entityproinfo[0].modeltype === 0,  //关联独立实体的数据源 详情 允许跳转到 页签页
        entityname: entityproinfo[0].entityname
      });
    });
  }

  fetchDetailAndProtocol = (entityId, recordId) => {
    const { unNeedPower } = this.props;
    this.setState({
      loading: true
    });
    getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: unNeedPower ? 0 : 1 // TODO 跑权限
    }).then(result => {
      let { detail } = result.data;
      if (detail instanceof Array) {
        detail = detail[0];
      }
      this.setState({ data: detail });
      return getGeneralProtocol({
        typeId: detail.rectype || entityId,
        OperateType: 2
      });
    }, (e) => {
      console.error(e.message);
      message.error('无权限查看或者数据已删');
      this.setState({
        errData: [...this.state.errData, entityId + 'and' + recordId],
        visible: false
      });
    }).then(result => {
      this.setState({
        protocol: result && result.data || [],
        loading: false
      });
    }, (e) => {
      console.error(e.message);
      message.error(e.message);
      this.setState({
        loading: false,
        visible: false
      });
    });
  };

  render() {
    const { entityId, recordId } = this.props;
    const { protocol, data, visible, entityname } = this.state;

    const hasTable = protocol.some(field => {
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });
    //width={hasTable ? 900 : 550}
    const linkUrl = `/entcomm/${entityId}/${recordId}`;
    return (
      <div className={classnames(Styles.Wrap, { [Styles.panelVisible]: visible })} onClick={e => e.nativeEvent.stopImmediatePropagation()} style={{ width: visible ? '550px' : '0px' }}>
        <Spin spinning={this.state.loading}>
          <div className={Styles.header}>
            <label>{entityname ? `${entityname}详情` : this.props.title}</label>
            {
              this.state.pemissonLink ? <Link to={linkUrl}>进入主页</Link> : null
            }
          </div>
          <div className={Styles.formViewWrap}>
            {
              Array.isArray(protocol) && protocol.length ? (
                <DynamicFormView
                  entityId={entityId}
                  entityTypeId={data.rectype || entityId}
                  fields={protocol}
                  value={data}
                  cols={24}
                />
              ) : null
            }
          </div>
        </Spin>
      </div>
    );
  }
}

export default DSourceDetail;
