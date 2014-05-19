Sequel.migration do
  up do
    alter_table :maps do
      add_column :nth_remix, Integer
    end
  end

  down do
    alter_table :maps do
      drop_column :nth_remix
    end
  end
end
