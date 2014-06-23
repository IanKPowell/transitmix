require 'faraday'
require 'faraday_middleware'
require 'app/services/simple_store'

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
          conn.response :caching, Transitmix::Services::SimpleStore

          conn.adapter Faraday.default_adapter
        end
      end
    end
  end
end
