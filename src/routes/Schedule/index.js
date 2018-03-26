/**
 * Created by 0291 on 2017/12/19.
 */
import React, { Component } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import Page from '../../components/Page';
import ScheduleTab from './ScheduleTab';
import TaskTab from './TaskTab';
import SchedulePanel from './componnet/SchedulePanel/index';
import ScheduleDayTable from './ScheduleDayTable';
import ScheduleWeekTable from './ScheduleWeekTable';
import ScheduleCalendarTable from './ScheduleCalendarTable';
import EmptyShow from './componnet/EmptyShow';
import FormModal from './FormModal';
import RelateCustomers from './modules/RelateCustomers';
import SaleRecords from './modules/SaleRecords';
import NoticeMessage from './modules/NoticeMessage';
import AuditMessage from './modules/AuditMessage';


import Styles from './index.less';

const TabPane = Tabs.TabPane;

const otherHeight = 60 + 48 + 10; //60：系统logo栏  48：页标栏  10： padding

class Schedule extends Component {
  static propTypes = {

  };
  static defaultProps = {

  };

  constructor(props) {
    super(props);
    this.state = {
      height: document.body.clientHeight - otherHeight
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  onWindowResize() {
    this.setState({
      height: document.body.clientHeight - otherHeight
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({

    });

    if (nextProps.value !== this.state.value) {

    }
  }

  componentWillMount() {
    window.removeEventListener('resize', this.onWindowResize);
  }

  renderModuleTabs() {
    const { modules, activeModule } = this.props;
    const ModuleComponents = {
      customer: RelateCustomers,
      sale: EmptyShow,
      notice: EmptyShow,
      audit: AuditMessage
    };
    return (
      <Tabs activeKey={activeModule} onChange={this.props.toggleModule}>
        {modules.map(mod => {
          const ModuleComponent = ModuleComponents[mod.name] || EmptyShow;
          return (
            <TabPane tab={mod.title} key={mod.name}>
              <ModuleComponent height={this.state.height - 50} />
            </TabPane>
          );
        })}
      </Tabs>
    );
  }

  render() {
    const contentStyle = {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none',
      padding: 0
    };

    return (
      <Page title="工作台" contentStyle={contentStyle} contentWrapStyle={{ paddingBottom: 0, overflow: 'auto' }}>
        <div className={Styles.ScheduleWrap} style={{ height: this.state.height }}>
          <div className={Styles.Left} style={{ width: 'calc(100% - 420px)' }}>
            {this.renderModuleTabs()}
          </div>
          <div className={Styles.Right}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="日程" key="1">
                <ScheduleTab height={this.state.height - 50} />
              </TabPane>
              <TabPane tab="任务" key="2">
                <TaskTab height={this.state.height - 50} />
              </TabPane>
            </Tabs>
          </div>
        </div>
        <SchedulePanel visible={this.props.schedulePanelVisible} onClose={this.props.closeSchedulePanel} >
          {
            this.props.scheduleWays[0].active ? <div style={{ padding: '0 30px' }}><ScheduleDayTable /></div> : null
          }
          {
            this.props.scheduleWays[1].active ? <div style={{ padding: '0 30px' }}><ScheduleWeekTable /></div> : null
          }
          {
            this.props.scheduleWays[2].active ? <div style={{ padding: '0 30px' }}><ScheduleCalendarTable /></div> : null
          }
        </SchedulePanel>
        <FormModal />
      </Page>
    );
  }
}


export default connect(
  state => state.schedule,
  dispatch => {
    return {
      closeSchedulePanel() {
        dispatch({ type: 'schedule/putState', payload: { schedulePanelVisible: false } });
      },
      toggleModule(moduleName) {
        dispatch({ type: 'schedule/putState', payload: { activeModule: moduleName } });
      }
    };
  }
)(Schedule);
