import request from '@/utils/request'

/** 分页查询客户 */
export function queryCustomerPage(data) {
  return request({
    url: '/customer/queryPage',
    method: 'post',
    data
  })
}
// 查全量客户数据
export function queryCustomerList(data) {
  return request({
    url: '/customer/selectList',
    method: 'post',
    data
  })
}

export function createCustomer(data) {
  return request({
    url: '/customer/create',
    method: 'post',
    data
  })
}

export function updateCustomer(data) {
  return request({
    url: '/customer/update',
    method: 'post',
    data
  })
}

export function deleteCustomer(data) {
  return request({
    url: '/customer/delete',
    method: 'post',
    data
  })
}

/** 查询客户详情 */
export function getCustomerDetail(data) {
  return request({
    url: '/customer/detail',
    method: 'post',
    data
  })
}

/** 导出客户 Excel */
export function exportCustomerExcel(data) {
  return request({
    url: '/customer/exportExcel',
    method: 'post',
    data,
    responseType: 'blob'
  })
}
