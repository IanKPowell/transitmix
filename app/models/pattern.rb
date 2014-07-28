module Transitmix
  module Models
    class Pattern < Sequel::Model
      plugin :timestamps, update_on_create: true
      plugin :json_serializer
      plugin :serialization, :json, :coordinates

      set_allowed_columns :coordinates, :name, :line_id, :color

      # Used in a variety of export formats
      def to_flattened_lnglat
        coordinates.flatten(1).map { |latlng| latlng.reverse }
      end
    end
  end
end
