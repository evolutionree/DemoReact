/**
 * Created by 0291 on 2017/8/28.
 */
import React, { Component } from 'react';
import { Modal, Button, Row, Col, Input, Radio } from 'antd';
const RadioGroup = Radio.Group;
import _ from 'lodash';
import Styles from './SetSeriesModal.less';


class SetSeriesModal extends Component {
  static propTypes = {

  }

  static defaultProps = {

  }

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  componentWillReceiveProps(nextProps) {

  }


  toggleModal() {
    this.setState({
      visible: !this.state.visible
    });
  }


  changeSerie(index, type, e) {
    let newSettingData = _.cloneDeep(this.props.settingData);
    newSettingData[index][type] = e.target.value;
    this.props.onChange(newSettingData);
  }

  render() {
    return (
      <div>
        <Button type="dashed" onClick={this.toggleModal.bind(this)}>设置</Button>
        <Modal
          visible={this.state.visible}
          title="设置金额区间"
          onOk={this.toggleModal.bind(this)}
          onCancel={this.toggleModal.bind(this)}
          footer={[
            <Button key="submit" type="primary" size="large" loading={false} onClick={this.toggleModal.bind(this)}>
              保存
            </Button>
          ]}
        >
          {
            this.props.settingData && this.props.settingData.map((item, index) => {
              return (
                <div key={index} className={Styles.wrap}>
                  <Input className={Styles.colorInput} type='color' value={item.seriecolor} onChange={this.changeSerie.bind(this, index, 'seriecolor')} />
                  <div className={Styles.textInputWrap}>
                    <Input style={{ width: 100 }} value={item.seriefrom} onChange={this.changeSerie.bind(this, index, 'seriefrom')} /><span style={{ padding: '0 10px' }}>至</span>
                    <Input style={{ width: 100 }} value={item.serieto} onChange={this.changeSerie.bind(this, index, 'serieto')} />
                  </div>
                  <RadioGroup value={item.seriestatus} onChange={this.changeSerie.bind(this, index, 'seriestatus')}>
                    <Radio value={1}>启用</Radio>
                    <Radio value={2}>禁用</Radio>
                  </RadioGroup>
                </div>
              );
            })
          }
        </Modal>
      </div>
    )
  }
}

export default SetSeriesModal;
