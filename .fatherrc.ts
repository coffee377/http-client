import { defineConfig } from 'father';
import { IFatherConfig } from 'father/dist/types';

export default defineConfig({
  esm: {
    // input: 'src', // 默认编译目录
    // transformer: 'babel', // 默认使用 babel 以提供更好的兼容性
  },
  // 以下为 cjs 配置项启用时的默认值，有自定义需求时才需配置
  cjs: {
    // input: 'src', // 默认编译目录
    // transformer: 'esbuild', // 默认使用 esbuild 以获得更快的构建速度
  },
  umd: {
    entry: 'src/index', // 默认构建入口文件
  },
  prebundle: {},
} as IFatherConfig);
