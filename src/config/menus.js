export default [
  // { name: '首页', path: '/', icon: 'home' },
  // {
  //   name: 'CRM',
  //   icon: 'team',
  //   children: [
  //     { name: '客户', path: '/customer' },
  //     // { name: '商机', path: '/opportunity' },
  //     // { name: '合同', path: '/contract' }
  //   ]
  // },

  {
    name: '办公',
    icon: 'calendar',
    children: [
      {
        name: '公告通知',
        path: '/notice-list'
      },
      // {
      //   name: '工作报告',
      //   children: [
      //     { name: '周报', path: '/report/weekly' },
      //     { name: '日报', path: '/report/daily' }
      //   ]
      // },
      {
        name: '知识库',
        path: 'knowledge'
      },
      {
        name: '考勤',
        path: 'attendance'
      },
      {
        name: '审批',
        path: '/affair-list'
      },
      {
        name: '销售目标',
        path: '/salestarget'
      }
    ]
  },
  {
    name: '团队组织',
    path: '/structure',
    icon: 'setting'
  },
  {
    name: '实体配置',
    path: '/entity',
    icon: 'setting'
  },
  {
    name: '数据源配置',
    path: '/data-source',
    icon: 'filter'
  },
  {
    name: '数据权限设置',
    icon: 'setting',
    children: [
      {
        name: '角色分类',
        path: '/role-groups'
      },
      {
        name: '角色权限',
        path: '/roles'
      },
      {
        name: '职能权限',
        path: '/vocations'
      }
    ]
  },
  {
    name: '产品管理',
    path: '/products',
    icon: 'setting'
  },
  {
    name: '操作日志',
    path: '/operate-log',
    icon: 'calendar'
  },
  {
    name: '字典配置',
    icon: 'setting',
    children: [
      {
        name: '字典分类',
        path: '/dictype'
      },
      {
        name: '字典参数',
        path: '/dic'
      }
    ]
  },
  {
    name: '审批设置',
    path: 'workflow',
    icon: 'setting'
  },
  {
    name: '系统管理',
    icon: 'setting',
    children: [
      {
        name: '授权信息',
        path: '/licenseinfo'
      }
    ]
  },
  {
    name: '业务参数设置',
    icon: 'setting',
    children: [
      {
        name: '销售阶段',
        path: '/salestage'
      },
      {
        name: '指标设置',
        path: '/targetsetting'
      }
    ]
  },
  {
    name: '提醒设置',
    icon: 'setting',
    children: [
      {
        name: '系统提醒',
        path: '/systemnotifications'
      },
      {
        name: '智能提醒',
        path: '/reminder-list'
      },
      {
        name: '回收规则',
        path: '/collector-list'
      }
    ]
  },
  {
    name: '报表管理',
    path: 'reportform',
    icon: 'setting'
  }

];
