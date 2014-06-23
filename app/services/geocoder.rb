require 'faraday'
require 'faraday_middleware'
require 'active_support/cache/moneta_store'
require 'app/models/simple_store'

module Transitmix
  module Services
    class Geocoder < Struct.new(:query)
      def self.search(query)
        connection.get('/maps/api/geocode/json', address: query).body
      end

      def self.connection
        @connection ||= Faraday.new(url: 'http://maps.googleapis.com') do |conn|
          conn.headers['Content-Type'] = 'application/json'

          conn.params['language'] = 'en'
          conn.params['sensor'] = false

          conn.response :json
          conn.response :caching do
            ActiveSupport::Cache::MonetaStore.new(store: Transitmix::Models::SimpleStore)
          end

          conn.adapter Faraday.default_adapter
        end
      end
    end
  end
end
