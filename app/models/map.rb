module Transitmix
  module Models
    class Map < Sequel::Model
      plugin :timestamps, update_on_create: true
      plugin :json_serializer, :include=>:lines
      plugin :serialization, :json, :center
      plugin :tree, key: :remixed_from_id, order: :nth_remix

      set_allowed_columns :name, :center, :zoom_level

      one_to_many :lines

      def remix
        new_map = Map.new(allowed_attributes)
        new_map.remixed_from_id = id
        new_map.nth_remix = self.remix_count = self.remix_count + 1

        db.transaction do
          new_map.save!
          save!

          lines.each do |line|
            new_map.add_line(line.allowed_attributes)
          end
        end

        new_map
      end

      def tree_view(view)
        unless Transitmix::App.tree_views.include?(view)
          raise 'invalid tree view'
        end

        public_send(view)
      end
    end
  end
end
