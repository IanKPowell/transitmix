Sequel.migration do
  up do
    alter_table(:maps) do
      add_column :comments, String
    end

    alter_table(:lines) do
      add_column :comment, String
    end
  end

  down do
    alter_table(:maps) do
      drop_column :comments, String
    end

    alter_table(:lines) do
      drop_column :comment, String
    end
  end
end
