<template>
  <div class="header" v-if="!isFullscreen">
    <Top />
  </div>

  <!-- 顶部菜单 -->
  <transition name="slide-down">
    <div class="top-menu" v-show="showMenu" @click.stop>
      <div class="menu-content">
        <div class="menu-left">
          <span class="book-name" v-if="data.bookInfo">{{ data.bookInfo.bookName }}</span>
          <span class="chapter-name" v-if="data.chapterInfo">{{ data.chapterInfo.chapterName }}</span>
        </div>
        <div class="menu-right">
          <a @click="addToBookshelfBtn" href="javascript:void(0)" class="menu-btn">
            <el-icon><CollectionTag /></el-icon> 加入书架
          </a>
          <a @click="bookDetail(data.chapterInfo?.bookId)" href="javascript:void(0)" class="menu-btn">
            <el-icon><Document /></el-icon> 书籍详情
          </a>
          <a @click="openChapterList(data.chapterInfo?.bookId)" href="javascript:void(0)" class="menu-btn">
            <el-icon><Menu /></el-icon> 目录
          </a>
          <a @click="showSetup" href="javascript:void(0)" class="menu-btn">
            <el-icon><Setting /></el-icon> 设置
          </a>
          <a @click="toggleFullscreen" href="javascript:void(0)" class="menu-btn">
            <el-icon><FullScreen /></el-icon> {{ isFullscreen ? '退出全屏' : '全屏阅读' }}
          </a>
        </div>
      </div>
    </div>
  </transition>

  <div id="showDetail" @click="handleGlobalClick" :class="[readTheme, { 'fullscreen-mode': isFullscreen }]" :tabindex="isFullscreen ? 0 : -1">
    <div class="readBody cf">
      <div class="readMain cf">
        <div class="read_menu" style="display: none;">
          <div
            class="menu_left"
            style="background-color: rgba(255, 255, 255, 0.45)"
          >
            <ul>
              <li>
                <a
                  class="ico_catalog"
                  @click="chapterList(data.chapterInfo.bookId)"
                  href="javascript:void(0)"
                  title="目录"
                >
                  <b>目录</b></a
                >
              </li>

              <li>
                <a
                  class="ico_page"
                  @click="bookDetail(data.chapterInfo.bookId)"
                  href="javascript:void(0)"
                  title="返回书页"
                  ><b>书页</b></a
                >
              </li>
              <!--
              <li class="li_shelf" id="cFavs">
                <a
                  class="ico_shelf"
                  href="javascript:void(0);"
                  title="加入书架"
                  onclick="javascript:BookDetail.AddFavorites(37,1959973,1);"
                  ><b>加书架</b></a
                >
              </li>
              <li class="li_shelfed" style="display: none">
                <a class="ico_shelfed" href="javascript:void(0);" title="已收藏"
                  ><b>已收藏</b></a
                >
              </li>

              <li>
                <a
                  class="ico_comment"
                  href="/book/comment-1334332598936240128.html"
                  title="评论"
                >
                  <b>评论</b></a
                >
              </li>
              <li>
                <a class="ico_setup" href="javascript:void(0);" title="设置"
                  ><b>设置</b></a
                >
              </li>
              -->
            </ul>
          </div>
          <div class="menu_right" style="position: fixed; bottom: 0">
            <ul>
              <li>
                <a
                  class="ico_pagePrev"
                  href="javascript:enterPreIndexPage('1334332598936240128','0');"
                  title="上一章"
                  ><i>上一章</i></a
                >
              </li>
              <li>
                <a
                  class="ico_pageNext"
                  href="javascript:enterNextIndexPage('1334332598936240128','1334332601092112384');"
                  title="下一章"
                  ><i>下一章</i></a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="readWrap">
          <div class="bookNav"></div>
          <transition :name="transitionName" mode="out-in">
          <div id="readcontent" :key="data.chapterInfo?.id || 'loading'">
            <div
              class="textbox cf"
              style="background-color: rgba(255, 255, 255, 0.45)"
            >
              <div class="book_title">
                <h1 v-if="data.chapterInfo">
                  {{ data.chapterInfo.chapterName }}
                </h1>
                <div class="textinfo" v-if="data.chapterInfo">
                  类别：{{ data.bookInfo.categoryName }} 作者：<a
                    href="javascript:searchByK('最终马甲')"
                    v-if="data.bookInfo"
                    >{{ data.bookInfo.authorName }}</a
                  ><span v-if="data.chapterInfo"
                    >字数：{{ data.chapterInfo.chapterWordCount }}</span
                  ><span v-if="data.chapterInfo"
                    >更新时间：{{ data.chapterInfo.chapterUpdateTime }}</span
                  >
                </div>
              </div>

              <div class="txtwrap">
                <div
                  v-if="data.bookContent"
                  id="showReading"
                  class="readBox"
                  :style="{ fontSize: readFontSize + 'px', fontFamily: actualFontFamily }"
                  v-html="renderedContent"
                ></div>
                <div v-else class="empty-content-tip">
                  <p class="tip-text">该章节暂无内容</p>
                  <p class="tip-desc">可能的原因：</p>
                  <ul class="tip-reasons">
                    <li>• 章节仍在审核中，请稍后再试</li>
                    <li>• 章节审核未通过，已下架</li>
                    <li>• 章节内容已被删除</li>
                  </ul>
                  <div class="tip-actions">
                    <a @click="chapterList(data.chapterInfo?.bookId)" href="javascript:void(0)" class="btn-back">返回目录</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </transition>
          <div class="nextPageBox">
            <a
              style="background-color: rgba(255, 255, 255, 0.45)"
              class="prev"
              href="javascript:void(0)"
              @click="preChapter(data.chapterInfo.bookId)"
              >上一章</a
            >
            <a
              style="background-color: rgba(255, 255, 255, 0.45)"
              class="dir"
              @click="chapterList(data.chapterInfo.bookId)"
              href="javascript:void(0)"
              >目录</a
            >
            <a
              style="background-color: rgba(255, 255, 255, 0.45)"
              class="next"
              @click="nextChapter(data.chapterInfo.bookId)"
              href="javascript:void(0)"
              >下一章</a
            >
          </div>
        </div>
      </div>
    </div>
    <div class="readPopup qrBox" style="display: none">
      <a
        class="closePopup"
        href="javascript:void(0);"
        onclick="javascript:$('.maskBox,.qrBox').hide();"
      ></a>
      <div class="popupTit">
        <h3>手机阅读</h3>
      </div>
      <div class="qrList">
        <ul></ul>
      </div>
    </div>
    <div class="readPopup setupBox" style="display: none">
      <a
        class="closePopup"
        href="javascript:void(0);"
        @click="closeSetup"
      ></a>
      <div class="popupTit">
        <h3>设置</h3>
      </div>
      <div class="setupList">
        <ul>
          <li class="readTheme">
            <em class="tit">阅读主题：</em>
            <a
              class="white"
              :class="{ current: readTheme === 'read_style_1' }"
              href="javascript:void(0);"
              title="白色"
              @click="setTheme(1)"
            ></a><a
              class="green"
              :class="{ current: readTheme === 'read_style_2' }"
              href="javascript:void(0);"
              title="绿色"
              @click="setTheme(2)"
            ></a><a
              class="pink"
              :class="{ current: readTheme === 'read_style_3' }"
              href="javascript:void(0);"
              title="粉色"
              @click="setTheme(3)"
            ></a><a
              class="yellow"
              :class="{ current: readTheme === 'read_style_4' }"
              href="javascript:void(0);"
              title="黄色"
              @click="setTheme(4)"
            ></a><a
              class="gray"
              :class="{ current: readTheme === 'read_style_5' }"
              href="javascript:void(0);"
              title="灰色"
              @click="setTheme(5)"
            ></a><a
              class="night"
              :class="{ current: readTheme === 'read_style_6' }"
              href="javascript:void(0);"
              title="夜间"
              @click="setTheme(6)"
            ></a>
          </li>
          <li class="setFont setBtn">
            <em class="tit">正文字体：</em>
            <a
              class="setYahei"
              :class="{ current: readFontFamily === 'YaHei' }"
              href="javascript:void(0);"
              @click="setFontFamily(0)"
              >雅黑</a
            >
            <a
              class="setSimsun"
              :class="{ current: readFontFamily === 'SimHei' }"
              href="javascript:void(0);"
              @click="setFontFamily(1)"
              >黑体</a
            >
            <a
              class="setSong"
              :class="{ current: readFontFamily === 'SimSun' }"
              href="javascript:void(0);"
              @click="setFontFamily(2)"
              >宋体</a
            >
            <a
              class="setKs"
              :class="{ current: readFontFamily === 'KaiTi' }"
              href="javascript:void(0);"
              @click="setFontFamily(3)"
              >楷体</a
            >
            <a
              class="setYahei"
              :class="{ current: readFontFamily === 'PingFang' }"
              href="javascript:void(0);"
              @click="setFontFamily(4)"
              >苹方</a
            >
          </li>
          <li class="font-tip">
            <em class="font-tip-text">提示：部分字体可能因系统而异，如显示异常可尝试其他字体</em>
          </li>
          <li class="fontSize setBtn">
            <em class="tit">字体大小：</em>
            <a
              class="small"
              href="javascript:void(0);"
              @click="setFontSize(-2)"
              >A-</a
            ><span class="current_font">{{ readFontSize }}</span
            ><a
              class="big"
              href="javascript:void(0);"
              @click="setFontSize(2)"
              >A+</a
            >
          </li>
        </ul>
      </div>
    </div>

    <!-- 章节列表弹窗（全屏模式下） -->
    <transition name="fade">
      <div class="chapter-list-mask" v-show="showChapterList" @click="closeChapterList"></div>
    </transition>
    <transition name="slide-fade">
      <div class="chapter-list-popup" v-show="showChapterList" @click.stop>
        <div class="chapter-list-header">
          <h3>目录</h3>
          <a class="close-chapter-list" href="javascript:void(0);" @click="closeChapterList">×</a>
        </div>
        <div class="chapter-list-content">
          <div v-if="loadingChapters" class="chapter-list-loading">
            <p>加载中...</p>
          </div>
          <div v-else-if="chapterListData.length === 0" class="chapter-list-empty">
            <p>暂无章节</p>
          </div>
          <ul v-else class="chapter-list-items">
            <li 
              v-for="(item, index) in chapterListData" 
              :key="index"
              :class="{ 'current-chapter': item.chapterNum == data.chapterInfo?.chapterNum }"
            >
              <a 
                @click="selectChapter(data.chapterInfo?.bookId, item.chapterNum)" 
                href="javascript:void(0)"
              >
                <span class="chapter-name">{{ item.chapterName }}</span>
                <i class="vip-tag" v-if="item.isVip == 1">[收费]</i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import "@/assets/styles/book.css";
import "@/assets/styles/read.css";
import { reactive, toRefs, onMounted, onBeforeUnmount, onUnmounted, computed, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getBookContent, getPreChapterId, getNextChapterId, listChapters } from "@/api/book";
import { getUid } from "@/utils/auth";
import { updateBookshelfProcess, addToBookshelf } from "@/api/user";
import { ElMessage } from "element-plus";
import Top from "@/components/common/Top";
import Footer from "@/components/common/Footer";
import { renderMarkdown } from "@/utils/markdown";
import { CollectionTag, Document, Menu, Setting, FullScreen } from '@element-plus/icons-vue';
export default {
  name: "bookContent",
  components: {
    Top,
    Footer,
    CollectionTag,
    Document,
    Menu,
    Setting,
    FullScreen
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      data: {},
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
      showMenu: false,
      transitionName: 'slide-left',
      isFullscreen: false,
      readTheme: localStorage.getItem('readTheme') || 'read_style_1',
      readFontSize: parseInt(localStorage.getItem('readFontSize') || '16'),
      // 存储字体标识符: 'YaHei', 'SimHei', 'SimSun', 'KaiTi', 'PingFang'
      // 兼容旧数据：如果是旧字体名，映射到新字体；如果是新字体名，保留；否则默认
      readFontFamily: (() => {
        const saved = localStorage.getItem('readFontFamily');
        const validFonts = ['YaHei', 'SimHei', 'SimSun', 'KaiTi', 'PingFang'];
        if (validFonts.includes(saved)) return saved;
        // 兼容旧数据：旧字体名映射到新字体
        if (saved === 'XingShu') return 'KaiTi';
        if (saved === 'LiSu') return 'SimSun';
        return 'YaHei';
      })(),
      // 章节列表相关
      showChapterList: false,
      chapterListData: [],
      loadingChapters: false,
      cachedBookId: null // 缓存章节列表对应的bookId
    });

    const actualFontFamily = computed(() => {
        const map = {
            'YaHei': '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
            'SimHei': '"SimHei", "STHeiti", "PingFang SC", "Microsoft YaHei", sans-serif',
            'SimSun': '"SimSun", "STSong", "Songti SC", serif',
            'KaiTi': '"KaiTi", "STKaiti", "Kaiti SC", serif',
            'PingFang': '"PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif'
        };
        return map[state.readFontFamily] || map['YaHei'];
    });

    // 设置主题
    const setTheme = (index) => {
        state.readTheme = `read_style_${index}`;
        localStorage.setItem('readTheme', state.readTheme);
    };

    // 设置字体大小
    const setFontSize = (step) => {
        let newSize = state.readFontSize + step;
        if (newSize < 12) newSize = 12;
        if (newSize > 40) newSize = 40;
        state.readFontSize = newSize;
        localStorage.setItem('readFontSize', newSize);
    };

    // 设置字体
    const setFontFamily = (index) => {
        const fonts = ['YaHei', 'SimHei', 'SimSun', 'KaiTi', 'PingFang'];
        state.readFontFamily = fonts[index] || 'YaHei';
        localStorage.setItem('readFontFamily', state.readFontFamily);
    };

    const showSetup = (e) => {
        // 阻止冒泡，避免触发点击背景关闭菜单
        if(e) e.stopPropagation();
        const popup = document.querySelector('.setupBox');
        const mask = document.querySelector('.maskBox');
        if (popup) popup.style.display = 'block';
        if (mask) mask.style.display = 'block';
        state.showMenu = false;
    };

    const closeSetup = () => {
        const popup = document.querySelector('.setupBox');
        const mask = document.querySelector('.maskBox');
        if (popup) popup.style.display = 'none';
        if (mask) mask.style.display = 'none';
    };

    const addToBookshelfBtn = async () => {
        if (!getUid()) {
            ElMessage.warning("请先登录");
            router.push({ path: "/login" });
            return;
        }
        if (!state.data.chapterInfo?.bookId) return;
        
        try {
            await addToBookshelf(state.data.chapterInfo.bookId);
            ElMessage.success("加入书架成功");
            state.showMenu = false;
        } catch (error) {
            console.error(error);
            // 错误处理通常在 request.js 里有统一处理，这里也可以捕获
        }
    };

    const handleGlobalClick = (e) => {
        // 如果菜单已打开，点击任意处（除了菜单本身，菜单本身有 @click.stop）关闭菜单
        if (state.showMenu) {
            state.showMenu = false;
            return;
        }

        // 检查是否选中了文字
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }

        // 检查是否点击了特定交互元素 (a, button, input 等)
        let target = e.target;
        while (target && target !== document.body) {
            if (['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                target.classList.contains('setupBox') || 
                target.classList.contains('qrBox') ||
                target.onclick != null) { // 简单检查是否有点击事件
                return;
            }
            target = target.parentNode;
        }

        // 计算点击位置
        const width = window.innerWidth;
        const x = e.clientX;
        const percentage = x / width;

        if (percentage < 0.3) {
            // 上一章
            preChapter(state.data.chapterInfo?.bookId);
        } else if (percentage > 0.7) {
            // 下一章
            nextChapter(state.data.chapterInfo?.bookId);
        } else {
            // 中间菜单
            state.showMenu = true;
        }
    };

    // 计算属性：将 Markdown 内容渲染为 HTML
    const renderedContent = computed(() => {
      if (!state.data.bookContent) {
        return '';
      }
      return renderMarkdown(state.data.bookContent);
    });
    // 初始化数据的统一方法
    const initData = (bookId, chapterNum) => {
      // 验证参数
      if (!bookId || bookId === 'null' || bookId === 'undefined') {
        ElMessage.error('书籍ID无效');
        router.push({ path: '/home' });
        return;
      }
      
      if (!chapterNum || chapterNum === 'null' || chapterNum === 'undefined') {
        ElMessage.warning('章节号无效，正在返回目录');
        router.push({ path: `/chapter_list/${bookId}` });
        return;
      }
      
      init(bookId, chapterNum);
    };

    onMounted(() => {
      // 从路由参数获取 bookId 和 chapterNum
      const bookId = route.params.id; // 路由中的 :id 对应 bookId
      const chapterNum = route.params.chapterNum; // 路由中的 :chapterNum 对应 chapterNum
      
      // 检查是否需要恢复全屏状态
      const shouldFullscreen = localStorage.getItem('readingFullscreen') === 'true';
      if (shouldFullscreen) {
        state.isFullscreen = true;
        document.body.classList.add('reading-fullscreen');
        // 延迟一下确保DOM已渲染
        setTimeout(() => {
          const showDetailEl = document.getElementById('showDetail');
          if (showDetailEl) {
            showDetailEl.focus();
          }
        }, 100);
      }
      
      initData(bookId, chapterNum);
      keyDown();
    });

    // 监听路由参数变化，当 bookId 或 chapterNum 改变时重新加载数据
    watch(
      () => [route.params.id, route.params.chapterNum],
      ([newBookId, newChapterNum], [oldBookId, oldChapterNum]) => {
        if (newBookId && newChapterNum && 
            (newBookId !== oldBookId || newChapterNum !== oldChapterNum)) {
          // 如果书籍ID变化，清除章节列表缓存
          if (newBookId !== oldBookId) {
            state.chapterListData = [];
            state.cachedBookId = null;
          }
          // 检查是否需要恢复全屏状态
          const shouldFullscreen = localStorage.getItem('readingFullscreen') === 'true';
          if (shouldFullscreen && !state.isFullscreen) {
            state.isFullscreen = true;
            document.body.classList.add('reading-fullscreen');
            setTimeout(() => {
              const showDetailEl = document.getElementById('showDetail');
              if (showDetailEl) {
                showDetailEl.focus();
              }
            }, 100);
          }
          initData(newBookId, newChapterNum);
        }
      }
    );

    onBeforeUnmount(async () => {
      console.log("onBeforeUnmount............");
      // 清理全屏样式
      document.body.classList.remove('reading-fullscreen');
      // 清理键盘监听
      document.onkeydown = null;
    });

    const bookDetail = (bookId) => {
      router.push({ path: `/book/${bookId}` });
    };

    // 打开章节列表（全屏模式下显示弹窗，非全屏模式下跳转页面）
    const openChapterList = async (bookId) => {
      if (!bookId) {
        ElMessage.warning('无法获取书籍ID');
        return;
      }

      // 如果不在全屏模式，跳转到目录页面
      if (!state.isFullscreen) {
        router.push({ path: `/chapter_list/${bookId}` });
        return;
      }

      // 全屏模式下显示弹窗
      state.showMenu = false; // 关闭顶部菜单
      
      // 如果已经缓存了该书籍的章节列表，直接显示
      if (state.cachedBookId === bookId && state.chapterListData.length > 0) {
        state.showChapterList = true;
        return;
      }

      // 首次加载或书籍ID变化，调用API加载章节列表
      state.loadingChapters = true;
      state.showChapterList = true;
      
      try {
        const { data } = await listChapters({ bookId: bookId });
        state.chapterListData = Array.isArray(data) ? data : [];
        state.cachedBookId = bookId;
      } catch (error) {
        console.error('加载章节列表失败:', error);
        ElMessage.error('加载章节列表失败');
        state.chapterListData = [];
      } finally {
        state.loadingChapters = false;
      }
    };

    // 兼容旧函数名
    const chapterList = (bookId) => {
      openChapterList(bookId);
    };

    // 选择章节并跳转（保持全屏状态）
    const selectChapter = (bookId, chapterNum) => {
      if (!bookId || !chapterNum) {
        ElMessage.warning('参数无效');
        return;
      }

      // 关闭章节列表弹窗
      state.showChapterList = false;
      
      // 保存全屏状态到localStorage
      if (state.isFullscreen) {
        localStorage.setItem('readingFullscreen', 'true');
      }

      // 跳转到新章节
      router.push({ path: `/book/${bookId}/${chapterNum}` });
    };

    // 关闭章节列表弹窗
    const closeChapterList = () => {
      state.showChapterList = false;
    };


    const preChapter = async (bookId) => {
      // 设置动画方向：上一章是从左边进来，所以内容向右滑动
      state.transitionName = 'slide-right';
      
      // 从 state.data.chapterInfo 中获取 chapterNum
      const chapterNum = state.data.chapterInfo?.chapterNum;

      if (!chapterNum) {
        ElMessage.warning("无法获取章节号，可能该书籍暂无可用章节");
        return;
      }

      if (!bookId) {
        ElMessage.warning("无法获取书籍ID");
        return;
      }

      try {
        const { data } = await getPreChapterId(bookId, chapterNum);

        if (data) {
          router.push({ path: `/book/${bookId}/${data}` });
          init(bookId, data);
        } else {
          // 非全屏模式下显示提示
          if (!state.isFullscreen) {
            ElMessage.warning("已经是第一章了！");
          }
        }
      } catch (error) {
        console.error('获取上一章失败:', error);
        // 非全屏模式下显示提示
        if (!state.isFullscreen) {
          ElMessage.warning("无法获取上一章，可能该书籍暂无可用章节");
        }
      }
    };



    const nextChapter = async (bookId) => {
      // 设置动画方向：下一章是从右边进来，所以内容向左滑动
      state.transitionName = 'slide-left';

      // 从 state.data.chapterInfo 中获取 chapterNum
      const chapterNum = state.data.chapterInfo?.chapterNum;

      if (!chapterNum) {
        ElMessage.warning("无法获取章节号，可能该书籍暂无可用章节");
        return;
      }

      if (!bookId) {
        ElMessage.warning("无法获取书籍ID");
        return;
      }

      try {
        const { data } = await getNextChapterId(bookId, chapterNum);

        if (data) {
          router.push({ path: `/book/${bookId}/${data}` });
          init(bookId, data);
        } else {
          // 非全屏模式下显示提示
          if (!state.isFullscreen) {
            ElMessage.warning("已经是最后一章了！");
          }
        }
      } catch (error) {
        console.error('获取下一章失败:', error);
        // 非全屏模式下显示提示
        if (!state.isFullscreen) {
          ElMessage.warning("无法获取下一章，可能该书籍暂无可用章节");
        }
      }
    };





    const init = async (bookId, chapterNum) => {
      try {
        // 验证参数
        if (!bookId || bookId === 'null' || bookId === 'undefined' || isNaN(Number(bookId))) {
          ElMessage.error('书籍ID无效');
          router.push({ path: '/home' });
          return;
        }
        if (!chapterNum || chapterNum === 'null' || chapterNum === 'undefined' || isNaN(Number(chapterNum))) {
          ElMessage.warning('章节号无效，正在返回目录');
          router.push({ path: `/chapter_list/${bookId}` });
          return;
        }
        
        const { data } = await getBookContent(bookId, chapterNum);
        state.data = data;
        
        // 如果章节内容为空，显示提示
        if (!data || !data.bookContent) {
          ElMessage.warning('该章节暂无内容，可能正在审核中或已下架');
        }
        
        // 如果已登录，更新阅读进度
        if (getUid() && data && data.chapterInfo) {
          updateBookshelfProcess(bookId, chapterNum);
        }
        
        // 等待DOM更新和transition动画开始后滚动到顶部
        await nextTick();
        // 稍微延迟以确保transition动画已经开始
        setTimeout(() => {
          // 如果是全屏模式，滚动全屏容器；否则滚动window
          if (state.isFullscreen) {
            const showDetailEl = document.getElementById('showDetail');
            if (showDetailEl) {
              showDetailEl.scrollTop = 0;
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      } catch (error) {
        console.error('加载章节内容失败:', error);
        ElMessage.error('加载章节内容失败');
        // 如果加载失败，尝试返回目录
        if (bookId) {
          router.push({ path: `/chapter_list/${bookId}` });
        }
      }
    };

    // 全屏切换
    const toggleFullscreen = () => {
      state.isFullscreen = !state.isFullscreen;
      if (state.isFullscreen) {
        // 进入全屏时关闭菜单和章节列表
        state.showMenu = false;
        state.showChapterList = false;
        // 保存全屏状态
        localStorage.setItem('readingFullscreen', 'true');
        // 添加全屏样式到body
        document.body.classList.add('reading-fullscreen');
        // 滚动到顶部
        window.scrollTo(0, 0);
        // 确保全屏容器可以获得焦点（用于键盘事件）
        setTimeout(() => {
          const showDetailEl = document.getElementById('showDetail');
          if (showDetailEl) {
            showDetailEl.focus();
          }
        }, 100);
      } else {
        // 退出全屏时移除样式和状态
        document.body.classList.remove('reading-fullscreen');
        localStorage.removeItem('readingFullscreen');
      }
    };

    // 监听键盘
    const keyDown = () => {
      document.onkeydown = (e) => {
        //事件对象兼容
        let e1 =
          e || event || window.event || arguments.callee.caller.arguments[0];
        
        // ESC键退出全屏 (keyCode: 27)
        if (e1 && e1.keyCode == 27 && state.isFullscreen) {
          toggleFullscreen();
          e.preventDefault();
          return;
        }
        
        //键盘按键判断:左箭头-37;上箭头-38；右箭头-39;下箭头-40
        // 增加空值判断
        if (!state.data || !state.data.chapterInfo) {
          // 如果没有章节数据，允许上下箭头键的默认滚动行为
          return;
        }
        
        const bookId = state.data.chapterInfo.bookId;
        //左箭头 - 上一章
        if (e1 && e1.keyCode == 37) {
          preChapter(bookId);
          e.preventDefault();
        } 
        //右箭头 - 下一章
        else if (e1 && e1.keyCode == 39) {
          nextChapter(bookId);
          e.preventDefault();
        }
        // C键 - 打开章节列表（全屏模式下）
        else if (e1 && e1.keyCode == 67 && state.isFullscreen) {
          if (bookId) {
            openChapterList(bookId);
            e.preventDefault();
          }
        }
        // 上下箭头键允许默认滚动行为，不阻止
      };
    };

    return {
      ...toRefs(state),
      renderedContent,
      bookDetail,
      chapterList,
      openChapterList,
      selectChapter,
      closeChapterList,
      preChapter,
      nextChapter,
      showSetup,
      addToBookshelfBtn,
      handleGlobalClick,
      setTheme,
      setFontSize,
      setFontFamily,
      closeSetup,
      actualFontFamily,
      toggleFullscreen
    };
  },
  mounted() {},
};
</script>

<style scoped>
@charset "utf-8";

/* 顶部菜单样式 */
.top-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10002;
  padding: 15px 0;
  transition: all 0.3s ease;
}

.menu-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.menu-left {
  display: flex;
  flex-direction: column;
}

.menu-left .book-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.menu-left .chapter-name {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.menu-right {
  display: flex;
  gap: 20px;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.menu-btn:hover {
  background-color: #f5f5f5;
  color: #f70;
}

/* 顶部菜单动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* 章节切换动画 */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-out;
}

/* 下一章：当前页向左消失，新页从右出现 */
.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

/* 上一章：当前页向右消失，新页从左出现 */
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

a {
  color: #333;
}
a:hover,
.redFont,
.current,
.bookNav a:hover,
.textinfo a:hover {
  color: #f70;
}
/* 阅读页背景 */
body {
  /*background-color: #4a4a4a;*/
  color: #333;
  font-family: "Microsoft YaHei";
}
.topMain {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#66ffffff,endColorstr=#66ffffff);
  background: none;
  background: rgba(255, 255, 255, 0.4);
}
.read_style_6 .topMain {
  border-bottom: 1px solid #444;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#0cffffff,endColorstr=#0cffffff);
  background: rgba(255, 255, 255, 0.05);
}
/*颜色：浅黄白、护眼绿、粉色、浅黄、浅灰、夜间黑*/
body,
.read_style_1 {
  background-color: #ebe5d8;
}
.read_style_2 {
  background-color: #cbdec9;
}
.read_style_3 {
  background-color: #edd4d4;
}
.read_style_4 {
  background-color: #e0cfa3;
}
.read_style_5 {
  background-color: #d3d3d3;
}
.read_style_6 {
  background-color: #0e0f0f;
}
.read_style_1 .textbox,
.read_style_1 .read_menu li a,
.read_style_1 .haveRead,
.read_style_1 .nextPageBox a {
  background-color: rgb(244, 241, 234);
} /*浅黄白*/
.read_style_2 .textbox,
.read_style_2 .read_menu li a,
.read_style_2 .haveRead,
.read_style_2 .nextPageBox a {
  background-color: rgb(224, 235, 223);
} /*护眼绿*/
.read_style_3 .textbox,
.read_style_3 .read_menu li a,
.read_style_3 .haveRead,
.read_style_3 .nextPageBox a {
  background-color: rgb(244, 229, 229);
} /*粉色*/
.read_style_4 .textbox,
.read_style_4 .read_menu li a,
.read_style_4 .haveRead,
.read_style_4 .nextPageBox a {
  background-color: rgb(236, 226, 200);
} /*浅黄*/
.read_style_5 .textbox,
.read_style_5 .read_menu li a,
.read_style_5 .haveRead,
.read_style_5 .nextPageBox a {
  background-color: rgb(229, 229, 229);
} /*浅灰*/
.read_style_6 .textbox,
.read_style_6 .read_menu li a,
.read_style_6 .haveRead,
.read_style_6 .nextPageBox a {
  background-color: rgb(39, 39, 39);
} /*夜间黑*/
.read_style_1 .textbox,
.read_style_1 .read_menu li a,
.read_style_1 .haveRead,
.read_style_1 .nextPageBox a {
  background-color: rgba(255, 255, 255, 0.45);
}
.read_style_2 .textbox,
.read_style_2 .read_menu li a,
.read_style_2 .haveRead,
.read_style_2 .nextPageBox a,
.read_style_3 .textbox,
.read_style_3 .read_menu li a,
.read_style_3 .haveRead,
.read_style_3 .nextPageBox a,
.read_style_4 .textbox,
.read_style_4 .read_menu li a,
.read_style_4 .haveRead,
.read_style_4 .nextPageBox a,
.read_style_5 .textbox,
.read_style_5 .read_menu li a,
.read_style_5 .haveRead,
.read_style_5 .nextPageBox a {
  background-color: rgba(255, 255, 255, 0.4);
}
.read_style_6 .textbox,
.read_style_6 .read_menu li a,
.read_style_6 .haveRead,
.read_style_6 .nextPageBox a {
  background-color: rgba(255, 255, 255, 0.1);
}
.read_style_1 .author_say,
.read_style_1 .orderBox,
.read_style_2 .author_say,
.read_style_2 .orderBox,
.read_style_3 .author_say,
.read_style_3 .orderBox,
.read_style_4 .author_say,
.read_style_4 .orderBox,
.read_style_5 .author_say,
.read_style_5 .orderBox {
  background-color: #fcfbfa;
  background-color: rgba(255, 255, 255, 0.75);
}
/*.read_style_1 .nextPageBox a { border-color: #e0e0e0 }
.read_style_2 .nextPageBox a { border-color: #bad7b7 }
.read_style_3 .nextPageBox a { border-color: #e5d3d3 }
.read_style_4 .nextPageBox a { border-color: #e0dcd0 }
.read_style_5 .nextPageBox a { border-color: #d3d3d3 }
.read_style_6 .nextPageBox a { border-color: #555 }*/
.read_style_6 .author_say,
.read_style_6 .orderBox,
.read_style_6 .textbox,
.read_style_6 .book_title h1,
.read_style_6 .read_menu li,
.read_style_6 .haveRead,
.read_style_6 .haveRead a,
.read_style_6 .topMain a,
.read_style_6 .searchBar .s_int,
.read_style_6 .bookNav,
.read_style_6 .bookNav a,
.read_style_6 .textinfo,
.read_style_6 .textinfo a,
.read_style_6 .textinfo span,
.read_style_6 .read_menu li a b {
  color: #999;
  box-shadow: none;
}
.read_style_6 .bookNav,
.read_style_6 .author_say,
.read_style_6 .orderBox,
.read_style_6 .payFoot {
  border-color: #444 !important;
}
.readBody {
  height: 100%;
}
.readMain {
  margin: 0 auto;
  position: relative;
  z-index: 3;
  width: 900px;
}
/* 左右菜单栏 */
.menu_left {
  width: 60px;
  z-index: 20;
  position: absolute;
  top: 60px;
  left: 50%;
  margin-left: -511px;
}
.menu_right {
  width: 60px;
  z-index: 20;
  position: absolute;
  bottom: 81px;
  right: 50%;
  margin-right: -511px;
  display: none;
}
.read_menu li {
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 1px;
  width: 60px;
  position: relative;
}
.read_menu li a {
  display: block;
  width: 60px;
  height: 60px;
  position: relative; /*background-color: #fff;*/
  opacity: 0.95;
}
.read_menu li a i {
  display: none;
  width: 60px;
  text-align: center;
  color: #999;
  font-size: 13px;
  line-height: 1.5;
  padding-top: 20px;
}
.read_menu li a b {
  font-weight: 400;
  display: block;
  height: 60px;
  width: 60px;
  text-align: center;
  line-height: 90px;
  color: rgba(0, 0, 0, 0.5);
}
.menu_left li a:hover,
.menu_right li a:hover {
  opacity: 1;
}
.menu_left li a span,
.menu_right li a span {
  background-position: -1px -126px;
  width: 6px;
  height: 6px;
  top: 13px;
  right: 13px;
  position: absolute;
}
.menu_left li a.ico_catalog {
  background-position: -60px -10px;
}
.menu_left li a.ico_page {
  background-position: 2px -10px;
}
.menu_left li a.ico_comment {
  background-position: -122px -65px;
}
.menu_left li a.ico_phone {
  background-position: -304px -10px;
}
.menu_left li a.ico_shelf,
.menu_left li a.ico_shelfed {
  background-position: -182px -10px;
}
.menu_left li a.ico_setup {
  background-position: -122px -10px;
}
.menu_left li a.ico_pc {
  background-position: 1px -62px;
}
.menu_left li a.ico_flower {
  background-position: -62px -64px;
}
.menu_right li a.ico_pagePrev {
  background-position: -184px -60px;
}
.menu_right li a.ico_pageNext {
  background-position: -243px -60px;
}
.menu_right li a.ico_goTop {
  background-position: -304px -56px;
}
.menu_right li a.ico_pagePrev:hover,
.menu_right li a.ico_pageNext:hover,
.menu_right li a.ico_goTop:hover {
  background-image: none;
}
.menu_right li a:hover i {
  display: block;
}
/* 正文栏 */
.textbox {
  border-radius: 2px;
  width: 98%;
  margin: 0 auto 20px;
  padding-bottom: 40px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.25);
  color: #111;
}
.bookNav {
  width: 99%;
  margin: 0 auto;
  padding: 18px 0 12px;
  line-height: 2.5; /*border-bottom: 1px dotted rgba(0,0,0,.1)*/
}
.bookNav a {
  font: 12px/1 "Microsoft YaHei";
  margin: 0 5px;
}
.readWrap {
  margin: 0 auto;
  width: 100%;
}
.book_title {
  width: 90%;
  margin: 0 auto;
  padding-bottom: 15px;
  position: relative;
}
.book_title h1 {
  padding: 60px 0 30px;
  font: 26px/1 "Microsoft YaHei";
  color: #000;
  text-align: center;
}
.textinfo {
  color: rgba(0, 0, 0, 0.5);
  font: 12px/1.8 "Microsoft YaHei";
  text-align: center;
  position: relative;
}
.textinfo a,
.textinfo span {
  color: rgba(0, 0, 0, 0.5);
  margin-right: 15px;
  display: inline-block;
  vertical-align: middle;
  margin-top: -3px;
  *margin-top: -1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.readBox {
  width: 90%;
  margin: 0 auto;
  line-height: 2;
  font-size: 16px;
  padding: 10px 0 60px; /*min-height: 469px;*/
  word-wrap: break-word;
  word-break: break-word;
}
/* Markdown 渲染后的段落样式 */
.readBox :deep(p) {
  line-height: 2;
  margin-top: 1em;
  margin-bottom: 0.5em;
  text-indent: 2em;
}

/* 确保段落首行缩进 */
.readBox :deep(> *) {
  text-indent: 2em;
}
/* 标题、列表等不需要缩进 */
.readBox :deep(h1),
.readBox :deep(h2),
.readBox :deep(h3),
.readBox :deep(h4),
.readBox :deep(h5),
.readBox :deep(h6),
.readBox :deep(ul),
.readBox :deep(ol),
.readBox :deep(blockquote),
.readBox :deep(pre) {
  text-indent: 0;
}
.orderBox {
  width: 90%;
  margin: 0 auto 10px;
  padding: 40px 0;
  font-size: 14px;
  min-height: 330px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
.orderBox h3 {
  padding: 0 50px;
  font: 18px/1 "Microsoft YaHei";
  margin: 25px 0;
}
.order_list {
  padding: 0 50px;
  line-height: 2.6;
}
.order_list .btns {
  padding: 20px 0;
}
/* 作者的话 */
.say_bar {
  padding: 14px 14px 14px 74px;
  font-size: 14px;
}
/* 翻页 */
.nextPageBox {
  margin: 30px auto;
  text-align: center;
  width: 98%;
}
.nextPageBox a {
  width: 26%;
  height: 58px;
  line-height: 58px;
  font-size: 18px;
  display: inline-block;
  border-radius: 3px;
  text-align: center; /*background: rgba(255,255,255,0.5);*/
  opacity: 0.95;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.nextPageBox a.prev,
.nextPageBox a.dir {
  margin-right: 40px;
}
.nextPageBox a:hover {
  /*background: rgba(255,255,255,.8);*/
  opacity: 1;
  color: #333;
}
.read_style_6 .nextPageBox a {
  color: #999;
  border: none;
}
/*固定悬浮图层*/
.readPopup {
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0 1px 2px #999;
  overflow: hidden;
  padding-bottom: 20px;
  z-index: 9999;
  position: fixed;
  left: 50%;
  top: 50%;
}
.icon_check {
  position: absolute;
  width: 29px;
  height: 25px;
  right: -1px;
  top: -1px;
  z-index: 2;
  background-position: 0 -142px;
}
.closePopup {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 16px;
  height: 15px;
  background-position: -43px -126px;
}
.chapterBox {
  width: 600px;
  margin-left: -300px;
  margin-top: -260px;
}
.chapterBox .scrollWrap {
  height: 540px;
}
/*弹窗内容*/
.popupTit h2 {
  text-align: center;
  letter-spacing: 15px;
  color: #333;
  font: 700 20px/30px "Microsoft Yahei";
  margin: 30px 0;
}
.popupTit h3 {
  font-size: 16px;
  margin: 15px 20px;
}
.scrollWrap {
  overflow-y: scroll;
  position: relative;
}
.dirWrap {
  padding: 0 40px;
}
.scrollWrap h3 {
  padding-left: 26px;
  font-size: 14px;
  background: #e6e6e6;
  height: 30px;
  line-height: 30px;
  font-weight: normal;
  position: relative;
  cursor: pointer;
  margin: 0 0 15px;
  border-radius: 3px;
}
.readPopup .tc .btn_gray {
  margin-left: 30px;
}
/* 目录 */
.dirList {
  overflow: hidden;
  *zoom: 1;
}
.dirList li {
  float: left;
  width: 40%;
  padding-left: 26px;
  height: 40px;
  line-height: 40px;
  overflow: hidden;
  margin-right: 20px;
  *zoom: 1;
}
.dirList li a {
  float: left;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 220px;
}
/* 加书架 */
.readTipBox {
  width: 400px;
  padding-bottom: 30px;
  margin-left: -200px;
  margin-top: -105px;
}
.tipWrap {
  padding: 30px;
}
/* 设置 */
.setupBox {
  width: 480px;
  margin-left: -240px;
  margin-top: -130px;
}
.setupList {
  padding: 5px 40px;
}
.setupList li {
  font-size: 14px;
  padding: 15px 0;
}
.setupList li a {
  display: inline-block;
  vertical-align: middle;
  margin: 0 6px;
  text-align: center;
}
.readTheme a {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.readTheme .white {
  background-color: #faf6ed;
  margin-left: 15px;
}
.readTheme .green {
  background-color: #e2efe2;
}
/*.readTheme .blue { background-color: #E8FDFE }*/
.readTheme .pink {
  background-color: #fdd9d9;
}
.readTheme .yellow {
  background-color: #f1debd;
}
.readTheme .gray {
  background-color: #eee;
}
.readTheme .night {
  background-color: #666;
}
/*.readTheme a.current, .readTheme a:hover { box-shadow: 1px 3px 5px #aaa }*/
.read_style_1 .readTheme .white,
.read_style_2 .readTheme .green,
.read_style_3 .readTheme .pink,
.read_style_4 .readTheme .yellow,
.read_style_5 .readTheme .gray,
.read_style_6 .readTheme .night {
  border-color: #f80;
}
.setBtn a {
  border: 1px solid #d9d9d9;
  width: 53px;
  height: 28px;
  line-height: 28px;
  box-shadow: 0 1px 1px #ececec;
  border-radius: 3px;
}
.setBtn .act {
  color: #cc2931;
}
.setFont .setYahei {
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 14px;
}
.setFont .setSimsun {
  font-family: SimHei, "STHeiti", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  font-weight: bold;
}
.setFont .setSong {
  font-family: SimSun, "STSong", serif;
  font-size: 14px;
  font-weight: normal;
}
.setFont .setKs {
  font-family: "KaiTi", "STKaiti", serif;
  font-size: 15px;
}
.font-tip {
  padding: 10px 0 0;
  font-size: 12px;
}
.font-tip-text {
  color: #999;
  font-style: normal;
  font-weight: normal;
  line-height: 1.5;
}
.setupList li.fontSize a {
  text-align: center;
  margin: 0;
  font-size: 16px;
  width: 70px;
  box-shadow: 0 1px 0 #ececec;
}
.setupList li.fontSize a.small {
  margin-left: 8px;
  border-right: none;
  border-radius: 3px 0 0 3px;
}
.setupList li.fontSize a.big {
  border-left: none;
  border-radius: 0 3px 3px 0;
}
.setupList li.fontSize .current_font {
  display: inline-block;
  padding: 0 22px;
  border: 1px solid #d9d9d9;
  height: 28px;
  line-height: 28px;
  box-shadow: 0 1px 1px #ececec;
  vertical-align: middle;
}
/* 手机阅读 */
.qrBox {
  width: 280px;
  margin-left: -140px;
  margin-top: -120px;
}
.qrList {
  text-align: center;
  width: 166px;
  margin: 30px auto 15px;
}
.qr_img {
  width: 160px;
  height: 160px;
  margin: 0 auto 10px;
  display: block;
}
.qrCodeBox p {
  color: #999;
}
/*遮罩层*/
.maskBox {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 995;
  width: 100%;
  height: 100%;
  background: black;
  filter: alpha(opacity=20);
  opacity: 0.2;
  animation: mask 2s ease-out 0s 1 normal;
}
@keyframes mask {
  0% {
    filter: alpha(opacity=0);
    opacity: 0;
  }
  100% {
    filter: alpha(opacity=20);
    opacity: 0.2;
  }
}
.pc_bar {
  padding: 30px 0 10px;
  text-align: center;
  position: relative;
}
.icon_pc {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
  padding: 3px;
  display: inline-block;
  border-radius: 50%;
}
.icon_pc span {
  width: 96px;
  height: 96px;
  line-height: 1;
  border-radius: 50%;
  display: inline-block;
  background-color: #f80;
  color: #fefefe;
  font-size: 22px;
  letter-spacing: 0px;
  text-align: center;
}
.icon_pc:hover span {
  background: #ed4259;
}
.icon_yb {
  width: 37px;
  height: 27px;
  display: block;
  background-position: 0 -173px;
  margin: 19px auto 7px;
}
.icon_pc em {
  filter: alpha(opacity=90);
  -moz-opacity: 0.9;
  opacity: 0.9;
}
.read_dz {
  height: 40px;
  line-height: 40px;
  border-radius: 40px;
  padding: 0 22px;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#0c000000,endColorstr=#0c000000);
  background: rgba(0, 0, 0, 0.07);
  display: block;
  position: absolute;
  bottom: 35px;
  right: 50px;
  color: #444;
  font-size: 18px;
}
.read_dz:hover {
  color: #444;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#19000000,endColorstr=#19000000);
  background: rgba(0, 0, 0, 0.1);
}
.read_style_6 .read_dz {
  color: #aaa;
}
.read_dz.on {
  color: #f70;
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr=#0cff8800,endColorstr=#0cff8800);
  background: rgba(255, 136, 0, 0.05);
}
.read_dz.on i {
  background-position: -30px 0;
}
.haveRead {
  border-radius: 2px; /*background: #fff;*/
  width: 98%;
  margin: 0 auto 20px;
}
.haveRead h4 {
  padding: 25px 40px 0;
  font-weight: normal;
}
.haveRead ul {
  padding: 0 15px 10px;
}
.haveRead li {
  float: left;
  width: 124px;
  margin: 15px 23px;
}
.haveRead .items_img {
  display: block;
}
.haveRead .items_img img {
  width: 120px;
  height: 150px;
  background: #f6f6f6;
  border: 1px solid #ebebeb;
  padding: 1px;
}
.haveRead .items_img:hover img {
  border-color: #ccc;
}
.haveRead .items_link {
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 124px;
  overflow: hidden;
  height: 30px;
  line-height: 30px;
  display: block;
}
.payFoot {
  line-height: 2.4;
  padding: 30px 0 20px;
  margin: 10px 50px 0;
  font-size: 13px;
  color: #808080;
  border-top: 1px solid #eee;
}
.readBanner {
  width: 98%;
  padding-top: 25px;
}
.readBanner img {
  max-width: 100%;
}
.read_style_6 .readBanner img,
.read_style_6 .haveRead .items_img img {
  filter: alpha(opacity=80);
  opacity: 0.8;
}
:root .topMain {
  filter: none;
}

/* 章节列表弹窗样式 */
.chapter-list-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.chapter-list-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chapter-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background-color: #f8f8f8;
}

.chapter-list-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.close-chapter-list {
  font-size: 28px;
  line-height: 1;
  color: #999;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-chapter-list:hover {
  color: #333;
}

.chapter-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.chapter-list-loading,
.chapter-list-empty {
  padding: 40px 24px;
  text-align: center;
  color: #999;
}

.chapter-list-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.chapter-list-items li {
  border-bottom: 1px solid #f0f0f0;
}

.chapter-list-items li:last-child {
  border-bottom: none;
}

.chapter-list-items li a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
  cursor: pointer;
}

.chapter-list-items li a:hover {
  background-color: #f5f5f5;
}

.chapter-list-items li.current-chapter a {
  background-color: #e8f4ff;
  color: #1890ff;
  font-weight: 500;
}

.chapter-list-items .chapter-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-list-items .vip-tag {
  color: #ff4d4f;
  font-size: 12px;
  margin-left: 8px;
  font-style: normal;
}

/* 弹窗动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translate(-50%, -60%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translate(-50%, -40%);
  opacity: 0;
}

/* 全屏模式下的章节列表弹窗样式调整 */
.fullscreen-mode .chapter-list-popup {
  max-height: 90vh;
}

/* 夜间模式下的章节列表弹窗 */
.read_style_6 .chapter-list-popup {
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.read_style_6 .chapter-list-header {
  background-color: #252525;
  border-bottom-color: #333;
}

.read_style_6 .chapter-list-header h3 {
  color: #e0e0e0;
}

.read_style_6 .close-chapter-list {
  color: #999;
}

.read_style_6 .close-chapter-list:hover {
  color: #e0e0e0;
}

.read_style_6 .chapter-list-items li {
  border-bottom-color: #333;
}

.read_style_6 .chapter-list-items li a {
  color: #e0e0e0;
}

.read_style_6 .chapter-list-items li a:hover {
  background-color: #2a2a2a;
}

.read_style_6 .chapter-list-items li.current-chapter a {
  background-color: #1a3a52;
  color: #4da6ff;
}

/*全本订阅*/
.order_bar {
  text-align: center;
  padding-bottom: 30px;
}
.order_zj {
  width: 178px;
  padding: 15px 0;
  margin: 0 14px;
  display: inline-block;
  transition: width 0.3s;
  border: 1px solid #d8d8d8;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 4px;
}
.order_zj:hover {
  color: #333;
  background: rgba(255, 255, 255, 0.2);
  border-color: #d1d1d1;
}
.order_zj h4 {
  font-size: 18px;
  font-weight: normal;
}
.order_zj .price {
  font-size: 12px;
  padding-top: 6px;
}
.order_zj .price .red {
  margin-left: 5px;
}
.order_allzj {
  background: #f80;
  color: #fff;
  border-color: #f80;
}
.order_allzj .red {
  color: #fff;
}
.order_allzj:hover {
  color: #fff;
  background: #f70;
  border-color: #f70;
}
.order_tip {
  padding: 25px 0 10px;
  color: #999;
  font-size: 13px;
}
.dqye {
  font-size: 15px;
}

.empty-content-tip {
  padding: 60px 40px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  margin: 40px auto;
  max-width: 600px;
}

.empty-content-tip .tip-text {
  font-size: 20px;
  color: #666;
  margin-bottom: 20px;
  font-weight: 500;
}

.empty-content-tip .tip-desc {
  font-size: 16px;
  color: #999;
  margin-bottom: 15px;
}

.empty-content-tip .tip-reasons {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
  text-align: left;
  display: inline-block;
}

.empty-content-tip .tip-reasons li {
  font-size: 14px;
  color: #999;
  line-height: 28px;
  padding: 5px 0;
}

.empty-content-tip .tip-actions {
  margin-top: 30px;
}

.empty-content-tip .btn-back {
  display: inline-block;
  padding: 10px 30px;
  background-color: #f70;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s;
}

.empty-content-tip .btn-back:hover {
  background-color: #f50;
  color: #fff;
}

/* 全屏阅读模式 */
.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  overflow-y: auto;
  outline: none;
}

/* 确保全屏模式下主题背景色生效 */
.read_style_1.fullscreen-mode {
  background-color: #ebe5d8;
}
.read_style_2.fullscreen-mode {
  background-color: #cbdec9;
}
.read_style_3.fullscreen-mode {
  background-color: #edd4d4;
}
.read_style_4.fullscreen-mode {
  background-color: #e0cfa3;
}
.read_style_5.fullscreen-mode {
  background-color: #d3d3d3;
}
.read_style_6.fullscreen-mode {
  background-color: #0e0f0f;
}

.fullscreen-mode .readBody {
  padding-top: 40px;
  padding-bottom: 60px;
  min-height: 100vh;
}

.fullscreen-mode .readMain {
  width: 100%;
  max-width: 1200px;
}

/* 全屏模式下优化阅读区域 */
.fullscreen-mode .readWrap {
  padding: 0 20px;
}

/* body全屏样式 */
body.reading-fullscreen {
  overflow: hidden;
}
</style>