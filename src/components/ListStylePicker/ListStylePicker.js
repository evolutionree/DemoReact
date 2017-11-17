import React, { PropTypes, Component } from 'react';
import { Button, Modal } from 'antd';
import { allStyleIds } from './constants';
import styles from './styles.less';
import ListViewer from './ListViewer';

class ListStylePicker extends Component {
  static propTypes = {
    listStyleConfig: PropTypes.shape({
      styleId: PropTypes.number,
      fieldStyleConfigs: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        font: PropTypes.string,
        color: PropTypes.string
      }))
    }),
    onChange: PropTypes.func.isRequired,
    allFields: PropTypes.arrayOf(PropTypes.shape({
      fieldname: PropTypes.string.isRequired,
      fieldlabel: PropTypes.string.isRequired,
      controltype: PropTypes.number.isRequired
    }))
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  onStyleConfigChange = listStyleConfig => {
    this.props.onChange(listStyleConfig);
  };

  renderContent = () => {
    const { listStyleConfig, allFields } = this.props;
    if (listStyleConfig.styleId === undefined) {
      return (
        <div className={styles.empty}>
          <Button onClick={this.showPicker}>选择样式</Button>
        </div>
      );
    }
    return (
      <ListViewer
        allFields={allFields}
        listStyleConfig={listStyleConfig}
        onChange={this.onStyleConfigChange}
      />
    );
  };

  render() {
    return (
      <div>
        {this.renderContent()}
        <Modal
          title="选择样式"
          visible={this.state.modalVisible}
          footer={null}
        >
          选择样式
        </Modal>
      </div>
    );
  }
}

export default ListStylePicker;
