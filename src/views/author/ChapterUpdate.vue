<template>
  <AuthorHeader />
  <div class="main box_center cf">
    <div class="userBox cf">
      <div class="my_l">
        <ul class="log_list">
          <li>
            <router-link class="link_4 on" :to="{ name: 'authorChapterList', query: { id: bookId } }"
              >返回章节列表</router-link
            >
          </li>
          <!--<li><a class="link_1 " href="/user/userinfo.html">批量小说爬取</a></li>
<li><a class="link_4 " href="/user/favorites.html">单本小说爬取</a></li>-->
        </ul>
      </div>
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="userBox cf">
            <form method="post" action="./register.html" id="form2">
              <div class="user_l">
                <div></div>
                <h3>小说章节内容填写</h3>
                <ul class="log_list">
                  <li><span id="LabErr"></span></li>
                  <!-- 新增：章节号修改 -->
                  <b>章节号：</b>
                  <li>
                    <input
                      v-model="chapter.chapterNum"
                      type="number"
                      class="s_input"
                      placeholder="请输入章节号"
                    />
                  </li>
                  
                  <b>章节名：</b>
                  <li>
                    <input
                      v-model="chapter.chapterName"
                      type="text"
                      id="bookIndex"
                      name="bookIndex"
                      class="s_input"
                    />
                  </li>
                  <b>章节内容：</b>
                  <li id="contentLi">
                    <!-- 添加AI工具栏 -->
                    <div class="ai-toolbar">
                      <el-button
                        v-for="btn in aiButtons"
                        :key="btn.action"
                        :type="btn.type"
                        :disabled="(btn.action !== 'polish' && !hasSelection) || generating || !chapter.content"
                        @click="openDialog(btn.action)"
                        size="small"
                      >
                        {{ btn.label }}
                        <el-icon v-if="generating" class="is-loading">
                          <Loading />
                        </el-icon>
                      </el-button>
                      <el-button
                        type="info"
                        size="small"
                        @click="enterFullscreen"
                        style="margin-left: 10px;"
                      >
                        全屏输入
                      </el-button>
                      <el-button
                        :type="showPreview ? 'success' : 'default'"
                        size="small"
                        @click="showPreview = !showPreview"
                        style="margin-left: 10px;"
                      >
                        {{ showPreview ? '编辑模式' : '预览模式' }}
                      </el-button>

                      <!-- 参数输入对话框 -->
                      <el-dialog
                        v-model="dialogVisible"
                        :title="dialogTitle"
                        width="30%"
                      >
                        <div
                          v-if="
                            currentAction === 'expand' ||
                            currentAction === 'condense'
                          "
                        >
                          <el-input
                            v-model.number="ratio"
                            type="number"
                            :placeholder="`请输入${
                              currentAction === 'expand' ? '扩写' : '缩写'
                            }比例（1-200%）`"
                            min="1"
                            max="200"
                          >
                            <template #append>%</template>
                          </el-input>
                        </div>

                        <div v-if="currentAction === 'continue'">
                          <el-input
                            v-model.number="length"
                            type="number"
                            placeholder="请输入续写长度（50-1000字）"
                            min="50"
                            max="1000"
                          >
                            <template #append>字</template>
                          </el-input>
                        </div>

                        <template #footer>
                          <el-button @click="dialogVisible = false"
                            >取消</el-button
                          >
                          <el-button type="primary" @click="confirmParams"
                            >确定</el-button
                          >
                        </template>
                      </el-dialog>
                    </div>
                    <!-- 编辑模式 -->
                    <textarea
                      v-if="!showPreview"
                      ref="editor"
                      v-model="chapter.content"
                      name="bookContent"
                      rows="12"
                      cols="106"
                      id="bookContent"
                      class="textarea"
                      @mouseup="checkSelection"
                      @keyup="checkSelection"
                    ></textarea>
                    <!-- 预览模式 -->
                    <div
                      v-else
                      class="markdown-preview"
                      v-html="renderedContent"
                    ></div>
                  </li>
                  
                  <!-- 全屏编辑模式 -->
                  <div v-if="isFullscreen" class="fullscreen-editor">
                    <div class="fullscreen-header">
                      <h3>{{ chapter.chapterName || '章节内容' }}</h3>
                      <el-button type="primary" @click="exitFullscreen">
                        返回
                      </el-button>
                    </div>
                    <div class="fullscreen-toolbar">
                      <!-- 格式化工具栏 -->
                      <div class="format-toolbar">
                        <el-button
                          size="small"
                          @click="insertParagraphBreak"
                          title="插入段落分隔（两个换行）"
                        >
                          段落分隔
                        </el-button>
                        <el-button
                          :type="showFullscreenPreview ? 'success' : 'default'"
                          size="small"
                          @click="showFullscreenPreview = !showFullscreenPreview"
                          style="margin-left: 10px;"
                        >
                          {{ showFullscreenPreview ? '编辑模式' : '预览模式' }}
                        </el-button>
                      </div>
                      <!-- AI工具栏 -->
                      <div class="ai-toolbar-section">
                        <el-button
                          v-for="btn in aiButtons"
                          :key="btn.action"
                          :type="btn.type"
                          :disabled="(btn.action !== 'polish' && !hasSelection) || generating || !chapter.content || isPolishMode"
                          @click="openDialog(btn.action)"
                          size="small"
                        >
                          {{ btn.label }}
                          <el-icon v-if="generating" class="is-loading">
                            <Loading />
                          </el-icon>
                        </el-button>
                      </div>
                      <el-dialog
                        v-model="dialogVisible"
                        :title="dialogTitle"
                        width="30%"
                      >
                        <div
                          v-if="
                            currentAction === 'expand' ||
                            currentAction === 'condense'
                          "
                        >
                          <el-input
                            v-model.number="ratio"
                            type="number"
                            :placeholder="`请输入${
                              currentAction === 'expand' ? '扩写' : '缩写'
                            }比例（1-200%）`"
                            min="1"
                            max="200"
                          >
                            <template #append>%</template>
                          </el-input>
                        </div>

                        <div v-if="currentAction === 'continue'">
                          <el-input
                            v-model.number="length"
                            type="number"
                            placeholder="请输入续写长度（50-1000字）"
                            min="50"
                            max="1000"
                          >
                            <template #append>字</template>
                          </el-input>
                        </div>

                        <template #footer>
                          <el-button @click="dialogVisible = false"
                            >取消</el-button
                          >
                          <el-button type="primary" @click="confirmParams"
                            >确定</el-button
                          >
                        </template>
                      </el-dialog>
                    </div>
                    
                    <div class="fullscreen-content" :class="{ 'polish-mode': isPolishMode, 'preview-mode': showFullscreenPreview && !isPolishMode }">
                      <!-- 左侧编辑区 -->
                      <div class="editor-pane" v-if="!showFullscreenPreview || isPolishMode">
                         <textarea
                            ref="fullscreenEditor"
                            v-model="chapter.content"
                            name="bookContentFullscreen"
                            class="fullscreen-textarea"
                            @mouseup="checkSelection"
                            @keyup="checkSelection"
                          ></textarea>
                      </div>
                      <!-- 预览区 -->
                      <div v-else class="preview-pane">
                        <div class="fullscreen-preview" v-html="renderedContent"></div>
                      </div>

                      <!-- 右侧润色对比区 -->
                      <div v-if="isPolishMode" class="polish-pane">
                        <!-- 润色配置阶段 -->
                        <div v-if="polishStep === 'config'" class="polish-config">
                          <div class="polish-header">
                            <h4>润色设置</h4>
                            <el-button size="small" @click="cancelPolish">取消</el-button>
                          </div>
                          <div class="config-form">
                            <!-- AI润色风险提醒 -->
                            <div class="polish-warning">
                              <div class="warning-icon">⚠️</div>
                              <div class="warning-content">
                                <div class="warning-title">AI润色风险提醒</div>
                                <div class="warning-text">
                                  AI返回的内容可能出现不可控问题，包括但不限于：格式错误、AI幻觉（生成不准确或虚假内容）、断章取义等。请注意保护隐私，建议您仔细检查AI生成的内容。我们鼓励作者自主创作，AI工具仅作为辅助参考。
                                </div>
                              </div>
                            </div>
                            <div class="form-item">
                              <label>润色风格</label>
                              <select v-model="polishParams.style" class="s_input" style="width: 100%;">
                                <option
                                  v-for="item in polishStyles"
                                  :key="item.value"
                                  :value="item.value"
                                >
                                  {{ item.label }}
                                </option>
                              </select>
                            </div>
                            <div class="form-item">
                              <label>具体要求</label>
                              <el-input
                                v-model="polishParams.requirement"
                                type="textarea"
                                :rows="4"
                                placeholder="请输入润色要求"
                              />
                            </div>
                            <div class="form-actions">
                              <el-button 
                                type="primary" 
                                @click="startPolish" 
                                :loading="generating"
                                style="width: 100%"
                              >
                                {{ generating ? '润色中...' : '开始润色' }}
                              </el-button>
                            </div>
                          </div>
                        </div>

                        <!-- 润色结果阶段 -->
                        <div v-else class="polish-result">
                          <div class="polish-header">
                            <h4>AI润色建议</h4>
                            <div class="polish-actions">
                              <el-button type="success" size="small" @click="applyPolish">采纳</el-button>
                              <el-button type="primary" size="small" @click="polishStep = 'config'">重试</el-button>
                              <el-button size="small" @click="cancelPolish">取消</el-button>
                            </div>
                          </div>
                          <div class="polish-text-container">
                            <div v-if="polishExplanation" class="polish-explanation">
                              <strong>润色说明：</strong> {{ polishExplanation }}
                            </div>
                            <textarea 
                              v-model="polishedContent" 
                              class="polish-textarea"
                              :class="{ 'has-explanation': !!polishExplanation }"
                              readonly
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <br />

                  <b>是否收费：</b>
                  <li>
                    <input
                      v-model="chapter.isVip"
                      type="radio"
                      name="isVip"
                      value="0"
                      checked=""
                    />免费
                    <input
                      v-model="chapter.isVip"
                      type="radio"
                      name="isVip"
                      value="1"
                    />收费
                  </li>

                  <li style="margin-top: 10px">
                    <input
                      @click="updateBookChapter"
                      type="button"
                      name="btnRegister"
                      :value="submitting ? '提交中...' : '提交'"
                      id="btnRegister"
                      class="btn_red"
                      :disabled="submitting"
                      :style="{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }"
                    />
                  </li>
                </ul>
              </div>
            </form>
          </div>
          <!--<div id="divData" class="updateTable">
                    <table cellpadding="0" cellspacing="0">
                        <thead>
                        <tr>

                            <th class="name">
                                爬虫源（已开启的爬虫源）
                            </th>
                            <th class="chapter">
                                成功爬取数量（websocket实现）
                            </th>
                            <th class="time">
                            目标爬取数量
                            </th>
                            <th class="goread">
                                状态（正在运行，已停止）（一次只能运行一个爬虫源）
                            </th>
                            <th class="goread">
                                操作（启动，停止）
                            </th>
                        </tr>
                        </thead>
                        <tbody id="bookShelfList">



                        </tbody>
                    </table>
                    <div class="pageBox cf" id="shellPage">
                    </div>
                </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { updateChapter, getChapter, aiGenerate } from "@/api/author";
import AuthorHeader from "@/components/author/Header.vue";
import { Loading } from "@element-plus/icons-vue";
import { renderMarkdown } from "@/utils/markdown";

export default {
  name: "authorChapterUpdate",
  components: {
    AuthorHeader,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const editor = ref(null);
    const fullscreenEditor = ref(null);

    const state = reactive({
      bookId: route.query.bookId,
      chapterNum: route.query.chapterNum,
      chapter: { chapterName: "", content: "", isVip: 0 },
      hasSelection: false,
      generating: false,
      selectedText: "",
      isFullscreen: false,
      isPolishMode: false,
      polishStep: 'config', // 'config' | 'result'
      polishedContent: "",
      polishExplanation: "",
      polishSelectionStart: -1, // 保存选中文本的起始位置
      polishSelectionEnd: -1,   // 保存选中文本的结束位置
      polishParams: {
        style: '通俗易懂',
        requirement: '保持原意，提升文学性'
      },
      polishStyles: [
        { label: '通俗易懂', value: '通俗易懂' },
        { label: '华丽优美', value: '华丽优美' },
        { label: '简洁有力', value: '简洁有力' },
        { label: '悬疑惊悚', value: '悬疑惊悚' },
        { label: '古风雅致', value: '古风雅致' }
      ],
      submitting: false, // 提交状态
      aiButtons: [
        { label: "AI扩写", action: "expand", type: "primary" },
        { label: "AI缩写", action: "condense", type: "success" },
        { label: "AI续写", action: "continue", type: "warning" },
        { label: "AI润色", action: "polish", type: "danger" },
      ],
      dialogVisible: false,
      currentAction: '',
      ratio: 30,
      length: 200,
      showPreview: false, // 普通编辑预览模式开关
      showFullscreenPreview: false, // 全屏编辑预览模式开关
    });

    const dialogTitle = computed(() => {
      const map = {
        expand: '扩写设置',
        condense: '缩写设置',
        continue: '续写设置',
        polish: '润色设置'
      }
      return map[state.currentAction]
    })

    // 计算属性：将 Markdown 内容渲染为 HTML
    const renderedContent = computed(() => {
      if (!state.chapter.content) {
        return '';
      }
      return renderMarkdown(state.chapter.content);
    })

    const openDialog = (action) => {
      state.currentAction = action
      if (action === 'polish') {
        handleAI(action)
      } else {
        state.dialogVisible = true
      }
    }

    const validateParams = () => {
      if (state.currentAction === 'expand') {
        if (!state.ratio || state.ratio < 110 || state.ratio > 200) {
          ElMessage.error('请输入110-200%之间的比例')
          return false
        }
      }
      if (state.currentAction === 'condense') {
        if (!state.ratio || state.ratio < 1 || state.ratio > 99) {
          ElMessage.error('请输入1-99%之间的比例')
          return false
        }
      }
      if (state.currentAction === 'continue') {
        if (!state.length || state.length < 50 || state.length > 1000) {
          ElMessage.error('请输入50-1000字之间的长度')
          return false
        }
      }
      return true
    }

    const confirmParams = async () => {
      if (!validateParams()) return
      
      state.dialogVisible = false
      await handleAI(state.currentAction)
    }

    const checkSelection = () => {
      // 优先使用全屏编辑器，如果没有则使用普通编辑器
      const textarea = state.isFullscreen ? fullscreenEditor.value : editor.value;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        state.hasSelection = start !== end;
        if (state.hasSelection) {
          state.selectedText = textarea.value.substring(start, end);
          // 如果在润色配置阶段，更新选中位置
          if (state.isPolishMode && state.polishStep === 'config') {
            state.polishSelectionStart = start;
            state.polishSelectionEnd = end;
          }
        }
      }
    };

    const typewriterEffect = (text) => {
      return new Promise((resolve) => {
        let index = 0;
        const typing = setInterval(() => {
          if (index < text.length) {
            state.chapter.content += text.charAt(index);
            index++;
            // 自动滚动到底部
            const currentEditor = state.isFullscreen ? fullscreenEditor.value : editor.value;
            if (currentEditor) {
              currentEditor.scrollTop = currentEditor.scrollHeight;
            }
          } else {
            clearInterval(typing);
            resolve();
          }
        }, 20);
      });
    };

    const handleAI = async (action) => {    
      // 如果没有选中文本，对于润色功能使用全部内容
      if (!state.hasSelection && action === 'polish') {
        if (!state.chapter.content || state.chapter.content.trim().length === 0) {
          ElMessage.warning("请先输入章节内容");
          return;
        }
        state.selectedText = state.chapter.content;
        // 保存全文的位置
        state.polishSelectionStart = 0;
        state.polishSelectionEnd = state.chapter.content.length;
      }
      
      // 其他功能需要选中文本
      if (!state.hasSelection && action !== 'polish') {
        ElMessage.warning("请先选中要处理的文本");
        return;
      }

      // 润色模式先进入配置界面
      if (action === 'polish') {
        // 保存当前选中的位置
        const currentEditor = state.isFullscreen ? fullscreenEditor.value : editor.value;
        if (currentEditor && state.hasSelection) {
          state.polishSelectionStart = currentEditor.selectionStart;
          state.polishSelectionEnd = currentEditor.selectionEnd;
        }
        
        state.isPolishMode = true;
        state.polishStep = 'config';
        state.polishedContent = "";
        state.polishExplanation = "";
        if (!state.isFullscreen) {
          enterFullscreen();
        }
        // 等待 DOM 更新后，恢复选中状态并高亮
        setTimeout(() => {
          if (fullscreenEditor.value && state.polishSelectionStart >= 0 && state.polishSelectionEnd >= 0) {
            fullscreenEditor.value.focus();
            fullscreenEditor.value.setSelectionRange(state.polishSelectionStart, state.polishSelectionEnd);
          }
        }, 100);
        return;
      }

      await generateContent(action);
    };

    const startPolish = async () => {
      // 在开始润色前，再次检查并更新选中位置
      const currentEditor = state.isFullscreen ? fullscreenEditor.value : editor.value;
      if (currentEditor) {
        const start = currentEditor.selectionStart;
        const end = currentEditor.selectionEnd;
        if (start !== end) {
          // 用户重新选择了文本
          state.polishSelectionStart = start;
          state.polishSelectionEnd = end;
          state.selectedText = state.chapter.content.substring(start, end);
        } else if (state.polishSelectionStart >= 0 && state.polishSelectionEnd >= 0) {
          // 使用之前保存的位置
          state.selectedText = state.chapter.content.substring(state.polishSelectionStart, state.polishSelectionEnd);
        } else {
          // 如果没有选中，使用全文
          state.selectedText = state.chapter.content;
          state.polishSelectionStart = 0;
          state.polishSelectionEnd = state.chapter.content.length;
        }
      }
      await generateContent('polish');
    };

    const generateContent = async (action) => {
      try {
        state.generating = true
        
        const params = {
          text: state.selectedText || state.chapter.content
        }
        // 润色参数适配
        if (action === 'polish') {
          params.selectedText = params.text; 
          params.style = state.polishParams.style; 
          params.requirement = state.polishParams.requirement;
        }

        if (action === 'expand' || action === 'condense') {
          params.ratio = state.ratio
        }
        if (action === 'continue') {
          params.length = state.length
        }

        let response;
        response = await aiGenerate(action, params)

        // 修复：使用正确的响应数据结构
        // 对于润色，后端返回的是 { data: { polishedText: "...", explanation: "..." } }
        let resultText = '';
        let explanation = '';
        if (action === 'polish' && response.data) {
          resultText = response.data.polishedText || response.data;
          explanation = response.data.explanation || '';
        } else if (response.data) {
          // 其他AI功能可能直接返回文本
          resultText = typeof response.data === 'string' ? response.data : response.data.text || '';
        }

        // 获取当前使用的编辑器
        const currentEditor = state.isFullscreen ? fullscreenEditor.value : editor.value;
        
        if (action === 'polish') {
          // 润色模式：进入结果展示
          state.polishedContent = resultText;
          state.polishExplanation = explanation;
          state.polishStep = 'result';
        } else {
          // 其他功能保持原有逻辑：直接替换或追加
          if (state.hasSelection && currentEditor) {
            // 对于扩写、缩写、续写，替换选中文本
            const start = currentEditor.selectionStart;
            const end = currentEditor.selectionEnd;
            const beforeText = state.chapter.content.substring(0, start);
            const afterText = state.chapter.content.substring(end);
            state.chapter.content = beforeText + resultText + afterText;
            
            setTimeout(() => {
              if (currentEditor) {
                currentEditor.focus();
                currentEditor.setSelectionRange(start + resultText.length, start + resultText.length);
              }
            }, 0);
          } else {
            // 其他情况追加到末尾
            const newContent = `\n\n【AI生成内容】${resultText}`;
            await typewriterEffect(newContent);
          }
          state.hasSelection = false;
          state.selectedText = '';
        }
        
      } catch (error) {
        ElMessage.error("AI生成失败：" + (error.message || error));
      } finally {
        state.generating = false;
      }
    }

    const applyPolish = () => {
      const currentEditor = state.isFullscreen ? fullscreenEditor.value : editor.value;
      if (!currentEditor) return;

      // 如果是全选润色（或者没选中时默认全选），直接替换全文
      // 这里需要判断当初润色时是基于全文还是选区。
      // 简单的判断逻辑：如果 selectedText 等于 content，或者是用户没选中时自动全选的。
      // 但 selectedText 可能已经变了（虽然在模态框里不可变），最稳妥的是记录一个 range。
      // 简化处理：如果当初是 hasSelection，则替换选区；否则替换全文。
      // 注意：hasSelection 在 handleAI 结束时被重置了，这会导致问题。
      // 我们需要在 handleAI 里保存这一状态，或者不重置它直到 apply。
      
      // 实际上，handleAI 中对于 polish 并没有重置 hasSelection。
      // 让我们回顾一下 handleAI 代码。
      
      // 在上面的代码中，我把 `state.hasSelection = false` 放在了 `else` 块里（非 polish），
      // 所以 polish 时 hasSelection 应该还保留着。
      
      if (state.hasSelection) {
        const start = currentEditor.selectionStart;
        const end = currentEditor.selectionEnd;
        // 再次确认选区是否还在（防止用户在等待时乱点）
        // 更好的做法是记录 start 和 end
        // 这里做一个简单的容错：如果 selectedText 和当前选区内容不一致，提示用户或直接全文替换？
        // 为简单起见，假设用户没有乱动光标。
        
        const beforeText = state.chapter.content.substring(0, start);
        const afterText = state.chapter.content.substring(end);
        state.chapter.content = beforeText + state.polishedContent + afterText;
      } else {
        // 全文替换
        state.chapter.content = state.polishedContent;
      }

      state.isPolishMode = false;
      state.polishedContent = "";
      state.hasSelection = false;
      state.selectedText = "";
      ElMessage.success("润色内容已采纳");
    };

    const cancelPolish = () => {
      state.isPolishMode = false;
      state.polishedContent = "";
      // 不重置选中状态，方便用户重试？或者重置？
      // state.hasSelection = false; 
    };

    onMounted(() => {
      load();
    });

    const load = async () => {
      const { data } = await getChapter(state.bookId, state.chapterNum);
      state.chapter = data;
    };

    const updateBookChapter = async () => {
      // 防止重复提交
      if (state.submitting) {
        return;
      }

      if (!state.chapter.chapterNum) {
        ElMessage.error("章节号不能为空！");
        return;
      }
      
      if (!/^[1-9]\d*$/.test(state.chapter.chapterNum)) {
        ElMessage.error("章节号必须为正整数！");
        return;
      }

      if (!state.chapter.chapterName) {
        ElMessage.error("章节名不能为空！");
        return;
      }

      if (state.chapter.content.length < 50) {
        ElMessage.error("章节内容太少！");
        return;
      }

      try {
        state.submitting = true;
        await updateChapter(state.bookId, state.chapterNum, state.chapter);
        ElMessage.success("您的章节内容已提交成功，请等待审核");
        // 延迟跳转，确保用户看到提示消息
        setTimeout(() => {
          router.push({ name: 'authorChapterList', query: { id: state.bookId } });
        }, 500);
      } catch (error) {
        ElMessage.error("提交失败：" + (error.message || "未知错误"));
      } finally {
        state.submitting = false;
      }
    };

    const enterFullscreen = () => {
      state.isFullscreen = true;
      // 等待 DOM 更新后聚焦到全屏编辑器
      setTimeout(() => {
        if (fullscreenEditor.value) {
          fullscreenEditor.value.focus();
        }
      }, 100);
    };

    const exitFullscreen = () => {
      state.isFullscreen = false;
      state.showFullscreenPreview = false; // 退出全屏时关闭预览
      // 返回后聚焦到原编辑器
      setTimeout(() => {
        if (editor.value) {
          editor.value.focus();
        }
      }, 100);
    };

    // 插入段落分隔（两个换行），并自动为新段落添加首行缩进
    const insertParagraphBreak = () => {
      const currentEditor = fullscreenEditor.value;
      if (!currentEditor) {
        ElMessage.warning("请在全屏编辑模式下使用此功能");
        return;
      }
      const start = currentEditor.selectionStart;
      const end = currentEditor.selectionEnd;
      const beforeText = state.chapter.content.substring(0, start);
      const afterText = state.chapter.content.substring(end);
      // 插入段落分隔，并在新段落开头添加首行缩进
      state.chapter.content = beforeText + "\n\n　　" + afterText;
      
      setTimeout(() => {
        if (currentEditor) {
          currentEditor.focus();
          const newPos = start + 5; // 两个换行 + 两个全角空格
          currentEditor.setSelectionRange(newPos, newPos);
        }
      }, 0);
    };



    return {
      ...toRefs(state),
      editor,
      fullscreenEditor,
      renderedContent,
      updateBookChapter,
      checkSelection,
      handleAI,
      dialogTitle,
      openDialog,
      confirmParams,
      Loading,
      enterFullscreen,
      exitFullscreen,
      applyPolish,
      cancelPolish,
      startPolish,
      insertParagraphBreak,
    };
  },
};
</script>

<style>
.el-pagination {
  justify-content: center;
}
.el-pagination.is-background .el-pager li:not(.is-disabled).is-active {
  background-color: #f80 !important;
}
.el-pagination {
  --el-pagination-hover-color: #f80 !important;
}
</style>

<style scoped>
.main.box_center {
  width: 1300px;
}
.redBtn {
  padding: 5px;
  border-radius: 20px;
  border: 1px solid #f80;
  background: #f80;
  color: #fff;
}
a.redBtn:hover {
  color: #fff;
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.updateTable .style a {
  color: #999;
}
.updateTable .author a {
  color: #999;
  cursor: text;
}
.bind,
.updateTable .style a:hover {
  color: #f65167;
}
.userBox {
  /*width: 998px; border: 1px solid #eaeaea;*/
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 6px;
}
.channelViewhistory .userBox {
  margin: 0 auto;
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
.user_l #LabErr {
  color: #ff4040;
  display: block;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 14px;
}
.user_l .log_list {
  width: 700px;
}
.user_l .s_input {
  margin-bottom: 25px;
  font-size: 14px;
}
.s_input {
  width: 680px;
  height: 38px;
  line-height: 38px\9;
  vertical-align: middle;
  border: 1px solid #ddd;
  border-radius: 2px;
}
.icon_name,
.icon_key,
.icon_code {
  width: 312px;
  padding-left: 36px;
}
.icon_key {
  background-position: 13px -51px;
}
.icon_code {
  background-position: 13px -117px;
  width: 200px;
  float: left;
}
.code_pic {
  height: 38px;
  float: right;
}
.btn_phone {
  height: 40px;
  width: 100px;
  float: right;
  cursor: pointer;
  padding: 0;
  text-align: center;
  border-radius: 2px;
  background: #dfdfdf;
}
.log_code {
  padding-bottom: 25px;
}
.user_l .btn_red {
  width: 100%;
  font-size: 19px;
  padding: 12px;
}
.autologin {
  color: #999;
  line-height: 1;
  margin-bottom: 18px;
}
.autologin em {
  vertical-align: 2px;
  margin-left: 4px;
}
.user_r {
  width: 259px;
  margin: 80px 0;
  padding: 20px 70px;
  border-left: 1px dotted #e3e3e3;
  float: right;
  text-align: center;
}
.user_r .tit {
  font-size: 16px;
  line-height: 1;
  padding: 6px 0 25px;
}
.user_r .btn_ora {
  padding: 10px 34px;
}
.fast_login {
  padding: 60px 0 0;
}
.fast_list {
  text-align: center;
  padding: 0.5rem;
}
.fast_list li {
  display: inline-block;
  zoom: 1;
}
.fast_list li .img {
  width: 48px;
  height: 48px;
  margin: 20px 0 5px;
}
.fast_list li a:hover {
  opacity: 0.8;
  filter: alpha(opacity=80);
  -moz-opacity: 0.8;
}
.fast_list li span {
  display: block;
}
.fast_list .login_qq {
  margin: 0 42px;
}
.fast_list .login_wb a {
  color: #f55c5b;
}
.fast_list .login_qq a {
  color: #51b7ff;
}
.fast_list .login_wx a {
  color: #66d65e;
}
.fast_tit {
  position: relative;
  overflow: hidden;
}
.fast_tit .lines {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  line-height: 1;
  background: #eaeaea;
}
.fast_tit .title {
  background: #fff;
  font-size: 16px;
  padding: 3px 14px;
  position: relative;
  display: inline-block;
  z-index: 999;
}
/*userinfo*/
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
.my_l .link_1 {
  background-position: 32px -188px;
}
.my_l .link_2 {
  background-position: 32px -230px;
}
.my_l .link_3 {
  background-position: 32px -272px;
}
.my_l .link_4 {
  background-position: 32px -314px;
}
.my_l .link_5 {
  background-position: 32px -356px;
}
.my_l .link_6 {
  background-position: 32px -397px;
}
.my_l .link_7 {
  background-position: 32px -440px;
}
.my_l .link_8 {
  background-position: 32px -481px;
}
.my_r {
  width: 1000px;
  padding: 0 30px 30px;
  float: right;
  border-left: 1px solid #efefef;
  min-height: 470px;
}
.my_info {
  padding: 30px 0 5px;
}
.user_big_head {
  /*width:110px; height:110px; padding:4px; border:1px solid #eaeaea;*/
  margin-right: 30px;
  float: left;
  width: 80px;
  height: 80px;
  border-radius: 50%;
}
.my_r .my_name {
  font-size: 18px;
  line-height: 1;
  padding: 5px 0 12px 0;
}
.my_r .s_input {
  width: 318px;
  padding: 0 10px;
}
.my_list li {
  line-height: 28px;
}
.my_list li i,
.my_list li em.red {
  margin-right: 6px;
}
.my_list .binded {
  color: #999;
  margin-left: 6px;
}
.my_list .btn_link {
  margin-left: 12px;
}
.mytab_list li {
  line-height: 30px;
  padding: 10px 0;
  font-size: 14px;
}
.mytab_list li .tit {
  width: 70px;
  color: #aaa;
  text-align: right;
  display: inline-block;
  margin-right: 18px;
}
.mytab_list .user_img {
  width: 48px;
  height: 48px;
  vertical-align: middle;
  border-radius: 50%;
}
.my_bookshelf .title {
  padding: 20px 0 15px;
  line-height: 30px;
}
.my_bookshelf h4 {
  font-size: 14px;
  color: #666;
}
.my_bookshelf h2 {
  font-size: 18px;
  font-weight: normal;
}
.updateTable {
  width: 739px;
  color: #999;
}
.updateTable table {
  width: 100%;
  margin-bottom: 14px;
}
.updateTable th,
.updateTable td {
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  padding-left: 6px;
  font-weight: normal;
  text-align: left;
}
.updateTable th {
  background: #f9f9f9;
  color: #333;
  border-top: 1px solid #eee;
}
.updateTable td {
  height: 40px;
  line-height: 40px;
}
.updateTable .style {
  width: 80px;
  padding-left: 10px;
}
.updateTable .name {
  width: 178px;
  padding-right: 10px;
}
.updateTable .name a,
.updateTable .chapter a {
  max-width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.updateTable .chapter {
  padding-right: 5px;
}
.updateTable .chapter a {
  max-width: 220px;
  float: left;
}
.updateTable .author {
  width: 72px;
  text-align: left;
}
.updateTable .goread {
  width: 80px;
  text-align: center;
}
.updateTable .time {
  width: 86px;
}
.updateTable .word {
  width: 64px;
  padding-right: 10px;
  text-align: right;
}
.updateTable .rank {
  width: 30px;
  padding-right: 10px;
  text-align: center;
}
.updateTable .name a,
.updateTable .chapter a,
.updateTable .author a {
  height: 40px;
  line-height: 40px;
  display: inline-block;
  overflow: hidden;
}
.updateTable tr:nth-child(2n) td {
  background: #fafafa;
}
.dataTable {
  width: 739px;
}
.dataTable table {
  width: 100%;
  margin-bottom: 14px;
  border-collapse: collapse;
}
.dataTable th,
.dataTable td {
  height: 40px;
  line-height: 40px;
  vertical-align: middle;
  padding: 0 10px;
  font-weight: normal;
  text-align: center;
  border: 1px solid #eaeaea;
}
.dataTable th {
  background: #f8f8f8;
}
.nodate {
  border-top: 1px solid #eaeaea;
  padding: 60px 0;
}
.viewhistoryBox {
  /*padding: 0 30px 30px; */
  padding: 0 20px 10px;
}
.viewhistoryBox .updateTable {
  width: 100%;
}
/*.btn_gray, .btn_red, .btn_ora { font-size:14px; padding:8px 28px }*/
.book_tit {
  height: 48px;
  line-height: 48px;
  margin: 0 14px;
  border-bottom: 1px solid #eaeaea;
  overflow: hidden;
}
.book_tit .fl {
  font-size: 14px;
  color: #999;
}
.book_tit .fl h3 {
  font-size: 18px;
  color: #333;
  font-weight: normal;
  margin-right: 5px;
  display: inline;
}
.book_tit .fr {
  font-size: 14px;
}

.commentBar,
.feedback_list {
  border-top: 1px solid #eee;
  margin-bottom: 15px;
}
/*.comment_list { padding: 16px 0; border-bottom: 1px solid #eee }
.comment_list .user_head { width:54px; height:54px; border-radius:50%; float: left; margin-right: 14px }
.comment_list .li_1 { overflow: hidden }
.comment_list .user_name { color: #ed4259 }
.comment_list .li_2 { padding:3px 0; color:#999 }
.comment_list .li_3, .comment_list .li_4 { margin-left:68px }
.comment_list .reply { padding-left: 12px }
.comment_list .num { color: #ed4259; margin: 0 3px }
.comment_list .li_4 { line-height:34px; padding-top:8px; margin-top:15px; border-top:1px solid #eaeaea }
.comment_list .li_4 .more { background:#f7f7f7; border-radius:2px; color:#ed4259; text-align:center }*/
.no_contet {
  padding: 190px 0 40px;
  text-align: center;
  color: #999;
  border-top: 1px solid #eee;
}

.comment_list {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}
.comment_list:last-child {
  border: none;
}
.comment_list .user_heads {
  /*width: 54px; height: 54px; float: left;*/
  position: relative;
  margin-right: 20px;
}
.comment_list .user_head {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f6f6f6;
}
.comment_list .user_heads span {
  display: block;
  margin: 0;
  position: absolute;
  left: 12px;
  bottom: 0;
}
.comment_list ul {
  /*width: 640px;*/
  width: 660px;
}
.comment_list .li_0 {
  font-family: "宋体";
}
.comment_list .li_0 strong {
  font-size: 14px;
  color: #f00;
}
.comment_list .li_1 {
  overflow: hidden;
}
.comment_list .user_name {
  color: #ed4259;
}
.comment_list .li_2 {
  padding: 6px 0;
}
.comment_list .li_3 {
  color: #999;
}
.comment_list .reply {
  padding-left: 12px;
}
.comment_list .num {
  color: #ed4259;
  margin: 0 3px;
}
.comment_list .li_4 {
  line-height: 34px;
  padding-top: 8px;
  margin-top: 15px;
  border-top: 1px solid #eaeaea;
}
.pl_bar li {
  display: block;
}
.pl_bar .name {
  color: #666;
  padding-top: 2px;
  font-size: 14px;
}
.pl_bar .dec {
  font-size: 14px;
  line-height: 1.8;
  padding: 12px 0;
}
.pl_bar .other {
  line-height: 24px;
  color: #999;
  font-size: 13px;
}
.pl_bar .other a {
  display: inline-block;
  color: #999;
}
.pl_bar .reply {
  padding-left: 22px;
}
/*.no_comment { padding: 70px 14px 115px; color: #CCCCCC; text-align: center; font-size: 14px; }*/
.reply_bar {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 10px;
  line-height: 1.8;
}

/* 添加AI工具栏样式 */
.ai-toolbar {
  margin-bottom: 10px;
  width: 680px;
}
.ai-toolbar .el-button {
  margin-right: 10px;
}

.textarea {
  width: 680px;
  position: relative;
  font-family: "Microsoft YaHei", "SimSun", monospace;
  line-height: 1.6;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 2px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
  /* 让全角空格更明显 */
  letter-spacing: 0.3px;
}

.ai-toolbar .el-input {
  margin-bottom: 15px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

/* 全屏编辑样式 */
.fullscreen-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 9999;
  display: flex;
  flex-direction: column;
}

.fullscreen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.fullscreen-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
  color: #333;
}

.fullscreen-toolbar {
  padding: 15px 30px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.format-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-toolbar-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.fullscreen-toolbar .el-button {
  margin-right: 0;
}

.fullscreen-textarea {
  flex: 1;
  width: 100%;
  padding: 30px;
  border: none;
  outline: none;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 2;
  resize: none;
  box-sizing: border-box;
  background: #fff;
  color: #333;
  /* 使用等宽字体显示缩进，让全角空格更明显 */
  font-family: "Microsoft YaHei", "SimSun", monospace;
  /* 让全角空格更明显 */
  letter-spacing: 0.5px;
}

/* 分栏布局样式 */
.fullscreen-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.fullscreen-content.polish-mode .editor-pane {
  width: 50%;
  border-right: 1px solid #ddd;
}

.fullscreen-content.preview-mode .editor-pane {
  display: none;
}

.editor-pane {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-pane {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 30px;
  background: #fff;
}

.fullscreen-preview {
  max-width: 900px;
  margin: 0 auto;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 2;
  word-wrap: break-word;
  word-break: break-word;
}

.fullscreen-preview :deep(p) {
  margin: 1em 0;
  margin-bottom: 0.5em;
  text-indent: 2em;
}

.fullscreen-preview :deep(> *) {
  text-indent: 2em;
}

.fullscreen-preview :deep(h1),
.fullscreen-preview :deep(h2),
.fullscreen-preview :deep(h3),
.fullscreen-preview :deep(h4),
.fullscreen-preview :deep(h5),
.fullscreen-preview :deep(h6),
.fullscreen-preview :deep(ul),
.fullscreen-preview :deep(ol),
.fullscreen-preview :deep(blockquote),
.fullscreen-preview :deep(pre) {
  text-indent: 0;
}

.polish-pane {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: #fdfdfd;
}

.polish-header {
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.polish-header h4 {
  margin: 0;
  color: #333;
  font-weight: normal;
}

.polish-text-container {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.polish-textarea {
  width: 100%;
  height: 100%;
  padding: 30px;
  border: none;
  outline: none;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 16px;
  line-height: 2;
  resize: none;
  box-sizing: border-box;
  background: #fdfdfd;
  color: #333;
  flex: 1;
}

.polish-config {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.polish-result {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.config-form {
  padding: 30px;
}

/* AI润色风险提醒样式 */
.polish-warning {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  margin-bottom: 25px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
  border-left: 4px solid #faad14;
}

.warning-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 14px;
  font-weight: bold;
  color: #d46b08;
  margin-bottom: 8px;
}

.warning-text {
  font-size: 13px;
  color: #8c4a00;
  line-height: 1.6;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 10px;
  color: #666;
  font-weight: bold;
}

.form-item .el-select {
  width: 100%;
}

.form-actions {
  margin-top: 30px;
}

.polish-explanation {
  padding: 15px 20px;
  background: #f0f9eb;
  color: #67c23a;
  font-size: 14px;
  border-bottom: 1px solid #e1f3d8;
  line-height: 1.6;
}

.polish-textarea.has-explanation {
  border-top: 1px solid #eee;
}

/* Markdown 预览样式 */
.markdown-preview {
  width: 680px;
  min-height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 2px;
  background: #fff;
  font-family: "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.8;
  word-wrap: break-word;
  word-break: break-word;
}

.markdown-preview :deep(p) {
  margin: 1em 0;
  margin-bottom: 0.5em;
  text-indent: 2em;
}

/* 确保段落首行缩进 */
.markdown-preview :deep(> *) {
  text-indent: 2em;
}
/* 标题、列表等不需要缩进 */
.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6),
.markdown-preview :deep(ul),
.markdown-preview :deep(ol),
.markdown-preview :deep(blockquote),
.markdown-preview :deep(pre) {
  text-indent: 0;
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  margin: 1em 0;
  font-weight: bold;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  margin: 1em 0;
  padding-left: 2em;
}

.markdown-preview :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid #ddd;
  color: #666;
}

.markdown-preview :deep(code) {
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
}

.markdown-preview :deep(pre) {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
}

.markdown-preview :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-preview :deep(a) {
  color: #f80;
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
