<template>
  <Header />
  <div class="main box_center cf">
    <div class="nav_sub">
      
    </div>
    <div class="channelWrap channelChapterlist cf mb50">
      <div class="bookMain">
        <div class="bookCover cf">
          <div class="book_info1">
            <div class="tit">
              <h1>{{book.bookName}}</h1>
              <!--<i class="vip_b">VIP</i>-->
            </div>
            <ul class="list">
              <li>
                <span>作者：<a href="javascript:void(0)">{{book.authorName}}</a></span>
                <span
                  >类别：{{book.categoryName}}</span
                >
                <span>状态：<em class="black3">{{
                  book.bookStatus == 0 ? "连载中" : "已完结"
                }}</em></span>
                <span>总点击：<em class="black3" id="cTotal">{{book.visitCount}}</em></span>
                <span>总字数：<em class="black3">{{book.wordCount}}</em></span>
              </li>
            </ul>
          </div>
        </div>
        <div class="dirWrap cf">
          <h3>正文({{chapterList.length}})</h3>
          <div class="dirList" v-if="chapterList.length > 0">
            <ul v-for="(item,index) in chapterList" :key="index">
              <li>
                <a @click="bookContent(book.id, item.chapterNum)" href="javascript:void(0)">
                  <span>{{item.chapterName}}</span><i class="red"> [{{item.isVip == 1 ? '收费' : '免费'}}]</i>
                </a>
              </li>
            </ul>
          </div>
          <div v-else class="empty-chapter-tip">
            <div class="tip-icon">📚</div>
            <p class="tip-text">该书籍暂无可用章节</p>
            <p class="tip-desc">可能的原因：</p>
            <ul class="tip-reasons">
              <li>• 章节仍在审核中，请稍后再试</li>
              <li>• 章节审核未通过，已下架</li>
              <li>• 作者尚未发布章节</li>
            </ul>
            <div class="tip-actions">
              <a @click="bookDetail(book.id)" href="javascript:void(0)" class="btn-back" v-if="book && book.id">返回书籍详情</a>
              <a @click="router.push({ path: '/home' })" href="javascript:void(0)" class="btn-home">返回首页</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getBookById, listChapters } from "@/api/book";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ElMessage } from "element-plus";
export default {
  name: "chapterList",
  components: {
    Header,
    Footer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      book: {},
      chapterList: [],
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
    });
    onMounted(() => {
      const bookId = route.params.bookId;
      
      // 检查 bookId 是否存在
      if (!bookId) {
        ElMessage.error('书籍ID无效，无法加载目录');
        router.push({ path: '/home' });
        return;
      }
      
      // 处理字符串 "null" 或 "undefined" 的情况
      // 这种情况可能是从其他页面跳转时传递了无效值，但不应该直接跳转
      // 而是显示空目录提示，让用户知道问题
      if (bookId === 'null' || bookId === 'undefined') {
        console.warn('检测到 bookId 为字符串 "null" 或 "undefined"');
        // 设置空列表，显示友好提示，而不是直接跳转
        state.chapterList = [];
        // 尝试从 URL 或其他地方获取有效的 bookId
        // 如果无法获取，至少让用户看到提示信息
        return;
      }
      
      // 验证是否为有效数字
      const numBookId = Number(bookId);
      if (isNaN(numBookId) || numBookId <= 0) {
        ElMessage.error('书籍ID格式错误，无法加载目录');
        router.push({ path: '/home' });
        return;
      }
      
      // bookId 有效，正常加载（即使目录为空也会显示友好提示）
      loadBook(bookId);
      loadChapterList(bookId);
    });

    const loadBook = async (bookId) => {
      try {
        const { data } = await getBookById(bookId);
        state.book = data;
      } catch (error) {
        console.error('加载书籍信息失败:', error);
        ElMessage.error('加载书籍信息失败');
      }
    };

    const loadChapterList = async (bookId) => {
      try {
        // bookId 在 onMounted 中已经验证过，这里直接使用
        const { data } = await listChapters({ bookId: bookId });
        
        // 后端直接返回数组，处理空列表情况（包括所有章节审核不通过的情况）
        state.chapterList = Array.isArray(data) ? data : [];
        
        // 目录为空是正常情况（可能是所有章节审核不通过、正在审核中等）
        // 不显示错误消息，页面会显示友好的空目录提示界面
      } catch (error) {
        console.error('加载章节目录失败:', error);
        
        // 区分不同类型的错误
        if (error.response) {
          const status = error.response.status;
          // 400 或 404 可能是参数错误或书籍不存在，但我们已经验证过 bookId
          // 这种情况下，可能是网络问题或服务异常，设置空列表显示提示
          if (status === 400 || status === 404) {
            // 参数错误或资源不存在，显示空目录提示
            state.chapterList = [];
          } else {
            // 其他服务器错误，也显示空目录提示，不显示错误消息
            state.chapterList = [];
          }
        } else {
          // 网络错误或其他错误，设置空列表显示提示
          state.chapterList = [];
        }
      }
    };

    const bookContent = (bookId, chapterNum) => {
      // 修改点2：如果您使用了联合主键加速检索，建议这里传递 chapterNum
      // 同时也需要确保路由配置和 BookContent 页面支持接收 chapterNum
      router.push({ path: `/book/${bookId}/${chapterNum}` });
    };

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
    };

    return {
      ...toRefs(state),
      bookContent,
      bookDetail,
      router,
    };
  },
};
</script>

<style scoped>
.empty-chapter-tip {
  padding: 60px 40px;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 30px 0;
  border: 1px solid #e8e8e8;
}

.empty-chapter-tip .tip-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-chapter-tip .tip-text {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

.empty-chapter-tip .tip-desc {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
  font-weight: 500;
}

.empty-chapter-tip .tip-reasons {
  list-style: none;
  padding: 0;
  margin: 0 auto 30px;
  text-align: left;
  display: inline-block;
  max-width: 400px;
  background-color: #fff;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.empty-chapter-tip .tip-reasons li {
  font-size: 14px;
  color: #666;
  line-height: 28px;
  padding: 8px 0;
}

.empty-chapter-tip .tip-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.empty-chapter-tip .btn-back,
.empty-chapter-tip .btn-home {
  display: inline-block;
  padding: 12px 30px;
  background-color: #f70;
  color: #fff;
  border-radius: 6px;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
  cursor: pointer;
}

.empty-chapter-tip .btn-back:hover,
.empty-chapter-tip .btn-home:hover {
  background-color: #f50;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 119, 0, 0.3);
}

.empty-chapter-tip .btn-home {
  background-color: #999;
}

.empty-chapter-tip .btn-home:hover {
  background-color: #777;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>
