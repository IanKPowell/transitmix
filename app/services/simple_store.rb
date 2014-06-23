require 'moneta'
require 'active_support/per_thread_registry'
require 'active_support/cache/moneta_store'

module Transitmix
  module Services
    SimpleStore = ActiveSupport::Cache::MonetaStore.new(store: Moneta.new(:Sequel, backend: Sequel::Model.db))
  end
end
