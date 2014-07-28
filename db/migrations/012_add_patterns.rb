Sequel.migration do
  up do
    create_table :patterns do
      primary_key :id
      String :name
      Text :coordinates
      String :color
      DateTime :created_at
      DateTime :updated_at
    end

    alter_table(:patterns) do
      add_foreign_key :line_id, :lines
    end
  end

  down do
    alter_table(:patterns) do
      drop_foreign_key :line_id
    end

    drop_table :lines
  end
end
