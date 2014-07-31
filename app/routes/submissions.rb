require 'pony'

module Transitmix
  module Routes
    class Submissions < Grape::API
      Pony.options = {
        from: 'transitmix@codeforamerica.org',
        to: 'sam@samhashemi.com',
        subject: 'LRV Feedback: A new map has been submitted',
        via: :smtp,
        via_options: {
          enable_starttls_auto: true,
          authentication: :plain,
          address:        'smtp.sendgrid.net',
          port:           587,
          domain:         'heroku.com',
          user_name:      ENV['SENDGRID_USERNAME'],
          password:       ENV['SENDGRID_PASSWORD'],
        }
      }

      post '/api/maps/:id/submit' do
        map = Map.first!(id: params[:id]) # ensure the map exists

        Pony.mail(body: <<-BODY.dedent)
          Hello,

          A new map has been submitted:
          http://sfmta.transitmix.net/map/#{map.id}

          - The Transitmix Team
        BODY
      end
    end
  end
end
