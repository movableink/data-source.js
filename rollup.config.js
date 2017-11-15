import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';

export default {
  entry: './src/index.ts',

  plugins: [
    resolve(),
    typescript()
  ]
}
