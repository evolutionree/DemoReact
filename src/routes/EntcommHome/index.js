import React from 'react';
import { connect } from 'dva';
import Page from '../../components/Page';
import LinkTab from '../../components/LinkTab';
import { HomePageMainFieldsView } from '../../components/DynamicForm';
import StageBar from './StageBar2';
import connectPermission from '../../models/connectPermission';
import { Icon } from 'antd';
import IntlText from '../../components/UKComponent/Form/IntlText';
import { hashHistory } from 'react-router';

function EntcommHome({
  checkFunc,
  entityName,
  recordDetail,
  relTabs,
  params,
  children,
  location,
  mainFieldsConfig,
  toggleFollow,
  firstLoad,
  stopAutoLink
}) {
  const entityId = params.entityId;
  const recordId = params.recordId;
  const isCustomer = entityId === 'f9db9d79-e94b-4678-a5cc-aa6e281c1246' && relTabs.length;

  const tabbar = (
    <LinkTab.Group>
      {/*   <LinkTab to={`/entcomm/${entityId}/${recordId}/activities`}>动态</LinkTab>
      <LinkTab to={`/entcomm/${entityId}/${recordId}/info`}>基础信息</LinkTab>
      <LinkTab to={`/entcomm/${entityId}/${recordId}/docs`}>文档</LinkTab>
      {'239a7c69-8238-413d-b1d9-a0d51651abfa' === entityId && <LinkTab to={`/entcomm/${entityId}/${recordId}/receivepay`}>回款</LinkTab>}
      {'f9db9d79-e94b-4678-a5cc-aa6e281c1246' === entityId && <LinkTab to={`/entcomm/${entityId}/${recordId}/relationtree`}>客户关系</LinkTab>}*/}
      {[...relTabs.map(t => (
        t.entitytaburl ?
          <LinkTab key={t.relid} to={`/entcomm/${entityId}/${recordId}/${t.entitytaburl}`}><IntlText name="relname" value={t} /></LinkTab> :
          <LinkTab key={t.relid} to={`/entcomm/${entityId}/${recordId}/rel/${t.relid}/${t.relentityid}`}><IntlText name="relname" value={t} /></LinkTab>
      ))]}
      {entityId === '9834d2bc-084a-49de-bbbf-02f35c191b64' && <LinkTab to={`/entcomm/${entityId}/${recordId}/relationschema`}>关系图</LinkTab>}
      {isCustomer && <LinkTab to={`/entcomm/${entityId}/${recordId}/message`}>司法信息</LinkTab>}
    </LinkTab.Group>
  );

  let titleText = recordDetail.recname || '';
  const titleField = mainFieldsConfig.titleField;
  if (titleField) {
    const value_name = recordDetail[titleField.fieldname + '_name'];
    titleText = value_name !== undefined ? value_name : recordDetail[titleField.fieldname];
  }
  const title = (
    <span style={{ wordBreak: 'break-all' }}>
      <span>{entityName || ''} : </span>
      {titleText}
      <Icon
        type={(recordDetail && recordDetail.isfollowed) ? 'star' : 'star-o'}
        onClick={toggleFollow}
        style={{ marginLeft: '10px', color: '#f5a623', cursor: 'pointer', wordBreak: 'break-all' }}
      />
    </span>
  );

  const routhPath = relTabs.map(item => {
    if (item.entitytaburl) {
      return `/entcomm/${entityId}/${recordId}/${item.entitytaburl}`;
    } else {
      return `/entcomm/${entityId}/${recordId}/rel/${item.relid}/${item.relentityid}`;
    }
  });

  if (firstLoad && routhPath.length > 0) {
    if (location.pathname !== routhPath[0]) {
      stopAutoLink();
      hashHistory.push(routhPath[0]);
    } else { //TODO: 第一个页签  跟 路由配置文件对应的首个路由一致  则也需设置 firstLoad： false
      stopAutoLink();
    }
  }

  return (
    <Page
      title={title}
      fixedTop={(
        <div>
          <HomePageMainFieldsView fields={mainFieldsConfig.subFields || []} value={recordDetail} />
          <StageBar />
          {tabbar}
        </div>
      )}
      showGoBack
      goBackPath={`/entcomm-list/${entityId}`}
      contentStyleFree={/(activities|info)$/.test(location.pathname)}
    >
      {React.cloneElement(children, { checkFunc })}
    </Page>
  );
}

export default connect(
  state => state.entcommHome,
  dispatch => {
    return {
      toggleFollow() {
        dispatch({ type: 'entcommHome/toggleFollow' });
      },
      stopAutoLink() {
        dispatch({ type: 'entcommHome/putState', payload: { firstLoad: false } });
      }
    };
  }
)(connectPermission(props => props.params.entityId, EntcommHome));
