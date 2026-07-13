import request from '@/utils/request'

/** 分页查询报价单 */
export function queryQuotationPage(data) {
  return request({
    url: '/quotation/page-list',
    method: 'post',
    data
  })
}

/** 获取报价单详情 */
export function getQuotationById(data) {
  return request({
    url: '/quotation/getById',
    method: 'post',
    data
  })
}

/** 创建报价单 */
export function createQuotation(data) {
  return request({
    url: '/quotation/create',
    method: 'post',
    data
  })
}

/** 更新报价单 */
export function updateQuotation(data) {
  return request({
    url: '/quotation/update',
    method: 'post',
    data
  })
}

/** 发布报价单 */
export function publishQuotation(data) {
  return request({
    url: '/quotation/publish',
    method: 'post',
    data
  })
}

/** 导出报价单 Excel */
export function exportQuotationExcel(data) {
  return request({
    url: '/quotation/exportExcel',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

/** 导出报价单 PDF */
export function exportQuotationPdf(data) {
  return request({
    url: '/quotation/exportPdf',
    method: 'post',
    data,
    responseType: 'blob'
  })
}

/** 作废报价单 */
export function cancelQuotation(data) {
  return request({
    url: '/quotation/cancel',
    method: 'post',
    data
  })
}

/** 克隆报价单 */
export function cloneQuotation(data) {
  return request({
    url: '/quotation/clone',
    method: 'post',
    data
  })
}

/** 获取报价单版本历史 */
export function getQuotationVersionHistory(data) {
  return request({
    url: '/quotation/version-history',
    method: 'post',
    data
  })
}

/** 从版本历史克隆报价单 */
export function cloneQuotationFromVersion(data) {
  return request({
    url: '/quotation/cloneFromVersion',
    method: 'post',
    data
  })
}
