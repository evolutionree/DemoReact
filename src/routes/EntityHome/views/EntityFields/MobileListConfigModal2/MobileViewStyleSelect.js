import React from 'react';
import { Button, message } from 'antd';
import MobFieldViewer from './MobFieldViewer';
import MobileViewStyleSelectModal from './MobileViewStyleSelectModal';
import styles from './styles.less';

class MobileViewStyleSelect extends React.Component {
  static propTypes = {
    mobViewConfig: React.PropTypes.object,
    onChange: React.PropTypes.func,
    disabled: React.PropTypes.bool
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showPicker: false
    };
  }

  onSelect = (styleId) => {
    const mobViewConfig = {
      ...this.props.mobViewConfig,
      viewstyleid: styleId
    };
    this.props.onChange(mobViewConfig);
    this.setState({
      showPicker: false
    });
  };

  onStyledFieldsChange = (fields) => {
    const mobViewConfig = {
      ...this.props.mobViewConfig,
      ...fields
    };
    this.props.onChange(mobViewConfig);
  };

  showPicker = () => {
    if (this.props.disabled) {
      return message.error('请先选择字段');
    }
    this.setState({
      showPicker: true
    });
  };

  render() {
    const { mobViewConfig } = this.props;
    return (
      <div>
        <div className={styles.subtitle} style={{ marginTop: 10 }}>
          <span className={styles.step}>第二步</span>
          <span>设置显示样式</span>
          {mobViewConfig.viewstyleid ? <a onClick={this.showPicker}>重新选择</a> : ''}
        </div>
        <div>
          {mobViewConfig.viewstyleid ? (
            <MobFieldViewer
              mobViewConfig={mobViewConfig}
              onChange={this.onStyledFieldsChange}
            />
          ) : (
            <div className={styles.empty}>
              <Button onClick={this.showPicker}>选择样式</Button>
            </div>
          )}
        </div>
        <MobileViewStyleSelectModal
          mobViewConfig={mobViewConfig}
          visible={this.state.showPicker}
          onSelect={this.onSelect}
          onCancel={() => { this.setState({ showPicker: false }); }}
        />
      </div>
    );
  }
}

export default MobileViewStyleSelect;
