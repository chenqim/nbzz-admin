import request from '@/utils/request'

export function createProduct(data) {
  return request({
    // url: '/dataAdmin/bizProductInfo/create',
    url: '/productInfo/create',
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
    // url: '/dataAdmin/bizProductInfo/update',
    url: '/productInfo/update',
    method: 'post',
    data
  })
}

export function getProductPage(data) {
  return request({
    // url: '/dataAdmin/bizProductInfo/queryByPage',
    url: '/productInfo/queryByPage',
    method: 'post',
    data
  })
}

export function getProductList(data) {
  return request({
    // url: '/dataAdmin/bizProductInfo/queryByList',
    url: '/productInfo/queryByList',
    method: 'post',
    data
  })
}

export function queryMainNameList(data) {
  return request({
    url: '/productInfo/queryMainNameList',
    method: 'post',
    data
  })
}

export function getProductDetail(data) {
  return request({
    url: '/productInfo/queryDetail',
    method: 'post',
    data
  })
}

export function createCustomerRelation(data) {
  return request({
    url: '/productInfo/createCustomerRelation',
    method: 'post',
    data
  })
}

export function deleteCustomerRelation(data) {
  return request({
    url: '/productInfo/deleteCustomerRelation',
    method: 'post',
    data
  })
}

export function queryCustomerRelationListByProduct(data) {
  return request({
    url: '/productInfo/queryCustomerRelationListByProduct',
    method: 'post',
    data
  })
}

export function queryCustomerRelationListByCustomer(data) {
  return request({
    url: '/productInfo/queryCustomerRelationListByCustomer',
    method: 'post',
    data
  })
}

export function updateCustomerRelation(data) {
  return request({
    url: '/productInfo/updateCustomerRelation',
    method: 'post',
    data
  })
}

/** 导出产品 Excel */
export function exportProductExcel(data) {
  return request({
    url: '/productInfo/exportExcel',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
