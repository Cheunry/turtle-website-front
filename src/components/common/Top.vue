 <template>
  <div class="topMain">
    <div class="box_center cf">
      <router-link :to="{ name: 'home' }" class="logo fl"
        ><img :src="logo" alt="小说精品屋"
      /></router-link>
      <div class="searchBar fl">
        <div class="search cf">
          <input
            v-model="keyword"
            type="text"
            placeholder="书名、作者、关键字"
            class="s_int"
            v-on:keyup.enter="searchByK"
          />
          <label class="search_btn" id="btnSearch" @click="searchByK()"
            ><i class="icon"></i
          ></label>
        </div>
      </div>

      <div class="bookShelf fr" id="headerUserInfo">
        <!--
        <a class="sj_link" href="/user/favorites.html">我的书架</a>-->
        <span v-if="!token" class="user_link"
          ><!--<i class="line mr20">|</i
          >-->
          <router-link :to="{ name: 'login' }" class="mr15">登录</router-link>
          <router-link :to="{ name: 'register' }" class="mr15"
            >注册</router-link
          >
        </span>
        <span v-if="token" class="user_link"
          ><!--<i class="line mr20">|</i
          >-->
          <router-link :to="{ name: 'userMessage' }" class="mr15 message-link" style="position: relative;">
            信箱
            <span v-if="unreadCount > 0" class="badge-count">{{ unreadCount }}</span>
          </router-link>
          <router-link :to="{name:'userSetup'}" class="mr15">{{ nickName }}</router-link>
          <a @click="logout" href="javascript:void(0)">退出</a></span
        >
      </div>
    </div>
  </div>
</template>

<script>
import logo from "@/assets/images/logo.png";
import { reactive, toRefs, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getToken, getNickName, removeToken, removeNickName,removeUid } from "@/utils/auth";
import { countUnreadMessages, logout as logoutApi } from "@/api/user";
export default {
  name: "Top",
  setup(props, context) {
    const state = reactive({
      keyword: "",
      nickName: getNickName(),
      token: getToken(),
      unreadCount: 0,
    });
    
    const route = useRoute();
    const router = useRouter();
    state.keyword = route.query.key;

    const loadUnreadCount = async () => {
        if (state.token) {
            try {
                const { data } = await countUnreadMessages();
                // 确保unreadCount是数字类型，且非负数
                const count = Number(data);
                state.unreadCount = (isNaN(count) || count < 0) ? 0 : count;
            } catch (error) {
                console.error("Failed to load unread messages count", error);
                // 请求失败时，将未读数量设为0，避免显示错误数据
                state.unreadCount = 0;
            }
        } else {
            // 未登录时，确保未读数量为0
            state.unreadCount = 0;
        }
    };

    const searchByK = () => {
      router.push({ path: "/bookclass", query: { key: state.keyword } });
      context.emit("eventSerch", state.keyword);
    };
    const logout = async () => {
      try {
        // 调用后端登出接口，将Token加入黑名单
        const token = getToken();
        if (token) {
          await logoutApi();
        }
      } catch (error) {
        // 即使后端登出失败，也继续执行前端登出逻辑
        console.error('登出失败:', error);
      } finally {
        // 清除本地存储的认证信息
        removeToken();
        removeNickName();
        removeUid();
        state.nickName = "";
        state.token = "";
        state.unreadCount = 0;
        
        // 触发登出事件，通知其他组件（如SSE连接断开）
        window.dispatchEvent(new Event('user-logout'));
        
        // 跳转到首页
        router.push({ name: 'home' });
      }
    };

    // 监听 localStorage 变化（注意：storage 事件只在不同窗口间触发，同窗口需手动更新）
    // 这里简单处理：使用 setInterval 或者 event bus。
    // 更推荐使用 Vuex/Pinia 状态管理，这里为了改动最小，每次路由变化重新获取一下
    router.afterEach(() => {
        state.nickName = getNickName();
        state.token = getToken();
        loadUnreadCount();
    })

    onMounted(() => {
        window.addEventListener('nickname-updated', () => {
            state.nickName = getNickName();
        });
        window.addEventListener('message-status-changed', () => {
            loadUnreadCount();
        });
        loadUnreadCount();
    });

    return {
      ...toRefs(state),
      logo,
      searchByK,
      logout,
    };
  },
};
</script>

<style scoped>
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
.message-link {
    margin-right: 25px !important; /* 给badge留点空间 */
}
</style>
