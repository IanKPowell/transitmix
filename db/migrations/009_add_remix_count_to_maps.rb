Sequel.migration do
  up do
    alter_table :maps do
      add_column :remix_count, Integer, default: 0
    end
  end

  down do
    alter_table :maps do
      drop_column :remix_count
    end
  end
end
