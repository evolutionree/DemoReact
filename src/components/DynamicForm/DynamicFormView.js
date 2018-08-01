import React, { PropTypes } from 'react';
import { Form } from 'antd';
import createJSEngineProxy from './createJSEngineProxy';
import FoldableGroup from './FoldableGroup';
import DynamicFieldView from './DynamicFieldView';
import styles from './styles.less';

const FormItem = Form.Item;

class DynamicFormView extends React.Component {
  static propTypes = {
    entityTypeId: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.shape({
      fieldname: PropTypes.string.isRequired,
      displayname: PropTypes.string.isRequired,
      controltype: PropTypes.number.isRequired,
      fieldconfig: PropTypes.object.isRequired
    })),
    value: PropTypes.object.isRequired,
    horizontal: PropTypes.bool
  };

  static defaultProps = {
    horizontal: false
  };

  getFormLayout = () => {
    if (this.props.horizontal) return 'horizontal';
    const { fields } = this.props;
    let layout = 'vertical';
    if (fields && fields[0]) {
      const { fieldconfig } = fields[0];
      if (fieldconfig && fieldconfig.style === 0) {
        layout = 'horizontal';
      }
    }
    return layout;
  };

  getFormItemLayout = () => {
    return this.getFormLayout() === 'horizontal'
      ? { labelCol: { span: 4 }, wrapperCol: { span: 20 } }
      : null;
  };

  renderFields = fields => {
    const { value, entityId, entityTypeId } = this.props;
    return fields.filter(field => field.controltype !== 30).map(field => {
      const { fieldname, displayname, controltype, fieldconfig } = field;
      return (
        <FormItem
          key={fieldname}
          colon={false}
          label={displayname}
          {...this.getFormItemLayout(field.fieldname)}
          style={(fieldconfig.isVisible !== 1 || field.fieldconfig.isVisibleJS === 0) ? { display: 'none' } : {}}
        >
          <DynamicFieldView
            isCommonForm
            entityId={entityId}
            entityTypeId={entityTypeId}
            value={value[fieldname]}
            controlType={controltype}
            config={fieldconfig}
            value_name={value[fieldname + '_name']}
          />
        </FormItem>
      );
    });
  };
  render() {
    const { fields: allFields } = this.props;

    // 处理分组
    const noGroupFields = [];
    const groups = [];
    let lastGroup = null;
    allFields.forEach((field, index) => {
      if (field.controltype === 20) {
        lastGroup = {
          title: field.displayname,
          foldable: field.fieldconfig.foldable === 1,
          fields: []
        };
        groups.push(lastGroup);
        return;
      }
      if (lastGroup) {
        lastGroup.fields.push(field);
      } else {
        noGroupFields.push(field);
      }
    });

    return (
      <Form className={styles.dyformview}>
        {this.renderFields(noGroupFields)}
        {groups.map(group => (
          <FoldableGroup key={group.title} title={group.title} foldable={group.foldable} theme="light">
            {this.renderFields(group.fields)}
          </FoldableGroup>
        ))}
      </Form>
    );
  }
}

export default createJSEngineProxy(DynamicFormView, { type: 'DETAIL' });
