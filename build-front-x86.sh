#!/bin/bash

# 设置目标架构为 x86_64 (服务器通用架
PLATFORM="linux/amd64"
VERSION="latest"
OUTPUT_FILE="turtle-front-images.tar"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 清理可能存在的旧 builder
docker buildx rm turtle-front-builder > /dev/null 2>&1 || true

echo -e "${YELLOW}提示: 请确保已在 Docker Desktop 设置中配置了代理 (Settings -> Resources -> Proxies)${NC}"
echo -e "${YELLOW}      HTTP/HTTPS Proxy: http://127.0.0.1:7897${NC}"
echo ""

# 2. Docker 构建 (x86_64)
echo -e "${GREEN}>>> 开始构建 Docker 镜像 ($PLATFORM)...${NC}"
echo -e "${YELLOW}注意: 这将在 Docker 容器内进行编译，首次运行需要下载依赖，可能较慢。${NC}"

# 使用 Dockerfile.x86 构建
# --platform $PLATFORM 指定最终镜像架构
# Dockerfile.x86 内部使用了 FROM --platform=$BUILDPLATFORM ... AS builder 
# 这意味着编译阶段会在本地架构 (ARM) 上运行，速度很快，只有最终打包阶段才切换到 x86
docker buildx build --platform $PLATFORM -f Dockerfile.x86 -t turtle-website-front:$VERSION --load .

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败: turtle-website-front${NC}"
    echo -e "${YELLOW}请检查 Docker Desktop 是否已配置代理，或者尝试更换网络${NC}"
    exit 1
fi

# 3. 导出镜像
echo -e "${GREEN}>>> 正在导出镜像到 $OUTPUT_FILE (这可能需要几分钟)...${NC}"

docker save -o $OUTPUT_FILE turtle-website-front:$VERSION

echo -e "${GREEN}>>> 成功！请将 $OUTPUT_FILE 上传到服务器${NC}"
