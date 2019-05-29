import React from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import { queryMobFieldVisible, addMobFieldVisible, editMobFieldVisible } from '../../../../../services/entity';
import MobileFieldsSelect from './MobileFieldsSelect';
import MobileViewStyleSelect from './MobileViewStyleSelect';

const defaultMobViewConfig = {
  colors: '#666666,#666666,#666666,#666666,#666666,#666666',
  fonts: '14,14,14,14,14,14'
};
function pad(mobViewConfig, padcount) {
  const count = padcount || getFieldCount(mobViewConfig.viewstyleid);

  const colors = mobViewConfig.colors.split(',');
  const fonts = mobViewConfig.fonts.split(',');
  while (colors.length < count) {
    colors.push('#666666');
  }
  while (colors.length > count) {
    colors.pop();
  }
  while (fonts.length < count) {
    fonts.push('14');
  }
  while (fonts.length > count) {
    fonts.pop();
  }
  return {
    ...mobViewConfig,
    colors: colors.join(','),
    fonts: fonts.join(',')
  };
}
function getFieldCount(styleId) {
  if (!styleId) return 6;
  const map = {
    100: 1,
    101: 2,
    102: 3,
    103: 4,
    104: 5,
    200: 1,
    201: 2,
    202: 3,
    203: 4,
    204: 5
  };
  return map[styleId] || 6;
}

class MobileListConfigModal extends React.Component {
  static propTypes = {
    fields: React.PropTypes.array,
    visible: React.PropTypes.string,
    entityId: React.PropTypes.string
  };
  static defaultProps = {
    fields: [],
    visible: false
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      mobVisibleFieldIds: [], // id array
      mobViewConfig: {
        ...defaultMobViewConfig
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    // 打开窗口时，查数据
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;

    if (isOpening) {
      this.setState({ loading: true });
      queryMobFieldVisible(this.props.entityId).then(result => {
        this.setState({ loading: false });
        const mobViewConfig = result.data.fieldmobstyleconfig[0];
        this.setState({
          mobVisibleFieldIds: result.data.fieldvisible.map(field => field.fieldid),
          mobViewConfig: (mobViewConfig && pad(mobViewConfig, 6)) || { ...defaultMobViewConfig }
        });
      }).catch(e => {
        this.setState({ loading: false });
        message.error(e.message || '请求数据出错');
      });
    } else if (isClosing) {
      this.setState({
        mobVisibleFieldIds: [],
        mobViewConfig: { ...defaultMobViewConfig }
      });
    }
  }

  handleOk = () => {
    const { fields, visible, onCancel } = this.props;
    const { mobVisibleFieldIds, mobViewConfig } = this.state;

    const mobVisibleFields = mobVisibleFieldIds.map(id => {
      return _.find(this.props.fields, field => field.fieldid === id);
    });
    const fieldids = mobVisibleFields.map(field => field.fieldid).join(',');
    const fieldkeys = mobVisibleFields.map(field => field.fieldname).join(',');
    const { colors, fonts } = pad(mobViewConfig); // 更正colors，fonts个数

    if (!mobVisibleFieldIds.length) {
      return message.error('请选择显示字段');
    }
    if (!mobViewConfig.viewstyleid) {
      return message.error('请选择显示样式');
    }

    this.setState({ loading: true });
    let params;
    if (mobViewConfig.viewconfid) {
      params = {
        ...mobViewConfig,
        fieldids,
        fieldkeys,
        colors,
        fonts,
        viewtype: 1
      };
      editMobFieldVisible(params).then(result => {
        this.setState({ loading: false });
        message.success('保存成功');
        onCancel();
      }).catch(e => {
        this.setState({ loading: false });
        message.error(e.message || '提交数据失败');
      });
    } else {
      params = {
        ...mobViewConfig,
        fieldids,
        fieldkeys,
        colors,
        fonts,
        viewtype: 1,
        entityid: this.props.entityId
      };
      addMobFieldVisible(params).then(result => {
        this.setState({ loading: false });
        message.success('保存成功');
        this.props.cancel();
      }).catch(e => {
        this.setState({ loading: false });
        message.error(e.message || '提交数据失败');
      });
    }
  };

  render() {
    const { fields, visible, onCancel } = this.props;
    const { mobVisibleFieldIds, mobViewConfig, loading } = this.state;
    return (
      <Modal
        title="设置手机端列表显示"
        visible={!!visible}
        onOk={this.handleOk}
        onCancel={onCancel}
        confirmLoading={loading}
      >
        <MobileFieldsSelect
          allFields={fields}
          selectedIds={mobVisibleFieldIds}
          onChange={arr => this.setState({ mobVisibleFieldIds: arr })}
        />
        <MobileViewStyleSelect
          disabled={!mobVisibleFieldIds || !mobVisibleFieldIds.length}
          mobViewConfig={mobViewConfig}
          onChange={conf => this.setState({ mobViewConfig: conf })}
        />
      </Modal>
    );
  }

}

export default connect(
  state => {
    return {
      fields: state.entityFields.list.filter(field => field.recstatus === 1),
      entityId: state.entityFields.entityId
    };
  }
)(MobileListConfigModal);
