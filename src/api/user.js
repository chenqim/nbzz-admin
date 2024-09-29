import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/getToken',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/login/initMainInfo',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/login/removeToken',
    method: 'post'
  })
}
