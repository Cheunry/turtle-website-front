#!/bin/bash

# 服务器端使用 docker-compose 部署脚本
# 使用方法: 将此脚本和 docker-compose.prod.yml 上传到服务器，然后在服务器上执行

# ==================== 配置区域 ====================
# 阿里云容器镜像服务配置
ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com"
# 如果服务器在阿里云 VPC 网络，可以使用内网地址（更快）:
# ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c-vpc.cn-beijing.personal.cr.aliyuncs.com"
ALIYUN_NAMESPACE="turtle-website"
ALIYUN_REPO="code"
ALIYUN_USERNAME="nick0256219954"
ALIYUN_FULL_IMAGE="${ALIYUN_REGISTRY}/${ALIYUN_NAMESPACE}/${ALIYUN_REPO}"

IMAGE_TAG="v1.0.0"  # 修改为要部署的版本号

# docker-compose 文件路径（相对于脚本位置）
COMPOSE_FILE="docker-compose.prod.yml"
# 如果文件在其他位置，修改为完整路径，如: /opt/turtle-website/docker-compose.prod.yml
# ==================== 配置区域结束 ====================

set -e

echo "=========================================="
echo "使用 Docker Compose 部署"
echo "=========================================="
echo "镜像: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未安装 Docker"
    exit 1
fi

# 检查 docker-compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: 未安装 docker-compose"
    echo "   安装方法:"
    echo "   curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "   chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

# 检查 compose 文件
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ 错误: 找不到 docker-compose 文件: $COMPOSE_FILE"
    echo "   请确保 docker-compose.prod.yml 文件在脚本同目录下"
    exit 1
fi

# 更新 docker-compose 文件中的镜像版本
echo "📝 更新 docker-compose 文件中的镜像版本..."
sed -i.bak "s|image:.*turtle-website.*|image: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}|g" "$COMPOSE_FILE"
echo "✅ 已更新镜像版本为: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"

# 登录阿里云容器镜像服务
echo ""
echo "🔐 登录阿里云容器镜像服务..."
echo "   用户名: $ALIYUN_USERNAME"
echo "   仓库地址: $ALIYUN_REGISTRY"
echo "   提示: 密码为开通服务时设置的密码，可在访问凭证页面修改"
docker login --username=$ALIYUN_USERNAME ${ALIYUN_REGISTRY}
if [ $? -ne 0 ]; then
    echo "❌ 阿里云登录失败"
    echo ""
    echo "💡 提示:"
    echo "   1. 确认用户名是否正确: $ALIYUN_USERNAME"
    echo "   2. 确认密码是否为开通服务时设置的密码"
    echo "   3. 可在阿里云控制台的访问凭证页面修改密码"
    exit 1
fi
echo "✅ 登录成功"

# 拉取最新镜像
echo ""
echo "📥 拉取镜像: ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}"
docker pull ${ALIYUN_FULL_IMAGE}:${IMAGE_TAG}
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 镜像拉取失败"
    echo ""
    echo "💡 可能的原因:"
    echo "   1. 镜像版本不存在，请确认 ${IMAGE_TAG} 是否正确"
    echo "   2. 网络连接问题，请检查网络"
    echo "   3. 如果服务器在阿里云 VPC 网络，可以修改脚本使用内网地址（更快）"
    exit 1
fi
echo "✅ 镜像拉取成功"

# 停止并删除旧容器
echo ""
echo "🛑 停止旧容器..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$COMPOSE_FILE" down 2>/dev/null || echo "   容器不存在，跳过"
else
    docker compose -f "$COMPOSE_FILE" down 2>/dev/null || echo "   容器不存在，跳过"
fi

# 启动服务
echo ""
echo "🚀 启动服务..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$COMPOSE_FILE" up -d
else
    docker compose -f "$COMPOSE_FILE" up -d
fi

if [ $? -ne 0 ]; then
    echo "❌ 服务启动失败"
    exit 1
fi

# 等待服务启动
echo ""
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "📊 检查服务状态..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$COMPOSE_FILE" ps
else
    docker compose -f "$COMPOSE_FILE" ps
fi

# 查看日志
echo ""
echo "📋 服务日志（最后20行）:"
if command -v docker-compose &> /dev/null; then
    docker-compose -f "$COMPOSE_FILE" logs --tail 20
else
    docker compose -f "$COMPOSE_FILE" logs --tail 20
fi

echo ""
echo "=========================================="
echo "✅ 部署完成！"
echo "=========================================="
echo "访问地址: http://$(hostname -I | awk '{print $1}'):8080"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose -f $COMPOSE_FILE logs -f"
echo "  查看状态: docker-compose -f $COMPOSE_FILE ps"
echo "  停止服务: docker-compose -f $COMPOSE_FILE down"
echo "  重启服务: docker-compose -f $COMPOSE_FILE restart"
echo "  查看资源使用: docker stats turtle-website-front"
echo ""
