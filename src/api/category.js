import request from '@/utils/request'

export function createCategory(data) {
  return request({
    url: '/dataAdmin/bizProductCategory/create',
    method: 'post',
    data
  })
}

export function deleteCategory(data) {
  return request({
    url: '/dataAdmin/bizProductCategory/deleteByIds',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/dataAdmin/bizProductCategory/update',
    method: 'post',
    data
  })
}

export function getCategoryPage(data) {
  return request({
    url: '/dataAdmin/bizProductCategory/queryByPage',
    method: 'post',
    data
  })
}

export function getCategoryList(data) {
  return request({
    url: '/dataAdmin/bizProductCategory/queryByList',
    method: 'post',
    data
  })
}
