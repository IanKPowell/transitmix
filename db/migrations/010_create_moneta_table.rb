Sequel.migration do
  up do
    create_table :moneta do
      primary_key :k, String
      File :v
    end
  end

  down do
    drop_table :moneta
  end
end
