import React from 'react';
import { Button } from 'antd';
import _ from 'lodash';
import MobileFieldsSelectModal from './MobileFieldsSelectModal';
import styles from './styles.less';

class MobileFieldsSelect extends React.Component {
  static propTypes = {
    allFields: React.PropTypes.array,
    selectedIds: React.PropTypes.array,
    onChange: React.PropTypes.func
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      showPicker: false
    };
  }

  handleOk = (newFields) => {
    this.props.onChange(newFields);
    this.setState({
      showPicker: false
    });
  };

  showPicker = () => {
    this.setState({
      showPicker: true
    });
  };

  render() {
    const { allFields, selectedIds } = this.props;
    const hasSelected = (selectedIds && selectedIds.length) || '';
    const selectedFields = selectedIds.map(id => {
      return _.find(allFields, field => field.fieldid === id);
    });
    return (
      <div>
        <div className={styles.subtitle}>
          <span className={styles.step}>第一步</span>
          <span>设置显示字段</span>
          {hasSelected && <a onClick={this.showPicker}>重新选择</a>}
        </div>
        <div>
          {hasSelected ? (
            <ul>
              {selectedFields.map((field, index) => (
                <li key={field.fieldid}>{`数据${index + 1}`} : {field.displayname}</li>
              ))}
            </ul>
          ) : (
            <div className={styles.empty}>
              <Button onClick={this.showPicker}>选择字段</Button>
            </div>
          )}
        </div>
        <MobileFieldsSelectModal
          visible={this.state.showPicker}
          allFields={allFields}
          pickedIds={selectedIds}
          onPick={this.handleOk}
          onCancel={() => { this.setState({ showPicker: false }); }}
        />
      </div>
    );
  }
}

export default MobileFieldsSelect;
