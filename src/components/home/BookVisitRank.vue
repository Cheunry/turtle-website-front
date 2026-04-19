<template>
  <div id="bookrank1_ShowBookRank">
        <div class="rightBox">
          <div class="title cf">
            <h3 class="on">点击榜单</h3>
          </div>
          <div class="rightList">
            <ul id="clickRankBooks">
              <li v-for="(item,index) in books" :key="index" :class="['num' + (Number(`${index}`) + 1), { on: index == 0 }]">
               <div class="book_name">
                <i>{{ index + 1 }}</i
                ><a class="name" href="javascript:void(0)" @click="bookDetail(item.id)">{{
                  item.bookName
                }}</a>
              </div>
              <div class="book_intro" v-if="index === 0">
                <div class="cover">
                  <a href="javascript:void(0)" @click="bookDetail(item.id)"
                    ><img
                      :src="getImageUrl(item.picUrl, imgBaseUrl)"
                      :alt="item.bookName"
                      onerror="this.src='default.gif';this.onerror=null"
                  /></a>
                </div>
                <a class="txt" href="javascript:void(0)" @click="bookDetail(item.id)">{{ item.bookDesc }}</a>
              </div>
             
              </li>
              
            </ul>
            <div class="more">
              <router-link :to="{ name: 'bookRank' }">查看更多&gt;</router-link>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { listVisitRankBooksHome } from "@/api/book";
import { getImageUrl } from "@/utils/index";
export default {
  name: "BookVisitRank",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      books: [],
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL
    });

    onMounted(async () => {
      const { data } = await listVisitRankBooksHome();
      state.books = Array.isArray(data) ? data : [];
    });

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
    };
    return {
      ...toRefs(state),
      bookDetail,
      getImageUrl,
    };
  },
};
</script>