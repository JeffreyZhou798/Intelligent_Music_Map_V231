# Quick Deploy Guide - 快速部署指南

## 🚀 Vercel 一键部署（推荐）

### 方法1：通过Vercel Dashboard

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择你的GitHub仓库
   - 选择 `intelligent-music-map-V231` 文件夹

3. **配置环境变量**
   - 在 "Environment Variables" 部分
   - 添加：`ZHIPU_API_KEY` = `你的智谱AI密钥`
   - 应用到：Production, Preview, Development

4. **部署**
   - 点击 "Deploy"
   - 等待2-3分钟
   - 获得部署链接：`https://your-project.vercel.app`

### 方法2：通过Vercel CLI

```bash
# 安装Vercel CLI
npm i -g vercel

# 进入项目目录
cd intelligent-music-map-V231

# 登录Vercel
vercel login

# 部署
vercel

# 添加环境变量
vercel env add ZHIPU_API_KEY

# 生产部署
vercel --prod
```

## 📦 GitHub Pages 部署

### 前提条件
- 代码已推送到GitHub
- 仓库设置中启用GitHub Pages

### 部署步骤

```bash
cd intelligent-music-map-V231

# 构建并部署
npm run deploy
```

部署后访问：`https://your-username.github.io/your-repo-name/`

**注意**：GitHub Pages不支持serverless函数，需要：
- 使用Mock模式测试，或
- 配置外部API代理服务器

## 🧪 本地测试（部署前验证）

### 快速测试（Mock模式）

```bash
cd intelligent-music-map-V231
npm install
npm run dev
```

访问：`http://localhost:3000`

### 测试生产构建

```bash
npm run build
npm run preview
```

访问：`http://localhost:4173`

## ✅ 部署检查清单

### 部署前
- [ ] 代码已推送到GitHub
- [ ] `.env` 文件在 `.gitignore` 中（已配置）
- [ ] 已获取智谱AI API密钥
- [ ] 本地测试通过

### Vercel部署后
- [ ] 环境变量已配置
- [ ] 构建成功（无错误）
- [ ] 访问部署链接正常
- [ ] 上传MusicXML文件测试
- [ ] AI分析功能正常
- [ ] 视觉编辑器正常
- [ ] 预览播放正常
- [ ] 导出功能正常

### GitHub Pages部署后
- [ ] 页面可访问
- [ ] Mock模式已启用
- [ ] 基本功能正常

## 🔗 获取部署链接

### Vercel
部署成功后，Vercel会提供：
- **Production URL**: `https://your-project.vercel.app`
- **Preview URLs**: 每次push自动生成预览链接

在Vercel Dashboard查看：
- Project → Deployments → 点击最新部署 → 查看URL

### GitHub Pages
格式：`https://[username].github.io/[repository-name]/`

在GitHub仓库查看：
- Settings → Pages → 查看部署链接

## 🐛 常见问题

### Q: Vercel构建失败
**A**: 检查：
- Node.js版本（需要16+）
- package.json中的依赖是否完整
- 查看构建日志找到具体错误

### Q: API调用失败
**A**: 检查：
- 环境变量 `ZHIPU_API_KEY` 是否正确配置
- API密钥是否有效
- 查看浏览器控制台错误信息

### Q: 页面空白
**A**: 检查：
- 浏览器控制台是否有错误
- 清除浏览器缓存
- 尝试无痕模式

### Q: 文件上传失败
**A**: 检查：
- 文件格式（.mxl, .musicxml, .mp3）
- 文件大小（建议<50MB）
- 浏览器是否支持File API

## 📊 性能优化建议

### Vercel部署
- ✅ 已配置代码分割（element-plus, gsap, d3）
- ✅ 已配置资源压缩
- ✅ 已配置缓存策略

### 进一步优化
- 启用Vercel Analytics监控性能
- 使用Vercel Edge Network加速
- 配置自定义域名

## 🎯 测试部署

部署完成后，使用示例文件测试：

1. **访问部署链接**
2. **上传测试文件**：
   - MusicXML: `CompositionExamples/Mozart Piano K.545 First Movement/sonata-no-16-1st-movement-k-545.mxl`
   - MP3: `CompositionExamples/Mozart Piano K.545 First Movement/sonata-no-16-1st-movement-k-545.mp3`
3. **验证功能**：
   - AI分析（30-60秒）
   - 视觉编辑
   - 预览播放
   - 导出功能

## 📞 获取帮助

- **Vercel文档**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Pages文档**: [docs.github.com/pages](https://docs.github.com/pages)
- **项目文档**: 查看 `README.md`, `DEPLOYMENT_GUIDE.md`

---

**预计部署时间**：
- Vercel: 5-10分钟（首次）
- GitHub Pages: 3-5分钟

**推荐部署方式**：Vercel（支持serverless函数，功能完整）
