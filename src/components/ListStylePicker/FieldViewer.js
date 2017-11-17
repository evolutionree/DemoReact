import React, { PropTypes, Component } from 'react';
import { Popover, Form, InputNumber, Input, Select } from 'antd';
import _ from 'lodash';
import { fieldTypes } from './constants';
import styles from './styles.less';

const FormItem = Form.Item;
const Option = Select.Option;

class FieldViewer extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    fieldStyleConfig: PropTypes.shape({
      fieldKey: PropTypes.string,
      font: PropTypes.string,
      color: PropTypes.string
    }),
    onChange: PropTypes.func,
    allFields: PropTypes.array
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      popVisible: false
    };
  }

  handleCancel = () => {
    this.setState({ popVisible: false });
  };

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.onChange(values);
      this.setState({ popVisible: false });
    });
  };

  handleVisibleChange = (visible) => {
    this.setState({ popVisible: true });

    // 展开时，设置表单值
    if (visible) {
      const { font, color, fieldKey } = this.props.fieldStyleConfig;
      this.props.form.setFieldsValue({
        font,
        color,
        fieldKey
      });
    }
  };

  renderText = () => {
    const { color, font, fieldKey } = this.state.popVisible
      ? this.props.form.getFieldsValue()
      : this.props.fieldStyleConfig;
    const style = { color, fontSize: `${font}px` };
    let text = this.props.children;
    if (fieldKey) {
      const field = _.find(this.props.allFields, ['fieldname', fieldKey]);
      text = field && field.fieldlabel;
    }
    return (
      <div className={styles.cellHolder}>
        <span className={styles.text} style={style}>{text}</span>
      </div>
    );
  };

  renderFieldOptions = () => {
    const imageControlTypes = [1002, 1003, 1006, 15, 25];
    const isImage = this.props.type === fieldTypes.Image;
    let fields = this.props.allFields;
    if (isImage) {
      fields = fields.filter(
        field => _.includes(imageControlTypes, field.controltype)
      );
    }
    return fields.map(field => (
      <Option key={field.fieldname}>{field.fieldlabel}</Option>
    ));
  };

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    const isImage = this.props.type === fieldTypes.Image;
    return (
      <div>
        <Form inline>
          <FormItem label="字段">
            {getFieldDecorator('fieldKey', {
              rules: [{ required: true, message: '请选择字段' }]
            })(
              <Select style={{ width: '80px' }}>
                {this.renderFieldOptions()}
              </Select>
            )}
          </FormItem>
          {!isImage && <FormItem label="字号">
            {getFieldDecorator('font', {
              rules: [{ required: true, message: '请输入字号' }]
            })(
              <InputNumber style={{ width: '60px' }} />
            )}
          </FormItem>}
          {!isImage && <FormItem label="颜色">
            {getFieldDecorator('color', {
              rules: [{ required: true, message: '请选择颜色' }]
            })(
              <Input type="color" style={{ width: '60px', cursor: 'pointer' }} />
            )}
          </FormItem>}
        </Form>
        <div className={styles.footer}>
          <a onClick={this.handleCancel}>cancel</a>
          <a onClick={this.handleOk}>ok</a>
        </div>
      </div>
    );
  };

  render() {
    const { type } = this.props;

    if (type === fieldTypes.Empty) {
      return <div className={styles.cellHolder}>{' '}</div>;
    }

    return (
      <Popover
        content={this.renderForm()}
        title="设置样式"
        trigger="click"
        visible={this.state.popVisible && !this.props.readOnly}
        onVisibleChange={this.handleVisibleChange}
      >
        {type === fieldTypes.Image ? (
          <div className={styles.leftHolder}>
            <img className={styles.img} src="/img_demo_avatar.png" alt="" />
          </div>
        ) : this.renderText()}
      </Popover>
    );
  }
}

export default Form.create()(FieldViewer);
