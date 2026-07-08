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
        placement="bottom"
        width="360"
        trigger="click"
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
                <span v-if="expireDaysText(item)" class="reminder-item__days">{{ expireDaysText(item) }}</span>
              </div>
            </div>
          </div>
        </div>
        <el-badge slot="reference" :value="reminderList.length" :hidden="reminderList.length === 0" :max="99" class="reminder-badge">
          <i class="el-icon-bell reminder-bell" @click="fetchReminders" />
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
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">登出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import { getMemoReminderList } from '@/api/memo'
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
      reminderTimer: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'name',
      'roles',
      'roleNames'
    ]),
    roleText() {
      const names = (this.roleNames || []).filter(Boolean)
      if (names.length) {
        return names.join(' / ')
      }
      return (this.roles || []).join(' / ')
    }
  },
  mounted() {
    this.fetchReminders()
    this.reminderTimer = setInterval(() => {
      this.fetchReminders()
    }, 5 * 60 * 1000)
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
      if (diff < 0) return 'expired'
      if (diff <= 3) return 'expiring'
      return ''
    },
    expireDaysText(item) {
      if (!item.expireDate) return ''
      const diff = dayjs(item.expireDate).diff(dayjs(), 'day')
      if (diff < 0) return `已过期${Math.abs(diff)}天`
      if (diff === 0) return '今天到期'
      if (diff <= 3) return `${diff}天后到期`
      return ''
    },
    goMemoList() {
      this.$router.push({ name: 'MemoListPage' })
    },
    goMemoDetail(item) {
      this.$router.push({ name: 'MemoDetail', params: { id: item.id }})
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
</style>

<style lang="scss">
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
  }
}
</style>
