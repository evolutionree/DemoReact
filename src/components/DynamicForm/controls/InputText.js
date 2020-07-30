import React from 'react';
import { Icon, Popover } from 'antd';
import QRCode from '../../QRCode';
import { createNormalInput } from './utils';
import { DefaultTextView } from '../DynamicFieldView';

const InputText = createNormalInput('text');

InputText.View = (props) => {
  const { value, encrypted, scanner, linkfieldUrl } = props;
  if (value && linkfieldUrl) {
    return <a style={{ wordWrap: 'break-word', whiteSpace: 'normal' }} href={linkfieldUrl} target="_blank">{value}</a>;
  } else if (value && encrypted) {
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
