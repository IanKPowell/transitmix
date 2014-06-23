require 'app/services/geocoder'

module Transitmix
  module Routes
    class Geocode < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      params do
        requires :query, type: String
      end

      get '/api/geocode/:query' do
        Transitmix::Services::Geocoder.search(params[:query])
      end
    end
  end
end
