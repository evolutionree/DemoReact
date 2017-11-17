import React, { PropTypes } from 'react';
import DynamicFieldView from './DynamicFieldView';
import styles from './styles.less';

const propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    fieldname: PropTypes.string.isRequired,
    displayname: PropTypes.string.isRequired,
    controltype: PropTypes.number.isRequired
  })),
  value: PropTypes.object
};
function DynamicFormViewLight({
    fields,
    value
  }) {
  return (
    <div className={styles.dyformviewlight}>
      {fields && fields instanceof Array && fields.map(field => {
        const { fieldname, displayname, controltype } = field;
        return (
          <div className={styles.field} key={fieldname}>
            <div className={styles.label}>{displayname}：</div>
            <div className={styles.value}>
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
DynamicFormViewLight.propTypes = propTypes;

export default DynamicFormViewLight;
