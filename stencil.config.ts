import { Config } from "@stencil/core";
import { postcss } from "@stencil/postcss";
import postCSSPresetEnv from "postcss-preset-env";

// https://stenciljs.com/docs/config

export const config: Config = {
  plugins: [
    postcss({
      plugins: [
        postCSSPresetEnv({
          features: {
            "custom-media-queries": true,
            "nesting-rules": true
          }
        })
      ]
    })
  ],

  outputTargets: [
    {
      type: "www",
      serviceWorker: null
    }
  ],
  globalScript: "src/global/app.ts",
  globalStyle: "src/global/app.css"
};
