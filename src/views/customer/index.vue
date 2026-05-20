<template>
  <keep-alive include="CustomerList">
    <router-view />
  </keep-alive>
</template>

<script>
export default {
  name: 'CustomerManage'
}
</script>
