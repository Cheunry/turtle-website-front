 <template>
  <div class="footer">
    <div class="box_center cf">
      <div class="copyright">
        <ul>
          
          <li>
            肥憋的小说网站
            &nbsp;&nbsp;你可以在这里看书、写作甚至和书中人对话
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import { getToken } from "@/utils/auth";
export default {
  name: "Footer",
  setup() {
    const router = useRouter();
    const goFeedBack = () => {
      if(!getToken()){
        router.push({name: 'login'});
      }else{
      router.push({name: 'feadback'});
      }
    };
    return {
      goFeedBack
    }
  },
  
};
</script>