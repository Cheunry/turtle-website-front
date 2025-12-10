<template>
  <Header />
  <div class="main box_center cf">
    <div class="channelWrap channelBookshelf cf">
      <div class="title cf">
        <h3 class="on">我的书架</h3>
      </div>
      <div class="bookshelf_list">
        <ul v-if="books.length > 0">
          <li v-for="(item, index) in books" :key="index" class="cf">
            <div class="book_img fl">
              <a href="javascript:void(0)" @click="bookDetail(item.bookId)">
                <img :src="getImageUrl(item.picUrl)" :alt="item.bookName" />
              </a>
            </div>
            <div class="book_info fl">
              <h3>
                <a href="javascript:void(0)" @click="bookDetail(item.bookId)">{{ item.bookName }}</a>
              </h3>
              <p class="author">作者：{{ item.authorName }}</p>
              <p class="newest">
                最新章节：<a href="javascript:void(0)" @click="bookContent(item.bookId, item.lastChapterNum)">{{ item.lastChapterName }}</a>
                <span class="time">({{ item.lastChapterUpdateTime }})</span>
              </p>
              <p class="read_btn">
                <a class="btn_red" href="javascript:void(0)" @click="bookContent(item.bookId, item.preChapterNum ? item.preChapterNum : item.firstChapterNum || 1)">
                  {{ item.preChapterNum ? '继续阅读' : '开始阅读' }}
                </a>
              </p>
            </div>
          </li>
        </ul>
        <div v-else class="no_data">
            您的书架空空如也，快去 <router-link :to="{name: 'home'}">首页</router-link> 逛逛吧！
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { reactive, toRefs, onMounted } from "vue";
import { useRouter } from "vue-router";
import { listBookshelf } from "@/api/user";
import { getImageUrl } from "@/utils";
import "@/assets/styles/book.css";

export default {
  name: "Bookshelf",
  components: {
    Header,
    Footer,
  },
  setup() {
    const router = useRouter();
    const state = reactive({
      books: [],
    });

    onMounted(() => {
      loadBookshelf();
    });

    const loadBookshelf = async () => {
      const { data } = await listBookshelf();
      state.books = data;
    };

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
    };

    const bookContent = (bookId, chapterNum) => {
      router.push({ path: `/book/${bookId}/${chapterNum}` });
    };

    return {
      ...toRefs(state),
      bookDetail,
      bookContent,
      getImageUrl,
    };
  },
};
</script>

<style scoped>
.channelBookshelf {
  background: #fff;
  padding: 20px;
  min-height: 500px;
}
.bookshelf_list li {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}
.bookshelf_list .book_img {
  width: 100px;
  margin-right: 20px;
}
.bookshelf_list .book_img img {
  width: 100px;
  height: 133px;
  border: 1px solid #ebebeb;
}
.bookshelf_list .book_info h3 {
  font-size: 18px;
  margin-bottom: 10px;
}
.bookshelf_list .book_info p {
  line-height: 24px;
  color: #999;
}
.bookshelf_list .book_info .author {
  margin-bottom: 5px;
}
.bookshelf_list .book_info .read_btn {
  margin-top: 15px;
}
.bookshelf_list .book_info .btn_red {
  display: inline-block;
  padding: 0 20px;
  height: 30px;
  line-height: 30px;
  background: #f70;
  color: #fff;
  border-radius: 3px;
}
.no_data {
    text-align: center;
    padding: 50px 0;
    font-size: 16px;
    color: #666;
}
.no_data a {
    color: #f70;
}
</style>