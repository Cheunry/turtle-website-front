<template>
  <div class="header">
    <div class="mainNav" id="mainNav">
        <div class="box_center cf" style="text-align: center;height: 44px;line-height: 48px;color: #fff;font-size: 16px;">
            小说精品屋作家管理
            <div class="fr" style="font-size: 14px; position: absolute; right: 20px; top: 0; display: flex; align-items: center; gap: 20px;">
                <div class="points-info" style="display: flex; gap: 15px; font-size: 13px; align-items: center;">
                    <span title="每日免费赠送，每日重置">免费积分: <span style="color: #67c23a; font-weight: bold;">{{ freePoints }}</span></span>
                    <span title="充值获得，永久有效">付费积分: <span style="color: #e6a23c; font-weight: bold;">{{ paidPoints }}</span></span>
                    <el-button 
                        type="primary" 
                        size="small" 
                        @click="goRecharge"
                        style="margin-left: 10px;"
                    >
                        充值
                    </el-button>
                </div>
                <router-link :to="{ name: 'authorMessage' }" class="message-link" style="color: #fff; text-decoration: none; position: relative;">
                    信箱
                    <span v-if="unreadCount > 0" class="badge-count">{{ unreadCount }}</span>
                </router-link>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAuthorUnReadCount, getAuthorStatus } from "@/api/author";

export default {
  name: "AuthorHeader",
  setup() {
      const router = useRouter();
      const state = reactive({
          unreadCount: 0,
          freePoints: 0,
          paidPoints: 0
      });

      const loadUnreadCount = async () => {
          try {
              const { data } = await getAuthorUnReadCount();
              state.unreadCount = data || 0;
          } catch (e) {
              console.error("Failed to load author unread count", e);
          }
      };

      const loadAuthorPoints = async () => {
          try {
              // 这里的 status 接口现在返回了完整的 AuthorInfo 信息
              const { data } = await getAuthorStatus();
              if (data && typeof data === 'object') {
                  state.freePoints = data.freePoints || 0;
                  state.paidPoints = data.paidPoints || 0;
              }
          } catch (e) {
              console.error("Failed to load author points", e);
          }
      };

      const goRecharge = () => {
          router.push({ name: 'authorRecharge' });
      };

      onMounted(() => {
          loadUnreadCount();
          loadAuthorPoints();
          
          window.addEventListener('author-message-status-changed', () => {
              loadUnreadCount();
          });

          // 监听积分变化事件（可在扣费成功后触发）
          window.addEventListener('author-points-changed', () => {
              loadAuthorPoints();
          });
      });

      return {
          ...toRefs(state),
          goRecharge
      };
  }
};
</script>

<style scoped>
.header {
    background: #3e3e3e;
}
.badge-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 14px;
  min-width: 14px;
  text-align: center;
  border: 1px solid #fff;
}
</style>
