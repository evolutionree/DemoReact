/**
 * Created by 0291 on 2018/4/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { message, Modal, Spin } from 'antd';
import FieldForm from './component/FieldForm';
import RuleForm from './component/RuleForm';
import Styles from './SetCountRuleModal.less';
import { getrelconfig } from '../../../../services/entity';
import _ from 'lodash';


const initConfigsets = [{
  title: '',
  configset: ''
}, {
  title: '',
  configset: ''
}, {
  title: '',
  configset: ''
}, {
  title: '',
  configset: ''
}];

class SetCountRuleModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    RelId: PropTypes.string,
    cancel: PropTypes.func
  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      FormValue: {
        configs: []
      },
      configsets: initConfigsets,
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      this.setState({
        loading: true
      })
      getrelconfig(nextProps.RelId).then(result => { //查询详情数据
        this.setState({
          FormValue: result.data,
          configsets: this.transformData(result.data.configsets),  //转化为前端的数据结构
          loading: false
        });
      }, err => {
        this.setState({
          loading: false
        })
        message.error('获取统计配置信息失败');
      });
    } else if (isClosing) {

    }
  }

  handleSubmit = () => {
    this.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('统计字段设置中所有项必填');
      }

      let configArr = values.configs;
      for (let i = 0; i < configArr.length; i++) {
        if (configArr[i].type !== 0) {
          delete configArr[i].fieldid; //如果统计字段type为‘函数’或者 ‘服务’则不穿field   0配置1函数2服务
          delete configArr[i].calcutetype;
        }
      }

      let params = {};
      params.configs = configArr;
      params.configsets = this.getRuleConfigValue(); //转化为后端需要的数据结构
      this.props.setCountRule(params);
    });
  };

  transformData(data) {
    let configsets = _.cloneDeep(initConfigsets);
    if (data instanceof Array && data.length > 0) {
      let configsetObj = data && data[0];
      for (let i = 0; i < configsets.length; i++) {
        configsets[i].title = configsetObj['title' + (i + 1)];
        configsets[i].configset = configsetObj['configset' + (i + 1)];
      }
    }
    return configsets;
  }

  getRuleConfigValue() {
    let ConfigSets = [...this.state.configsets];
    let obj = {};
    for (let i = 0; i < ConfigSets.length; i++) {
      obj['title' + (i + 1)] = ConfigSets[i].title;
      obj['configset' + (i + 1)] = ConfigSets[i].configset;
    };
    return [obj];
  }

  render() {
    const { visible, cancel } = this.props;
    return (
      <Modal
        width={660}
        title="统计规则设置"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={cancel}
      >
        <Spin spinning={this.state.loading}>
          <div className={Styles.title}>第一步：统计字段设置</div>
          <FieldForm ref={form => { this.form = form; }} value={this.state.FormValue} onChange={(formValue) => { this.setState({ FormValue: formValue }) }} />
          <div className={Styles.title}>第二步：统计值规则设置</div>
          <RuleForm configsets={this.state.configsets} onChange={(newConfig) => { this.setState({ configsets: newConfig }) }} />
        </Spin>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { entityTabs } = state;
    const { showModals, entityList, RelId } = entityTabs;
    return {
      visible: /setcountrule/.test(showModals),
      entityList,
      RelId
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entityTabs/showModals', payload: '' });
      },
      setCountRule(params) {
        dispatch({ type: 'entityTabs/setCountRule', payload: params });
      }
    };
  },
  undefined,
  { withRef: true }
)(SetCountRuleModal);
