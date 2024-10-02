import request from '@/utils/request'

export function createStage(data) {
  return request({
    url: '/dataAdmin/bizStagingArea/create',
    method: 'post',
    data
  })
}

export function deleteStage(data) {
  return request({
    url: '/dataAdmin/bizStagingArea/deleteByIds',
    method: 'post',
    data
  })
}

export function updateStage(data) {
  return request({
    url: '/dataAdmin/bizStagingArea/update',
    method: 'post',
    data
  })
}

export function getStagePage(data) {
  return request({
    url: '/dataAdmin/bizStagingArea/queryByPage',
    method: 'post',
    data
  })
}

export function getStageList(data) {
  return request({
    url: '/dataAdmin/bizStagingArea/queryByList',
    method: 'post',
    data
  })
}
