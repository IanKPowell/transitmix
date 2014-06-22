module FixtureHelpers
  def fixture(name)
    File.read("spec/rb/support/fixtures/#{name}")
  end
end

RSpec.configure do |config|
  config.include FixtureHelpers
end
