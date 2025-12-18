<template>
  <Header />
  <div class="main box_center cf mb50">
    <div class="channelWrap channelBookInfo cf">
      <div class="bookCover cf">
        <a class="book_cover">
          <img
            id="bookCover"
            class="cover"
            :src="getImageUrl(book.picUrl, imgBaseUrl)"
            :alt="book.bookName"
        /></a>
        <div class="book_info">
          <div class="tit">
            <h1>{{ book.bookName }}</h1>
            <!--<i class="vip_b">VIP</i>--><a class="author">{{
              book.authorName
            }}</a>
          </div>
          <ul class="list">
            <li>
              <span class="item"
                >类别：<em>{{ book.categoryName }}</em></span
              >
              <span class="item"
                >状态：<em>{{
                  book.bookStatus == 0 ? "连载中" : "已完结"
                }}</em></span
              >
              <span class="item"
                >总点击：<em id="cTotal">{{ book.visitCount }}</em></span
              >
              <span class="item"
                >总字数：<em>{{ book.wordCount }}</em></span
              >
            </li>
          </ul>
          <div class="intro_txt">
            <p style="white-space:break-spaces" v-html="book.bookDesc"></p>
            <a class="icon_hide" href="javascript:void(0)" onclick=""
              ><i></i>收起</a
            >
            <a class="icon_show" href="javascript:void(0)" onclick=""
              ><i></i>展开</a
            >
          </div>
          <div class="btns" id="optBtn">
            <a
              href="javascript:void(0)"
              @click="bookContent(book.id, book.firstChapterNum)"
              class="btn_ora"
              >点击阅读</a
            >
            <span id="cFavs"
              ><a
                href="javascript:void(0);"
                class="btn_ora_white btn_addsj"
                @click="addBookToShelf"
                >加入书架</a
              >
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="channelBookContent cf">
      <!--left start-->
      <div class="wrap_left fl">
        <div class="wrap_bg">
          <!--章节目录 start-->
          <div class="pad20_nobt">
            <div class="bookChapter">
              <div class="book_tit">
                <div class="fl">
                  <h3>最新章节</h3>
                  <span id="bookIndexCount"
                    >(第{{ chapterAbout.chapterTotal }}章)</span
                  >
                </div>
                <a
                  class="fr"
                  @click="chapterList(book.id || route.params.id)"
                  href="javascript:void(0)"
                  >全部目录</a
                >
              </div>
              <ul class="list cf">
                <li>
                  <span class="fl font16">
                    <a
                      @click="
                        bookContent(
                          chapterAbout.chapterInfo.bookId,
                          chapterAbout.chapterInfo.chapterNum
                        )
                      "
                      href="javascript:void(0)"
                      v-if="chapterAbout.chapterInfo"
                      >{{ chapterAbout.chapterInfo.chapterName }}</a
                    ></span
                  >
                  <span class="black9 fr" v-if="chapterAbout.chapterInfo"
                    >更新时间：{{
                      chapterAbout.chapterInfo.chapterUpdateTime
                    }}</span
                  >
                </li>
                <li class="zj_yl" id="lastBookContent">
                  <!--go-->
                  　　<span
                    v-html="`${chapterAbout.contentSummary}` + '...'"
                  ></span>
                </li>
                <!--此处是该章节预览，截取最前面的42个字-->
              </ul>
            </div>
          </div>
          <!--章节目录 end-->

          <!--作品评论区 start-->
          <div class="pad20">
            <div class="bookComment">
              <div class="book_tit">
                <div class="fl">
                  <h3>作品评论区</h3>
                  <span id="bookCommentTotal"
                    >({{ newestComments.commentTotal }}条)</span
                  >
                  <span class="ml20" style="font-size: 14px; cursor: pointer">
                    <el-checkbox
                      v-model="onlyMine"
                      @change="handleOnlyMineChange"
                      :disabled="!uid"
                    >
                      只看我的
                    </el-checkbox>
                  </span>
                </div>
              </div>
              <div class="reply_bar" id="reply_bar">
                <div class="tit">
                  <span class="fl font16">发表评论</span>

                  <span class="fr black9" style="display: none"
                    >请先 <a class="orange" href="/user/login.html">登录</a
                    ><em class="ml10 mr10">|</em
                    ><a class="orange" href="/user/register.html">注册</a></span
                  >
                </div>

                <textarea
                  v-model="commentContent"
                  name="txtComment"
                  rows="2"
                  cols="20"
                  id="txtComment"
                  class="replay_text"
                  placeholder="我来说两句..."
                ></textarea>
                <div class="reply_btn">
                  <span class="fl black9"
                    ><em class="ml5" id="emCommentNum">0/1000</em> 字</span
                  >
                  <span class="fr"
                    ><a
                      class="btn_ora"
                      :class="{ 'disabled': isSubmitting }"
                      :style="{ cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }"
                      href="javascript:void(0);"
                      @click="userComment"
                      >{{ isSubmitting ? '提交中...' : '发表' }}</a
                    ></span
                  >
                </div>
              </div>
              <div
                v-if="newestComments.commentTotal == 0"
                class="no_comment"
                id="noCommentPanel"
              >
                <img :src="no_comment" alt="" />
                <span class="block">暂无评论</span>
              </div>
              <div
                v-if="newestComments.commentTotal > 0"
                class="commentBar"
                id="commentPanel"
              >
                <div
                  class="comment_list cf"
                  v-for="(item, index) in newestComments.comments"
                  :key="index"
                >
                  <div class="user_heads fl" vals="389">
                    <img
                      :src="
                        item.commentUserPhoto
                          ? getImageUrl(item.commentUserPhoto, imgBaseUrl)
                          : man
                      "
                      class="user_head"
                      alt=""
                    /><span class="user_level1" style="display: none"
                      >见习</span
                    >
                  </div>
                  <ul class="pl_bar fr">
                    <li class="name">{{ item.commentUser }}</li>
                    <li class="dec" v-html="item.commentContent"></li>
                    <li class="other cf">
                      <span class="time fl">
                        发表于：{{ item.commentCreateTime }}，更新于：{{
                          item.commentUpdateTime
                        }}</span
                      ><span class="fr" v-if="item.commentUserId == uid"
                        ><a
                          href="javascript:void(0);"
                          @click="
                            updateUserComment(item.id, item.commentContent)
                          "
                          class="zan"
                          >修改</a
                        >
                        |
                        <a
                          href="javascript:void(0);"
                          @click="deleteUserComment(item.id)"
                          class="zan"
                          >删除</a
                        ></span
                      >
                    </li>
                  </ul>
                </div>
              </div>
              <div class="pageBox cf" v-if="newestComments.commentTotal > 0">
                <el-pagination
                  small
                  background
                  layout="prev, pager, next"
                  :total="Number(newestComments.commentTotal)"
                  :page-size="Number(pageSize)"
                  :current-page="Number(pageNum)"
                  @current-change="handleCurrentChange"
                />
              </div>
              <el-dialog
                v-model="dialogUpdateCommentFormVisible"
                title="评论修改"
              >
                <el-form>
                  <el-form-item label="评论内容">
                    <el-input type="textarea" v-model="updateComment" />
                  </el-form-item>
                </el-form>
                <template #footer>
                  <span class="dialog-footer">
                    <el-button @click="dialogUpdateCommentFormVisible = false"
                      >取消</el-button
                    >
                    <el-button type="primary" @click="goUpdateComment()"
                      >确定</el-button
                    >
                  </span>
                </template>
              </el-dialog>

              <!--无评论时此处隐藏-->
              <div class="more_bar" id="moreCommentPanel" style="display: none">
                <a href="/book/comment-1431636283466297344.html"
                  >查看全部评论&gt;</a
                >
              </div>
            </div>
          </div>
          <!--作品评论区 end-->
        </div>
      </div>
      <!--left end-->

      <!--right start-->
      <div class="wrap_right fr">
        <!--作者专栏s-->
        <div class="wrap_inner author_info mb20">
          <div class="author_head cf">
            <a href="javascript:void(0);" class="head"
              ><img :src="author_head" alt="作者头像" id="authorLogoImg"
            /></a>
            <div class="msg">
              <span class="icon_qyzz">签约作家</span>
              <h4>
                <a href="javascript:searchByK('冷漠的天蝎')">{{
                  book.authorName
                }}</a>
              </h4>
            </div>
          </div>
          <div class="author_intro cf">
            <h4>作者有话说</h4>
            <div class="intro_txt" id="authorNote">
              亲亲们，你们的支持是我最大的动力！求点击、求推荐、求书评哦！
            </div>
          </div>
        </div>

        <div id="RelateBookOther" class="wrap_inner wrap_right_cont mb20">
          <div class="title cf">
            <h3 class="on">同类推荐</h3>
          </div>
          <div class="tj_bar">
            <ul id="recBookList">
              <li v-for="(item, index) in books" :key="index">
                <div class="book_intro">
                  <div class="cover">
                    <a href="javascript:void(0)" @click="bookDetail(item.id)"
                      ><img
                        :id="'bookCover' + `${index}`"
                        :src="getImageUrl(item.picUrl, imgBaseUrl)"
                        :alt="item.bookName"
                    /></a>
                  </div>
                  <div class="dec">
                    <a href="javascript:void(0)" @click="bookDetail(item.id)">{{
                      item.bookName
                    }}</a>
                    <a
                      class="txt"
                      href="javascript:void(0)"
                      @click="bookDetail(item.id)"
                      v-html="item.bookDesc"
                    ></a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!--right end-->
    </div>
  </div>

  <Footer />
</template>

<script>
import "@/assets/styles/book.css";
import man from "@/assets/images/man.png";
import { reactive, toRefs, onMounted, onUpdated } from "vue";
import { ElMessage } from "element-plus";
import { useRouter, useRoute } from "vue-router";
import {
  getBookById,
  addVisitCount,
  getLastChapterAbout,
  listRecBooks,
  listCommentByPage,
} from "@/api/book";
import { comment, deleteComment, updateComment, addToBookshelf } from "@/api/user";
import { getUid } from "@/utils/auth";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import author_head from "@/assets/images/author_head.png";
import no_comment from "@/assets/images/no_comment.png";
import { goToAnchor, getImageUrl } from "@/utils";
export default {
  name: "book",
  components: {
    Header,
    Footer,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      uid: getUid(),
      book: {},
      books: [],
      chapterAbout: {},
      commentContent: "",
      newestComments: {
        commentTotal: 0,
        comments: []
      },
      pageNum: 1,
      pageSize: 10,
      onlyMine: false,
      isSubmitting: false, // 新增：提交状态
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
      dialogUpdateCommentFormVisible: false,
      commentId: "",
      updateComment: "",
    });
    onMounted(() => {
      const bookId = route.params.id;
      loadBook(bookId);
      loadRecBooks(bookId);
      loadLastChapterAbout(bookId);
      loadComments(bookId);
    });

    onUpdated(() => {
      console.log("onUpdated==========================");
      for (let i = 0; i < state.books.length; i++) {
        document
          .getElementById("bookCover" + i)
          .setAttribute("onerror", "this.src='default.gif';this.onerror=null");
      }
    });

    const loadBook = async (bookId) => {
      const { data } = await getBookById(bookId);
      state.book = data;
      document
        .getElementById("bookCover")
        .setAttribute("onerror", "this.src='default.gif';this.onerror=null");
      addBookVisit(bookId);
    };

    const loadRecBooks = async (bookId) => {
      const { data } = await listRecBooks({ bookId: bookId });
      state.books = data;
    };

    const loadLastChapterAbout = async (bookId) => {
      const { data } = await getLastChapterAbout({ bookId: bookId });
      state.chapterAbout = data;
    };

    const bookContent = (bookId, chapterId) => {
      router.push({ path: `/book/${bookId}/${chapterId}` });
    };

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
      loadBook(bookId);
      loadRecBooks(bookId);
      loadLastChapterAbout(bookId);
      loadComments(bookId);
    };

    const chapterList = (bookId) => {
      // 优先使用路由中的 bookId（更可靠）
      const routeBookId = route.params.id;
      let finalBookId = bookId;
      
      // 如果传入的 bookId 无效，使用路由中的 bookId
      if (!finalBookId || finalBookId === null || finalBookId === undefined) {
        finalBookId = routeBookId;
      }
      
      // 验证最终 bookId 是否有效
      if (!finalBookId || finalBookId === 'null' || finalBookId === 'undefined') {
        ElMessage.warning('无法获取书籍ID，请刷新页面重试');
        return;
      }
      
      // 验证是否为有效数字
      const numBookId = Number(finalBookId);
      if (isNaN(numBookId) || numBookId <= 0) {
        ElMessage.warning('书籍ID格式错误，无法跳转到目录');
        return;
      }
      
      router.push({ path: `/chapter_list/${finalBookId}` });
    };

    const addBookVisit = async (bookId) => {
      addVisitCount({ bookId: bookId });
    };

    const loadComments = async (bookId) => {
      const { data } = await listCommentByPage({ 
          bookId: bookId, 
          pageNum: state.pageNum, 
          pageSize: state.pageSize,
          userId: state.onlyMine ? state.uid : null
      });
      state.newestComments = {
          commentTotal: data.total,
          comments: data.list
      };
    };

    const handleOnlyMineChange = () => {
        if (!state.uid) {
            ElMessage.warning("请先登录！");
            state.onlyMine = false;
            return;
        }
        state.pageNum = 1;
        loadComments(state.book.id);
    };

    const handleCurrentChange = (pageNum) => {
        state.pageNum = pageNum;
        loadComments(state.book.id);
    };

    const userComment = async () => {
      // 如果正在提交，直接返回
      if (state.isSubmitting) {
        return;
      }

      if (!state.commentContent) {
        ElMessage.error("用户评论不能为空！");
        return;
      }
      if (state.commentContent.length < 10) {
        ElMessage.error("评论不能少于 10 个字符！");
        return;
      }
      if (state.commentContent.length > 512) {
        ElMessage.error("评论不能多于 512 个字符！");
        return;
      }

      // 设置提交状态，禁用按钮
      state.isSubmitting = true;
      
      try {
        await comment({
          bookId: state.book.id,
          commentContent: state.commentContent,
        });
        ElMessage.success("评论发表成功！");
        state.commentContent = "";
        state.pageNum = 1;
        loadComments(state.book.id);
      } catch (error) {
        // 错误处理已在 request 拦截器中处理，这里只做状态恢复
        console.error("发表评论失败:", error);
      } finally {
        // 1.5 秒后恢复按钮状态（给用户流畅的反馈，不会感觉卡顿）
        setTimeout(() => {
          state.isSubmitting = false;
        }, 1500);
      }
    };

    const addBookToShelf = async () => {
      if (!state.uid) {
        router.push({ name: "login" });
        return;
      }
      if (!state.book.id) {
         return;
      }
      await addToBookshelf(state.book.id);
      ElMessage.success("加入书架成功！");
    };

    const updateUserComment = async (id, comment) => {
      state.dialogUpdateCommentFormVisible = true;
      state.updateComment = comment;
      state.commentId = id;
    };

    const deleteUserComment = async (id) => {
      await deleteComment(id);
      loadComments(state.book.id);
    };

    const goUpdateComment = async (id) => {
      state.dialogUpdateCommentFormVisible = false;
      await updateComment(state.commentId, { content: state.updateComment });
      loadComments(state.book.id);
    };

    return {
      ...toRefs(state),
      author_head,
      no_comment,
      bookContent,
      bookDetail,
      chapterList,
      goToAnchor,
      userComment,
      deleteUserComment,
      man,
      addBookToShelf,
      updateUserComment,
      goUpdateComment,
      getImageUrl,
      handleCurrentChange,
      handleOnlyMineChange,
    };
  },
  mounted() {
    $(".icon_show").click(function () {
      $(this).hide();
      $(".icon_hide").show();
      $(".intro_txt").innerHeight("auto");
    });
    $(".icon_hide").click(function () {
      $(this).hide();
      $(".icon_show").show();
      $(".intro_txt").innerHeight("");
    });

    $("#AuthorOtherNovel li").unbind("mouseover");

    $("#txtComment").on("input propertychange", function () {
      var count = $(this).val().length;
      $("#emCommentNum").html(count + "/1000");
      if (count > 1000) {
        $("#txtComment").val($("#txtComment").val().substring(0, 1000));
      }
    });
  },
};
</script>

<style scoped>
.el-button:not(.is-text) {
  border: #f80;
  border-color: #f80;
}
.el-button--primary {
  --el-button-hover-bg-color: #f80;
}

.el-button--primary {
  --el-button-bg-color: #f70;
}

.el-button {
  --el-button-hover-text-color: #fafafa;
}

.el-button {
  --el-button-hover-bg-color: #ff880061;
}

:deep(.el-pagination) {
  justify-content: center;
}
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #f80 !important;
}
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #f80 !important;
}
</style>
