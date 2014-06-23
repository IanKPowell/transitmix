require './spec/rb/spec_helper.rb'

describe Transitmix::Routes::Geocode do
  include Transitmix::Routes::TestHelpers

  describe 'GET /api/geocode/:query' do
    let(:endpoint) { "http://maps.googleapis.com/maps/api/geocode/json?address=Oakland,%2BCA&language=en&sensor=false" }
    let(:body) { fixture('oakland-response.json') }

    it 'caches the result' do
      stub_request(:get, endpoint).
        to_return(status: 200, body: body)

      get "/api/geocode/Oakland,+CA"
      expect(last_response.body).to eq body

      get "/api/geocode/Oakland,+CA"
      expect(last_response.body).to eq body

      expect(a_request(:get, endpoint)).to have_been_made.once
    end
  end
end
