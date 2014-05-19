require 'bundler'
Bundler.require

# setup environment variables
require 'dotenv'
Dotenv.load

# setup load paths
$: << File.expand_path('../', __FILE__)
$: << File.expand_path('../lib', __FILE__)

require 'sinatra/base'
require 'sinatra/assetpack'
require 'sinatra-sequel'
require 'grape'

require 'app/routes'

module Transitmix
  class App < Sinatra::Application
    set :root, File.expand_path('../', __FILE__)
    set :tree_views, %w(ancestors children descendants parent root self_and_siblings siblings)
  end
end

require 'app/routes'
require 'app/models'
include Transitmix::Models
