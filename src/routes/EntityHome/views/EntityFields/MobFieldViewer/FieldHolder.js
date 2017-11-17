import React from 'react';
import { Popover, Form, InputNumber, Input } from 'antd';
import styles from './styles.less';

const FormItem = Form.Item;

class FieldHolder extends React.Component {
  static propTypes = {
    field: React.PropTypes.shape({
      font: React.PropTypes.number,
      color: React.PropTypes.string
    }),
    onChange: React.PropTypes.func,
    children: React.PropTypes.node,
    isImage: React.PropTypes.bool,
    readOnly: React.PropTypes.bool
  };
  static defaultProps = {
    field: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      popVisible: false,
      color: props.field.color,
      font: props.field.font
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
    this.setState({ popVisible: visible });

    // 展开时，设置表单值
    if (visible) {
      const { font, color } = this.props.field;
      this.props.form.setFieldsValue({
        font,
        color
      });
    }
  };

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form inline>
          <FormItem label="字号">
            {getFieldDecorator('font', {
              rules: [{ required: true, message: '请输入字号' }]
            })(
              <InputNumber style={{ width: '60px' }} />
            )}
          </FormItem>
          <FormItem label="颜色">
            {getFieldDecorator('color', {
              rules: [{ required: true, message: '请选择颜色' }]
            })(
              <Input type="color" style={{ width: '60px', cursor: 'pointer' }} />
            )}
          </FormItem>
        </Form>
        <div className={styles.footer}>
          <a onClick={this.handleCancel}>cancel</a>
          <a onClick={this.handleOk}>ok</a>
        </div>
      </div>
    );
  };

  render() {
    let style;
    if (this.state.popVisible) {
      const { color, font } = this.props.form.getFieldsValue();
      style = {
        color,
        fontSize: font + 'px'
      };
    } else {
      style = {
        color: this.props.field.color,
        fontSize: this.props.field.font + 'px'
      };
    }
    return (
      <Popover
        content={this.renderForm()}
        title="设置样式"
        trigger="click"
        visible={this.state.popVisible && !this.props.readOnly}
        onVisibleChange={this.handleVisibleChange}
      >
        {this.props.isImage
          ? (
            <div className={styles.leftHolder}>
              <img className={styles.img} src="/img_demo_avatar.png" alt="" />
            </div>
          )
          : (
            <div className={styles.cellHolder}>
              <span className={styles.text} style={style}>{this.props.children}</span>
            </div>
          )
        }
      </Popover>
    );
  }
}

export default Form.create({
  mapPropsToFields: props => {
    return {
      color: { value: props.field.color },
      font: { value: props.field.font }
    };
  }
})(FieldHolder);
