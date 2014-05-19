require './spec/rb/spec_helper.rb'

describe Map do
  describe '.remix' do
    it 'creates a copy of the map and lines' do
      map = create(:map)
      lines = create_list(:line, 3, map_id: map.id)
      copy = Map.first!(id: map.id).remix

      expect(copy.name).to match map.name
      expect(copy.lines.count).to eq 3
    end

    it 'tracks the map that was remixed from' do
      map = create(:map)
      copy = Map.first!(id: map.id).remix

      expect(copy.remixed_from_id).to eq map.id
    end
  end
end