import React, { PropTypes } from 'react';
import { Form, Row, Col } from 'antd';
import createJSEngineProxy from './createJSEngineProxy';
import FoldableGroup from './FoldableGroup';
import DynamicFieldView from './DynamicFieldView';
import styles from './styles.less';

const FormItem = Form.Item;
const onlylineField = [2, 15, 22, 23, 24];

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
    horizontal: PropTypes.bool,
    gridLayout: PropTypes.bool //是否采用栅格布局
  };

  static defaultProps = {
    horizontal: false,
    gridLayout: true
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
      ? { labelCol: { span: 6 }, wrapperCol: { span: 18 } }
      : null;
  };

  renderFields = fields => {
    const { value, entityId, entityTypeId, gridLayout } = this.props;
    return fields.filter(field => field.controltype !== 30).map(field => {
      const { fieldname, displayname, controltype, fieldconfig } = field;
      const layout = onlylineField.indexOf(field.controltype) > -1 ? {} : this.getFormItemLayout(field.fieldname); //表格字段 永远不考虑横向显示

      let colNum = 24;
      if (gridLayout) {
        colNum = onlylineField.indexOf(field.controltype) > -1 ? 24 : document.body.clientWidth > 1400 ? 8 : 12;
      }

      return (
        <Col span={colNum}
             key={field.fieldname}
             style={(fieldconfig.isVisible !== 1 || field.fieldconfig.isVisibleJS === 0) ? { display: 'none' } : { padding: '4px' }} >
          <FormItem
            key={fieldname}
            colon={false}
            label={displayname}
            {...layout}
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
        </Col>
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
        <Row gutter={24} style={{ margin: 0 }}>
          {this.renderFields(noGroupFields)}
          {groups.map(group => (
            <FoldableGroup key={group.title} title={group.title} foldable={group.foldable} theme="light">
              {this.renderFields(group.fields)}
            </FoldableGroup>
          ))}
        </Row>
      </Form>
    );
  }
}

export default createJSEngineProxy(DynamicFormView, { type: 'DETAIL' });
