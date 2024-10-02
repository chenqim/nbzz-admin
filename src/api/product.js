import request from '@/utils/request'

export function createProduct(data) {
  return request({
    url: '/dataAdmin/bizProductInfo/create',
    method: 'post',
    data
  })
}

export function deleteProduct(data) {
  return request({
    url: '/dataAdmin/bizProductInfo/deleteByIds',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/dataAdmin/bizProductInfo/update',
    method: 'post',
    data
  })
}

export function getProductPage(data) {
  return request({
    url: '/dataAdmin/bizProductInfo/queryByPage',
    method: 'post',
    data
  })
}

export function getProductList(data) {
  return request({
    url: '/dataAdmin/bizProductInfo/queryByList',
    method: 'post',
    data
  })
}
