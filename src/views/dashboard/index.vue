<template>
  <div class="app-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card>
          <div>今日工单总数：30</div>
          <div>生产中：20</div>
          <div>已完成：10</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div>今日工单总工序：20</div>
          <div>已接单工序：20</div>
          <div>今日已接单人员：20</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div>在制品完成情况：20</div>
          <div>总需求数量：20</div>
          <div>已完成数量：20</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
