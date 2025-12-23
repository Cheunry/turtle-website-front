 <template>
  <div class="header">
    <div class="mainNav" id="mainNav">
        <div class="box_center cf" style="text-align: center;height: 44px;line-height: 48px;color: #fff;font-size: 16px;">
            小说精品屋作家管理
            <div class="fr" style="font-size: 14px; position: absolute; right: 20px; top: 0;">
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
import { getAuthorUnReadCount } from "@/api/author";

export default {
  name: "AuthorHeader",
  setup() {
      const state = reactive({
          unreadCount: 0
      });

      const loadUnreadCount = async () => {
          try {
              const { data } = await getAuthorUnReadCount();
              state.unreadCount = data || 0;
          } catch (e) {
              console.error("Failed to load author unread count", e);
          }
      };

      onMounted(() => {
          loadUnreadCount();
          window.addEventListener('author-message-status-changed', () => {
              loadUnreadCount();
          });
      });

      return {
          ...toRefs(state)
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