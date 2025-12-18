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
              <!-- 如果书籍未审核通过或待审核，显示提示信息 -->
              <p v-if="getAuditStatus(item.auditStatus) !== 1" class="audit_tip" style="color: #f56c6c; margin: 10px 0;">
                {{ getAuditStatus(item.auditStatus) === 0 ? '该小说正在审核中，暂时无法查看' : '该小说审核未通过，暂时无法查看' }}
              </p>
              <p v-else class="newest">
                {{ item.preChapterNum > 0 ? `上次阅读到第 ${item.preChapterNum} 章` : '尚未开始阅读' }}
              </p>
              <p class="read_btn">
                <!-- 只有审核通过的书籍才能阅读 -->
                <a 
                  v-if="getAuditStatus(item.auditStatus) === 1 && item.firstChapterNum !== null && item.firstChapterNum !== undefined"
                  class="btn_red" 
                  href="javascript:void(0)" 
                  @click="bookContent(item.bookId, item.preChapterNum > 0 ? item.preChapterNum : item.firstChapterNum)">
                  {{ item.preChapterNum > 0 ? '继续阅读' : '开始阅读' }}
                </a>
                <a 
                  v-else-if="getAuditStatus(item.auditStatus) === 1"
                  class="btn_gray" 
                  href="javascript:void(0)" 
                  style="cursor: not-allowed; opacity: 0.5;"
                  @click="handleNoChapter(item)">
                  暂无章节
                </a>
                <a 
                  v-else
                  class="btn_gray" 
                  href="javascript:void(0)" 
                  style="cursor: not-allowed; opacity: 0.5;">
                  暂时无法阅读
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

    // 获取审核状态（转换为数字，兼容字符串类型）
    const getAuditStatus = (auditStatus) => {
      if (auditStatus === null || auditStatus === undefined || auditStatus === '') {
        return 0; // 默认为待审核
      }
      const status = parseInt(auditStatus, 10);
      return isNaN(status) ? 0 : status;
    };

    const bookDetail = (bookId) => {
      // 找到对应的书籍信息
      const book = state.books.find(b => b.bookId === bookId);
      // 如果书籍未审核通过或待审核，提示用户
      if (book && getAuditStatus(book.auditStatus) !== 1) {
        const status = getAuditStatus(book.auditStatus);
        const message = status === 0 ? '该小说正在审核中，暂时无法查看' : '该小说审核未通过，暂时无法查看';
        ElMessage.warning(message);
        return;
      }
      router.push({ path: `/book/${bookId}` });
    };

    const bookContent = (bookId, chapterNum) => {
      // 找到对应的书籍信息
      const book = state.books.find(b => b.bookId === bookId);
      // 如果书籍未审核通过或待审核，提示用户
      if (book && getAuditStatus(book.auditStatus) !== 1) {
        const status = getAuditStatus(book.auditStatus);
        const message = status === 0 ? '该小说正在审核中，暂时无法查看' : '该小说审核未通过，暂时无法查看';
        ElMessage.warning(message);
        return;
      }
      // 验证 chapterNum
      if (!chapterNum || chapterNum === null || chapterNum === undefined) {
        ElMessage.warning('该书籍暂无可用章节，可能正在审核中或已下架');
        return;
      }
      router.push({ path: `/book/${bookId}/${chapterNum}` });
    };

    const handleNoChapter = (book) => {
      ElMessage.warning('该书籍暂无可用章节，可能正在审核中或已下架');
    };

    return {
      ...toRefs(state),
      bookDetail,
      bookContent,
      deleteBook,
      getImageUrl,
      getAuditStatus,
      handleNoChapter,
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