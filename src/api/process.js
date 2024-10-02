import request from '@/utils/request'

export function createProcess(data) {
  return request({
    url: '/dataAdmin/bizWorkingProcedure/create',
    method: 'post',
    data
  })
}

export function deleteProcess(data) {
  return request({
    url: '/dataAdmin/bizWorkingProcedure/deleteByIds',
    method: 'post',
    data
  })
}

export function updateProcess(data) {
  return request({
    url: '/dataAdmin/bizWorkingProcedure/update',
    method: 'post',
    data
  })
}

export function getProcessPage(data) {
  return request({
    url: '/dataAdmin/bizWorkingProcedure/queryByPage',
    method: 'post',
    data
  })
}

export function getProcessList(data) {
  return request({
    url: '/dataAdmin/bizWorkingProcedure/queryByList',
    method: 'post',
    data
  })
}
