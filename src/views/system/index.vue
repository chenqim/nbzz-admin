<template>
  <keep-alive :include="cachedViews">
    <router-view />
  </keep-alive>
</template>

<script>
export default {
  name: 'SystemManage',
  data() {
    return {
      cachedViews: ['AccessLogList']
    }
  }
}
</script>
