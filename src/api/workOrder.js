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

export function deliveryOrder(data) {
  return request({
    url: '/workOrder/deliveryOrder',
    method: 'post',
    data
  })
}

export function queryLatelyByPage(data) {
  return request({
    url: '/workOrder/queryLatelyByPage',
    method: 'post',
    data
  })
}

export function queryOrderAchieveTotal(data) {
  return request({
    url: '/wxapp/boss/queryOrderAchieveTotal',
    method: 'post',
    data
  })
}

export function queryProduceExecuteTotal(data) {
  return request({
    url: '/wxapp/boss/queryProduceExecuteTotal',
    method: 'post',
    data
  })
}

export function queryWorkingProcedureList(data) {
  return request({
    url: '/workOrder/queryWorkingProcedureList',
    method: 'post',
    data
  })
}

export function updateWorkingProcedure(data) {
  return request({
    url: '/workOrder/updateWorkingProcedure',
    method: 'post',
    data
  })
}
