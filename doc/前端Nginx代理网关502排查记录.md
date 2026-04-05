# 前端 Nginx 代理网关 502 / 404 排查记录

## 现象

- 浏览器访问：`http://<公网IP>:1024/api/front/user/sse/user/connect`（及同类 `/api/...`）返回 **502 Bad Gateway**。
- 端口 **1024** 映射为前端容器 `turtle-website-front`（Nginx），**8080** 映射为 `novel-gateway`。
- Nacos `prod_namespace` 下服务列表正常，曾误判为命名空间或注册问题。

## 已排除的原因

| 方向 | 结论 |
|------|------|
| Nacos 命名空间 ID | 与 `docker-compose.prod.yml` 中 `NACOS_NAMESPACE_ID=prod_namespace` 一致，非主因。 |
| 网关 → 用户服务 | 在 `novel-gateway` 容器内访问 `http://novel-user-service:9060/actuator/health` 正常 `UP`。 |
| Spring Cloud Gateway | 宿主机 `curl http://127.0.0.1:8080/api/...` 返回业务响应（如 200 + JSON），网关与下游正常。 |
| Nginx `proxy_pass` 写错 | 初版固定主机名时路径正确；改为变量后若仍带 `/api/` 后缀可能触发路径异常（见下文附录）。 |
| Docker 网络 | `common-network` 内包含网关、用户服务、前端、Nacos 等，连通性正常。 |

## 根因

- Nginx 使用 **`proxy_pass http://novel-gateway:8888/...`**（主机名为固定字面量）时，对上游主机名的解析行为容易导致：**在加载配置/进程启动时解析一次 IP，之后长期复用**。
- **`novel-gateway` 容器重建后会获得新的容器内网 IP**；而 **`turtle-website-front` 若长时间未重启**（例如仅重新部署后端镜像），其内的 Nginx 仍向 **旧 IP** 建连 → 上游连接失败 → **502**。
- 因此：**502 仅出现在经 1024（前端 Nginx）访问时**；直连 **8080（网关）** 正常，与上述结论一致。

## 临时恢复

在服务器执行：

```bash
docker restart turtle-website-front
```

重启后 Nginx 重新解析 `novel-gateway`，502 消失。

## 长期修复（已实现）

仓库 **`turtle-website-front`** 中 `docker/nginx.conf`：

1. 增加 **`resolver 127.0.0.11 valid=10s ipv6=off;`**（Docker 内嵌 DNS，仅容器环境有效）。
2. 将上游改为变量形式，并用 **`proxy_pass http://$gateway_upstream:8888$request_uri;`**（勿写成 `...8888/api/;`）：在带 **resolver** 时既要动态解析，又要避免 Nginx 对「变量 + 固定 URI 后缀」处理异常导致 **上游路径错误 → 404**。
3. 为 SSE 等长连接补充 **`proxy_buffering off;`**、**`proxy_read_timeout 3600s;`**（按需可再调）。

部署：**重新构建并发布前端镜像**后生效；之后单独重建网关容器一般**不必**再手动重启前端。

## 运维建议

- 仅部署后端、未改前端镜像时：若仍使用**旧版** Nginx 配置，建议在网关容器重建后 **顺带重启前端容器**，或尽快上线上述 Nginx 修改。
- 本地 `npm run dev` 不使用该 `nginx.conf`，不受影响；本地用 Docker 跑前端镜像时，仍需与网关处于同一 Docker 网络且能解析 `novel-gateway`。

## 相关文件

| 说明 | 路径 |
|------|------|
| 生产编排（网关端口、前端端口） | `docker-compose.prod.yml` |
| Nacos 与命名空间说明 | `doc/note/NACOS_本地与生产环境配置说明.md` |
| 前端 Nginx（动态解析 + SSE） | `turtle-website-front/docker/nginx.conf` |

## 附录：与 `bootstrap` 里 `spring.profiles.active: dev` 的关系

- **`docker-compose.prod.yml`** 中已设置 **`SPRING_PROFILES_ACTIVE: prod`** 时，Spring Boot 会以环境变量为准，**通常会覆盖** 各服务 `bootstrap.yml` 里的 `spring.profiles.active: dev`，实际激活的仍是 **prod**（以启动日志中 `The following 1 profile is active: "prod"` 为准）。
- 若怀疑未生效：在容器内执行 `echo $SPRING_PROFILES_ACTIVE`，或访问 Actuator 的 `env`/`conditions` 查看。
- **404 若仅出现在经 1024 的访问**，而直连 **8080** 正常，则优先查 **Nginx**，而非 Profile。

---

*记录整理自一次线上 502 / 404 排查；日期以 Git 提交为准。*
