<script setup>

</script>

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
                  <input v-model="book.bookName" type="text" class="s_input" />
                </li>
                <b>小说封面：</b>
                <li style="position: relative">
                  <ImageCropper :fixedNumber="[3, 4]" :limitSize="10" title="修改封面" @uploaded="handleAvatarSuccess">
                    <template #trigger>
                      <div class="avatar-uploader">
                        <img :src="book.picUrl ? getImageUrl(book.picUrl, imgBaseUrl) : picUpload" class="avatar" style="width: 120px; height: 160px; object-fit: cover;" />
                      </div>
                    </template>
                  </ImageCropper>
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
                  <textarea v-model="book.bookDesc" rows="5" cols="106" class="textarea" id="bookDesc"></textarea>
                </li>
                <li>
                  <input type="button" @click="saveBook" value="保存修改" class="btn_red" />
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
import { ElMessage } from "element-plus";
import { updateBook } from "@/api/author";
import { getBookById, listCategorys } from "@/api/book";
import { getImageUrl } from "@/utils/index";
import AuthorHeader from "@/components/author/Header.vue";
import picUpload from "@/assets/images/pic_upload.png";
import ImageCropper from "@/components/common/ImageCropper";

export default {
  name: "authorBookEdit",
  components: { AuthorHeader, ImageCropper },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      book: { workDirection: 0, bookStatus: 0 },
      bookCategorys: [],
      imgBaseUrl: process.env.VUE_APP_BASE_IMG_URL,
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

    const saveBook = async () => {
      if (!state.book.bookName) return ElMessage.error("书名不能为空！");
      if (!state.book.picUrl) return ElMessage.error("封面不能为空！");
      if (!state.book.bookDesc) return ElMessage.error("简介不能为空！");
      
      const params = { ...state.book, bookId: state.book.id };
      await updateBook(state.book.id, params);
      ElMessage.success("修改成功");
      router.push({ name: 'authorBookList' });
    };

    return {
      ...toRefs(state),
      picUpload,
      handleAvatarSuccess,
      loadCategoryList,
      categoryChange,
      saveBook,
      getImageUrl,
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
