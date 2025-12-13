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
                <img :src="getImageUrl(item.picUrl, imgBaseUrl)" :alt="item.bookName" onerror="this.src='default.gif';this.onerror=null" />
              </a>
            </div>
            <div class="book_info fl">
              <h3>
                <a href="javascript:void(0)" @click="bookDetail(item.bookId)">{{ item.bookName }}</a>
              </h3>
              <p class="author">作者：{{ item.authorName }}</p>
              <p class="newest">
                {{ item.preChapterNum > 0 ? `上次阅读到第 ${item.preChapterNum} 章` : '尚未开始阅读' }}
              </p>
              <p class="read_btn">
                <!-- 逻辑简化：只要有阅读进度就用进度，否则直接用书的首章节号（如果是null则兜底为0） -->
                <!-- 这里的 !== null 判断非常重要，因为 0 是有效的章节号 -->
                <a class="btn_red" href="javascript:void(0)" @click="bookContent(item.bookId, item.preChapterNum > 0 ? item.preChapterNum : (item.firstChapterNum !== null ? item.firstChapterNum : 1))">
                  {{ item.preChapterNum > 0 ? '继续阅读' : '开始阅读' }}
                </a>
                <a class="btn_gray" href="javascript:void(0)" @click="deleteBook(item.bookId)" style="margin-left: 10px;">移除</a>
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
import { listBookshelf, deleteBookshelf } from "@/api/user";
import { getImageUrl } from "@/utils";
import { ElMessage, ElMessageBox } from "element-plus";
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
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
    });

    onMounted(() => {
      loadBookshelf();
    });

    const loadBookshelf = async () => {
      const { data } = await listBookshelf();
      state.books = data;
    };

    const deleteBook = (bookId) => {
      ElMessageBox.confirm(
        "确认将这本书移出书架吗？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(async () => {
        await deleteBookshelf(bookId);
        ElMessage.success("移除成功");
        loadBookshelf();
      }).catch(() => {
        // 取消删除
      });
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
      deleteBook,
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