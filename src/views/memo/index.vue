<template>
  <keep-alive include="MemoList">
    <router-view />
  </keep-alive>
</template>

<script>
export default {
  name: 'MemoManage'
}
</script>
