import request from '@/utils/request'

export function getRoleList(data) {
  return request({
    url: '/role/queryRoles',
    method: 'post',
    data
  })
}
