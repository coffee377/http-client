import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import Components from "unplugin-vue-components/vite";
import tailwindcss from "@tailwindcss/vite";
import Vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import { resolve, sep } from "path";

const pathResolve = (find: string, dir?: string) => {
  return resolve(process.cwd(), ...Array.from(dir ? [dir] : [])) + sep;
};

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /@@\//,
        replacement: pathResolve(__dirname),
      },
      {
        find: /@\//,
        replacement: pathResolve(__dirname, "src"),
      },
    ],
  },
  plugins: [
    tailwindcss(),
    Vue({
      template: {
        compilerOptions: {
          // 将所有以deep-开头的标签视为自定义元素
          isCustomElement: (tag) => tag == "deep-chat",
        },
      },
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // css in js
        }),
      ],
    }),
  ],

  server: {
    host: true,
    // open: true,
    proxy: {
      "/api/oss": {
        target: "http://localhost:9001",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/oss/, "/api"),
      },
    },
  },
  build: {
    // lib: {
    //   // Could also be a dictionary or array of multiple entry points
    //   entry: resolve(__dirname, 'src/index.ts'),
    //   name: 'http',
    //   formats: ['es', 'umd', 'cjs'],
    //   // the proper extensions will be added
    //   // fileName: 'my-lib',
    // },
    // rollupOptions: {
    //   // 确保外部化处理那些你不想打包进库的依赖
    //   external: ['vue'],
    //   output: {
    //     // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
    //     globals: {
    //       vue: 'Vue',
    //     },
    //   },
    // },
  },
});
