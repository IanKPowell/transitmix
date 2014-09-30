Sequel.migration do
  up do
    create_table :error_logs do
      primary_key :id
      String :data, default: '{}'
      DateTime :created_at
    end
  end

  down do
    drop_table :error_logs
  end
end
