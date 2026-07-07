<template>
  <div v-loading="loading" class="app-container">
    <el-button class="mb-4" icon="el-icon-back" @click="goBack">返回</el-button>
    <el-descriptions title="基本信息" :column="2" border>
      <el-descriptions-item label="操作用户">{{ ins.userName }}</el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ ins.userId }}</el-descriptions-item>
      <el-descriptions-item label="类名(中文)">{{ ins.classNameCn }}</el-descriptions-item>
      <el-descriptions-item label="方法名(中文)">{{ ins.functionNameCn }}</el-descriptions-item>
      <el-descriptions-item label="类名">{{ ins.className }}</el-descriptions-item>
      <el-descriptions-item label="方法名">{{ ins.functionName }}</el-descriptions-item>
      <el-descriptions-item label="主机名">{{ ins.hostName }}</el-descriptions-item>
      <el-descriptions-item label="操作时间">{{ ins.operateDate }}</el-descriptions-item>
      <el-descriptions-item label="操作信息" :span="2">{{ ins.msg || '-' }}</el-descriptions-item>
    </el-descriptions>

    <div class="json-section">
      <h3>请求参数</h3>
      <json-viewer
        v-if="parsedParamData !== null"
        :value="parsedParamData"
        :expand-depth="3"
        :copyable="{ copyText: '复制', copiedText: '已复制' }"
        boxed
        sort
      />
      <el-empty v-else description="暂无数据" />
    </div>

    <div class="json-section">
      <h3>返回数据</h3>
      <json-viewer
        v-if="parsedReturnData !== null"
        :value="parsedReturnData"
        :expand-depth="3"
        :copyable="{ copyText: '复制', copiedText: '已复制' }"
        boxed
        sort
      />
      <el-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'

export default {
  name: 'AccessLogDetail',
  components: {
    JsonViewer
  },
  data() {
    return {
      loading: false,
      ins: {}
    }
  },
  computed: {
    parsedParamData() {
      return this.parseJson(this.ins.paramData)
    },
    parsedReturnData() {
      return this.parseJson(this.ins.returnData)
    }
  },
  created() {
    this.loadDetail()
  },
  methods: {
    loadDetail() {
      try {
        const data = this.$route.query.data
        if (data) {
          this.ins = JSON.parse(data)
        }
      } catch (e) {
        console.error('解析详情数据失败', e)
      }
    },
    parseJson(str) {
      if (!str) return null
      try {
        return JSON.parse(str)
      } catch (e) {
        return str
      }
    },
    goBack() {
      this.$router.push({
        name: 'AccessLogList'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.json-section {
  margin-top: 24px;

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
