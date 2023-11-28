import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    Vue(),
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
