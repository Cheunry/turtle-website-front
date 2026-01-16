# Docker 部署说明

## 目录结构

```
turtle-website-front/
├── docker/
│   ├── Dockerfile              # Docker 镜像构建文件
│   ├── nginx.conf              # Nginx 配置文件
│   ├── docker-compose.prod.yml # 生产环境 Docker Compose 配置 ⭐ 需上传到服务器
│   └── README.md               # 本文件
├── scripts/
│   ├── deploy.sh               # 本地构建和推送脚本（推送到阿里云）
│   └── deploy-server-compose.sh # 服务器端 Docker Compose 部署脚本 ⭐ 需上传到服务器
└── docker-compose.yml          # Docker Compose 配置（用于本地测试）
```

## 核心流程

### 方式 1: 使用 GitHub Actions 构建（推荐，适合 Apple Silicon Mac）

GitHub Actions 在云端构建，网络稳定，支持跨平台构建。

#### 步骤 1: 配置 GitHub Secrets

**详细步骤：**

1. 打开你的 GitHub 仓库页面（确保代码已推送到 GitHub）
2. 点击仓库顶部的 **Settings**（设置）标签
3. 在左侧菜单中找到并点击 **Secrets and variables**（密钥和变量）
4. 点击展开 **Actions**（操作）
5. 点击右上角的 **New repository secret**（新建仓库密钥）按钮
6. 添加第一个 Secret：
   - **Name（名称）**: `ALIYUN_USERNAME`
   - **Secret（值）**: `nick0256219954`
   - 点击 **Add secret**（添加密钥）
7. 再次点击 **New repository secret**，添加第二个 Secret：
   - **Name（名称）**: `ALIYUN_PASSWORD`
   - **Secret（值）**: 你的阿里云容器镜像服务密码（开通服务时设置的密码）
   - 点击 **Add secret**（添加密钥）

**如果找不到 Settings：**
- 确保你拥有仓库的管理员权限
- 确保仓库不是 Fork 的（Fork 的仓库需要在原仓库配置）
- 尝试直接访问：`https://github.com/你的用户名/仓库名/settings/secrets/actions`

**配置完成后检查：**
在 Secrets 页面应该能看到两个 Secret：
- ✅ `ALIYUN_USERNAME`
- ✅ `ALIYUN_PASSWORD`

**如果仓库还没有创建：**
1. 在 GitHub 上创建一个新仓库
2. 将本地代码推送到 GitHub：
   ```bash
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```
3. 然后按照上面的步骤配置 Secrets

#### 步骤 2: 触发构建

**方式 A: 手动触发**
1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Build and Push Docker Image" workflow
3. 点击 "Run workflow"
4. 输入镜像版本标签（如 `v1.0.0`）
5. 点击 "Run workflow" 开始构建

**方式 B: 推送 Tag 触发**
```bash
git tag v1.0.0
git push origin v1.0.0
```

**方式 C: 推送到 main/master 分支触发**
```bash
git push origin main
```
（会自动使用 commit SHA 作为标签）

构建完成后，镜像会自动推送到阿里云容器镜像服务。

### 方式 2: 本地构建和推送镜像

使用 `scripts/deploy.sh` 构建镜像并推送到阿里云容器镜像服务：

```bash
# 1. 编辑脚本配置版本号
vim scripts/deploy.sh
# 修改: IMAGE_TAG="v1.0.0"

# 2. 给脚本添加执行权限
chmod +x scripts/deploy.sh

# 3. 执行构建和推送
./scripts/deploy.sh
```

**注意**: 如果使用 Apple Silicon Mac（M 系列芯片），本地构建可能遇到网络问题，建议使用 GitHub Actions。

**配置说明**（在 `scripts/deploy.sh` 中）：
```bash
# 阿里云容器镜像服务配置
ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com"
ALIYUN_NAMESPACE="turtle-website"
ALIYUN_REPO="code"
ALIYUN_USERNAME="nick0256219954"
IMAGE_TAG="v1.0.0"  # 修改为要推送的版本号
```

### 2. 服务器端部署

#### 步骤1: 上传文件到服务器

将以下 **2个文件**上传到服务器的**同一目录**（如 `/opt/turtle-website/`）：

1. `scripts/deploy-server-compose.sh` - 部署脚本
2. `docker/docker-compose.prod.yml` - Docker Compose 配置文件

#### 步骤2: 配置脚本

在服务器上编辑 `deploy-server-compose.sh`，修改以下配置：

```bash
# 阿里云容器镜像服务配置
ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com"
# 如果服务器在阿里云 VPC 网络，可以使用内网地址（更快）:
# ALIYUN_REGISTRY="crpi-zxhiymyhrekwsl0c-vpc.cn-beijing.personal.cr.aliyuncs.com"
ALIYUN_USERNAME="nick0256219954"
IMAGE_TAG="v1.0.0"  # 修改为要部署的版本号
```

#### 步骤3: 执行部署

```bash
# 1. 进入文件所在目录
cd /opt/turtle-website/  # 或你上传的目录

# 2. 给脚本添加执行权限
chmod +x deploy-server-compose.sh

# 3. 执行部署
./deploy-server-compose.sh
```

脚本会自动：
- 登录阿里云容器镜像服务
- 拉取指定版本的镜像
- 更新 docker-compose 文件中的镜像版本
- 停止旧容器并启动新容器

部署成功后访问：`http://服务器IP:8080`

## 本地测试

使用 Docker Compose 快速启动本地测试：

```bash
docker-compose up -d
```

访问: http://localhost:8080

停止服务：
```bash
docker-compose down
```

## 配置说明

### Docker Compose 配置（docker-compose.prod.yml）

主要配置项：

- **镜像地址**: 脚本会自动更新为阿里云镜像地址
- **端口映射**: `8080:80`（主机端口:容器端口）
- **资源限制**: CPU 和内存限制（可根据实际情况调整）
- **日志管理**: 自动轮转，单个文件最大 10MB，保留 3 个文件
- **健康检查**: 每 30 秒检查一次服务健康状态

### 环境变量（可选）

如果需要配置环境变量（如 API 地址），修改 `docker/Dockerfile`：

```dockerfile
ARG VUE_APP_BASE_API_URL
ENV VUE_APP_BASE_API_URL=$VUE_APP_BASE_API_URL
```

构建时传入：
```bash
VUE_APP_BASE_API_URL=https://api.example.com ./scripts/deploy.sh
```

## 常用命令

### 查看服务状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

### 查看日志
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### 重启服务
```bash
docker-compose -f docker-compose.prod.yml restart
```

### 停止服务
```bash
docker-compose -f docker-compose.prod.yml down
```

### 更新到新版本
1. 本地推送新版本镜像（修改 `deploy.sh` 中的 `IMAGE_TAG` 并执行）
2. 修改服务器上 `deploy-server-compose.sh` 中的 `IMAGE_TAG`
3. 重新执行部署脚本

## 注意事项

1. **首次部署前**，确保服务器已安装 Docker 和 docker-compose
2. **端口配置**: 默认使用 8080 端口，如果被占用，修改 `docker-compose.prod.yml` 中的端口映射
3. **防火墙**: 确保服务器防火墙开放对应端口
4. **镜像版本**: 建议使用版本号标签（如 v1.0.0），便于版本管理和回滚
5. **VPC 网络**: 如果服务器在阿里云 VPC 网络，使用内网地址可提升拉取速度
6. **资源限制**: 根据服务器实际情况调整内存和 CPU 限制
7. **日志管理**: 日志会自动轮转，避免占用过多磁盘空间

## 手动操作（可选）

### 手动构建镜像
```bash
docker build -f docker/Dockerfile -t crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com/turtle-website/code:v1.0.0 .
```

### 手动推送镜像
```bash
# 登录阿里云
docker login --username=nick0256219954 crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com

# 推送镜像
docker push crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com/turtle-website/code:v1.0.0
```

### 手动拉取镜像（服务器端）
```bash
# 登录阿里云
docker login --username=nick0256219954 crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com

# 拉取镜像
docker pull crpi-zxhiymyhrekwsl0c.cn-beijing.personal.cr.aliyuncs.com/turtle-website/code:v1.0.0
```
