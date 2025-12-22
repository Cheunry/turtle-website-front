<template>
  <AuthorHeader />
  <div class="main box_center cf">
    <div class="userBox cf">
      <div class="my_l">
        <ul class="log_list">
          <li>            <router-link class="link_4 on" :to="{'name':'authorBookList'}">小说管理</router-link>
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
                <h3>小说基本信息填写</h3>
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
                          <strong>提交频率限制：</strong>每次提交需间隔30分钟，每天最多提交5次。提交后会触发AI审核，请谨慎提交。
                        </span>
                      </template>
                    </el-alert>
                  </li>
                  <li class="form-row">
                    <div class="form-item">
                      <b>作品方向：</b>
                      <select
                        v-model="book.workDirection"
                        class="s_input s_input_inline"
                        id="workDirection"
                        name="workDirection"
                        @change="loadCategoryList()"
                      >
                        <option value="0">男频</option>
                        <option value="1">女频</option>
                      </select>
                    </div>
                    <div class="form-item">
                      <b>分类：</b>
                      <select class="s_input s_input_inline" id="catId" name="catId" v-model="book.categoryId" @change="categoryChange">
                        <option :value="item.id" v-for="(item,index) in bookCategorys" :key="index">{{item.name}}</option>
                      </select>
                    </div>
                  </li>
                  <input
                    type="hidden"
                    id="catName"
                    name="catName"
                    value="玄幻奇幻"
                  />
                  <b>小说名：</b>
                  <li>
                    <input
                      v-model="book.bookName"
                      type="text"
                      id="bookName"
                      name="bookName"
                      class="s_input"
                    />
                  </li>
                  
                  <b>小说介绍：</b>

                  <li>
                    <textarea
                      v-model="book.bookDesc"
                      name="bookDesc"
                      rows="5"
                      cols="106"
                      id="bookDesc"
                      class="textarea"
                    ></textarea>
                  </li>

                  <b>状态：</b>
                  <li>
                    <el-radio-group v-model="book.bookStatus">
                        <el-radio :label="0">连载中</el-radio>
                        <el-radio :label="1">已完结</el-radio>
                    </el-radio-group>
                  </li>

                  <b>收费模式：</b>
                  <li>
                    <el-radio-group v-model="book.isVip">
                        <el-radio :label="0">免费</el-radio>
                        <el-radio :label="1">收费</el-radio>
                    </el-radio-group>
                  </li>

                  <li>
                    <input
                      type="button"
                      @click="saveBook"
                      name="btnRegister"
                      :value="submitting ? '提交中...' : '下一步（设置封面）'"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/styles/book.css";
import { reactive, toRefs, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { publishBook } from "@/api/author";
import { listCategorys } from "@/api/book";
import AuthorHeader from "@/components/author/Header.vue";
import { ElAlert, ElRadioGroup, ElRadio } from "element-plus";

export default {
  name: "authorBookAdd",
  components: {
    AuthorHeader,
    ElAlert,
    ElRadioGroup,
    ElRadio
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      book: {'workDirection' : 0,'isVip':0, 'bookStatus': 0},
      bookCategorys: [],
      submitting: false, // 提交状态
    });

    onMounted(() => {
      loadCategoryList()
    })

    const loadCategoryList = async () => {
      const { data } = await listCategorys({ workDirection: state.book.workDirection });
      state.book.categoryId = data[0].id
      state.book.categoryName = data[0].name
      state.bookCategorys = data;
    };

    const categoryChange = async (event) => {
      console.log("categoryChange======",event.target.value)
     state.bookCategorys.forEach((category)=>{
        if(category.id == event.target.value){
          state.book.categoryName = category.name
          return
        }
      });
    }


    const saveBook = async () => {
      // 防止重复提交
      if (state.submitting) {
        return;
      }

      console.log("sate=========",state.book)
      if (!state.book.bookName) {
        ElMessage.error("书名不能为空！");
        return;
      }
      if (!state.book.bookDesc) {
        ElMessage.error("简介不能为空！");
        return;
      }
      try {
        state.submitting = true;
        // 封面字段由后端填充默认值
        await publishBook(state.book)
        ElMessage.success("您的小说基本信息已提交成功，请前往列表页上传封面");
        // 延迟跳转，确保用户看到提示消息
        setTimeout(() => {
          router.push({'name':'authorBookList'})
        }, 500);
      } catch (error) {
        // 错误信息已经在拦截器中处理
      } finally {
        state.submitting = false;
      }
    }

    return {
      ...toRefs(state),
      loadCategoryList,
      categoryChange,
      saveBook,
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
.main.box_center {
  width: 1300px;
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
.frequency-tip {
  margin-bottom: 20px;
}
.frequency-tip .el-alert {
  padding: 12px 16px;
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
</style>
