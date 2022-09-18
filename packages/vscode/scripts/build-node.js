const { watchMode } = require("./utils.js");
const isDev = process.argv.includes("--watch");

require("esbuild")
  .build({
    entryPoints: {
      extension: "./src/extension.ts",
    },
    bundle: true,
    sourcemap: isDev ? true : false,
    outdir: "./dist",
    external: ["vscode"],
    format: "cjs",
    platform: "node",
    tsconfig: "./tsconfig.json",
    minify: isDev ? false : true,
    watch: isDev ? watchMode : false,
    plugins: [
      {
        name: "umd2esm",
        setup(build) {
          build.onResolve(
            { filter: /^(vscode-.*|estree-walker|jsonc-parse)/ },
            (args) => {
              const pathUmd = require.resolve(args.path, {
                paths: [args.resolveDir],
              });
              const pathEsm = pathUmd.replace("/umd/", "/esm/");
              return { path: pathEsm };
            }
          );
        },
      },
    ],
  })
  .catch(() => process.exit(1));
