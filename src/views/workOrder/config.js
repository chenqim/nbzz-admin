const config = {}

config.gradeMap = {
  middle: '普通',
  high: '紧急'
}

config.gradeTypeMap = {
  middle: 'primary',
  high: 'danger'
}

config.typeMap = {
  produce: '新刀',
  maintenance: '维修',
  rework: '返工'
}

config.statusMap = {
  create: '已创建',
  receive: '已认领',
  producing: '生产中',
  executed: '待发货',
  completed: '已完成'
}

config.statusTypeMap = {
  create: 'info',
  receive: 'primary',
  producing: 'warning',
  executed: 'danger',
  completed: 'success'
}

config.trackingTypeMap = {
  1: '上门自提',
  2: '送货上门',
  3: '快递发货'
}

export default config
