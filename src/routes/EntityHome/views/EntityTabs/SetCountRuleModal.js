/**
 * Created by 0291 on 2018/4/27.
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Form, message, Input, Select, Checkbox, Modal } from 'antd';
import * as _ from 'lodash';
import SelectCombine from './SelectCombine';
import Styles from './SetCountRuleModal.less';

const FormItem = Form.Item;
const Option = Select.Option;

class SetCountRuleModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    save: PropTypes.func,
    cancel: PropTypes.func,
    form: PropTypes.object
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      entityFields: []
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const { isEdit, currentItem, form, entityId } = nextProps;
      if (isEdit) {
        const formValues = _.pick(currentItem, ['relname', 'relentityid', 'fieldid', 'ismanytomany', 'srctitle', 'srcsql', 'icon']);
        formValues.ismanytomany = !!formValues.ismanytomany;
        form.setFieldsValue(formValues);
        this.fetchEntityFields(entityId, formValues.relentityid);
      } else {
        form.resetFields();
      }
    } else if (isClosing) {
      this.setState({ entityFields: [] });
    }
  }

  handleSubmit = () => {
    this.props.form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return message.error('请检查表单');
      }
    });
  };

  render() {
    const { visible, form, cancel } = this.props;
    return (
      <Modal
        width={640}
        maskClosable={false}
        title="统计规则设置"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={cancel}
      >
        <div className={Styles.title}>第一步：统计字段设置</div>
        <Form>
          <FormItem label="页签名称">
            {form.getFieldDecorator('relname', {
              rules: [{ required: true, message: '请输入页签名称' }]
            })(
              <SelectCombine entityList={this.props.entityList} />
            )}
          </FormItem>
        </Form>
        <div className={Styles.title}>第二步：统计值规则设置</div>
      </Modal>
    );
  }
}

export default connect(
  state => {
    const { entityTabs, entityList } = state;
    const { showModals } = entityTabs;
    return {
      visible: /setcountrule/.test(showModals),
      entityList
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({ type: 'entityTabs/showModals', payload: '' });
      }
    };
  }
)(Form.create()(SetCountRuleModal));
