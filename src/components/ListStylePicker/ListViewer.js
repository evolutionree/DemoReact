import React, { PropTypes } from 'react';
import classnames from 'classnames';
import FieldViewer from './FieldViewer';
import { allStyleIds, presetStyles, fieldTypes } from './constants';
import styles from './styles.less';

function ListViewer({
    listStyleConfig,
    onChange,
    allFields
  }) {
  function onFieldStyleChange(index, fieldStyleConfig) {
    const { fieldStyleConfigs, styleId } = listStyleConfig;
    const newConfs = [...fieldStyleConfigs];
    newConfs[index] = fieldStyleConfig;
    onChange({
      styleId,
      fieldStyleConfigs: newConfs
    });
  }

  const { styleId, fieldStyleConfigs } = listStyleConfig;
  const layout = presetStyles[styleId].split('');
  const hasPicture = layout[0] === '1';
  const containerCls = classnames({
    [styles.container]: true,
    [styles.hasPicture]: hasPicture
  });
  let dataIndex = hasPicture ? 1 : 0;
  return (
    <div className={containerCls}>
      {hasPicture && (
        <FieldViewer
          type={fieldTypes.Image}
          fieldStyleConfig={fieldStyleConfigs[0]}
          onChange={onFieldStyleChange.bind(0)}
          allFields={allFields}
        />
      )}
      {layout.slice(1).map((flag, index) => {
        return flag === '1' ? (
          <FieldViewer
            key={index}
            type={fieldTypes.Text}
            fieldStyleConfig={fieldStyleConfigs[dataIndex]}
            onChange={onFieldStyleChange.bind(null, dataIndex)}
            allFields={allFields}
          >
            {`数据${dataIndex++}`}
          </FieldViewer>
        ) : <FieldViewer key={index} type={fieldTypes.Empty} />;
      })}
    </div>
  );
}
ListViewer.propTypes = {
  listStyleConfig: PropTypes.shape({
    styleId: PropTypes.number,
    fieldStyleConfigs: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string,
      font: PropTypes.string,
      color: PropTypes.string
    }))
  }),
  onChange: PropTypes.func
};

export default ListViewer;
