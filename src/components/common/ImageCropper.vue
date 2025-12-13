<template>
  <div class="image-cropper-container">
    <!-- 触发插槽：点击此处触发选择文件 -->
    <div @click="triggerSelect" class="trigger-box">
      <slot name="trigger">
        <el-button>选择图片</el-button>
      </slot>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/jpeg, image/png, image/jpg"
      @change="handleFileChange"
    />

    <!-- 裁剪弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="title"
      width="600px"
      :close-on-click-modal="false"
      @close="closeDialog"
      append-to-body
    >
      <div style="height: 400px; width: 100%">
        <vueCropper
          ref="cropper"
          :img="cropperImg"
          :outputSize="option.size"
          :outputType="option.outputType"
          :info="true"
          :full="option.full"
          :canMove="option.canMove"
          :canMoveBox="option.canMoveBox"
          :original="option.original"
          :autoCrop="option.autoCrop"
          :fixed="option.fixed"
          :fixedNumber="fixedNumber"
          :centerBox="option.centerBox"
          :infoTrue="option.infoTrue"
          :fixedBox="option.fixedBox"
        ></vueCropper>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :loading="loading" @click="finishCrop">确认上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from "vue";
import "vue-cropper/dist/index.css";
import { VueCropper } from "vue-cropper";
import { uploadImage } from "@/api/resource";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "ImageCropper",
  components: {
    VueCropper,
  },
  props: {
    // 裁剪框标题
    title: {
      type: String,
      default: "图片裁剪",
    },
    // 截图框宽高比例 [宽, 高]
    fixedNumber: {
      type: Array,
      default: () => [1, 1],
    },
    // 限制文件大小，单位 MB
    limitSize: {
      type: Number,
      default: 5,
    },
  },
  emits: ["uploaded"],
  setup(props, { emit }) {
    const fileInput = ref(null);
    const cropper = ref(null);
    const state = reactive({
      dialogVisible: false,
      loading: false,
      cropperImg: "",
      option: {
        size: 1,
        full: false,
        outputType: "png", // 默认输出 png，但压缩时会转 jpeg
        canMove: true,
        fixedBox: false,
        original: false,
        canMoveBox: true,
        autoCrop: true,
        fixed: true,
        centerBox: true,
        infoTrue: true,
      },
    });

    // 触发文件选择
    const triggerSelect = () => {
      // 必须确保 fileInput 已经绑定
      if (fileInput.value) {
        fileInput.value.click();
      } else {
        console.error("fileInput ref not found");
      }
    };

    // 文件选择变动
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!/\.(jpg|jpeg|png|JPG|PNG)$/.test(e.target.value)) {
        ElMessage.error('图片类型必须是jpeg,jpg,png中的一种');
        return;
      }
      
      // 【新增】硬性限制：源文件不能超过 30MB，防止浏览器卡死
      // 200MB 的图片转 Base64 后不仅内存溢出，Base64 字符串解析也会卡死主线程
      const MAX_SOURCE_SIZE = 30; 
      if (file.size > MAX_SOURCE_SIZE * 1024 * 1024) {
        ElMessage.error(`源图片太大（超过${MAX_SOURCE_SIZE}MB），浏览器无法处理，请选择较小的图片`);
        // 清空 input，否则下次选同一个文件不触发 change
        fileInput.value.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (data) => {
        state.cropperImg = data.target.result;
        state.dialogVisible = true;
        fileInput.value.value = "";
      };
      reader.readAsDataURL(file);
    };

    // 关闭弹窗
    const closeDialog = () => {
      state.dialogVisible = false;
      state.loading = false;
    };

    // 辅助函数：将 blob 压缩
    const compressBlob = (blob, quality = 0.8) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                // 铺底色，防止透明背景变黑
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // 导出为 jpeg 以进行压缩
                canvas.toBlob((newBlob) => {
                    URL.revokeObjectURL(url);
                    resolve(newBlob);
                }, 'image/jpeg', quality);
            };
            img.src = url;
        });
    };

    const doUpload = (blob) => {
        const formData = new FormData();
        // 如果压缩过，通常是jpeg
        const fileName = blob.type === 'image/jpeg' ? 'cropped.jpg' : 'cropped.png';
        formData.append("file", blob, fileName);
        
        uploadImage(formData)
          .then(({ data }) => {
            ElMessage.success("上传成功");
            emit("uploaded", data);
            closeDialog();
          })
          .catch(() => {
            ElMessage.error("上传失败");
            state.loading = false;
          });
    };

    // 确认裁剪并上传
    const finishCrop = () => {
      state.loading = true;
      cropper.value.getCropBlob(async (blob) => {
        // 检查大小
        const sizeInMB = blob.size / 1024 / 1024;
        
        if (sizeInMB > props.limitSize) {
            state.loading = false; // 先暂停 loading
            
            try {
                await ElMessageBox.confirm(
                    `您的图片大小 (${sizeInMB.toFixed(2)}MB) 超过了 ${props.limitSize}MB 限制。是否同意自动压缩图片？`,
                    '图片过大',
                    {
                        confirmButtonText: '同意压缩',
                        cancelButtonText: '不同意，我重新选择',
                        type: 'warning',
                    }
                );
                
                // 用户同意压缩
                state.loading = true;
                // 尝试压缩，质量设为 0.7
                const compressedBlob = await compressBlob(blob, 0.7);
                
                // 二次检查（可选，如果压缩后还大，可以再压或提示）
                if (compressedBlob.size / 1024 / 1024 > props.limitSize) {
                    // 如果还大，再狠压一次
                     const reCompressedBlob = await compressBlob(blob, 0.5);
                     doUpload(reCompressedBlob);
                } else {
                    doUpload(compressedBlob);
                }
                
            } catch (e) {
                // 用户点击取消或不同意
                // 这里什么都不做，留给用户重新调整或重新选择
                ElMessage.info('请重新选择更小的图片');
            }
        } else {
            // 未超限，直接上传
            doUpload(blob);
        }
      });
    };

    return {
      ...toRefs(state),
      fileInput,
      cropper,
      triggerSelect,
      handleFileChange,
      closeDialog,
      finishCrop,
    };
  },
};
</script>

<style scoped>
.trigger-box {
  display: inline-block;
  cursor: pointer;
}
</style>