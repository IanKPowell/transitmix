require './spec/rb/spec_helper.rb'

describe Map do
  describe '#remix' do
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

    it 'increments the remix count of a map' do
      map = create(:map)
      map.remix
      map.remix

      expect(map.remix_count).to eq 2
    end

    it 'tracks the order of sibling remixes' do
      map = create(:map)
      remix_1 = map.remix
      remix_2 = map.remix

      expect(remix_1.nth_remix).to eq 1
      expect(remix_2.nth_remix).to eq 2
    end
  end
end
