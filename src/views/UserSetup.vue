<template>
  <Header />

  <div class="main box_center cf">
    <div class="userBox cf">
      <UserMenu />
      <div class="my_r">
        <div class="my_info cf">
          <div class="my_info_txt">
            <ul class="mytab_list">
              <li>
                <i class="tit">我的头像</i>
                <!-- 替换原有的 el-upload -->
                <ImageCropper 
                  :fixedNumber="[1, 1]" 
                  :limitSize="5"
                  title="修改头像" 
                  @uploaded="handleAvatarSuccess"
                >
                  <template #trigger>
                    <div class="avatar-uploader">
                      <img
                        :src="userPhoto ? getImageUrl(userPhoto, imgBaseUrl) : man"
                        class="avatar"
                      />
                      <div class="el-upload__text" style="text-align:center; margin-top:5px; color:#999; font-size:12px;">
                        点击图片修改
                      </div>
                    </div>
                  </template>
                </ImageCropper>
              </li>
              <!-- 移除用户名称编辑栏 -->
              <li>
                <i class="tit">手机号码</i>{{ username }}
              </li>
              <li>
                <i class="tit">账户余额</i>{{ accountBalance }} 龟币
              </li>
              <li>
                <i class="tit">我的昵称</i>
                <a id="my_name" v-if="!nickNameEdit" @click="nickNameEdit = true" style="cursor: pointer;">
                  {{ nickName }}<em class="ml10">[修改]</em>
                </a>
                <el-input 
                  v-else 
                  v-model="nickName" 
                  ref="nickNameRef"
                  @blur="saveNickName" 
                  @keyup.enter="saveNickName"
                  placeholder="请输入昵称"
                  style="width: 200px" 
                />
              </li>
              <li style="display: none">
                <i class="tit">电子邮箱</i><a href="javascript:void(0);"></a>
              </li>
              <li>
                <i class="tit">我的性别</i>
                <a id="my_sex" v-if="!userSexEdit" @click="userSexEdit = true" style="cursor: pointer;">
                  {{ userSex === 1 ? '女' : '男' }}<em class="ml10">[修改]</em>
                </a>
                <el-radio-group v-else v-model="userSex" @change="saveUserSex">
                  <el-radio :label="0">男</el-radio>
                  <el-radio :label="1">女</el-radio>
                </el-radio-group>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import "@/assets/styles/user.css";
import man from "@/assets/images/man.png";
import { reactive, toRefs, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { UploadProps } from "element-plus";
import { getImgVerifyCode } from "@/api/resource";
import { getUserinfo, updateUserInfo } from "@/api/user";
import { getImageUrl } from "@/utils/index";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import UserMenu from "@/components/user/Menu";
// 引入新组件
import ImageCropper from "@/components/common/ImageCropper";

export default {
  name: "userSetup",
  components: {
    Header,
    Footer,
    UserMenu,
    ImageCropper // 注册组件
  },
  setup() {
    const route = useRoute();
    const router = useRouter();

    const state = reactive({
      userPhoto: "",
      nickName: "",
      username: "",
      accountBalance: 0,
      userSex: 0,
      nickNameEdit: false,
      userSexEdit: false,
      baseUrl: process.env.VUE_APP_BASE_API_URL,
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
    });

    onMounted(async () => {
      const { data } = await getUserinfo();
      state.userPhoto = data.userPhoto;
      state.nickName = data.nickName;
      state.username = data.username;
      state.accountBalance = data.accountBalance || 0;
      if (data.userSex !== undefined && data.userSex !== null) {
        state.userSex = data.userSex;
      }
    });

    // 移除原来的 beforeAvatarUpload (裁剪组件内部已校验)

    // 修改 onSuccess 回调以适配组件传出的 url
    const handleAvatarSuccess = (url) => {
      state.userPhoto = url;
      updateUserInfo({ userPhoto: state.userPhoto });
    };

    const saveNickName = async () => {
      if (!state.nickNameEdit) return;
      if (!state.nickName) {
        ElMessage.error("昵称不能为空");
        return;
      }
      try {
        await updateUserInfo({ nickName: state.nickName });
        state.nickNameEdit = false;
        ElMessage.success("昵称修改成功");
      } catch (error) {
        ElMessage.error("修改失败");
      }
    };

    const saveUserSex = async (val) => {
      // 强制转换为数字，防止 element-plus 返回字符串导致显示逻辑判断错误
      const sexVal = Number(val);
      try {
        await updateUserInfo({ userSex: sexVal });
        state.userSexEdit = false;
        // 显式更新状态为数字
        state.userSex = sexVal;
        ElMessage.success("性别修改成功");
      } catch (error) {
        ElMessage.error("修改失败");
        // 失败回滚
        const { data } = await getUserinfo();
        state.userSex = data.userSex;
      }
    };

    return {
      ...toRefs(state),
      man,
      handleAvatarSuccess,
      getImageUrl,
      saveNickName,
      saveUserSex
    };
  },
};
</script>

<style scoped>
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
  width: 350px;
  float: left;
  padding: 100px 124px;
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
  width: 350px;
}
.user_l .s_input {
  margin-bottom: 25px;
  font-size: 14px;
}
.s_input {
  width: 348px;
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
  *padding-bottom: 25px;
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
  *display: inline;
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
  width: 739px;
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