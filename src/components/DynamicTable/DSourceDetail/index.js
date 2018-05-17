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
      loading: false
    };
  }

  componentWillMount() {
    const { entityId, recordId } = this.props;
    if (entityId && recordId) {
      this.fetchDetailAndProtocol(entityId, recordId);
      this.fetchEntityDetail(entityId);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { entityId, recordId } = nextProps;
    if (entityId && recordId && (this.props.recordId !== recordId) || this.props.entityId !== entityId) {
      this.fetchDetailAndProtocol(entityId, recordId);
      this.fetchEntityDetail(entityId);
    }
  }

  fetchEntityDetail = (entityId) => {
    queryEntityDetail(entityId).then(result => {
      const { data: { entityproinfo } } = result;
      this.setState({
        pemissonLink: entityproinfo[0].modeltype === 0  //关联独立实体的数据源 详情 允许跳转到 页签页
      });
    });
  }

  fetchDetailAndProtocol = (entityId, recordId) => {
    this.setState({
      loading: true
    });
    getEntcommDetail({
      entityId,
      recId: recordId,
      needPower: 0 // TODO 跑权限
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
    }).then(result => {
      this.setState({
        protocol: result.data,
        loading: false
      });
    }).catch((e) => {
      console.error(e.message);
      message.error(e.message);
      this.setState({
        loading: false
      });
    });
  };

  testSocket = () => {
    //let socket = new WebSocket('ws://118.25.40.163:8088');
    let socket = new WebSocket('ws://10.187.133.221:8880/ws');
    socket.onopen = (event) => {
      socket.send('I am the client and I\'m listening!');
      socket.onmessage = (event) => {
        console.log('Client received a message',event)
      };
      socket.onclose = (event) => {
        console.log('Client notified socket has closed',event)
      };
    };
  }

  render() {
    const { visible, entityId, recordId } = this.props;
    const { protocol, data } = this.state;

    const hasTable = protocol.some(field => {
      return field.controltype === 24 && (field.fieldconfig.isVisible === 1);
    });
    //width={hasTable ? 900 : 550}
    let linkUrl = `/entcomm/${entityId}/${recordId}`;
    return (
      <div className={classnames(Styles.Wrap, { [Styles.panelVisible]: visible })} onClick={e => e.nativeEvent.stopImmediatePropagation()} style={{ width: visible ? '550px' : '0px' }}>
        <Spin spinning={this.state.loading}>
          <div className={Styles.header}>
            <label>{this.props.title}</label>
            {
              this.state.pemissonLink ? <Link to={linkUrl}>进入主页</Link> : null
            }
          </div>
          <div className={Styles.formViewWrap}>
            <DynamicFormView
              entityId={entityId}
              entityTypeId={data.rectype || entityId}
              fields={protocol}
              value={data}
            />
          </div>
        </Spin>
      </div>
    );
  }
}

export default DSourceDetail;
