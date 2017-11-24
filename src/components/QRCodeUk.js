import React, { PropTypes, Component } from 'react';
import { Icon } from 'antd';
import QRCode from 'qrcode.react';
import { getAppDownloadUrl } from '../services/authentication';

class QRCodeUk extends Component {
  static propTypes = {
    size: PropTypes.number
  };
  static defaultProps = {
    size: 128
  };
  state = {
    url: '',
    loading: false
  };
  componentDidMount() {
    // this.loadUrl();
  }
  loadUrl = () => {
    this.setState({ loading: true });
    getAppDownloadUrl().then(result => {
      this.setState({ url: result.data, loading: false });
    }, err => {
      console.error(err);
      this.setState({ loading: false });
    });
  };
  handleClick = () => {
    if (this.state.loading) return;
    this.loadUrl();
  };
  render() {
    const wrapStyle = {
      width: this.props.size + 'px',
      height: this.props.size + 'px',
      display: 'inline-block',
      position: 'relative'
    };
    const maskStyle = {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      cursor: 'pointer',
      background: 'rgba(255,255,255,0.8)'
    };
    const iconStyle = {
      fontSize: '30px',
      fontWeight: 'bold',
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    };
    return (
      <div style={wrapStyle}>
        <QRCode value={this.state.url} {...this.props} />
        {!this.state.url && (
          <div style={maskStyle} onClick={this.handleClick}>
            <Icon style={iconStyle} spin={this.state.loading} type="sync" />
          </div>
        )}
      </div>
    );
  }
}

export default QRCodeUk;
