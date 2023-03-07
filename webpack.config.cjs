const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: "development",
  entry: {
    core: {
      import: "./core/core.js"
    },
    datastore: {
      import: './datastore/datastore.js'
    },
    desktop: {
      import: './desktop/desktop.js'
    },
    event: {
      import: './event/event.js'
    },
    responder: {
      import: './responder/responder.js'
    },
    statechart: {
      import: './statechart/statechart.js',
    },
    view: {
      import: './view/view.js'
    },
    testing: {
      import: './testing/testing.js'
    },
    sproutcore_global: {
      import: "./sproutcore.js",
    },
    sproutcore_css: {
      import: './sproutcore_css.js'
    },
    aki_theme: {
      import: './themes/aki/theme.js'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      // $: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
      // jQuery: path.resolve(__dirname, 'node_modules/jquery/dist/jquery.slim.js'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  output: {
    assetModuleFilename: `assets/[name].[hash][ext][query]`,
  },
  module: {

    rules: [
      {
        test: /\.(png|jpg|gif|svg|xls)$/,
        type: 'asset/resource',
      },
      {
        test: /\.s?css$/,
        use: [
          {
              loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
                // additionalData: (content: string): string => {
                //     // replace $theme. by #{$theme}.
                //     // Sadly this doesn't work, because if files are @imported which by themselves also use unwrapped $theme, it still causes an error.
                //     // as the import still uses the unwrapped $theme...
                //     // the only way seems to be to hack the sass-loader to do the replace for us... _not_ nice, and it seems to be much easier
                //     // to simply replace it by hand...
                //     //
                //     const regexp = /\$theme\./gi;
                //     const newContent = content.replace(regexp, '#{$theme}.');
                //     return `@import "./apps/carta/resources/_theme.scss"; \n ${newContent}`;
                // },
                sassOptions: {
                    includePaths: [
                        path.resolve(
                            './node_modules/compass-mixins-fixed/lib'
                        ),
                    ],
                },
            },
        },
        ],
      },
    ]
  }
}