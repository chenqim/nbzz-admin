<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <div class="user-info">
        <span class="user-name">{{ name }}</span>
        <span v-if="roleText" class="user-role">{{ roleText }}</span>
      </div>
      <el-popover
        v-if="isAdmin"
        placement="bottom"
        width="360"
        trigger="hover"
        class="reminder-popover"
      >
        <div class="reminder-panel">
          <div class="reminder-panel__header">
            <span>到期提醒</span>
            <el-button type="text" size="mini" @click="goMemoList">查看全部</el-button>
          </div>
          <div v-if="reminderLoading" class="reminder-panel__loading">
            <i class="el-icon-loading" /> 加载中...
          </div>
          <div v-else-if="reminderList.length === 0" class="reminder-panel__empty">
            <i class="el-icon-bell" /> 暂无待提醒事项
          </div>
          <div v-else class="reminder-panel__list">
            <div
              v-for="item in reminderList"
              :key="item.id"
              class="reminder-item"
              @click="goMemoDetail(item)"
            >
              <div class="reminder-item__title">{{ item.title }}</div>
              <div class="reminder-item__date">
                <span :class="expireClass(item)">{{ item.expireDate }}</span>
                <span v-if="expireDaysText(item)" class="reminder-item__days" :class="{ 'reminder-item__days--expired': expireClass(item) === 'expired' }">{{ expireDaysText(item) }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-badge slot="reference" :value="reminderList.length" :hidden="reminderList.length === 0" :max="99" class="reminder-badge" @mouseenter.native="fetchReminders">
          <i class="el-icon-bell reminder-bell" />
        </el-badge>
      </el-popover>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar || defaultAvatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              总览
            </el-dropdown-item>
          </router-link>
          <!-- <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a> -->
          <el-dropdown-item divided @click.native="showChangePwd">
            <span style="display:block;">修改密码</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      title="修改密码"
      :visible.sync="pwdDialogVisible"
      width="420px"
      :close-on-click-modal="false"
      @closed="resetPwdForm"
    >
      <el-form
        ref="pwdForm"
        :model="pwdForm"
        :rules="pwdRules"
        label-width="90px"
        label-position="left"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="pwdForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入旧密码"
            autocomplete="current-password"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword" class="pwd-form-item--has-strength">
          <el-input
            v-model="pwdForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
            autocomplete="new-password"
          />
          <div class="pwd-strength">
            <span class="pwd-strength__label">密码强度：</span>
            <span :class="['pwd-strength__bar', strengthClass]" />
            <span :class="['pwd-strength__text', strengthClass]">{{ strengthText }}</span>
          </div>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="pwdForm.confirmPassword"
            type="password"
            show-password
            placeholder="请再次输入新密码"
            autocomplete="new-password"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="pwdDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="pwdLoading" @click="submitChangePwd">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getMemoReminderList } from '@/api/memo'
import { updatePwd } from '@/api/user'
import dayjs from 'dayjs'
// import store from '../index'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  data() {
    return {
      defaultAvatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif?imageView2/1/w/80/h/80',
      reminderList: [],
      reminderLoading: false,
      reminderTimer: null,
      pwdDialogVisible: false,
      pwdLoading: false,
      pwdForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  computed: {
    pwdRules() {
      const validatePwd = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入密码'))
          return
        }
        const count = this.getPasswordTypeCount(value)
        if (count < 3) {
          callback(new Error('密码必须包含大写字母、小写字母、数字、特殊字符中的至少三种'))
          return
        }
        callback()
      }
      const validateConfirm = (rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入密码'))
          return
        }
        if (value !== this.pwdForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      }
      return {
        oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
        newPassword: [{ required: true, validator: validatePwd, trigger: 'blur' }],
        confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
      }
    },
    passwordStrength() {
      return this.getPasswordTypeCount(this.pwdForm.newPassword)
    },
    strengthClass() {
      const s = this.passwordStrength
      if (s <= 1) return 'weak'
      if (s === 2) return 'medium'
      if (s === 3) return 'strong'
      return 'very-strong'
    },
    strengthText() {
      const s = this.passwordStrength
      if (!this.pwdForm.newPassword) return ''
      if (s <= 1) return '弱'
      if (s === 2) return '中'
      if (s === 3) return '强'
      return '很强'
    },
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'roles',
      'roleNames'
    ]),
    isAdmin() {
      return (this.roles || []).includes('admin')
    },
    roleText() {
      const names = (this.roleNames || []).filter(Boolean)
      if (names.length) {
        return names.join(' / ')
      }
      return (this.roles || []).join(' / ')
    }
  },
  mounted() {
    if (this.isAdmin) {
      this.fetchReminders()
      this.reminderTimer = setInterval(() => {
        this.fetchReminders()
      }, 5 * 60 * 1000)
    }
  },
  beforeDestroy() {
    if (this.reminderTimer) {
      clearInterval(this.reminderTimer)
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    },
    async fetchReminders() {
      this.reminderLoading = true
      try {
        const res = await getMemoReminderList()
        this.reminderList = res.data || []
      } catch (e) {
        console.log(e)
      } finally {
        this.reminderLoading = false
      }
    },
    expireClass(item) {
      if (!item.expireDate) return ''
      const diff = dayjs(item.expireDate).diff(dayjs(), 'day')
      if (diff <= 0) return 'expired'
      if (diff > 0) return 'expiring'
      return ''
    },
    expireDaysText(item) {
      if (!item.expireDate) return ''
      const diff = dayjs(item.expireDate).diff(dayjs(), 'day')
      if (diff < 0) return `已过期${Math.abs(diff)}天`
      if (diff === 0) return '今天到期'
      if (diff > 0) return `${diff}天后到期`
      return ''
    },
    goMemoList() {
      this.$router.push({ name: 'MemoListPage' })
    },
    goMemoDetail(item) {
      this.$router.push({ name: 'MemoDetail', params: { id: item.id }})
    },
    showChangePwd() {
      this.pwdDialogVisible = true
    },
    resetPwdForm() {
      this.pwdForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
      this.$refs.pwdForm && this.$refs.pwdForm.resetFields()
    },
    getPasswordTypeCount(pwd) {
      if (!pwd) return 0
      let count = 0
      if (/[a-z]/.test(pwd)) count++
      if (/[A-Z]/.test(pwd)) count++
      if (/\d/.test(pwd)) count++
      if (/[^a-zA-Z0-9]/.test(pwd)) count++
      return count
    },
    submitChangePwd() {
      this.$refs.pwdForm.validate(async(valid) => {
        if (!valid) return
        this.pwdLoading = true
        try {
          await updatePwd({ oldPassword: this.pwdForm.oldPassword, newPassword: this.pwdForm.newPassword })
          this.$message.success('密码修改成功，请重新登录')
          this.pwdDialogVisible = false
          await this.$store.dispatch('user/logout')
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        } catch (e) {
          console.log(e)
        } finally {
          this.pwdLoading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      margin-right: 16px;
      line-height: 1.4;

      .user-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .user-role {
        font-size: 12px;
        color: #909399;
      }
    }

    .reminder-badge {
      margin-right: 20px;
      cursor: pointer;

      .reminder-bell {
        font-size: 20px;
        color: #5a5e66;
        transition: color 0.3s;

        &:hover {
          color: #409EFF;
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }
      }
    }
  }
}
.pwd-strength {
  display: flex;
  align-items: center;
  margin-top: 6px;
  margin-bottom: 2px;
  font-size: 12px;
  line-height: 1;

  &__label {
    color: #909399;
  }

  &__bar {
    display: inline-block;
    width: 60px;
    height: 6px;
    border-radius: 3px;
    margin-right: 6px;
    background: #dcdfe6;
    transition: background 0.3s;

    &.weak { background: #F56C6C; }
    &.medium { background: #E6A23C; }
    &.strong { background: #409EFF; }
    &.very-strong { background: #67C23A; }
  }

  &__text {
    &.weak { color: #F56C6C; }
    &.medium { color: #E6A23C; }
    &.strong { color: #409EFF; }
    &.very-strong { color: #67C23A; }
  }
}
</style>

<style lang="scss">
.pwd-form-item--has-strength {
  margin-bottom: 36px !important;
}

.reminder-panel {
  max-height: 360px;
  overflow-y: auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  &__loading,
  &__empty {
    text-align: center;
    padding: 24px 0;
    color: #909399;
    font-size: 14px;
  }

  &__list {
    padding-top: 8px;
  }
}

.reminder-item {
  padding: 10px 4px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f5f7fa;
  }

  &__title {
    font-size: 14px;
    color: #303133;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__date {
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 8px;

    .expired {
      color: #F56C6C;
      font-weight: 600;
    }

    .expiring {
      color: #E6A23C;
      font-weight: 600;
    }
  }

  &__days {
    font-size: 12px;
    color: #E6A23C;
    font-weight: 600;

    &--expired {
      color: #F56C6C;
    }
  }
}
</style>
