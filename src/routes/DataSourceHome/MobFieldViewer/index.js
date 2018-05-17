import React from 'react';
import classnames from 'classnames';
import { FieldTypes, PresetLayouts } from './constants';
import FieldHolder from './FieldHolder';
import styles from './styles.less';

class MobFieldViewer extends React.Component {
  static propTypes = {
    mobViewConfig: React.PropTypes.shape({
      viewstyleid: React.PropTypes.number.isRequired,
      colors: React.PropTypes.string.isRequired,
      fonts: React.PropTypes.string.isRequired
    }),
    onChange: React.PropTypes.func,
    readOnly: React.PropTypes.bool
  };
  static defaultProps = {
    fields: [],
    usePresetStyle: 1,
    readOnly: false
  };

  static getLayout = (styleId) => {
    return PresetLayouts[styleId];
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  onStyleChange = (dataIndex, { font, color }) => {
    const fonts = this.props.mobViewConfig.fonts.split(',');
    const colors = this.props.mobViewConfig.colors.split(',');
    fonts[dataIndex] = font;
    colors[dataIndex] = color;

    this.props.onChange({
      ...this.props.mobViewConfig,
      fonts: fonts.join(','),
      colors: colors.join(',')
    });
  };

  renderTextFields = (layoutRemark) => {
    const colors = this.props.mobViewConfig.colors.split(',');
    const fonts = this.props.mobViewConfig.fonts.split(',');

    // layoutRemark: 10101
    // 第一个是图片标识位，不渲染
    // const hasPicture = layoutRemark[0] === '1';
    // let dataIndex = hasPicture ? 0 : -1;
    let dataIndex = -1;
    return layoutRemark.slice(1).split('').map((flag, index) => {
      if (flag === '1') {
        dataIndex += 1;
        return (
          <FieldHolder
            field={{ color: colors[dataIndex], font: +fonts[dataIndex] }}
            key={index}
            onChange={this.onStyleChange.bind(this, dataIndex)}
            readOnly={this.props.readOnly}
          >
            {`数据${dataIndex + 1}`}
          </FieldHolder>
        );
      }
      return '';
    });
  };

  render() {
    const { mobViewConfig, readOnly } = this.props;
    const layoutRemark = MobFieldViewer.getLayout(mobViewConfig.viewstyleid);
    const hasPicture = layoutRemark[0] === '1';
    const containerCls = classnames({
      [styles.container]: true,
      [styles.hasPicture]: hasPicture
    });

    return (
      <div className={containerCls}>
        {hasPicture ? (
          <FieldHolder
            field={{}}
            onChange={this.onStyleChange.bind(this, 0)}
            isImage
            readOnly
          />
        ) : ''}
        {this.renderTextFields(layoutRemark)}
      </div>
    );
  }
}

export default MobFieldViewer;
