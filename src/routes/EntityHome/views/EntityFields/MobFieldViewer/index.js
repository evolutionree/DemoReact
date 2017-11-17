import React from 'react';
import classnames from 'classnames';
import { FieldTypes,PresetLayouts } from './constants';
import FieldContainer from './FieldContainer';
import FieldHolder from './FieldHolder';
import styles from './styles.less';

class MobFieldViewer extends React.Component {
  static propTypes = {
    fields: React.PropTypes.arrayOf(React.PropTypes.shape({
      fieldId: React.PropTypes.string,
      fieldType: React.PropTypes.oneOf([FieldTypes.Image, FieldTypes.Text]),
      fieldLabel: React.PropTypes.string,
      font: React.PropTypes.number,
      color: React.PropTypes.string
    })),
    styleId: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8]),
    onChange: React.PropTypes.func,
    readOnly: React.PropTypes.bool
  };
  static defaultProps = {
    fields: [],
    usePresetStyle: 1,
    readOnly: false
  };

  static getLayout = (styleId) => {
    return PresetLayouts[styleId];
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onFieldChange = (fieldIndex, options) => {
    const newFields = [...this.props.fields];
    newFields[fieldIndex] = {
      ...newFields[fieldIndex],
      ...options
    };
    this.props.onChange(newFields);
  };

  renderTextFields = (layoutRemark) => {
    // layoutRemark: 10101
    // 第一个是图片标识位，不渲染
    const hasPicture = layoutRemark[0] === '1';
    let dataIndex = hasPicture ? 0 : -1;
    return layoutRemark.slice(1).split('').map((flag, index) => {
      if (flag === '1') {
        dataIndex += 1;
        const field = this.props.fields[dataIndex];
        return (
          <FieldHolder
            key={field ? field.fieldId : index}
            field={field || {}}
            onChange={this.onFieldChange.bind(this, dataIndex)}
            readOnly={this.props.readOnly}
          >
            {field ? field.fieldLabel : `数据${dataIndex + 1}`}
          </FieldHolder>
        );
      }
      return '';
    });
  };

  render() {
    const { styleId, fields, readOnly } = this.props;
    const layoutRemark = MobFieldViewer.getLayout(styleId);
    const hasPicture = layoutRemark[0] === '1';
    const containerCls = classnames({
      [styles.container]: true,
      [styles.hasPicture]: hasPicture
    });
    return (
      <div className={containerCls}>
        {hasPicture ? (
          <FieldHolder
            field={fields[0]}
            onChange={this.onFieldChange.bind(this, 0)}
            isImage
            readOnly={readOnly}
          />
        ) : ''}
        {this.renderTextFields(layoutRemark)}
      </div>
    );
  }
}

export default MobFieldViewer;
