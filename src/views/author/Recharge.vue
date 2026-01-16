<template>
  <div>
    <AuthorHeader />
    <div class="main box_center cf">
      <div class="recharge-wrapper">
        <div class="recharge-container">
            <h2 class="recharge-title">积分充值</h2>
            
            <!-- 当前积分信息 -->
            <div class="points-info-card">
              <div class="points-item">
                <span class="points-label">免费积分：</span>
                <span class="points-value free">{{ freePoints }}</span>
                <span class="points-desc">（每日重置）</span>
              </div>
              <div class="points-item">
                <span class="points-label">付费积分：</span>
                <span class="points-value paid">{{ paidPoints }}</span>
                <span class="points-desc">（永久有效）</span>
              </div>
            </div>

            <!-- 充值金额选择 -->
            <div class="recharge-amount-section">
              <h3 class="section-title">选择充值金额</h3>
              <div class="amount-options">
                <div
                  v-for="amount in amountOptions"
                  :key="amount.value"
                  class="amount-option"
                  :class="{ active: selectedAmount === amount.value }"
                  @click="selectAmount(amount.value)"
                >
                  <div class="amount-value">¥{{ amount.label }}</div>
                  <div class="amount-points">获得 {{ amount.points }} 积分</div>
                </div>
              </div>
              
              <!-- 自定义金额输入 -->
              <div class="custom-amount">
                <label>自定义金额：</label>
                <el-input-number
                  v-model="customAmount"
                  :min="1"
                  :max="10000"
                  :precision="2"
                  :step="1"
                  placeholder="请输入充值金额（元）"
                  style="width: 200px;"
                  @change="onCustomAmountChange"
                />
                <span class="custom-points" v-if="customAmount > 0">
                  可获得 {{ customAmount * 100 }} 积分
                </span>
              </div>
            </div>

            <!-- 支付方式选择 -->
            <div class="payment-method-section">
              <h3 class="section-title">选择支付方式</h3>
              <div class="payment-options">
                <div
                  class="payment-option"
                  :class="{ active: payChannel === 0 }"
                  @click="payChannel = 0"
                >
                  <img src="@/assets/images/pay_zfb.png" alt="支付宝" />
                  <span>支付宝</span>
                </div>
                <!-- 微信支付暂时禁用 -->
                <div
                  class="payment-option disabled"
                  title="暂未开放"
                >
                  <img src="@/assets/images/pay_wx.png" alt="微信支付" />
                  <span>微信支付</span>
                  <span class="coming-soon">敬请期待</span>
                </div>
              </div>
            </div>

            <!-- 充值说明 -->
            <div class="recharge-notice">
              <h3 class="section-title">充值说明</h3>
              <ul>
                <li>1元 = 100积分</li>
                <li>充值获得的积分为付费积分，永久有效</li>
                <li>付费积分可用于AI审核、AI润色、AI封面生成等服务</li>
                <li>支付完成后，积分将自动到账</li>
              </ul>
            </div>

            <!-- 提交按钮 -->
            <div class="submit-section">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                :disabled="!canSubmit"
                @click="handleRecharge"
                style="width: 200px;"
              >
                {{ loading ? '处理中...' : `确认充值 ¥${finalAmount}` }}
              </el-button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import AuthorHeader from "@/components/author/Header.vue";
import { getAuthorStatus, createRechargeOrder } from "@/api/author";

export default {
  name: "AuthorRecharge",
  components: {
    AuthorHeader,
  },
  setup() {
    const router = useRouter();

    const state = reactive({
      freePoints: 0,
      paidPoints: 0,
      selectedAmount: null, // 选中的固定金额（分）
      customAmount: 0, // 自定义金额（元）
      payChannel: 0, // 0-支付宝 1-微信
      loading: false,
      // 固定金额选项（单位：元）
      amountOptions: [
        { label: "10", value: 1000, points: 1000 },
        { label: "20", value: 2000, points: 2000 },
        { label: "50", value: 5000, points: 5000 },
        { label: "100", value: 10000, points: 10000 },
        { label: "200", value: 20000, points: 20000 },
        { label: "500", value: 50000, points: 50000 },
      ],
    });

    // 计算最终充值金额（分）
    const finalAmount = computed(() => {
      if (state.selectedAmount) {
        return (state.selectedAmount / 100).toFixed(2);
      } else if (state.customAmount > 0) {
        return state.customAmount.toFixed(2);
      }
      return "0.00";
    });

    // 是否可以提交
    const canSubmit = computed(() => {
      return (state.selectedAmount > 0 || state.customAmount > 0) && !state.loading;
    });

    // 加载作者积分信息
    const loadAuthorPoints = async () => {
      try {
        const { data } = await getAuthorStatus();
        if (data && typeof data === 'object') {
          state.freePoints = data.freePoints || 0;
          state.paidPoints = data.paidPoints || 0;
        }
      } catch (e) {
        console.error("Failed to load author points", e);
      }
    };

    // 选择固定金额
    const selectAmount = (amount) => {
      state.selectedAmount = amount;
      state.customAmount = 0; // 清空自定义金额
    };

    // 自定义金额变化
    const onCustomAmountChange = () => {
      if (state.customAmount > 0) {
        state.selectedAmount = null; // 清空固定金额选择
      }
    };

    // 处理充值
    const handleRecharge = async () => {
      if (!canSubmit.value) {
        return;
      }

      // 计算充值金额（分）
      let rechargeAmount = 0;
      if (state.selectedAmount) {
        rechargeAmount = state.selectedAmount;
      } else if (state.customAmount > 0) {
        rechargeAmount = Math.round(state.customAmount * 100); // 元转分
      }

      if (rechargeAmount <= 0) {
        ElMessage.warning("请选择或输入充值金额");
        return;
      }

      state.loading = true;

      try {
        const params = {
          rechargeAmount: rechargeAmount,
          payChannel: state.payChannel,
        };

        const { data } = await createRechargeOrder(params);

        if (data) {
          // 如果有支付URL，跳转到支付页面
          if (data.payUrl) {
            // 新窗口打开支付页面
            window.open(data.payUrl, '_blank');
            ElMessage.success("正在跳转到支付页面...");
            
            // 监听支付完成事件（可以通过轮询订单状态或监听窗口关闭事件）
            // 这里简化处理，提示用户支付完成后刷新页面
            setTimeout(() => {
              ElMessage.info("支付完成后，请刷新页面查看积分");
            }, 2000);
          } else if (data.payFormHtml) {
            // 如果是PC网站支付表单，可以显示在弹窗中
            ElMessage.info("请在新打开的窗口中完成支付");
          } else {
            ElMessage.warning("未获取到支付信息，请稍后重试");
          }
        }
      } catch (error) {
        console.error("创建充值订单失败:", error);
        // 错误信息已经在request拦截器中统一处理
      } finally {
        state.loading = false;
      }
    };

    onMounted(() => {
      loadAuthorPoints();

      // 监听积分变化事件
      window.addEventListener('author-points-changed', () => {
        loadAuthorPoints();
      });

      // 监听页面可见性变化，当页面重新可见时刷新积分（支付完成后返回页面）
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          loadAuthorPoints();
        }
      });
    });

    return {
      ...toRefs(state),
      finalAmount,
      canSubmit,
      selectAmount,
      onCustomAmountChange,
      handleRecharge,
    };
  },
};
</script>

<style scoped>
.recharge-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.recharge-container {
  width: 100%;
  max-width: 900px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  box-sizing: border-box;
}

.recharge-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.points-info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  color: #fff;
}

.points-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
}

.points-item:last-child {
  margin-bottom: 0;
}

.points-label {
  margin-right: 10px;
}

.points-value {
  font-size: 24px;
  font-weight: bold;
  margin-right: 10px;
}

.points-value.free {
  color: #67c23a;
}

.points-value.paid {
  color: #e6a23c;
}

.points-desc {
  font-size: 12px;
  opacity: 0.8;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
  border-left: 4px solid #409eff;
  padding-left: 10px;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.amount-option {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.amount-option:hover {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.amount-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.amount-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.amount-points {
  font-size: 14px;
  color: #909399;
}

.custom-amount {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.custom-amount label {
  font-weight: 500;
  color: #333;
}

.custom-points {
  color: #409eff;
  font-weight: 500;
}

.payment-options {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.payment-option {
  flex: 1;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
  position: relative;
}

.payment-option:hover:not(.disabled) {
  border-color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.payment-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.payment-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.payment-option img {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.payment-option span {
  display: block;
  font-size: 16px;
  color: #333;
}

.coming-soon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #f56c6c;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.recharge-notice {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.recharge-notice ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 2;
}

.recharge-notice li {
  margin-bottom: 8px;
}

.submit-section {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
  .recharge-wrapper {
    padding: 10px;
  }
  
  .recharge-container {
    padding: 20px 15px;
  }
  
  .amount-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .payment-options {
    flex-direction: column;
  }
  
  .recharge-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
}
</style>
