# 第一阶段：构建阶段
FROM node:16-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package.json yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用（如果需要环境变量，在这里传入）
# ARG VUE_APP_BASE_API_URL
# ENV VUE_APP_BASE_API_URL=$VUE_APP_BASE_API_URL

RUN yarn build

# 第二阶段：运行阶段（使用 Nginx）
FROM nginx:alpine

# 安装 curl（用于健康检查）
RUN apk add --no-cache curl

# 复制构建产物到 Nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# 确保文件权限正确（nginx:alpine 使用 root 用户运行，所以只需要设置权限）
RUN chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
