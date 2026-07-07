import request from '@/utils/request'

export function queryLogPage(data) {
  return request({
    url: '/sysAccessLog/queryLogPage',
    method: 'post',
    data
  })
}

export function getControllerMethods() {
  return request({
    url: '/sysAccessLog/getControllerMethods',
    method: 'post'
  })
}
