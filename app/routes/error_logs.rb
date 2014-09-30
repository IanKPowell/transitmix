module Transitmix
  module Routes
    class ErrorLogs < Grape::API
      version 'v1', using: :header, vendor: 'transitmix'
      format :json

      post '/api/errors' do
        Transitmix::App.database[:error_logs].insert(
          data: request.params.to_json,
          created_at: DateTime.now
        )
      end
    end
  end
end
