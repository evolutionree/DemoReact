import React, { PropTypes } from 'react';
import DynamicFieldView from './DynamicFieldView';
import styles from './styles.less';

const propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    fieldname: PropTypes.string.isRequired,
    fieldlabel: PropTypes.string.isRequired,
    controltype: PropTypes.number.isRequired
  })),
  value: PropTypes.object
};
function DynamicTemplateView({
    fields,
    value
  }) {
  return (
    <div className={styles.templatelist}>
      {fields && fields instanceof Array && fields.map(field => {
        const { fieldname, fieldlabel, controltype } = field;
        return (
          <div className={styles.templateitem} key={fieldname}>
            <div className={styles.templatetitle}>{fieldlabel}</div>
            <div className={styles.templatecontent}>
              <DynamicFieldView
                value={value[fieldname]}
                controlType={controltype}
                value_name={value[fieldname + '_name']}
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
