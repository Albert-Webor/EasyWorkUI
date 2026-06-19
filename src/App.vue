<script setup>
import { ref, computed, markRaw } from 'vue'
import Sidebar from './components/Sidebar.vue'
import UserManage from './components/features/UserManage.vue'
import RoleManage from './components/features/RoleManage.vue'
import OrderManage from './components/features/OrderManage.vue'
import ProductManage from './components/features/ProductManage.vue'
import ReportStats from './components/features/ReportStats.vue'
import DataBoard from './components/features/DataBoard.vue'

const featureMap = { UserManage, RoleManage, OrderManage, ProductManage, ReportStats, DataBoard }

const menuItems = [
  {
    label: '系统管理',
    id: 'sys',
    features: [
      { name: '用户管理', key: 'UserManage' },
      { name: '角色管理', key: 'RoleManage' },
    ]
  },
  {
    label: '业务管理',
    id: 'biz',
    features: [
      { name: '订单管理', key: 'OrderManage' },
      { name: '商品管理', key: 'ProductManage' },
    ]
  },
  {
    label: '数据分析',
    id: 'data',
    features: [
      { name: '报表统计', key: 'ReportStats' },
      { name: '数据看板', key: 'DataBoard' },
    ]
  },
]

const tabs = ref([])
const activeKey = ref(null)

const activeTab = computed(() => tabs.value.find(t => t.key === activeKey.value))

function onFeatureSelect(feature) {
  const comp = featureMap[feature.key]
  if (!comp) return
  const existing = tabs.value.find(t => t.key === feature.key)
  if (existing) {
    activeKey.value = feature.key
    return
  }
  tabs.value.push({
    key: feature.key,
    name: feature.name,
    component: markRaw(comp),
  })
  activeKey.value = feature.key
}

function closeTab(key) {
  const idx = tabs.value.findIndex(t => t.key === key)
  if (idx === -1) return
  tabs.value.splice(idx, 1)
  if (activeKey.value === key) {
    activeKey.value = tabs.value.length > 0 ? tabs.value[Math.min(idx, tabs.value.length - 1)].key : null
  }
}

function closeTabMouseDown(e, key) {
  if (e.button === 1) {
    e.preventDefault()
    closeTab(key)
  }
}
</script>

<template>
  <div class="app-layout">
    <Sidebar :menuItems="menuItems" @feature-select="onFeatureSelect" />
    <main class="main-content">
      <div v-if="tabs.length === 0" class="welcome">
        <h1>EasyWork</h1>
        <p>请从左侧菜单选择功能</p>
      </div>
      <template v-else>
        <div class="tab-bar">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: tab.key === activeKey }"
            @click="activeKey = tab.key"
            @mousedown="closeTabMouseDown($event, tab.key)"
          >
            <span class="tab-name">{{ tab.name }}</span>
            <span class="tab-close" @click.stop="closeTab(tab.key)">×</span>
          </div>
        </div>
        <div class="tab-content">
          <component :is="activeTab?.component" :key="activeKey" />
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #bbb;
  user-select: none;
}
.welcome h1 {
  font-size: 42px;
  font-weight: 300;
  margin-bottom: 12px;
  color: #ccc;
}
.tab-bar {
  display: flex;
  align-items: center;
  background: #e8e8e8;
  padding: 0;
  overflow-x: auto;
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  font-size: 13px;
  min-width: 0;
  transition: background 0.15s;
}
.tab-item:hover {
  background: #fff;
}
.tab-item.active {
  background: #fff;
  font-weight: 600;
  color: #333;
}
.tab-name {
  color: inherit;
}
.tab-close {
  font-size: 16px;
  line-height: 1;
  color: #999;
  border-radius: 2px;
  padding: 0 2px;
}
.tab-close:hover {
  color: #333;
  background: #e8e8e8;
}
.tab-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
