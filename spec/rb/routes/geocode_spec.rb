require './spec/rb/spec_helper.rb'

describe Transitmix::Routes::Geocode do
  include Transitmix::Routes::TestHelpers

  describe 'GET /api/geocode/:query' do
    it 'caches the result' do
      stub_request(:get, "http://maps.googleapis.com/maps/api/geocode/json?address=Oakland,%2BCA&language=en&sensor=false").
        to_return(status: 200, body: fixture('google-geocoding-oakland.json'))

      get "/api/geocode/Oakland,+CA"
      expect(last_response.body).to eq fixture('oakland-response.json')

      get "/api/geocode/Oakland,+CA"
      expect(last_response.body).to eq fixture('cached-oakland-response.json')
    end
  end
end
