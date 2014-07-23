require './spec/rb/spec_helper'

describe Line do
  it 'whitelists mass-assignable columns' do
    whitelist = [:coordinates, :name, :speed, :color, :map_id, :service_windows, :comment]
    expect(Line.allowed_columns).to eq whitelist
  end
end
