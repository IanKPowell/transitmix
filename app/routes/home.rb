module Transitmix
  module Routes
    class Home < Sinatra::Application
      configure do
        set :root, File.expand_path('../../../', __FILE__)
        set :views, 'app/views'
      end

      use Rack::Auth::Basic do |username, password|
        # verify user's password here
        Transitmix::Auth[username] == password
      end

      get '/*' do
        erb :index
      end
    end
  end
end
