import React, { PropTypes } from 'react';
import DynamicFieldView from './DynamicFieldView';
import styles from './styles.less';

const propTypes = {
  fields: PropTypes.arrayOf(PropTypes.shape({
    fieldname: PropTypes.string.isRequired,
    fieldlabel: PropTypes.string.isRequired,
    controltype: PropTypes.number.isRequired
  })),
  value: PropTypes.object.isRequired
};
function HomePageMainFieldsView({
    fields,
    value
  }) {
  return (
    <div className={styles.mainfields}>
      {fields.map(field => {
        const { fieldname, displayname, controltype, fieldconfig } = field;
        return (
          <div className={styles.field} key={fieldname}>
            <div className={styles.label}>{displayname} : </div>
            <div className={styles.value}>
              <DynamicFieldView
                value={value[fieldname]}
                controlType={controltype}
                config={fieldconfig}
                value_name={value[fieldname + '_name']}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
HomePageMainFieldsView.propTypes = propTypes;

export default HomePageMainFieldsView;
