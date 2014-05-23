require './spec/rb/spec_helper.rb'

describe Transitmix::Routes::Lines do
  include Transitmix::Routes::TestHelpers

  describe 'GET /api/lines/:id' do
    let(:line) { create(:line) }

    it 'responds with 200 OK' do
      get "/api/lines/#{line.id}"
      expect(last_response.status).to eq 200
    end

    it 'returns the record' do
      get "/api/lines/#{line.id}"
      expect(last_response.body).to eq line.to_json
    end

    context 'not found' do
      it 'responds with 404 NOT FOUND' do
        max = Line.max(:id) || 0
        get "/api/lines/#{ max + 1 }"
        expect(last_response.status).to eq 404
      end
    end
  end

  describe 'POST /api/lines' do
    let(:params) { attributes_for(:line) }

    it 'responds with 201 CREATED' do
      post '/api/lines', params
      expect(last_response.status).to eq 201
    end

    it 'creates a new record' do
      expect { post '/api/lines', params }.to change{ Line.count }.by(+1)
    end
  end

  describe 'GET /api/lines' do
    it 'responds with 200 OK' do
      get '/api/lines'
      expect(last_response.status).to eq 200
    end

    it 'returns the list of lines' do
      lines = create_list(:line, 5)
      get '/api/lines', per: 2
      expect(last_response.body).to eq [lines[4], lines[3]].to_json
    end
  end

  describe 'DELETE /api/lines' do
    let!(:line) { create(:line) }

    it 'responds with 200 OK' do
      delete "/api/lines/#{ line.id }"
      expect(last_response.status).to eq 200
    end

    it 'deletes the line' do
      expect { delete "/api/lines/#{ line.id }" }.to change{ Line.count }.by(-1)
    end
  end
end
