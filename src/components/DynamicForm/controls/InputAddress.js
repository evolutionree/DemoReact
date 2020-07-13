import React, { PropTypes, Component } from 'react';
import { Input, Icon, Modal, message } from 'antd';
import { is } from 'immutable';
import { connect } from 'dva';
import Search from '../../Search';
import gpsIcon from '../../../assets/icon_gps.png';

const style = { height: '32px' };
class InputAddress extends Component {
  static propTypes = {
    value: PropTypes.shape({
      address: PropTypes.string,
      lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      lon: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    onChange: PropTypes.func.isRequired,
    isReadOnly: PropTypes.oneOf([0, 1])
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { address } = this.parseValue(props.value);
    this.state = {
      inputValue: address,
      modalVisible: false,
      currentPoint: {
        lat: null,
        lon: null,
        address: ''
      },
      keyword: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    const { address = '' } = this.parseValue(nextProps.value);
    this.setState({ inputValue: address });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length || Object.keys(thisState).length !== Object.keys(nextState).length) {
      return true;
    }

    for (const key in nextProps) {
      if (!is(thisProps[key], nextProps[key])) {
        //console.log('createJSEngineProxy_props:' + key);
        return true;
      }
    }

    for (const key in nextState) {
      if (thisState[key] !== nextState[key] || !is(thisState[key], nextState[key])) {
        //console.log('state:' + key);
        return true;
      }
    }

    return false;
  }

  setValue = val => {
    this.props.onChange(val, true);
  };

  parseValue = value => {
    if (!value) return {};
    return {
      address: value.address,
      lat: value.lat,
      lon: value.lon
    };
  };

  onInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  onInputBlur = event => {
    const { address = '', lat = null, lon = null } = this.parseValue(this.props.value);
    const isInputChanged = event.target.value !== address;
    this.props.onChange({
      address: event.target.value,
      lat: isInputChanged ? null : lat,
      lon: isInputChanged ? null : lon
    });
  };

  showAddressModal = () => {
    if (this.props.isReadOnly === 1) return;
    this.setState({ modalVisible: true }, this.initMap);
  };

  initMap = () => {
    const { address, lat, lon } = this.parseValue(this.props.value);
    const mapOptions = { enableMapClick: false };
    const map = false || (this.map = new BMap.Map(this.mapContainer, mapOptions));

    let centerPoint = new BMap.Point(116.404, 39.915); // 默认地址;
    let markerPoint;
    if (address && lat && lon) {
      centerPoint = new BMap.Point(lon, lat);
      markerPoint = centerPoint;
    } else if (address) {
      this.handleSearch(address);
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

  onMapClick = event => {
    if (event.domEvent.button === 2) {
      const point = event.point;
      const geoc = new BMap.Geocoder();
      geoc.getLocation(point, result => {
        const {
          province,
          city,
          district,
          street,
          streetNumber
        } = result.addressComponents;
        const addrText = [province, city, district, street, streetNumber].join('');
        this.setCurrentPoint(point, addrText);
      });
    }
  };

  handleSearch = value => {
    this.setState({
      keyword: value
    });
    if (!value) return;
    const local = new BMap.LocalSearch(this.map, {
      onSearchComplete: result => {
        const poi = result && result.getPoi(0);
        if (!poi) {
          message.warn('找不到相关地址');
          return;
        }
        const point = poi.point;
        this.setCurrentPoint(point, poi.address, true);
        // const geoc = new BMap.Geocoder();
        // geoc.getLocation(point, result2 => {
        //   const {
        //     province,
        //     city,
        //     district,
        //     street,
        //     streetNumber
        //   } = result2.addressComponents;
        //   const addrText = [province, city, district, street, streetNumber].join('');
        //   this.setCurrentPoint(point, addrText);
        // });
      }
    });
    local.search(value);
  };

  setCurrentPoint = (point, address, shouldCenter) => {
    this.setState({
      currentPoint: {
        address,
        lat: point.lat,
        lon: point.lng
      }
    }, () => { this.renderMarker(point, address, shouldCenter); });
  };

  renderMarker = (mapPoint, addressText, shouldCenter) => {
    if (!this.map) return;
    if (shouldCenter) {
      this.map.centerAndZoom(mapPoint, 16);
    }
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

  closeModal = () => {
    this.setState({
      modalVisible: false,
      keyword: ''
    });
  };

  confirmModal = () => {
    const { currentPoint } = this.state;
    if (!currentPoint.lat) return message.warn('请选择地址');
    this.props.onChange({
      lat: currentPoint.lat,
      lon: currentPoint.lon,
      address: currentPoint.address
    });
    this.closeModal();
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
    const { isReadOnly } = this.props;
    return (
      <div style={style}>
        <Input
          value={this.state.inputValue}
          onChange={this.onInputChange}
          onBlur={this.onInputBlur}
          disabled={isReadOnly === 1}
          suffix={this.renderIcon()}
        />
        <Modal
          title="选择地址"
          visible={this.state.modalVisible}
          onCancel={this.closeModal}
          onOk={this.confirmModal}
        >
          <Search value={this.state.keyword} onSearch={this.handleSearch} placeholder="输入地名搜索" />
          <span style={{ paddingLeft: '10px', color: '#999' }}>注：鼠标右键标注地址</span>
          <div
            style={{ height: '400px', marginTop: '10px' }}
            ref={elem => { this.mapContainer = elem; }}
          >
            loading..
          </div>
        </Modal>
      </div>
    );
  }
}

InputAddress.View = ({ value, dispatch }) => {
  if (!value || !value.address) return <span style={{ color: '#999999' }}>(空)</span>;
  return (
    <div>
      <span style={{ verticalAlign: 'middle' }}>{value.address}</span>
      <img
        style={{ verticalAlign: 'middle', marginLeft: '5px', cursor: 'pointer' }}
        src={gpsIcon}
        alt=""
        onClick={() => { dispatch({ type: 'app/viewMapLocation', payload: value }); }}
      />
    </div>);
};
InputAddress.View = connect()(InputAddress.View);

export default InputAddress;
