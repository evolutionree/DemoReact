import React, { PropTypes, Component } from 'react';
import QRCode from 'qrcode.react';
import { createNormalInput } from './utils';
import { DefaultTextView } from '../DynamicFieldView';
import { Icon, Popover } from 'antd'

const InputText = createNormalInput('text');

InputText.View = (props) => {
  const { value, encrypted, scanner } = props;
  if (value && encrypted) {
    return <div style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>********</div>;
  } else if (value && scanner) {
    return (
      <div>
        <span style={{ verticalAlign: 'middle' }}>{value}</span>
        <Popover
          title="二维码"
          trigger="click"
          content={(
            <QRCode value={value} size={160} fgColor="#666" />
          )}
        >
          <Icon
            style={{ marginLeft: '5px', cursor: 'pointer', verticalAlign: 'middle' }}
            type="qrcode"
          />
        </Popover>
      </div>
    );
  } else {
    return <DefaultTextView {...props} />;
  }
};

export default InputText;
