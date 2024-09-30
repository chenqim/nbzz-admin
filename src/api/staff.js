import request from '@/utils/request'

export function getStaffList(data) {
  return request({
    url: '/user/queryByPage',
    method: 'post',
    data
  })
}

export function createOrUpdateStaff(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}

export function deleteStaff(data) {
  return request({
    url: '/user/deleteByIds',
    method: 'post',
    data
  })
}
