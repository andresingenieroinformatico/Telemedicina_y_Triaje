#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE usuarios;
    CREATE DATABASE agendamiento;
    CREATE DATABASE historial_medico;
EOSQL
