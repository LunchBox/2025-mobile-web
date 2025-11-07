# 项目构建说明

## 🎯 构建目标

将Vue项目构建成**可以直接双击打开使用**的独立网页版本，无需任何服务器。

## 🚀 快速开始

### 方法1：使用批处理文件（推荐）
```bash
双击运行 build.bat
```

### 方法2：使用命令行
```bash
npm run build
```

### 方法3：直接运行Node脚本
```bash
node build.js
```

## 📦 构建过程

构建脚本会自动完成以下操作：

1. **读取所有JSON数据文件**
   - 从 `data/` 目录读取所有课程数据
   - 包括 page-1.json, page-2.json 等

2. **内嵌数据到JavaScript**
   - 将所有JSON数据转换为JavaScript对象
   - 内嵌到 app.js 和 detail.js 中
   - 这样就不需要通过fetch加载外部文件

3. **修改数据加载逻辑**
   - 将原来的 `fetch()` 改为直接读取内嵌数据
   - 移除对服务器的依赖

4. **复制必要文件**
   - HTML文件（index.html, detail.html）
   - CSS文件（styles.css）
   - 图片文件夹（images/）

5. **生成输出**
   - 所有文件输出到 `dist/` 目录
   - 创建使用说明 README.md

## 📁 输出结构

```
dist/
├── index.html          # 主页面（双击打开）
├── detail.html         # 课程详情页
├── app.js             # 主应用逻辑（已内嵌数据）
├── detail.js          # 详情页逻辑（已内嵌数据）
├── styles.css         # 样式文件
├── images/            # 课程图片
│   ├── default.png
│   ├── CM429.png
│   └── ...
└── README.md          # 使用说明
```

## ✅ 构建后的特点

### 1. 完全独立
- ✅ 无需Web服务器
- ✅ 无需Node.js环境
- ✅ 无需任何依赖
- ✅ 双击即可使用

### 2. 数据内嵌
- ✅ 所有课程数据已内嵌到JS文件
- ✅ 不依赖外部JSON文件
- ✅ 避免CORS问题
- ✅ 加载速度更快

### 3. 功能完整
- ✅ 课程列表展示
- ✅ 搜索功能
- ✅ 排序功能
- ✅ 分页功能
- ✅ 课程详情
- ✅ 报名表单
- ✅ 中英文切换

## 🎉 使用构建后的文件

### 本地使用
1. 进入 `dist` 目录
2. 双击打开 `index.html`
3. 在浏览器中直接使用

### 分享给他人
1. 将整个 `dist` 文件夹打包成ZIP
2. 发送给他人
3. 解压后双击 `index.html` 即可使用

### 部署到网站
将 `dist` 文件夹中的所有文件上传到：
- GitHub Pages
- Netlify
- Vercel
- 任何静态网站托管服务
- 传统Web服务器

## 🔧 技术实现

### 原理说明

**问题**：直接打开HTML文件时，浏览器使用 `file://` 协议，无法通过 `fetch()` 加载本地JSON文件（CORS限制）。

**解决方案**：
1. 在构建时读取所有JSON文件
2. 将数据转换为JavaScript对象
3. 直接写入到JS文件中作为常量
4. 修改数据加载函数，从内嵌数据读取而不是fetch

### 代码示例

**构建前（需要服务器）：**
```javascript
async loadCourses(pageNumber = 1) {
    const resp = await fetch(`data/page-${pageNumber}.json`);
    const data = await resp.json();
    // ...
}
```

**构建后（可直接打开）：**
```javascript
const EMBEDDED_COURSE_DATA = {
    page1: { courses: [...] },
    page2: { courses: [...] },
    // ...
};

async loadCourses(pageNumber = 1) {
    const data = EMBEDDED_COURSE_DATA[`page${pageNumber}`];
    // ...
}
```

## 📊 构建统计

构建完成后会显示：
- 文件总数
- 目录总数
- 总文件大小
- 数据页数
- 总课程数

## ⚠️ 注意事项

1. **图片文件**
   - 图片仍然是外部文件
   - 需要保持在 images ��件夹中
   - 不要修改相对路径

2. **数据更新**
   - 如果要更新课程数据
   - 需要修改源文件后重新构建
   - 不能直接修改dist中的文件

3. **浏览器兼容性**
   - 需要现代浏览器（支持ES6+）
   - 推荐使用Chrome、Firefox、Edge

## 🐛 故障排除

### 问题1：构建失败
**解决方案**：
- 确保已安装Node.js
- 检查 data 文件夹是否存在
- 检查JSON文件格式是否正确

### 问题2：打开后显示空白
**解决方案**：
- 按F12打开浏览器控制台查看错误
- 确保所有文件都在同一目录
- 检查images文件夹是否存在

### 问题3：图片不显示
**解决方案**：
- 确保images文件夹已复制到dist
- 检查图片文件名是否正确
- 查看浏览器控制台的404错误

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台（F12）的错误信息
2. dist/README.md 中的使用说明
3. 确保所有文件完整复制

---

构建时间：${new Date().toLocaleString('zh-CN')}
