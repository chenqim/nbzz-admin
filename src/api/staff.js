import request from '@/utils/request'

export function getStaffList(data) {
  return request({
    url: '/user/queryByPage',
    method: 'post',
    data
  })
}
