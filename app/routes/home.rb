module Transitmix
  module Routes
    class Home < Sinatra::Application
      configure do
        set :root, File.expand_path('../../../', __FILE__)
        set :views, 'app/views'
        set :scss, { load_paths: ["#{root}/app/css"] }
      end

      register Sinatra::AssetPack

      assets do
        js :app, [
          '/js/app.js',
          '/js/utils.js',
          '/js/framework/*.js',
          '/js/controllers/*.js',
          '/js/data/*.js',
          '/js/models/*.js',
          '/js/collections/*.js',
          '/js/views/*.js',
          '/js/routers/*.js',
        ]

        css :app, [
          '/css/style.css',
         ]

        js_compression :uglify
        css_compression :sass
      end

      get '/*' do
        erb :index
      end
    end
  end
end
