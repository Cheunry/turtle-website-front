 <template>
  <div class="my_l">
    <ul class="log_list">
      <li>
        <router-link :class="`${routeName == 'userSetup' ? 'link_8 on' : 'link_8'}`" :to="{ name: 'userSetup' }"
          >账号设置</router-link
        >
      </li>
      <li>
        <router-link :class="`${routeName == 'userMessage' ? 'link_6 on' : 'link_6'}`" :to="{ name: 'userMessage' }"
          >我的信箱</router-link
        >
      </li>
      <!-- 已删除“我的评论”链接 -->
    </ul>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
export default {
  name: "UserMenu",
  setup() {
    const route = useRoute();
    const routeName = route.name;
    return {routeName}
  }
};
</script>
