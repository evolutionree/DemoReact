import React, { PropTypes, Component } from 'react';
import MailActionBar from '../Mails/MailActionBar';
import { connect } from 'dva';
import { queryMailLayout, saveMailLayout } from '../../services/mails';
import styles from './styles.less';
import ImgIcon from '../../components/ImgIcon';

class MainLayout extends Component {
  static propTypes = {
    left: PropTypes.node,
    midtop: PropTypes.node,
    midbottom: PropTypes.node,
    right: PropTypes.node
  };
  static defaultProps = {};
  static MIN_LEFT = 0;
  static MIN_RIGHT = 50;
  static MIN_BOTTOM = 0;
  container = null;
  resizingType = '';

  constructor(props) {
    super(props);
    this.state = {
      pleft: 0.25,
      pright: 0.25,
      pbottom: 0.50,
      showBottom: true,
      showRight: false,
      showLeft: false
    };
  }

  componentDidMount() {
    document.body.addEventListener('mouseup', this.stopResize);
    this.initLayout();
  }

  initLayout = () => {
    queryMailLayout().then(result => {
      const { bottomprecent, leftprecent, rightprecent, showbottom, showright, showleft } = result.data;
      this.setState({
        pleft: leftprecent,
        pright: 0.5 || rightprecent,
        pbottom: bottomprecent,
        showBottom: showbottom,
        showRight: false,
        showLeft: true
      });
    });
  };

  saveLayout = () => {
    const params = {
      bottomprecent: this.state.pbottom,
      leftprecent: this.state.pleft,
      rightprecent: this.state.pright,
      showbottom: this.state.showBottom,
      showright: this.state.showRight,
      showleft: this.state.showLeft
    };
    saveMailLayout(params).catch(e => console.error(e));
  };

  activeResize = type => {
    this.resizingType = type;
    document.body.addEventListener('mousemove', this.handleMouseMove);
  };

  stopResize = () => {
    if (!this.resizingType) return;
    this.resizingType = '';
    this.saveLayout();
    document.body.removeEventListener('mousemove', this.handleMouseMove);
  };

  handleMouseMove = event => {
    const { pageX, pageY } = event;
    const { width, height } = this.container.getBoundingClientRect();
    const { left: conLeft, top: conTop } = this.getContainerOffset();
    const offsetX = pageX - conLeft;
    const offsetY = pageY - conTop;
    if (this.resizingType === 'left') {
      let pleft = offsetX / width;
      const pleftMin = MainLayout.MIN_LEFT / width;
      if (pleft >= 0.5) pleft = 0.5;
      if (pleft <= pleftMin) pleft = pleftMin;
      this.setState({ pleft });
    } else if (this.resizingType === 'right') {
      let pright = (width - offsetX) / width;
      const prightMin = MainLayout.MIN_RIGHT / width;
      if (pright >= 0.5) pright = 0.5;
      if (pright <= prightMin) {
        pright = prightMin;
        this.setState({ pright, showRight: false });
        return;
      }
      this.setState({ pright, showRight: true });
    } else if (this.resizingType === 'mid') {
      let pbottom = (height - offsetY) / height;
      const pbottomMin = MainLayout.MIN_BOTTOM / height;
      if (pbottom >= 1) pbottom = 1;
      if (pbottom <= pbottomMin) {
        pbottom = pbottomMin;
        this.setState({ pbottom, showBottom: false });
        return;
      }
      this.setState({ pbottom, showBottom: true });
    }
  };

  toggleBottom = () => {
    this.setState({ showBottom: !this.state.showBottom }, this.saveLayout);
  };

  toggleRight = () => {
    this.setState({ showRight: !this.state.showRight }, this.saveLayout);
  };

  toggleLeft = () => {
    this.setState({ showLeft: !this.state.showLeft }, this.saveLayout);
  };

  getContainerOffset = () => {
    let left = 0;
    let top = 0;
    let elem = this.container;
    while (elem && elem !== document.body) {
      left += elem.offsetLeft;
      top += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return { left, top };
  };

  render() {
    const { mailSelected } = this.props;
    const { pleft, pright, pbottom, showLeft, showRight, showBottom } = this.state;
    const wleft = showLeft ? (pleft * 100 + '%') : '30px';
    const wright = showRight ? (pright * 100 + '%') : '30px';
    const htop = showBottom ? ((1 - pbottom) * 100 + '%') : 'calc(100% - 30px)';
    const hbottom = showBottom ? (pbottom * 100 + '%') : '30px';

    const actionBarStyle = {
      paddingBottom: '10px',
      borderBottom: '1px solid #f0f0f0',
      minWidth: '920px',
      overflow: 'auto'
    }

    return (
      <div className={styles.container} ref={el => this.container = el}>
        <MailActionBar mails={mailSelected} style={actionBarStyle} />
        <div className={styles.right} style={{ width: wright }}>
          {showRight ? this.props.right : (
            <div style={{ height: '100%', background: '#f1f1f1' }} />
          )}
          <ImgIcon
            name="arrow-up-bordered"
            size="small"
            className={styles.panelToggle}
            style={{ top: '20px', left: '10px', transform: 'rotate(90deg)' }}
            onClick={this.toggleRight}
          />
        </div>
        <div className={styles.mid} style={{ left: 0, right: wright }}>
          <div className={styles.midtop}>
            {this.props.midtop}
          </div>
          <div className={styles.split} style={{ left: '100%', cursor: 'e-resize' }}
               onMouseDown={this.activeResize.bind(this, 'right')} />
        </div>
      </div>
    );
  }
}

export default connect(
  state => state.mails
)(MainLayout);

