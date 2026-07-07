<template>
  <section class="app-main">
    <transition name="fade-transform" mode="out-in">
      <keep-alive :include="cachedViews">
        <router-view :key="key" />
      </keep-alive>
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  data() {
    return {
      cachedViews: []
    }
  },
  computed: {
    key() {
      // 缓存的视图使用完整路径，确保 keep-alive 能正确识别组件切换
      if (this.$route.name && this.cachedViews.includes(this.$route.name)) {
        return this.$route.path
      }
      const { matched } = this.$route
      if (matched.length > 2) {
        return matched[matched.length - 2].path
      }
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /*50 = navbar  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}
.fixed-header+.app-main {
  padding-top: 50px;
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
