#!/bin/bash

# 本地构建和推送脚本（不包含服务器部署）
# 服务器部署请使用 scripts/deploy-server.sh 在服务器上执行

# ==================== 配置区域 ====================
# Docker 镜像配置
DOCKER_USERNAME="cheunrywang"
IMAGE_NAME="turtle-website"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# 镜像版本标签（直接在这里指定版本号）
IMAGE_TAG="v1.0.0"  # 修改为需要的版本号，如: v1.0.0, v1.0.1, latest 等

# 阿里云容器镜像服务配置
ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com"
ALIYUN_NAMESPACE="turtle-website"
ALIYUN_REPO="code"
ALIYUN_USERNAME="nick0256219954"
ALIYUN_FULL_IMAGE="${ALIYUN_REGISTRY}/${ALIYUN_NAMESPACE}/${ALIYUN_REPO}"

# 推送目标选择
PUSH_TO_DOCKERHUB="false"  # 是否推送到 Docker Hub
PUSH_TO_ALIYUN="true"      # 是否推送到阿里云（推荐）

# 环境变量（如果需要）
# VUE_APP_BASE_API_URL="https://api.example.com"

# 基础镜像配置
# 如果国内网络访问 Docker Hub 较慢，请先配置 Docker 镜像加速器：
# 1. 创建或编辑 /etc/docker/daemon.json
# 2. 添加以下内容：
#    {
#      "registry-mirrors": [
#        "https://docker.mirrors.ustc.edu.cn",
#        "https://hub-mirror.c.163.com"
#      ]
#    }
# 3. 重启 Docker: sudo systemctl restart docker
# 脚本会在构建前先拉取基础镜像，利用镜像加速器配置
# ==================== 配置区域结束 ====================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "构建并推送 Docker 镜像"
echo "=========================================="
echo "镜像: ${FULL_IMAGE_NAME}:${IMAGE_TAG}"
if [ "$PUSH_TO_ALIYUN" = "true" ]; then
    echo "阿里云: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"
fi
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未安装 Docker，请先安装 Docker"
    exit 1
fi

# 构建 Docker 镜像
STEP_COUNT=3
if [ "$PUSH_TO_DOCKERHUB" = "true" ] && [ "$PUSH_TO_ALIYUN" = "true" ]; then
    STEP_COUNT=4
elif [ "$PUSH_TO_DOCKERHUB" = "true" ] || [ "$PUSH_TO_ALIYUN" = "true" ]; then
    STEP_COUNT=3
else
    echo "❌ 错误: 至少需要选择一个推送目标（Docker Hub 或阿里云）"
    exit 1
fi

echo "📦 步骤 1/${STEP_COUNT}: 构建 Docker 镜像..."
echo "   平台: linux/amd64（确保服务器兼容性）"
echo "   提示: 如果拉取基础镜像较慢，请配置 Docker 镜像加速器（见脚本注释）"
echo ""
echo "   正在拉取基础镜像（利用 Docker 镜像加速器配置）..."
docker pull --platform linux/amd64 node:16-alpine || {
    echo "   ⚠️  基础镜像拉取失败，尝试继续构建（可能使用本地缓存）"
}
docker pull --platform linux/amd64 nginx:alpine || {
    echo "   ⚠️  基础镜像拉取失败，尝试继续构建（可能使用本地缓存）"
}
echo ""

# 检测本地架构
LOCAL_ARCH=$(docker version --format '{{.Server.Arch}}' 2>/dev/null || echo "unknown")
echo "   本地架构: $LOCAL_ARCH"

# 如果本地是 amd64 架构，直接使用传统 docker build（可以使用镜像加速器）
# 否则使用 buildx 进行跨平台构建
if [ "$LOCAL_ARCH" = "amd64" ]; then
    echo "   使用传统构建方式（本地架构匹配，可使用镜像加速器）"
    USE_BUILDX=false
elif docker buildx version &> /dev/null; then
    echo "   使用 buildx 进行跨平台构建..."
    USE_BUILDX=true
    BUILDX_BUILDER="turtle-website-builder"
    if ! docker buildx inspect $BUILDX_BUILDER &> /dev/null; then
        echo "   创建 buildx builder..."
        docker buildx create \
            --name $BUILDX_BUILDER \
            --driver docker-container \
            --use \
            2>/dev/null || docker buildx use $BUILDX_BUILDER
    else
        docker buildx use $BUILDX_BUILDER 2>/dev/null || true
    fi
else
    echo "   ⚠️  未检测到 buildx，尝试使用传统构建方式"
    USE_BUILDX=false
fi

if [ "$USE_BUILDX" = "true" ]; then
    echo "   开始构建（buildx 跨平台构建）..."
        if [ -n "$VUE_APP_BASE_API_URL" ]; then
            echo "   使用环境变量: VUE_APP_BASE_API_URL=$VUE_APP_BASE_API_URL"
            docker buildx build \
                --platform linux/amd64 \
                -f docker/Dockerfile \
                --build-arg VUE_APP_BASE_API_URL="$VUE_APP_BASE_API_URL" \
                -t ${FULL_IMAGE_NAME}:${IMAGE_TAG} \
                -t ${FULL_IMAGE_NAME}:latest \
                --load \
                .
        else
            docker buildx build \
                --platform linux/amd64 \
                -f docker/Dockerfile \
                -t ${FULL_IMAGE_NAME}:${IMAGE_TAG} \
                -t ${FULL_IMAGE_NAME}:latest \
                --load \
                .
        fi
else
    # 使用传统 docker build（本地是 amd64 或 buildx 不可用）
    echo "   开始构建（传统方式，使用镜像加速器）..."
    if [ -n "$VUE_APP_BASE_API_URL" ]; then
        echo "   使用环境变量: VUE_APP_BASE_API_URL=$VUE_APP_BASE_API_URL"
        docker build \
            --platform linux/amd64 \
            -f docker/Dockerfile \
            --build-arg VUE_APP_BASE_API_URL="$VUE_APP_BASE_API_URL" \
            -t ${FULL_IMAGE_NAME}:${IMAGE_TAG} \
            -t ${FULL_IMAGE_NAME}:latest \
            .
    else
        docker build \
            --platform linux/amd64 \
            -f docker/Dockerfile \
            -t ${FULL_IMAGE_NAME}:${IMAGE_TAG} \
            -t ${FULL_IMAGE_NAME}:latest \
            .
    fi
fi

if [ $? -ne 0 ]; then
    echo "❌ 镜像构建失败"
    exit 1
fi
echo "✅ 镜像构建成功"

# 给镜像打标签（阿里云）
if [ "$PUSH_TO_ALIYUN" = "true" ]; then
    echo ""
    echo "🏷️  步骤 2/${STEP_COUNT}: 给镜像打标签（阿里云）..."
    docker tag ${FULL_IMAGE_NAME}:${IMAGE_TAG} ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}
    docker tag ${FULL_IMAGE_NAME}:${IMAGE_TAG} ${ALIYUN_FULL_IMAGE}:latest
    echo "✅ 标签创建成功"
fi

# 登录并推送
STEP_NUM=2
if [ "$PUSH_TO_ALIYUN" = "true" ]; then
    STEP_NUM=$((STEP_NUM + 1))
    echo ""
    echo "🔐 步骤 ${STEP_NUM}/${STEP_COUNT}: 登录阿里云容器镜像服务..."
    echo "   用户名: $ALIYUN_USERNAME"
    echo "   密码: "
    docker login --username=$ALIYUN_USERNAME ${ALIYUN_REGISTRY}
    if [ $? -ne 0 ]; then
        echo "❌ 阿里云登录失败"
        exit 1
    fi
    echo "✅ 登录成功"
    
    STEP_NUM=$((STEP_NUM + 1))
    echo ""
    echo "📤 步骤 ${STEP_NUM}/${STEP_COUNT}: 推送镜像到阿里云..."
    docker push ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}
    if [ "$IMAGE_TAG" != "latest" ]; then
        docker push ${ALIYUN_FULL_IMAGE}:latest
    fi
    if [ $? -ne 0 ]; then
        echo "❌ 镜像推送失败"
        exit 1
    fi
    echo "✅ 镜像推送成功: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"
fi

if [ "$PUSH_TO_DOCKERHUB" = "true" ]; then
    STEP_NUM=$((STEP_NUM + 1))
    echo ""
    echo "🔐 步骤 ${STEP_NUM}/${STEP_COUNT}: 登录 Docker Hub..."
    echo "   ⚠️  注意: Docker Hub 需要使用 Personal Access Token (PAT)"
    echo "   1. 访问 https://hub.docker.com/settings/security"
    echo "   2. 创建新的 Access Token"
    echo "   3. 复制 Token，在下面输入（不会显示）"
    echo ""
    echo "   用户名: $DOCKER_USERNAME"
    echo "   密码/Token: "
    docker login -u $DOCKER_USERNAME
    if [ $? -ne 0 ]; then
        echo "❌ Docker Hub 登录失败"
        exit 1
    fi
    echo "✅ 登录成功"
    
    STEP_NUM=$((STEP_NUM + 1))
    echo ""
    echo "📤 步骤 ${STEP_NUM}/${STEP_COUNT}: 推送镜像到 Docker Hub..."
    docker push ${FULL_IMAGE_NAME}:${IMAGE_TAG}
    if [ "$IMAGE_TAG" != "latest" ]; then
        docker push ${FULL_IMAGE_NAME}:latest
    fi
    if [ $? -ne 0 ]; then
        echo "❌ 镜像推送失败"
        exit 1
    fi
    echo "✅ 镜像推送成功: ${FULL_IMAGE_NAME}:${IMAGE_TAG}"
fi

echo ""
echo "=========================================="
echo "✅ 构建和推送完成！"
echo "=========================================="
if [ "$PUSH_TO_ALIYUN" = "true" ]; then
    echo "阿里云镜像: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"
fi
if [ "$PUSH_TO_DOCKERHUB" = "true" ]; then
    echo "Docker Hub: ${FULL_IMAGE_NAME}:${IMAGE_TAG}"
fi
echo ""
echo "📋 下一步: 在服务器上部署"
echo "   1. 将 scripts/deploy-server-compose.sh 和 docker/docker-compose.prod.yml 上传到服务器"
echo "   2. 在服务器上编辑 deploy-server-compose.sh，设置 DOMESTIC_REGISTRY"
echo "   3. 执行: chmod +x deploy-server-compose.sh && ./deploy-server-compose.sh"
echo ""
