// // import { defineConfig } from "vite";
// // import react from "@vitejs/plugin-react";

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [
// //     react({
// //       jsxImportSource: "@emotion/react", // opcional, só se usar @emotion
// //       babel: {
// //         parserOpts: {
// //           plugins: ["jsx"],
// //         },
// //       },
// //     }),
// //   ],
// //   esbuild: {
// //     loader: "jsx", // Processa todos os .js como JSX
// //   },
// //   optimizeDeps: {
// //     esbuildOptions: {
// //       loader: {
// //         ".js": "jsx", // Transforma .js em .jsx
// //       },
// //     },
// //   },
// // });
// // vite.config.js
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:3000", // porta do backend
//         changeOrigin: true,
//         secure: false,
//         // Opcional: logs para debug
//         onProxyReq: (proxyReq, req, res) => {
//           console.log("Proxy:", req.method, req.url);
//         },
//         onProxyRes: (proxyRes, req, res) => {
//           if (proxyRes.statusCode === 404) {
//             console.error("Rota não encontrada no backend:", req.url);
//           }
//         },
//       },
//     },
//   },
// });
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // ← porta do seu backend
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // mantém o caminho
      },
    },
    port: 5173, // opcional: define a porta
  },
});
