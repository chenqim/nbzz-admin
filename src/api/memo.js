import request from '@/utils/request'

export function createMemo(data) {
  return request({
    url: '/taskMemo/create',
    method: 'post',
    data
  })
}

export function updateMemo(data) {
  return request({
    url: '/taskMemo/update',
    method: 'post',
    data
  })
}

export function getMemoDetail(data) {
  return request({
    url: '/taskMemo/getById',
    method: 'post',
    data
  })
}

export function getMemoPage(data) {
  return request({
    url: '/taskMemo/queryByPage',
    method: 'post',
    data
  })
}

export function toggleMemoComplete(data) {
  return request({
    url: '/taskMemo/toggleComplete',
    method: 'post',
    data
  })
}

export function getMemoReminderList() {
  return request({
    url: '/taskMemo/queryReminderList',
    method: 'post'
  })
}
