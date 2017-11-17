import React from 'react';
import { connect } from 'dva';
import { Modal, message, Button } from 'antd';

// function MapModal() {
//   return (
//     <div>
//       MapModal
//     </div>
//   );
// }

class MapModal extends React.Component {
  static propTypes = {
    mapLocation: React.PropTypes.shape({
      lat: React.PropTypes.string,
      lon: React.PropTypes.string,
      address: React.PropTypes.string
    })
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalKey: new Date().getTime()
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!!nextProps.mapLocation) {
      this.setState({
        modalVisible: true
      }, this.initMap);
    } else {
      this.setState({
        modalVisible: false,
        modalKey: new Date().getTime()
      });
    }
  }

  parseValue = () => {
    const { mapLocation: value } = this.props;
    if (!value) return {};
    return {
      address: value.address,
      lat: value.lat,
      lng: value.lon
    };
  };

  initMap = () => {
    const { address, lat, lng } = this.parseValue();
    const mapOptions = { enableMapClick: false };
    const map = false || (this.map = new BMap.Map(this.mapContainer, mapOptions));

    let centerPoint;
    let markerPoint;
    if (lat && lng) {
      centerPoint = new BMap.Point(lng, lat);
      markerPoint = centerPoint;
    } else {
      message.error('无法定位当前地址');
      centerPoint = new BMap.Point(116.404, 39.915); // 默认地址
    }

    map.centerAndZoom(centerPoint, 16); // 初始化地图，设置中心点和地图级别
    // map.setCurrentCity('北京'); // 设置地图显示的城市 此项是必须设置的
    map.enableScrollWheelZoom(true); // 开启鼠标滚轮缩放
    map.addControl(new BMap.NavigationControl());

    map.addEventListener('mousedown', this.onMapClick);

    if (markerPoint) {
      this.setCurrentPoint(markerPoint, address);
    }
  };

  setCurrentPoint = (point, address) => {
    this.setState({
      currentPoint: {
        address,
        lat: point.lat,
        lng: point.lng
      }
    }, () => { this.renderMarker(point, address); });
  };

  renderMarker = (mapPoint, addressText) => {
    if (!this.map) return;
    const marker = new BMap.Marker(mapPoint);
    const label = new BMap.Label(addressText, {
      position: mapPoint,
      offset: new BMap.Size(20, -20)
    });  // 创建文本标注对象
    label.setStyle({
      color: 'red',
      fontSize: '12px',
      height: '20px',
      lineHeight: '20px',
      fontFamily: '微软雅黑'
    });
    this.map.clearOverlays();
    this.map.addOverlay(marker);
    this.map.addOverlay(label);
  };

  renderIcon = () => {
    return (
      <Icon
        type="environment-o"
        onClick={this.showAddressModal}
        style={{
          cursor: 'pointer',
          fontSize: '16px'
        }}
      />
    );
  };

  render() {
    const { cancel } = this.props;
    return (
      <Modal
        key={this.state.modalKey}
        title="查看地址"
        visible={this.state.modalVisible}
        onCancel={cancel}
        footer={[
          <Button key="cancel" onClick={cancel} type="default">关闭</Button>
        ]}
      >
        <div
          style={{ height: '500px' }}
          ref={elem => { this.mapContainer = elem; }}
        >
          loading..
        </div>
      </Modal>
    );
  }
}

export default connect(
  state => state.app.mapModal,
  dispatch => {
    return {
      cancel: () => {
        dispatch({ type: 'app/viewMapLocation', payload: undefined });
      }
    };
  }
)(MapModal);

