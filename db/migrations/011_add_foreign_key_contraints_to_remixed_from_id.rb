Sequel.migration do
  up do
    execute %{ALTER TABLE ONLY maps
              ADD CONSTRAINT maps_remixed_from_id_fkey
              FOREIGN KEY (remixed_from_id)
              REFERENCES maps(id);}
  end

  down do
    execute %{ALTER TABLE ONLY maps
              DROP CONSTRAINT maps_remixed_from_id_fkey;}
  end
end
