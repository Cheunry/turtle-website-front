<template>
  <Header />
  <div class="main box_center cf">
    <div class="userBox cf">
      <UserMenu />
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">我的信箱</h2>
            <div class="fr">
                <el-button type="primary" size="small" @click="handleBatchRead" :disabled="selectedIds.length === 0">标记已读</el-button>
                <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="selectedIds.length === 0">删除选中</el-button>
                <el-button type="success" size="small" @click="handleAllRead">一键已读</el-button>
                <el-button type="warning" size="small" @click="handleAllDelete">一键清空</el-button>
            </div>
          </div>

          <div class="message-tabs">
             <el-tabs v-model="activeTab" @tab-click="handleTabClick">
              <el-tab-pane label="全部消息" name="all"></el-tab-pane>
              <el-tab-pane label="系统通知" name="sys"></el-tab-pane>
              <el-tab-pane label="作品更新" name="update"></el-tab-pane>
            </el-tabs>
          </div>

          <div class="updateTable" v-loading="loading">
            <table cellpadding="0" cellspacing="0">
                <thead>
                    <tr>
                        <th class="check"><input type="checkbox" v-model="isAllSelected" @change="handleSelectAll" /></th>
                        <th class="style">状态</th>
                        <th class="name">消息标题</th>
                        <th class="chapter">内容预览</th>
                        <th class="time">时间</th>
                        <th class="goread">操作</th>
                    </tr>
                </thead>
                <tbody v-if="messages.length > 0">
                    <tr v-for="msg in messages" :key="msg.id">
                        <td class="check"><input type="checkbox" :value="msg.id" v-model="selectedIds" :disabled="msg.type == 0" /></td>
                        <td class="style">
                            <!-- 其他消息显示已读/未读状态 -->
                            <span v-if="msg.type != 0 && msg.isRead == 0" class="red-dot">●</span>
                            <span v-else-if="msg.type != 0" class="read-text">已读</span>
                            <!-- 系统消息（type=0）不在这里显示，而是在标题左上角 -->
                        </td>
                        <td class="name" @click="viewMessage(msg)">
                            <a href="javascript:void(0);" :class="{ 'unread-title': msg.isRead == 0 && msg.type != 0 }" :style="{ position: 'relative' }">
                                <!-- 系统消息（type=0）显示红色new标签在左上角 -->
                                <span v-if="msg.type == 0" class="new-badge-top-left">new</span>
                                {{ msg.title }}
                            </a>
                        </td>
                        <td class="chapter" @click="viewMessage(msg)">
                            <span class="preview-text">{{ getPreview(msg.content) }}</span>
                        </td>
                        <td class="time">
                            {{ formatDate(msg.createTime) }}
                        </td>
                        <td class="goread">
                            <a href="javascript:void(0);" @click="viewMessage(msg)" class="action-btn">查看</a>
                            <span class="divider">|</span>
                            <a href="javascript:void(0);" @click="handleDelete(msg.id)" class="action-btn delete">删除</a>
                        </td>
                    </tr>
                </tbody>
                <tbody v-else>
                    <tr>
                        <td colspan="6" class="nodate">
                             暂无相关消息
                        </td>
                    </tr>
                </tbody>
            </table>
            
            <div class="pageBox cf">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="total"
                    :page-size="pageSize"
                    :current-page="currentPage"
                    @current-change="handlePageChange"
                    v-if="total > 0"
                />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />

  <el-dialog v-model="dialogVisible" :title="currentMessage.title" width="600px" custom-class="msg-dialog">
    <div class="message-detail">
        <div class="msg-meta">
            <span class="time">{{ currentMessage.createTime }}</span>
        </div>
        <div class="divider-line"></div>
        <div class="msg-body" v-html="currentMessage.content"></div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleDelete(currentMessage.id)">删除</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import "@/assets/styles/user.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import UserMenu from "@/components/user/Menu";
import { reactive, toRefs, onMounted, watch } from "vue";
import { listMessages, readMessage, deleteMessage, batchReadMessages, batchDeleteMessages, allReadMessages, allDeleteMessages } from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "UserMessage",
  components: {
    Header,
    Footer,
    UserMenu,
  },
  setup() {
    const state = reactive({
      activeTab: "all",
      loading: false,
      messages: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      currentMessage: {},
      selectedIds: [],
      isAllSelected: false
    });

    const loadData = async (tabName = null) => {
      state.loading = true;
      try {
        // 使用传入的 tabName，如果没有则使用 state.activeTab
        const currentTab = tabName || state.activeTab;
        const params = {
          pageNum: state.currentPage,
          pageSize: state.pageSize,
          messageType: undefined
        };
        // Mapping tab names to message types
        // 消息类型定义：0:系统公告, 1:订阅更新, 2:作家助手/审核, 3:私信
        if (currentTab === 'sys') {
          params.messageType = 0; // 系统通知
        } else if (currentTab === 'update') {
          params.messageType = 1; // 作品更新
        }
        // 'all' 时 messageType 为 undefined，查询全部

        const { data } = await listMessages(params);
        console.log("Fetched messages:", data.list); // Debug log
        state.messages = data.list || [];
        state.total = Number(data.total) || 0;
        state.selectedIds = [];
        state.isAllSelected = false;
      } catch (e) {
        console.error(e);
      } finally {
        state.loading = false;
      }
    };

    onMounted(() => {
      loadData();
    });

    // 监听 selectedIds 变化以更新全选状态
    watch(() => state.selectedIds, (newVal) => {
        if (state.messages.length > 0 && newVal.length === state.messages.length) {
            state.isAllSelected = true;
        } else {
            state.isAllSelected = false;
        }
    });

    const handleSelectAll = () => {
        if (state.isAllSelected) {
            // 只选择非系统消息（系统消息不支持操作）
            state.selectedIds = state.messages.filter(msg => msg.type != 0).map(msg => msg.id);
        } else {
            state.selectedIds = [];
        }
    };

    const handleTabClick = (tab) => {
      // Element Plus 的 tab-click 事件传递的参数包含 paneName 属性
      // 直接使用事件参数确保获取到正确的标签页值，避免依赖可能未及时更新的 activeTab
      const tabName = tab?.paneName || tab?.name || tab;
      state.currentPage = 1;
      // 直接传递 tabName 给 loadData，确保使用正确的标签页值
      loadData(tabName);
    };

    const handlePageChange = (page) => {
      state.currentPage = page;
      loadData();
    };

    const viewMessage = async (msg) => {
      state.currentMessage = msg;
      state.dialogVisible = true;
      // 系统消息（type=0）不支持已读操作，跳过
      if (msg.isRead == 0 && msg.type != 0) {
        try {
          await readMessage(msg.id);
          // Update local state to reflect read status
          const targetMsg = state.messages.find(m => m.id === msg.id);
          if (targetMsg) targetMsg.isRead = 1;
          // Notify Top component to update badge
          window.dispatchEvent(new Event('message-status-changed'));
        } catch (e) {
          console.error(e);
        }
      }
    };

    const handleDelete = (id) => {
      // 找到要删除的消息，检查是否是系统消息
      const msg = state.messages.find(m => m.id === id);
      if (msg && msg.type == 0) {
        ElMessage.warning("系统公告不支持删除操作");
        return;
      }
      
      ElMessageBox.confirm("确认删除该消息？", "提示", {
        type: "warning",
      }).then(async () => {
        await deleteMessage(id);
        ElMessage.success("删除成功");
        state.dialogVisible = false;
        loadData();
        // Notify Top component to update badge (in case unread message was deleted)
        window.dispatchEvent(new Event('message-status-changed'));
      });
    };

    const handleBatchRead = async () => {
        // 过滤掉系统消息（系统消息不支持已读操作）
        const nonSystemIds = state.selectedIds.filter(id => {
            const msg = state.messages.find(m => m.id === id);
            return msg && msg.type != 0;
        });
        
        if (nonSystemIds.length === 0) {
            ElMessage.warning("选中的消息中没有可标记为已读的消息（系统公告不支持已读操作）");
            return;
        }
        
        if (nonSystemIds.length < state.selectedIds.length) {
            ElMessage.info(`已过滤 ${state.selectedIds.length - nonSystemIds.length} 条系统公告`);
        }
        
        try {
            await batchReadMessages(nonSystemIds);
            ElMessage.success("标记成功");
            // 更新本地状态
            state.messages.forEach(msg => {
                if (nonSystemIds.includes(msg.id)) {
                    msg.isRead = 1;
                }
            });
            state.selectedIds = [];
            window.dispatchEvent(new Event('message-status-changed'));
        } catch(e) {
            console.error(e);
        }
    };

    const handleBatchDelete = () => {
        // 过滤掉系统消息（系统消息不支持删除操作）
        const nonSystemIds = state.selectedIds.filter(id => {
            const msg = state.messages.find(m => m.id === id);
            return msg && msg.type != 0;
        });
        
        if (nonSystemIds.length === 0) {
            ElMessage.warning("选中的消息中没有可删除的消息（系统公告不支持删除操作）");
            return;
        }
        
        if (nonSystemIds.length < state.selectedIds.length) {
            ElMessage.info(`已过滤 ${state.selectedIds.length - nonSystemIds.length} 条系统公告`);
        }
        
        ElMessageBox.confirm(`确认删除选中的 ${nonSystemIds.length} 条消息？`, "提示", {
            type: "warning"
        }).then(async () => {
            await batchDeleteMessages(nonSystemIds);
            ElMessage.success("删除成功");
            loadData();
            window.dispatchEvent(new Event('message-status-changed'));
        }).catch(()=>{});
    };

    const handleAllRead = async () => {
        try {
            await allReadMessages();
            ElMessage.success("全部已读");
            state.messages.forEach(msg => msg.isRead = 1);
            window.dispatchEvent(new Event('message-status-changed'));
        } catch(e) {
             console.error(e);
        }
    };

    const handleAllDelete = () => {
        ElMessageBox.confirm("确认清空所有消息？此操作不可恢复！", "高危操作", {
            type: "error"
        }).then(async () => {
            await allDeleteMessages();
            ElMessage.success("清空成功");
            loadData();
            window.dispatchEvent(new Event('message-status-changed'));
        }).catch(()=>{});
    };

    const getPreview = (content) => {
      if (!content) return "";
      const tmp = document.createElement("DIV");
      tmp.innerHTML = content;
      let text = tmp.textContent || tmp.innerText || "";
      return text.length > 30 ? text.substring(0, 30) + "..." : text;
    };
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr;
    }

    return {
      ...toRefs(state),
      handleTabClick,
      handlePageChange,
      viewMessage,
      handleDelete,
      getPreview,
      formatDate,
      handleSelectAll,
      handleBatchRead,
      handleBatchDelete,
      handleAllRead,
      handleAllDelete
    };
  },
};
</script>

<style scoped>
/* ... (existing styles) ... */
.updateTable .check { width: 40px; text-align: center; padding-left:0; }
/* ... (rest of styles) ... */

/* Layout Styles - Matched with BookList.vue */
.box_center {
  width: 1200px;
  margin: 0 auto;
}

.userBox {
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 6px;
}

/* User Menu (Left Side) Styles */
/* Since UserMenu is a child component, we target its root class */
:deep(.my_l) {
  width: 198px;
  float: left;
  font-size: 13px;
  padding-top: 20px;
}

:deep(.my_l li a) {
  display: block;
  height: 42px;
  line-height: 42px;
  padding-left: 62px;
  border-left: 4px solid #fff;
  margin-bottom: 5px;
  color: #666;
}

:deep(.my_l li .on) {
  background-color: #fafafa;
  border-left: 2px solid #f80;
  color: #000;
  border-radius: 0 2px 2px 0;
}

/* Content (Right Side) Styles */
.my_r {
  width: 940px;
  padding: 0 30px 30px;
  float: right;
  border-left: 1px solid #efefef;
  min-height: 470px;
}

.my_bookshelf .title {
  padding: 20px 0 15px;
  line-height: 30px;
  /* border-bottom: 1px solid #eee; */ /* BookList doesn't seem to have border-bottom on title, but let's keep it if it looks good, or remove to match exactly */
}

.my_bookshelf h2 {
  font-size: 18px;
  font-weight: normal;
  color: #333;
}

/* Tabs */
.message-tabs {
    margin-bottom: 10px;
}

/* Table Styles - Strictly Matched */
.updateTable {
  width: 939px;
  color: #999;
}

.updateTable table {
  width: 100%;
  margin-bottom: 14px;
}

.updateTable th,
.updateTable td {
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  padding-left: 6px;
  font-weight: normal;
  text-align: left;
  font-size: 14px;
}

.updateTable th {
  background: #f9f9f9;
  color: #333;
  border-top: 1px solid #eee;
}

.updateTable tr:nth-child(2n) td {
  background: #fafafa;
}

/* Specific Column Styles */
.updateTable .style { width: 80px; text-align: center; padding-left:0; }
.updateTable .name { width: 100px; padding-right: 10px; }
.updateTable .chapter { width: 250px; padding-right: 5px; color: #999; }
.updateTable .time { width: 140px; }
.updateTable .goread { width: 80px; text-align: center; }

/* Link Styles */
.name a {
    color: #333;
    text-decoration: none;
    display: block;
    white-space: nowrap;
    overflow: visible;
    text-overflow: ellipsis;
    max-width: 250px;
    position: relative;
    padding-left: 30px;
}
.name a:hover {
    color: #f80;
}
.name a.unread-title {
    font-weight: bold;
}

.preview-text {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 320px;
}

.action-btn {
    color: #999;
    margin: 0 3px;
    cursor: pointer;
    text-decoration: none;
}
.action-btn:hover {
    color: #f65167;
}
.action-btn.delete:hover {
    color: #f65167;
}

.divider {
    color: #eee;
    margin: 0 5px;
}

.red-dot {
    color: #f56c6c;
    font-size: 20px;
    vertical-align: middle;
    line-height: 1;
}
.read-text {
    color: #ccc;
    font-size: 12px;
}
.new-badge-top-left {
    position: absolute;
    top: -8px;
    left: -25px;
    display: inline-block;
    background: #f56c6c;
    color: #fff;
    font-size: 10px;
    font-weight: bold;
    padding: 2px 6px;
    border-radius: 3px;
    line-height: 1.2;
    text-transform: uppercase;
    z-index: 1;
    white-space: nowrap;
}

.nodate {
    border-top: 1px solid #eaeaea;
    padding: 60px 0;
    text-align: center;
}

.pageBox {
    text-align: center;
    margin-top: 20px;
}

/* Dialog Styles */
.message-detail {
    padding: 0 10px;
}
.msg-meta {
    color: #999;
    font-size: 13px;
    margin-bottom: 10px;
}
.divider-line {
    height: 1px;
    background: #eee;
    margin: 10px 0 20px;
}
.msg-body {
    font-size: 14px;
    line-height: 1.8;
    color: #333;
    min-height: 100px;
}
</style>