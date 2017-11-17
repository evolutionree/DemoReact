import React, { PropTypes, Component } from 'react';
import { connect } from 'dva';
import { Modal, Progress, Row, Col, Button, Steps, Popover } from 'antd';
import styles from './ProgressModal.less';


class ProgressModal extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    selectTask: PropTypes.object,
    cancel: PropTypes.func.isRequired,
    currentUser: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      showFormModal: false,
      selectTask: undefined,
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    };
  }

  componentWillReceiveProps(nextProps) {
    const isOpening = !this.props.visible && nextProps.visible;
    const isClosing = this.props.visible && !nextProps.visible;
    if (isOpening) {
      const selectTask = nextProps.selectTask;
      this.setState({
        selectTask,
        showFormModal: true
      });
    } else if (isClosing) {
      this.resetState();
    }
  }

  sumPercent = (taskObj) => {
    if (!taskObj) return 0;
    if (taskObj.resultfileid) return 100;
    const totalrowscount = taskObj.totalrowscount > 0 ? taskObj.totalrowscount : 0;
    const dealrowscount = taskObj.dealrowscount > 0 ? taskObj.dealrowscount : 0;
    if (totalrowscount == 0) return 0;
    return Math.floor(dealrowscount / totalrowscount * 100);
  };

  onProgressModalCancel = () => {
    this.props.cancel();
  };

  resetState = () => {
    this.setState({
      showFormModal: false,
      selectTask: undefined,
      key: new Date().getTime() // 每次打开弹窗时，都重新渲染
    });
  };

  render() {
    const Step = Steps.Step;
    const percentNum = this.sumPercent(this.props.selectTask);
    let totalrowscount=0;
    let dealrowscount=0;
    let errorrowscount=0;
    if(this.props.selectTask){
        if(this.props.selectTask.totalrowscount)
            totalrowscount=this.props.selectTask.totalrowscount;
        if(this.props.selectTask.dealrowscount)
            dealrowscount=this.props.selectTask.dealrowscount;
        if(this.props.selectTask.errorrowscount)
            errorrowscount=this.props.selectTask.errorrowscount;            
    }
    //默认第二部
    const stepNum = percentNum === 100 ? 2 : 1;
    const customDot = (dot, { status, index }) => (
      <Popover content={<span>第{index + 1}步</span>}>
        {dot}
      </Popover>
    );
    return (
      <div key={this.state.key}>
        <Modal title="导入进度"
               visible={this.state.showFormModal}
               onCancel={this.onProgressModalCancel}
               footer={[
                 <Button key="submit" type="primary" size="large" onClick={this.onProgressModalCancel}>
                   最小化
                 </Button>
               ]}
        >
          <div className={styles.progressMain}>
            <Row className={styles.row_top}>
              <Steps current={stepNum} progressDot={customDot}>
                <Step description="上传文档" />
                <Step description="导入数据" />
                <Step description="完成" />
              </Steps>
            </Row>
            <Row className={styles.row}>
              <Progress percent={percentNum} strokeWidth={20} status="active" />
            </Row>
            <Row className={styles.row_buttom}>
              <Col span={24}>共导入数据{totalrowscount}条,
              导入成功{dealrowscount-errorrowscount}条,
              导入失败{errorrowscount}条</Col>
            </Row>  
          </div>
        </Modal>
      </div>
    );
  }

}

export default connect(
  state => {
    const { showModals, selectTask } = state.task;
    const { user } = state.app;
    return {
      visible: /impProgross/.test(showModals),
      selectTask,
      currentUser: user
    };
  },
  dispatch => {
    return {
      cancel() {
        dispatch({
          type: 'task/showModals',
          payload: ''
        });
      }
    };
  }
)(ProgressModal);
