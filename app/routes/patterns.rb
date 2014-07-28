module Transitmix
  module Routes
    class Patterns < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      rescue_from Sequel::NoMatchingRow do
        Rack::Response.new({}, 404)
      end

      params do
        requires :id, type: Integer
      end

      get '/api/patterns/:id' do
        Pattern.first!(id: params[:id])
      end
      
      params do
        optional :page, type: Integer, default: 1
        optional :per, type: Integer, default: 10, max: 100
      end

      get '/api/patterns' do
        Pattern.dataset.paginate(params[:page], params[:per]).order(Sequel.desc(:created_at))
      end

      params do
        requires :name, type: String
        requires :coordinates, type: Array
        optional :color, type: String
      end

      post '/api/patterns' do
        Pattern.create(params)
      end

      params do
        requires :id, type: Integer
      end

      put '/api/patterns/:id' do
        Pattern.first!(id: params[:id]).update(params)
      end

      params do
        requires :id, type: Integer
      end

      delete '/api/patterns/:id' do
        Pattern.first!(id: params[:id]).destroy
      end
    end
  end
end
