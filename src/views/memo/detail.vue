<template>
  <div v-loading="loading" class="app-container">
    <el-button class="mb-4" icon="el-icon-back" @click="goBack">返回列表</el-button>
    <el-descriptions title="备忘详情" :column="2" border :label-style="{ width: '150px' }" :content-style="{ minWidth: '180px', maxWidth: '500px' }">
      <el-descriptions-item label="备忘标题" :span="2">{{ ins.title }}</el-descriptions-item>
      <el-descriptions-item label="详细内容" :span="2">
        <div class="content-pre">{{ ins.content || '-' }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="内部备注" :span="2">{{ ins.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="到期日期">
        <span v-if="ins.expireDate" :class="expireClass">{{ ins.expireDate }}</span>
        <span v-else class="text-gray">无期限</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="ins.status === 'COMPLETED' ? 'info' : 'success'">
          {{ ins.status === 'COMPLETED' ? '已完成' : '正常' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ ins.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ ins.updateTime }}</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import { getMemoDetail } from '@/api/memo'
import dayjs from 'dayjs'

export default {
  name: 'MemoDetail',
  data() {
    return {
      loading: false,
      ins: {}
    }
  },
  computed: {
    expireClass() {
      if (!this.ins.expireDate || this.ins.status === 'COMPLETED') return ''
      const diff = dayjs(this.ins.expireDate).diff(dayjs(), 'day')
      if (diff <= 0) return 'expire-text expired'
      if (diff < 7) return 'expire-text expiring'
      return ''
    }
  },
  created() {
    this.getDetail()
  },
  watch: {
    '$route.params.id'() {
      this.getDetail()
    }
  },
  methods: {
    async getDetail() {
      this.loading = true
      try {
        const res = await getMemoDetail({ id: this.$route.params.id })
        this.ins = res.data || {}
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.push({ name: 'MemoListPage' })
    }
  }
}
</script>

<style lang="scss" scoped>
.content-pre {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
.text-gray {
  color: #909399;
}
.expire-text {
  font-weight: 600;
  &.expired {
    color: #F56C6C;
  }
  &.expiring {
    color: #E6A23C;
  }
}
</style>
