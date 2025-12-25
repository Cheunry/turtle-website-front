 <template>
  <div class="mainNav" id="mainNav">
    <div class="box_center cf">
      <ul class="nav" id="navModule">
        <li><router-link :to="{ name: 'home' }">首页</router-link></li>
        <li>
          <router-link :to="{ name: 'bookclass' }"> 全部作品 </router-link>
        </li>
        <li><router-link :to="{ name: 'bookRank' }">排行榜</router-link></li>
        <li><router-link :to="{ name: 'bookshelf' }">我的书架</router-link></li>
        <!--<li class=""><a href="/pay/index.html">充值</a></li>-->
        <li><a @click="goAuthor" href="javascript:void(0)">作家专区</a></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getToken} from "@/utils/auth";
import {getAuthorStatus} from "@/api/author"
export default {
  name: "Navbar",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const goAuthor = async () => {
      if (!getToken()) {
        router.push({
          name: "login",
        });
        return;
      }

      try {
        const response = await getAuthorStatus();
        // 根据 axios 拦截器，成功时返回的是 res.data，其中包含 data 字段
        const data = response?.data;
        if(data === null || data === undefined){
          router.push({
            name: "authorRegister",
          });
          return;
        }

        // 使用 router.push 而不是 window.open，避免新标签页的问题
        router.push({
          name: "authorBookList",
        });
      } catch (error) {
        console.error('获取作家状态失败:', error);
        // 如果获取状态失败，仍然尝试跳转到注册页面或列表页面
        // 让后端接口来决定用户是否有权限
        router.push({
          name: "authorBookList",
        });
      }
    };
    return {
      goAuthor,
    };
  },
};
</script>