import React, { PropTypes } from 'react';
import DynamicFieldView from './DynamicFieldView';
import { getIntlText } from '../UKComponent/Form/IntlText';
import styles from './styles.less';

const propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    fieldname: PropTypes.string.isRequired,
    fieldlabel: PropTypes.string.isRequired,
    controltype: PropTypes.number.isRequired
  })),
  value: PropTypes.object,
  entityId: PropTypes.string
};
function DynamicTemplateView({
    fields,
    value,
    entityId
  }) {
  return (
    <div className={styles.templatelist}>
      {fields && fields instanceof Array && fields.map(field => {
        const { fieldname, fieldlabel, controltype } = field;
        return (
          <div className={styles.templateitem} key={fieldname}>
            <div className={styles.templatetitle}>{getIntlText('fieldlabel', field)}</div>
            <div className={styles.templatecontent}>
              <DynamicFieldView
                value={value[fieldname]}
                controlType={controltype}
                value_name={value[fieldname + '_name']}
                config={field.fieldconfig}
                entityTypeId={value.rectype || entityId}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
DynamicTemplateView.propTypes = propTypes;

export default DynamicTemplateView;
