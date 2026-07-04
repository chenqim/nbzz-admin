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

/** 获取 OSS 直传签名 */
export function getOssSignature() {
  return request({
    url: '/oss/signature',
    method: 'get'
  })
}

/** 保存产品附件 */
export function saveProductAttachments(data) {
  return request({
    url: '/productInfo/saveProductAttachments',
    method: 'post',
    data
  })
}

/** 查询产品图纸附件 */
export function queryProductAttachments(data) {
  return request({
    url: '/productInfo/queryProductAttachments',
    method: 'post',
    data
  })
}

/** 删除产品附件 */
export function deleteProductAttachment(data) {
  return request({
    url: '/productInfo/deleteProductAttachment',
    method: 'post',
    data
  })
}

/** 生成 OSS 文件临时下载 URL */
export function generateDownloadUrl(data) {
  return request({
    url: '/oss/generate-download-url',
    method: 'post',
    data
  })
}
