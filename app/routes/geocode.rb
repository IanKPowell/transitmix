module Transitmix
  module Routes
    class Geocode < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      Geocoder.configure(
        lookup: :google,
        cache: Transitmix::Models::SimpleStore,
        always_raise: :all
      )

      params do
        requires :query, type: String
      end

      get '/api/geocode/:query' do
        Geocoder.search(params[:query])
      end
    end
  end
end
