import request from '@/utils/request'

export function createWorkOrder(data) {
  return request({
    url: '/workOrder/create',
    method: 'post',
    data
  })
}

export function deleteWorkOrder(data) {
  return request({
    url: '/workOrder/delete',
    method: 'post',
    data
  })
}

export function updateWorkOrder(data) {
  return request({
    url: '/workOrder/update',
    method: 'post',
    data
  })
}

export function getWorkOrderPage(data) {
  return request({
    url: '/workOrder/queryByPage',
    method: 'post',
    data
  })
}

export function getWorkOrderDetail(data) {
  return request({
    url: '/workOrder/queryDetail',
    method: 'post',
    data
  })
}
