require 'moneta'

module Transitmix
  module Models
    SimpleStore = Moneta.new(:Sequel, backend: Sequel::Model.db)
  end
end
