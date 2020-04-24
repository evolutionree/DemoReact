// 工商照面信息
const __list = [
  { key: 'name', title: '企业名称', content: '', span: 12 },
  { key: 'econkind', title: '企业类型', content: '', span: 12 },
  { key: 'econkindcode', title: '企业类型代码', content: '', span: 12 },
  { key: 'registcapi', title: '注册资本', content: '', span: 12 },
  { key: 'historynames', title: '历史名称（数组）', content: '', span: 12 },
  { key: 'regno', title: '企业注册号', content: '', span: 12 },
  { key: 'termstart', title: '营业开始日期', content: '', span: 12 },
  { key: 'termend', title: '营业结束日期', content: '', span: 12 },
  { key: 'belongorg', title: '所属工商局', content: '', span: 12 },
  { key: 'opername', title: '企业法定代表人', content: '', span: 12 },
  { key: 'startdate', title: '成立日期', content: '', span: 12 },
  { key: 'enddate', title: '注销日期', content: '', span: 12 },
  { key: 'checkdate', title: '核准日期', content: '', span: 12 },
  { key: 'status', title: '经营状态', content: '', span: 12 },
  { key: 'orgno', title: '组织机构号', content: '', span: 12 },
  { key: 'creditno', title: '统一社会信用代码', content: '', span: 12 },
  { key: 'districtCode', title: '地区代码', content: '', span: 12 },
  { key: 'domain', title: '四级行业', content: '', span: 12 },
  { key: 'scope', title: '经营范围', content: '', span: 24 },
  { key: 'address', title: '地址', content: '', span: 24 },
  { key: 'tags', title: '不知道是啥', content: '', span: 24 }
];

const _b = { 0: '当前公示信息', 1: '历史公示信息' };
const _c = { 0: '企业', 4: '社会组织', 5: '律所' };

// 企业工商年报
const _a = ['report_year,年报年份', 'report_date,发布日期', 'name,企业名称', 'reg_no,注册号', 'credit_no,统一社会信用代码', 'telephone,企业联系电话', 'email,电子邮箱', 'address,企业通信地址', 'oper_name,企业法定代表人', 'zip_code,邮政编码', 'reg_capi,注册资本', 'if_invest,企业是否有投资信息或购买其他公司股权', 'if_website,是否有网站或网店', 'if_equity,有限责任公司本年度是否发生股东股权转', 'if_external_guarantee,是否提供对外担保', 'collegues_num,从业人数', 'status,企业标准经营状态', 'origin_status,企业经营状态', 'sale_income,营业总收入', 'debit_amount,负债总额', 'net_amount,净利润', 'prac_person_num,实际员工数量', 'profit_reta,所有者权益合计', 'profit_total,利润总额', 'tax_total,纳税总额', 'total_equity,资产总额', 'fare_scope,主营业务', 'serv_fare_income,主营业务收入', 'websites.web_type,网站类型', 'websites.web_name,网站名称', 'websites.web_url,网站网址', 'stock_changes.name,股东', 'stock_changes.before_percent,变更前股权比例', 'stock_changes.after_percent,变更后股权比例', 'stock_changes.change_date,股权变更日期', 'invest_items.invest_name,投资企业名称', 'invest_items.invest_reg_no,投资企业注册号', 'invest_items.invest_capi,投资金额', 'invest_items.invest_percent,投资占比', 'partners.stock_name,股东名称', 'partners.stock_type,股东类型', 'partners.stock_percent,股东所占比例', 'partners.identify_type,证件类型', 'partners.identify_no,证件编号', 'partners.should_capi_items.invest_type,认缴出资方式', 'partners.should_capi_items.shoud_capi,认缴出资额', 'partners.should_capi_items.should_capi_date,认缴出资时间', 'partners.real_capi_items.real_capi,实缴出资额', 'partners.real_capi_items.invest_type,实缴出资方式', 'partners.real_capi_items.real_capi_date,实缴出资时间', 'guarantee_items.creditor,债权人', 'guarantee_items.debitor,债务人', 'guarantee_items.debit_type,主债权种类', 'guarantee_items.debit_amount,主债权数额', 'guarantee_items.debit_period,履行债务的期限', 'guarantee_items.guarant_method,保证的方式', 'guarantee_items.guarant_period,保证的期间', 'guarantee_items.guarant_scope,保证担保的范围'];
const columns1 = _a.map(s => {
  const sArr = s.split(',');
  return {
    title: sArr[1],
    dataIndex: sArr[0],
    key: sArr[0]
  };
});

// 企业裁判文书列表
const columns2 = [
  { title: '类型', dataIndex: 'type', key: 'type' },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '提交日期', dataIndex: 'date', key: 'date' },
  { title: '案号', dataIndex: 'case_no', key: 'case_no' },
  { title: '案由', dataIndex: 'case_cause', key: 'case_cause' },
  { title: '公示信息', dataIndex: 'disabled', key: 'disabled', render: v => _b[v] }
];

// 企业立案信息
const columns3 = [
  { title: '立案Id', dataIndex: 'case_id', key: 'case_id' },
  { title: '开庭日期', dataIndex: 'hearing_date', key: 'hearing_date' },
  { title: '案号', dataIndex: 'case_no', key: 'case_no' },
  { title: '立案时间', dataIndex: 'start_date', key: 'start_date' },
  { title: '案件状态', dataIndex: 'case_status', key: 'case_status' },
  { title: '承办人', dataIndex: 'agent', key: 'agent' },
  { title: '助理法官', dataIndex: 'assistant', key: 'assistant' },
  { title: '结束时间', dataIndex: 'end_date', key: 'end_date' },
  { title: '当事人角色', dataIndex: 'related_items.role', key: 'related_items.role' },
  { title: '当事人企业id', dataIndex: 'related_items.items.eid', key: 'related_items.items.eid' },
  { title: '当事人企业名称', dataIndex: 'related_items.items.name', key: 'related_items.items.name' },
  { title: '当事人类型', dataIndex: 'related_items.items.entity_type', key: 'related_items.items.entity_type', render: v => _c[v] }
];

// 法院公告信息
const columns4 = [
  { title: '公告类型', dataIndex: 'type', key: 'type' },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '发布日期', dataIndex: 'date', key: 'date' },
  { title: '法院', dataIndex: 'court', key: 'court' },
  { title: '当事人', dataIndex: 'person', key: 'person' },
  { title: '公示信息', dataIndex: 'disabled', key: 'disabled', render: v => _b[v] }
];

// 企业立案信息
const columns5 = [
  { title: '执行法院', dataIndex: 'court', key: 'court' },
  { title: '法定代表人', dataIndex: 'oper_name', key: 'oper_name' },
  { title: '省份', dataIndex: 'province', key: 'province' },
  { title: '执行依据文号', dataIndex: 'doc_number', key: 'doc_number' },
  { title: '立案时间', dataIndex: 'date', key: 'date' },
  { title: '案号', dataIndex: 'case_number', key: 'case_number' },
  { title: '做出执行依据单位', dataIndex: 'ex_department', key: 'ex_department' },
  { title: '生效法律文书确定的义务', dataIndex: 'final_duty', key: 'final_duty' },
  { title: '被执行人履行情况', dataIndex: 'execution_status', key: 'execution_status' },
  { title: '失信被执行人行为具体情形', dataIndex: 'execution_desc', key: 'execution_desc' },
  { title: '发布日期', dataIndex: 'publish_date', key: 'publish_date' },
  { title: '组织机构号', dataIndex: 'number', key: 'number' },
  { title: '公示信息', dataIndex: 'disabled', key: 'disabled', render: v => _b[v] }
];

export default {
  __list,
  columns1,
  columns2,
  columns3,
  columns4,
  columns5
};
