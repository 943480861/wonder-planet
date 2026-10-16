# 奇妙小星球

给 3 岁左右孩子玩的六款小游戏，共 60 关。文件都在这个文件夹里（`e:\lhc\小游戏`），不需要放到 C 盘。

## 本地打开

```bash
npm install
npm run dev
```

浏览器打开终端里显示的地址，一般是 `http://localhost:5173`。

## 构建

```bash
npm run build
npm run preview
```

构建结果在本文件夹的 `dist` 目录。

## 给别人玩

把 `dist` 里的全部文件上传到任意静态网站（需 https）。路由用的是 `#`，不用额外配置服务器跳转。微信里打开这个 https 链接就能玩，不需要登录。

用阿里云 ESA Pages 托管时，仓库根目录已有 `esa.jsonc`，会先执行 `npm install` 再构建，产物目录是 `dist`。控制台模板选 Vite 即可，不要用空的安装命令。
