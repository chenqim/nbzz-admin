<template>
  <span class="copy-text-wrap">
    <span class="copy-text-value">{{ value }}</span>
    <i
      class="el-icon-copy-document copy-text-icon"
      @click="handleCopy"
    />
    <!-- <el-tooltip :content="copied ? '已复制' : '点击复制'" placement="top" :hide-after="1500">
      <i
        class="el-icon-copy-document copy-text-icon"
        @click="handleCopy"
      />
    </el-tooltip> -->
  </span>
</template>

<script>
export default {
  name: 'CopyText',
  props: {
    value: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      // copied: false
    }
  },
  methods: {
    handleCopy() {
      const text = String(this.value)
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          this.showSuccess()
        }).catch(() => {
          this.fallbackCopy(text)
        })
      } else {
        this.fallbackCopy(text)
      }
    },
    fallbackCopy(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.showSuccess()
      } catch (e) {
        this.$message.error('复制失败')
      } finally {
        document.body.removeChild(textarea)
      }
    },
    showSuccess() {
      // this.copied = true
      this.$message.success('复制成功')
      setTimeout(() => {
        // this.copied = false
      }, 2000)
    }
  }
}
</script>

<style scoped>
.copy-text-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.copy-text-icon {
  cursor: pointer;
  color: #909399;
  font-size: 13px;
  flex-shrink: 0;
  transition: color 0.2s;
  margin-left: 4px;
}

.copy-text-icon:hover {
  color: #409eff;
}
</style>
