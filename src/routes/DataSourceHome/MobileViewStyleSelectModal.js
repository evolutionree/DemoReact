import React from 'react';
import { Modal } from 'antd';
import styles from './styles.less';
import MobFieldViewer from './MobFieldViewer';

class MobileViewStyleSelectModal extends React.Component {
  static propTypes = {
    visible: React.PropTypes.bool,
    mobViewConfig: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    onCancel: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      allViewStyleIds: [100, 101, 102, 103, 200, 201, 202, 203]
    };
  }

  render() {
    const { visible, mobViewConfig } = this.props;
    const { allViewStyleIds } = this.state;
    return (
      <Modal title="选择样式" visible={visible} footer={null} onCancel={this.props.onCancel}>
        <p>请选择列表显示样式，最多可选择1种</p>
        {visible ? (
          <ul className={styles.demoList}>
            {allViewStyleIds.map(styleId => (
              <li
                key={styleId}
                className={styleId === this.state.viewStyleId}
                onClick={() => { this.props.onSelect(styleId); }}
              >
                <MobFieldViewer
                  mobViewConfig={{ ...mobViewConfig, viewstyleid: styleId }}
                  readOnly
                />
              </li>
            ))}
          </ul>
        ) : ''}
      </Modal>
    );
  }

}

export default MobileViewStyleSelectModal;
