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
  produce: '制造',
  maintenance: '维修'
}

config.statusMap = {
  create: '已创建',
  receive: '已认领',
  producing: '生产中',
  completed: '已完成'
}

config.statusTypeMap = {
  create: 'info',
  receive: 'primary',
  producing: 'warning',
  completed: 'success'
}

export default config
