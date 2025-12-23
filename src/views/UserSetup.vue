<template>
  <Header />
  <div class="main box_center cf">
    <div class="userBox cf">
      <UserMenu />
      <div class="my_r">
        <div class="my_bookshelf">
          <div class="title cf">
            <h2 class="fl">账号设置</h2>
          </div>
          
          <div class="user-setup-body">
            <ul class="user_info_ul">
              <!-- Avatar -->
              <li class="user_header_li">
                <span class="lab">头像</span>
                <div class="val_area avatar_area">
                  <img :src="getImageUrl(userPhoto)" class="user_header_img" alt="用户头像"/>
                  <ImageCropper 
                    :limitSize="5"
                    @uploaded="handleAvatarSuccess"
                  >
                    <template #trigger>
                        <a href="javascript:;" class="change_avatar_btn">更换头像</a>
                    </template>
                  </ImageCropper>
                </div>
              </li>
              
              <!-- Nickname -->
              <li class="user_common_li">
                <span class="lab">昵称</span>
                <div class="val_area">
                  <div v-if="!nickNameEdit" class="view_mode">
                    <span class="val">{{ nickName }}</span>
                    <a href="javascript:;" class="edit_btn" @click="nickNameEdit = true">
                      编辑
                    </a>
                  </div>
                  <div v-else class="edit_form">
                    <el-input v-model="nickName" placeholder="请输入新昵称" size="small" style="width: 200px; margin-right: 10px;" />
                    <el-button type="primary" size="small" @click="saveNickName">保存</el-button>
                    <el-button size="small" @click="nickNameEdit = false">取消</el-button>
                  </div>
                </div>
              </li>

              <!-- Username -->
              <li class="user_common_li">
                <span class="lab">账号</span>
                <div class="val_area">
                  <span class="val">{{ username }}</span>
                </div>
              </li>

              <!-- Balance -->
              <li class="user_common_li">
                <span class="lab">余额</span>
                <div class="val_area">
                  <span class="val">{{ accountBalance }} 屋币</span>
                </div>
              </li>

              <!-- Sex -->
              <li class="user_common_li">
                <span class="lab">性别</span>
                <div class="val_area">
                   <div v-if="!userSexEdit" class="view_mode">
                    <span class="val">{{ userSex === 1 ? '女' : '男' }}</span>
                    <a href="javascript:;" class="edit_btn" @click="userSexEdit = true">编辑</a>
                  </div>
                  <div v-else class="edit_form">
                    <el-radio-group v-model="userSex" style="margin-right: 10px;">
                      <el-radio :label="0">男</el-radio>
                      <el-radio :label="1">女</el-radio>
                    </el-radio-group>
                    <el-button type="primary" size="small" @click="saveUserSex(userSex)">保存</el-button>
                    <el-button size="small" @click="userSexEdit = false">取消</el-button>
                  </div>
                </div>
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
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import UserMenu from "@/components/user/Menu";
import ImageCropper from "@/components/common/ImageCropper";
import { reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getUserinfo, updateUserInfo } from "@/api/user";
import { ElMessage } from "element-plus";
import { getImageUrl } from "@/utils/index";
import { setNickName } from "@/utils/auth";

export default {
  name: "userSetup",
  components: {
    Header,
    Footer,
    UserMenu,
    ImageCropper
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

    const handleAvatarSuccess = (url) => {
      state.userPhoto = url;
      updateUserInfo({ userPhoto: state.userPhoto }).then(() => {
          ElMessage.success("头像修改成功");
      });
    };

    const saveNickName = async () => {
      if (!state.nickNameEdit) return;
      if (!state.nickName) {
        ElMessage.error("昵称不能为空");
        return;
      }
      try {
        await updateUserInfo({ nickName: state.nickName });
        setNickName(state.nickName); 
        state.nickNameEdit = false;
        ElMessage.success("昵称修改成功");
      } catch (error) {
        ElMessage.error("修改失败");
      }
    };

    const saveUserSex = async (val) => {
      const sexVal = Number(val);
      try {
        await updateUserInfo({ userSex: sexVal });
        state.userSexEdit = false;
        state.userSex = sexVal;
        ElMessage.success("性别修改成功");
      } catch (error) {
        ElMessage.error("修改失败");
        const { data } = await getUserinfo();
        state.userSex = data.userSex;
      }
    };

    return {
      ...toRefs(state),
      handleAvatarSuccess,
      getImageUrl,
      saveNickName,
      saveUserSex
    };
  },
};
</script>

<style scoped>
/* Layout Styles - Matched with UserMessage.vue */
.box_center {
  width: 1200px;
  margin: 0 auto;
}

.userBox {
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 6px;
}

/* User Menu Override */
:deep(.my_l) {
  width: 198px;
  float: left;
  font-size: 13px;
  padding-top: 20px;
}

:deep(.my_l li a) {
  display: block;
  height: 42px;
  line-height: 42px;
  padding-left: 62px;
  border-left: 4px solid #fff;
  margin-bottom: 5px;
  color: #666;
}

:deep(.my_l li .on) {
  background-color: #fafafa;
  border-left: 2px solid #f80;
  color: #000;
  border-radius: 0 2px 2px 0;
}

/* Right Content Area */
.my_r {
  width: 940px;
  padding: 0 30px 30px;
  float: right;
  border-left: 1px solid #efefef;
  min-height: 470px;
}

.my_bookshelf .title {
  padding: 20px 0 15px;
  line-height: 30px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.my_bookshelf h2 {
  font-size: 18px;
  font-weight: normal;
  color: #333;
}

/* User Info Styles - Cleaned up alignment */
.user-setup-body {
    padding: 0;
}

.user_info_ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

.user_info_ul li {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
    color: #333;
    padding-left: 10px; /* Slight padding to match table column alignment */
}

.user_info_ul li .lab {
    width: 80px; 
    text-align: right;
    margin-right: 20px;
    color: #888;
    font-weight: normal;
    flex-shrink: 0;
}

.val_area {
    flex: 1;
    display: flex;
    align-items: center;
}

.val {
    margin-right: 15px;
    font-weight: 500;
}

.user_header_img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #eee;
    margin-right: 20px;
}

.change_avatar_btn, .edit_btn {
    color: #409EFF;
    cursor: pointer;
    font-size: 13px;
    text-decoration: none;
}

.edit_btn {
    margin-left: 5px;
}

.change_avatar_btn:hover, .edit_btn:hover {
    color: #66b1ff;
    text-decoration: underline;
}

.edit_form {
    display: flex;
    align-items: center;
    gap: 10px;
}

.view_mode {
    display: flex;
    align-items: center;
}
</style>
