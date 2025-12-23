<template>
  <AuthorHeader />
  <div class="main box_center_author cf">
    <div class="userBox cf">
      <div class="my_l">
        <ul class="log_list">
          <li>
            <router-link class="link_4" :to="{ name: 'authorBookList' }">小说管理</router-link>
          </li>
          <li>
            <router-link class="link_1 on" :to="{ name: 'authorMessage' }">作家信箱</router-link>
          </li>
        </ul>
      </div>
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">消息中心</h2>
            <div class="fr">
                <el-button type="primary" size="small" @click="handleBatchRead" :disabled="selectedIds.length === 0">标记已读</el-button>
                <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="selectedIds.length === 0">删除选中</el-button>
                <el-button type="success" size="small" @click="handleAllRead">一键已读</el-button>
                <el-button type="warning" size="small" @click="handleAllDelete">一键清空</el-button>
            </div>
          </div>
          
          <div class="message-tabs">
            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
              <el-tab-pane label="全部" name="all"></el-tab-pane>
              <el-tab-pane label="审核通知" name="audit"></el-tab-pane>
              <el-tab-pane label="封面通知" name="cover"></el-tab-pane>
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
                        <td class="check"><input type="checkbox" :value="msg.id" v-model="selectedIds" /></td>
                        <td class="style">
                            <span v-if="msg.isRead == 0" class="red-dot">●</span>
                            <span v-else class="read-text">已读</span>
                        </td>
                        <td class="name" @click="viewMessage(msg)">
                            <div class="title-wrapper">
                                <el-tag size="small" v-if="msg.type === 2" type="warning" class="mr-2 tag-badge">审核</el-tag>
                                <el-tag size="small" v-if="msg.type === 4" type="success" class="mr-2 tag-badge">封面</el-tag>
                                <a href="javascript:void(0);" :class="{ 'unread-title': msg.isRead == 0 }">
                                    {{ msg.title }}
                                </a>
                            </div>
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

            <div class="pageBox cf" style="margin-top:20px; text-align:center;">
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

  <!-- Detail Dialog -->
  <el-dialog v-model="dialogVisible" :title="currentMessage.title" width="600px" custom-class="msg-dialog">
    <div class="message-detail">
        <div class="msg-meta">
            <span class="time">{{ currentMessage.createTime }}</span>
        </div>
        <div class="divider-line"></div>
      
      <!-- Standard Content -->
      <div class="msg-body" v-html="currentMessage.content"></div>
      
      <!-- Special Handling for Audit Rejection (Type 3 usually, assuming status check inside content or metadata) -->
      <!-- If backend sends a flag like 'canAppeal' or we detect it -->
      <div v-if="isAuditRejection(currentMessage)" class="special-action-area">
        <el-alert title="审核未通过" type="error" :closable="false" show-icon>
            您可以点击下方按钮发起申诉。
        </el-alert>
        <div style="margin-top: 10px;">
             <el-button type="primary" @click="handleAppeal(currentMessage)">发起申诉</el-button>
        </div>
      </div>

      <!-- Special Handling for AI Cover (Type 4) -->
      <div v-if="isAICover(currentMessage)" class="special-action-area">
        <el-alert title="AI封面已生成" type="success" :closable="false" show-icon>
            临时链接有效期24小时，请尽快下载保存。
        </el-alert>
        <!-- Assuming the content contains the URL, or we parse it. For now, trust the HTML content but add a copy button if we can find a link -->
         <div style="margin-top: 10px;" v-if="extractUrl(currentMessage.content)">
            <el-input :model-value="extractUrl(currentMessage.content)" readonly>
                <template #append>
                    <el-button @click="copyLink(extractUrl(currentMessage.content))">复制链接</el-button>
                </template>
            </el-input>
         </div>
      </div>

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
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { listAuthorMessages, readAuthorMessage, deleteAuthorMessage, batchReadAuthorMessages, batchDeleteAuthorMessages, allReadAuthorMessages, allDeleteAuthorMessages } from "@/api/author";
import AuthorHeader from "@/components/author/Header.vue";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "AuthorMessage",
  components: {
    AuthorHeader,
  },
  setup() {
    const router = useRouter();
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
          messageType: 2, // 作家助手/审核类型
          busType: undefined
        };
        // Mapping: 根据标签页设置业务类型筛选
        // 消息类型定义：0:系统公告, 1:订阅更新, 2:作家助手/审核, 3:私信
        // 审核通知和封面通知都是 type=2，通过 busType 区分：
        // - 审核通知：busType = "BOOK_AUDIT" 或 "CHAPTER_AUDIT"
        // - 封面通知：busType = "BOOK_COVER"（假设）
        if (currentTab === 'audit') {
          // 审核通知：筛选 busType 为 BOOK_AUDIT 或 CHAPTER_AUDIT
          // 使用特殊值 'AUDIT' 来匹配所有以 'AUDIT' 结尾的 busType
          params.busType = 'AUDIT';
        } else if (currentTab === 'cover') {
          params.busType = 'BOOK_COVER'; // 封面通知
        } else {
          // 全部：查询所有类型2的消息（不设置busType）
          params.busType = undefined;
        }

        const { data } = await listAuthorMessages(params);
        state.messages = data.list || [];
        state.total = Number(data.total) || 0;
        state.selectedIds = [];
        state.isAllSelected = false;
      } catch (e) {
        console.error(e);
        ElMessage.error("加载消息列表失败：" + (e.response?.data?.message || e.message || "未知错误"));
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
            state.selectedIds = state.messages.map(msg => msg.id);
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
    }

    const handlePageChange = (page) => {
      state.currentPage = page;
      loadData();
    };

    const viewMessage = async (msg) => {
      state.currentMessage = msg;
      state.dialogVisible = true;
      if (msg.isRead == 0) {
        try {
          await readAuthorMessage(msg.id);
          const targetMsg = state.messages.find(m => m.id === msg.id);
          if (targetMsg) targetMsg.isRead = 1;
          window.dispatchEvent(new Event('author-message-status-changed'));
        } catch(e) {
          console.error("标记消息已读失败：", e);
        }
      }
    };

    const handleDelete = (id) => {
        ElMessageBox.confirm("确认删除？", "提示", { type: "warning" })
        .then(async () => {
            await deleteAuthorMessage(id);
            ElMessage.success("已删除");
            state.dialogVisible = false;
            loadData();
            window.dispatchEvent(new Event('author-message-status-changed'));
        }).catch(() => {});
    };

    const handleBatchRead = async () => {
        try {
            await batchReadAuthorMessages(state.selectedIds);
            ElMessage.success("标记成功");
            // 更新本地状态
            state.messages.forEach(msg => {
                if (state.selectedIds.includes(msg.id)) {
                    msg.isRead = 1;
                }
            });
            state.selectedIds = [];
            window.dispatchEvent(new Event('author-message-status-changed'));
        } catch(e) {
            console.error(e);
        }
    };

    const handleBatchDelete = () => {
        ElMessageBox.confirm(`确认删除选中的 ${state.selectedIds.length} 条消息？`, "提示", {
            type: "warning"
        }).then(async () => {
            await batchDeleteAuthorMessages(state.selectedIds);
            ElMessage.success("删除成功");
            loadData();
            window.dispatchEvent(new Event('author-message-status-changed'));
        }).catch(()=>{});
    };

    const handleAllRead = async () => {
        try {
            await allReadAuthorMessages();
            ElMessage.success("全部已读");
            state.messages.forEach(msg => msg.isRead = 1);
            window.dispatchEvent(new Event('author-message-status-changed'));
        } catch(e) {
             console.error(e);
        }
    };

    const handleAllDelete = () => {
        ElMessageBox.confirm("确认清空所有消息？此操作不可恢复！", "高危操作", {
            type: "error"
        }).then(async () => {
            await allDeleteAuthorMessages();
            ElMessage.success("清空成功");
            loadData();
            window.dispatchEvent(new Event('author-message-status-changed'));
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

    const isAuditRejection = (msg) => {
        return (msg.title && (msg.title.includes("驳回") || msg.title.includes("不通过")));
    };

    const handleAppeal = (msg) => {
        ElMessageBox.prompt('请输入申诉理由', '申诉', {
          confirmButtonText: '提交',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          ElMessage.success('申诉已提交: ' + value);
        }).catch(() => {});
    };

    const isAICover = (msg) => {
         return (msg.title && msg.title.includes("封面"));
    };

    const extractUrl = (content) => {
        const match = content.match(/https?:\/\/[^\s"']+/);
        return match ? match[0] : null;
    };

    const copyLink = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            ElMessage.success('链接已复制');
        }, () => {
            ElMessage.error('复制失败');
        });
    };

    return {
      ...toRefs(state),
      handleTabClick,
      handlePageChange,
      viewMessage,
      handleDelete,
      getPreview,
      formatDate,
      isAuditRejection,
      handleAppeal,
      isAICover,
      extractUrl,
      copyLink,
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

/* Layout Styles */
.box_center_author {
  width: 1200px;
  margin: 0 auto;
}

.userBox {
    margin: 0 auto 50px;
    background: #fff;
    border-radius: 6px;
}

/* My_l styles from author module */
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

/* My_r styles - Matched */
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
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
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
.updateTable .chapter { width: 330px; padding-right: 5px; color: #999; }
.updateTable .time { width: 100px; }
.updateTable .goread { width: 80px; text-align: center; }

/* Link & Tag Styles */
.title-wrapper {
    display: flex;
    align-items: center;
}
.tag-badge {
    margin-right: 5px;
    height: 20px;
    line-height: 18px;
    padding: 0 5px;
}
.name a {
    color: #333;
    text-decoration: none;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
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
.special-action-area {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px dashed #eee;
}
</style>
