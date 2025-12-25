<template>
  <AuthorHeader />
  <div class="main box_center cf">
    <div class="userBox cf">
      <div class="my_l">
        <ul class="log_list">
          <li><router-link class="link_4 on" :to="{'name':'authorBookList'}">小说管理</router-link></li>
        </ul>
      </div>
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="userBox cf">
            <div class="user_l">
              <div></div>
              <h3>小说基本信息修改</h3>
              <ul class="log_list">
                <li><span id="LabErr"></span></li>
                <li class="frequency-tip">
                  <el-alert
                    type="warning"
                    :closable="false"
                    show-icon
                  >
                    <template #title>
                      <span style="font-size: 14px;">
                        <strong>更新频率限制：</strong>修改书名或简介时，每次更新需间隔10分钟，每天最多更新10次。更新后会触发AI审核，请谨慎修改。
                      </span>
                    </template>
                  </el-alert>
                </li>
                <li class="form-row">
                  <div class="form-item">
                    <b>作品方向：</b>
                    <select v-model="book.workDirection" class="s_input s_input_inline" @change="loadCategoryList()">
                      <option :value="0">男频</option>
                      <option :value="1">女频</option>
                    </select>
                  </div>
                  <div class="form-item">
                    <b>分类：</b>
                    <select class="s_input s_input_inline" v-model="book.categoryId" @change="categoryChange">
                      <option :value="item.id" v-for="(item,index) in bookCategorys" :key="index">{{item.name}}</option>
                    </select>
                  </div>
                </li>
                <b>小说名：</b>
                <li>
                  <input 
                    v-model="book.bookName" 
                    type="text" 
                    class="s_input" 
                    :disabled="generatingPrompt || generatingCover"
                    :style="{ opacity: (generatingPrompt || generatingCover) ? 0.6 : 1, cursor: (generatingPrompt || generatingCover) ? 'not-allowed' : 'text' }"
                  />
                </li>
                <b>小说封面：</b>
                <li style="position: relative">
                  <div style="display: flex; align-items: flex-start; gap: 15px;">
                    <ImageCropper :fixedNumber="[3, 4]" :limitSize="10" title="修改封面" @uploaded="handleAvatarSuccess">
                      <template #trigger>
                        <div class="avatar-uploader">
                          <img :src="book.picUrl ? getImageUrl(book.picUrl, imgBaseUrl) : picUpload" class="avatar" style="width: 120px; height: 160px; object-fit: cover;" />
                        </div>
                      </template>
                    </ImageCropper>
                    <div style="flex: 1;">
                      <div style="display: flex; gap: 10px; align-items: center;">
                        <el-button 
                          type="primary" 
                          size="small" 
                          @click="generateCoverPrompt"
                          :loading="generatingPrompt"
                          :disabled="!book.bookName || !book.bookDesc || generatingCover"
                        >
                          <el-icon v-if="!generatingPrompt"><MagicStick /></el-icon>
                          {{ generatingPrompt ? '生成中...' : 'AI生成提示词' }}
                        </el-button>
                        <el-button 
                          type="success" 
                          size="small" 
                          @click="generateCover"
                          :loading="generatingCover"
                          :disabled="generatingPrompt"
                        >
                          <el-icon v-if="!generatingCover"><Picture /></el-icon>
                          {{ generatingCover ? 'AI正在绘图中(约30s)...' : '一键生成封面' }}
                        </el-button>
                      </div>
                      <!-- 封面提示词输入框 -->
                      <div v-if="generatedPrompt" style="margin-top: 15px;">
                        <div style="margin-bottom: 8px; font-size: 14px; color: #333;">
                          <b>封面提示词：</b>
                        </div>
                        <el-input
                          v-model="generatedPrompt"
                          type="textarea"
                          :rows="4"
                          placeholder="生成的提示词将显示在这里，您可以编辑"
                          style="width: 100%;"
                          :disabled="generatingPrompt || generatingCover"
                        />
                        <!-- 生成中的提示 -->
                        <el-alert
                          v-if="generatingPrompt || generatingCover"
                          :type="generatingPrompt ? 'info' : 'warning'"
                          :closable="false"
                          show-icon
                          style="margin-top: 10px;"
                        >
                          <template #title>
                            <span style="font-size: 13px;">
                              {{ generatingPrompt ? '正在生成提示词，请稍候...' : 'AI正在绘图中，请耐心等待约15-30秒，期间请勿操作...' }}
                            </span>
                          </template>
                        </el-alert>
                      </div>
                      
                      <!-- 封面预览区域 -->
                      <div v-if="previewCoverUrl" style="margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 15px;">
                        <div style="font-size: 14px; color: #333; margin-bottom: 10px;"><b>封面预览：</b></div>
                        <div style="display: flex; gap: 20px; align-items: flex-end;">
                          <div style="border: 1px solid #eee; padding: 5px; background: #f9f9f9;">
                            <img :src="previewCoverUrl" style="width: 120px; height: 160px; object-fit: cover; display: block;" />
                          </div>
                          <div>
                            <el-button 
                              type="success" 
                              @click="setAsCover" 
                              :loading="settingCover"
                              :disabled="generatingPrompt || generatingCover"
                            >
                              使用此封面
                            </el-button>
                            <div style="margin-top: 8px; font-size: 12px; color: #666;">
                              满意后点击使用，将自动保存为正式封面
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <b>书籍状态：</b>
                <li>
                  <select v-model="book.bookStatus" class="s_input">
                    <option :value="0">连载中</option>
                    <option :value="1">已完结</option>
                  </select>
                </li>
                <b>小说介绍：</b>
                <li>
                  <div style="position: relative;">
                    <textarea 
                      v-model="book.bookDesc" 
                      rows="5" 
                      cols="106" 
                      class="textarea" 
                      id="bookDesc"
                      :disabled="generatingPrompt || generatingCover"
                      :style="{ opacity: (generatingPrompt || generatingCover) ? 0.6 : 1, cursor: (generatingPrompt || generatingCover) ? 'not-allowed' : 'text' }"
                      placeholder="请输入小说简介，建议50-2000字"
                      maxlength="2000"
                    ></textarea>
                    <div style="position: absolute; bottom: 8px; right: 12px; font-size: 12px; color: #999; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 3px;">
                      {{ (book.bookDesc || '').length }}/2000
                    </div>
                  </div>
                </li>
                <li>
                  <input 
                    type="button" 
                    @click="saveBook" 
                    :value="submitting ? '提交中...' : '保存修改'" 
                    class="btn_red"
                    :disabled="submitting || generatingPrompt || generatingCover"
                    :style="{ opacity: (submitting || generatingPrompt || generatingCover) ? 0.6 : 1, cursor: (submitting || generatingPrompt || generatingCover) ? 'not-allowed' : 'pointer' }"
                  />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { updateBook, aiCover, aiCoverPrompt, getAuthorStatus, getBookById } from "@/api/author";
import { uploadImageFromUrl } from "@/api/resource";
import { listCategorys } from "@/api/book";
import { getImageUrl } from "@/utils/index";
import AuthorHeader from "@/components/author/Header.vue";
import picUpload from "@/assets/images/pic_upload.png";
import ImageCropper from "@/components/common/ImageCropper";
import { ElAlert } from "element-plus";
import { MagicStick, Picture } from "@element-plus/icons-vue";

export default {
  name: "authorBookEdit",
  components: { 
    AuthorHeader, 
    ImageCropper,
    ElAlert
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      book: { workDirection: 0, bookStatus: 0 },
      bookCategorys: [],
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
      submitting: false, // 提交状态
      generatingPrompt: false, // 生成提示词状态
      generatedPrompt: '', // 生成的提示词
      generatingCover: false, // 生成封面状态
      previewCoverUrl: '', // 预览封面URL
      settingCover: false, // 设置封面状态
      authorPoints: {
        freePoints: 0,
        paidPoints: 0
      }
    });

    onMounted(async () => {
      const bookId = route.params.id;
      if (bookId) {
        await loadBook(bookId);
      }
    });

    const loadBook = async (bookId) => {
      const { data } = await getBookById(bookId);
      state.book = data;
      // 加载对应方向的分类列表
      await loadCategoryList();
    };

    const loadCategoryList = async () => {
      const { data } = await listCategorys({ workDirection: state.book.workDirection });
      state.bookCategorys = data;
      // 如果当前分类不在列表中（比如切换了方向），重置为第一个
      const exists = data.some(c => c.id === state.book.categoryId);
      if (!exists && data.length > 0) {
        state.book.categoryId = data[0].id;
        state.book.categoryName = data[0].name;
      }
    };

    const handleAvatarSuccess = (url) => {
      state.book.picUrl = url;
    };

    const categoryChange = (event) => {
      const selected = state.bookCategorys.find(c => c.id == event.target.value);
      if (selected) {
        state.book.categoryName = selected.name;
      }
    };

    const generateCoverPrompt = async () => {
      if (!state.book.bookName) {
        ElMessage.warning("请先填写小说名");
        return;
      }
      if (!state.book.bookDesc) {
        ElMessage.warning("请先填写小说简介");
        return;
      }
      
      // 如果正在生成封面，不允许生成提示词
      if (state.generatingCover) {
        ElMessage.warning("AI正在生成封面中，请稍候...");
        return;
      }
      
      try {
        state.generatingPrompt = true;
        ElMessage.info("正在生成提示词，请稍候...");
        // 使用 aiCoverPrompt API 仅生成提示词（不扣积分）
        const params = {
          id: state.book.id,
          bookName: state.book.bookName,
          categoryName: state.book.categoryName || '',
          bookDesc: state.book.bookDesc
        };
        const response = await aiCoverPrompt(params);
        console.log("封面提示词响应:", response);
        // 响应拦截器已处理错误，这里直接检查 data
        if (response && response.data) {
          // 返回的是提示词字符串
          state.generatedPrompt = response.data;
          ElMessage.success("提示词生成成功");
          // 注意：生成提示词不扣积分，所以不需要触发积分更新事件
        } else {
          console.warn("响应数据异常:", response);
          ElMessage.error(response?.message || "生成提示词失败，响应数据为空");
        }
      } catch (error) {
        ElMessage.error("生成提示词失败，请稍后重试");
        console.error("生成封面提示词失败:", error);
      } finally {
        state.generatingPrompt = false;
      }
    };

    // 获取作者积分信息
    const fetchAuthorPoints = async () => {
      try {
        const response = await getAuthorStatus();
        if (response && response.data) {
          // 确保转换为数字类型，避免字符串拼接问题
          state.authorPoints.freePoints = Number(response.data.freePoints) || 0;
          state.authorPoints.paidPoints = Number(response.data.paidPoints) || 0;
          return true;
        }
      } catch (error) {
        console.error('获取积分信息失败:', error);
      }
      return false;
    };

    const generateCover = async () => {
      // 如果正在生成提示词，不允许生成封面
      if (state.generatingPrompt) {
        ElMessage.warning("正在生成提示词中，请稍候...");
        return;
      }
      
      // 如果没有提示词，先尝试自动生成提示词
      if (!state.generatedPrompt) {
          // 检查必要信息
          if (!state.book.bookName || !state.book.bookDesc) {
            ElMessage.warning("请先填写小说名和简介");
            return;
          }
          
          try {
            // 先调用生成提示词
            await generateCoverPrompt();
            // 如果生成后还是没有（比如失败了），则停止
            if (!state.generatedPrompt) return;
          } catch (e) {
            return;
          }
      }
      
      // 先获取最新积分信息
      const pointsFetched = await fetchAuthorPoints();
      
      const consumePoints = 100; // AI封面生成消耗100积分
      const currentTotal = Number(state.authorPoints.freePoints || 0) + Number(state.authorPoints.paidPoints || 0);
      const afterTotal = currentTotal - consumePoints;
      
      // 只有在成功获取积分信息且积分明显不足时才提示（避免因为获取失败而误判）
      if (pointsFetched && afterTotal < 0) {
        ElMessage.error(`积分不足！当前积分：${currentTotal}，需要：${consumePoints}`);
        return;
      }
      
      // 计算消耗后的积分（优先扣除免费积分）
      const usedFreePoints = Math.min(consumePoints, state.authorPoints.freePoints);
      const usedPaidPoints = Math.max(0, consumePoints - state.authorPoints.freePoints);
      const afterFreePoints = state.authorPoints.freePoints - usedFreePoints;
      const afterPaidPoints = state.authorPoints.paidPoints - usedPaidPoints;
      
      // 显示确认对话框
      const confirmed = await ElMessageBox.confirm(
        `
          <div style="padding: 10px 0;">
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>当前积分：</strong>
              ${pointsFetched ? `
                <span style="color: #409EFF;">免费积分 ${state.authorPoints.freePoints}</span>
                <span style="margin: 0 5px;">+</span>
                <span style="color: #67C23A;">永久积分 ${state.authorPoints.paidPoints}</span>
                <span style="color: #606266;">（总计 ${currentTotal}）</span>
              ` : '<span style="color: #909399;">积分查询失败，后端将进行积分检查</span>'}
            </p>
            <p style="margin: 8px 0; font-size: 14px;">
              <strong>消耗积分：</strong>
              <span style="color: #E6A23C;">${consumePoints} 积分</span>
              <span style="color: #909399; font-size: 12px;">（优先扣除每日免费积分）</span>
            </p>
            ${pointsFetched ? `
            <p style="margin: 8px 0; font-size: 14px; border-top: 1px solid #EBEEF5; padding-top: 8px;">
              <strong>消耗后积分：</strong>
              <span style="color: ${afterTotal >= 0 ? '#67C23A' : '#F56C6C'};">
                ${afterFreePoints > 0 ? `免费积分 ${afterFreePoints}` : '免费积分 0'}
                ${afterPaidPoints > 0 ? ` + 永久积分 ${afterPaidPoints}` : ''}
                <span style="color: #606266;">（总计 ${afterTotal}）</span>
              </span>
            </p>
            ` : ''}
          </div>
        `,
        '确认生成 AI 封面',
        {
          confirmButtonText: '确认并扣费',
          cancelButtonText: '取消',
          dangerouslyUseHTMLString: true,
          type: 'warning'
        }
      ).catch(() => false);
      
      if (!confirmed) {
        return;
      }
      
      try {
        state.generatingCover = true;
        ElMessage.info("AI正在绘图中，请耐心等待约 15-30 秒，期间请勿操作...");
        
        // 使用 aiCover API 生成封面（已集成积分扣除）
        const params = {
          relatedId: state.book.id,
          relatedDesc: state.book.bookName,
          bookName: state.book.bookName,
          categoryName: state.book.categoryName || '',
          bookDesc: state.book.bookDesc,
          prompt: state.generatedPrompt, // 使用生成的提示词
          consumePoints: 0 // 后端会自动计算并扣除
        };
        
        const response = await aiCover(params);
        
        // 触发积分更新事件
        window.dispatchEvent(new Event('author-points-changed'));
        
        if (response && response.data) {
          // 如果返回的是图片URL字符串
          if (typeof response.data === 'string') {
            state.previewCoverUrl = response.data;
          } else if (response.data.imageUrl) {
            state.previewCoverUrl = response.data.imageUrl;
          } else if (response.data.url) {
            state.previewCoverUrl = response.data.url;
          } else {
            state.previewCoverUrl = response.data;
          }
          ElMessage.success("封面生成成功，请查看预览");
        } else {
          ElMessage.error(response?.message || "生成封面失败");
        }
      } catch (error) {
        // 判断是否是超时错误
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            ElMessage.warning("生成时间较长，请稍后刷新页面或重试");
        } else {
            ElMessage.error("生成封面失败，请稍后重试");
        }
        console.error("生成封面失败:", error);
      } finally {
        state.generatingCover = false;
      }
    };

    const setAsCover = async () => {
      if (!state.previewCoverUrl) return;
      
      try {
        state.settingCover = true;
        // 1. 转存图片到 COS
        const response = await uploadImageFromUrl(state.previewCoverUrl);
        if (response && response.data) {
          const cosUrl = response.data;
          // 2. 更新本地显示
          state.book.picUrl = cosUrl;
          // 3. 更新数据库
          await updateBook(state.book.id, {
             ...state.book, 
             bookId: state.book.id,
             picUrl: cosUrl 
          });
          ElMessage.success("已成功设置为封面");
          state.previewCoverUrl = ''; // 清除预览，因为已经应用了
        } else {
          ElMessage.error("封面设置失败");
        }
      } catch (error) {
        console.error("设置封面失败:", error);
        ElMessage.error("设置封面失败");
      } finally {
        state.settingCover = false;
      }
    };

    const saveBook = async () => {
      // 防止重复提交
      if (state.submitting) {
        return;
      }
      
      // 如果正在生成提示词或封面，不允许提交
      if (state.generatingPrompt || state.generatingCover) {
        ElMessage.warning("AI正在处理中，请稍候再提交...");
        return;
      }

      if (!state.book.bookName) {
        ElMessage.error("书名不能为空！");
        return;
      }
      if (!state.book.picUrl) {
        ElMessage.error("封面不能为空！");
        return;
      }
      if (!state.book.bookDesc) {
        ElMessage.error("简介不能为空！");
        return;
      }
      
      const params = { ...state.book, bookId: state.book.id };
      try {
        state.submitting = true;
        // 后端已优化为异步处理（发送MQ后立即返回），无需等待审核完成
        await updateBook(state.book.id, params);
        ElMessage.success("您的小说基本信息已提交成功，正在处理中，审核结果将稍后通知您");
        // 立即跳转，后端异步处理不会阻塞
        router.push({ name: 'authorBookList' });
      } catch (error) {
        // 错误信息已经在拦截器中处理
      } finally {
        state.submitting = false;
      }
    };

    return {
      ...toRefs(state),
      picUpload,
      handleAvatarSuccess,
      loadCategoryList,
      categoryChange,
      saveBook,
      getImageUrl,
      generateCoverPrompt,
      generateCover,
      setAsCover,
      MagicStick,
      Picture,
    };
  },
};
</script>

<style scoped>
.main.box_center {
  width: 1300px;
}
.user_l {
  width: 700px;
  float: left;
  padding: 100px 80px;
}
.user_l h3 {
  font-size: 23px;
  font-weight: normal;
  line-height: 1;
  text-align: center;
}
.user_l .log_list {
  width: 700px;
}
.s_input {
  width: 680px;
  height: 38px;
  line-height: 38px\9;
  vertical-align: middle;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin-bottom: 25px;
  font-size: 14px;
}
.s_input_inline {
  width: 320px;
}
.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  align-items: flex-start;
}
.form-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.form-item b {
  margin-bottom: 8px;
  font-weight: normal;
}
.form-item .s_input_inline {
  width: 100%;
}
.textarea {
  width: 680px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}
.user_l .btn_red {
  width: 100%;
  font-size: 19px;
  padding: 12px;
}
.frequency-tip {
  margin-bottom: 20px;
}
.frequency-tip .el-alert {
  padding: 12px 16px;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.my_l {
  width: 198px;
  float: left;
  font-size: 13px;
  padding-top: 20px;
}
.my_l li a {
  display: block;
  height: 42px;
  line-height: 42px;
  padding-left: 62px;
  border-left: 4px solid #fff;
  margin-bottom: 5px;
  color: #666;
}
.my_l li .on {
  background-color: #fafafa;
  border-left: 2px solid #f80;
  color: #000;
  border-radius: 0 2px 2px 0;
}
.my_l .link_4 {
  background-position: 32px -314px;
}
.my_r {
  width: 1000px;
  padding: 0 30px 30px;
  float: right;
  border-left: 1px solid #efefef;
  min-height: 470px;
}
</style>
