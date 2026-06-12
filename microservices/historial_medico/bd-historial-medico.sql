
  create table "public"."citas" (
    "id_cita" uuid not null default gen_random_uuid(),
    "id_paciente" uuid not null,
    "id_medico" uuid not null,
    "fecha_cita" timestamp with time zone not null,
    "motivo" text,
    "estado" text not null default 'pendiente'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."citas" enable row level security;


  create table "public"."historial_medico" (
    "id_historial" uuid not null default gen_random_uuid(),
    "id_paciente" uuid not null,
    "id_medico" uuid not null,
    "fecha" timestamp with time zone not null default now(),
    "diagnostico" text,
    "tratamiento" text,
    "observaciones" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."historial_medico" enable row level security;


  create table "public"."medicos" (
    "id_medico" uuid not null default gen_random_uuid(),
    "id_usuario" uuid not null,
    "especialidad" text not null,
    "numero_colegiado" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."medicos" enable row level security;


  create table "public"."pacientes" (
    "id_paciente" uuid not null default gen_random_uuid(),
    "id_usuario" uuid not null,
    "documento" text not null,
    "fecha_nacimiento" date not null,
    "genero" text,
    "telefono" text,
    "direccion" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."pacientes" enable row level security;


  create table "public"."recetas" (
    "id_receta" uuid not null default gen_random_uuid(),
    "id_historial" uuid not null,
    "medicamento" text not null,
    "dosis" text not null,
    "indicaciones" text,
    "duracion" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."recetas" enable row level security;


  create table "public"."usuarios" (
    "id_usuario" uuid not null default gen_random_uuid(),
    "nombre" text not null,
    "correo" text not null,
    "contrasena" text not null,
    "rol" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."usuarios" enable row level security;

CREATE UNIQUE INDEX citas_pkey ON public.citas USING btree (id_cita);

CREATE UNIQUE INDEX historial_medico_pkey ON public.historial_medico USING btree (id_historial);

CREATE INDEX idx_citas_fecha ON public.citas USING btree (fecha_cita);

CREATE INDEX idx_citas_medico ON public.citas USING btree (id_medico);

CREATE INDEX idx_citas_paciente ON public.citas USING btree (id_paciente);

CREATE INDEX idx_historial_medico ON public.historial_medico USING btree (id_medico);

CREATE INDEX idx_historial_paciente ON public.historial_medico USING btree (id_paciente);

CREATE INDEX idx_medicos_usuario ON public.medicos USING btree (id_usuario);

CREATE INDEX idx_pacientes_usuario ON public.pacientes USING btree (id_usuario);

CREATE INDEX idx_recetas_historial ON public.recetas USING btree (id_historial);

CREATE UNIQUE INDEX medicos_numero_colegiado_key ON public.medicos USING btree (numero_colegiado);

CREATE UNIQUE INDEX medicos_pkey ON public.medicos USING btree (id_medico);

CREATE UNIQUE INDEX pacientes_documento_key ON public.pacientes USING btree (documento);

CREATE UNIQUE INDEX pacientes_pkey ON public.pacientes USING btree (id_paciente);

CREATE UNIQUE INDEX recetas_pkey ON public.recetas USING btree (id_receta);

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);

CREATE UNIQUE INDEX usuarios_pkey ON public.usuarios USING btree (id_usuario);

alter table "public"."citas" add constraint "citas_pkey" PRIMARY KEY using index "citas_pkey";

alter table "public"."historial_medico" add constraint "historial_medico_pkey" PRIMARY KEY using index "historial_medico_pkey";

alter table "public"."medicos" add constraint "medicos_pkey" PRIMARY KEY using index "medicos_pkey";

alter table "public"."pacientes" add constraint "pacientes_pkey" PRIMARY KEY using index "pacientes_pkey";

alter table "public"."recetas" add constraint "recetas_pkey" PRIMARY KEY using index "recetas_pkey";

alter table "public"."usuarios" add constraint "usuarios_pkey" PRIMARY KEY using index "usuarios_pkey";

alter table "public"."citas" add constraint "citas_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'cancelada'::text, 'completada'::text]))) not valid;

alter table "public"."citas" validate constraint "citas_estado_check";

alter table "public"."citas" add constraint "citas_id_medico_fkey" FOREIGN KEY (id_medico) REFERENCES public.medicos(id_medico) not valid;

alter table "public"."citas" validate constraint "citas_id_medico_fkey";

alter table "public"."citas" add constraint "citas_id_paciente_fkey" FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE not valid;

alter table "public"."citas" validate constraint "citas_id_paciente_fkey";

alter table "public"."historial_medico" add constraint "historial_medico_id_medico_fkey" FOREIGN KEY (id_medico) REFERENCES public.medicos(id_medico) not valid;

alter table "public"."historial_medico" validate constraint "historial_medico_id_medico_fkey";

alter table "public"."historial_medico" add constraint "historial_medico_id_paciente_fkey" FOREIGN KEY (id_paciente) REFERENCES public.pacientes(id_paciente) ON DELETE CASCADE not valid;

alter table "public"."historial_medico" validate constraint "historial_medico_id_paciente_fkey";

alter table "public"."medicos" add constraint "medicos_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE not valid;

alter table "public"."medicos" validate constraint "medicos_id_usuario_fkey";

alter table "public"."medicos" add constraint "medicos_numero_colegiado_key" UNIQUE using index "medicos_numero_colegiado_key";

alter table "public"."pacientes" add constraint "pacientes_documento_key" UNIQUE using index "pacientes_documento_key";

alter table "public"."pacientes" add constraint "pacientes_genero_check" CHECK ((genero = ANY (ARRAY['M'::text, 'F'::text, 'otro'::text]))) not valid;

alter table "public"."pacientes" validate constraint "pacientes_genero_check";

alter table "public"."pacientes" add constraint "pacientes_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE not valid;

alter table "public"."pacientes" validate constraint "pacientes_id_usuario_fkey";

alter table "public"."recetas" add constraint "recetas_id_historial_fkey" FOREIGN KEY (id_historial) REFERENCES public.historial_medico(id_historial) ON DELETE CASCADE not valid;

alter table "public"."recetas" validate constraint "recetas_id_historial_fkey";

alter table "public"."usuarios" add constraint "usuarios_correo_key" UNIQUE using index "usuarios_correo_key";

alter table "public"."usuarios" add constraint "usuarios_rol_check" CHECK ((rol = ANY (ARRAY['paciente'::text, 'medico'::text, 'admin'::text]))) not valid;

alter table "public"."usuarios" validate constraint "usuarios_rol_check";

grant delete on table "public"."citas" to "anon";

grant insert on table "public"."citas" to "anon";

grant references on table "public"."citas" to "anon";

grant select on table "public"."citas" to "anon";

grant trigger on table "public"."citas" to "anon";

grant truncate on table "public"."citas" to "anon";

grant update on table "public"."citas" to "anon";

grant delete on table "public"."citas" to "authenticated";

grant insert on table "public"."citas" to "authenticated";

grant references on table "public"."citas" to "authenticated";

grant select on table "public"."citas" to "authenticated";

grant trigger on table "public"."citas" to "authenticated";

grant truncate on table "public"."citas" to "authenticated";

grant update on table "public"."citas" to "authenticated";

grant delete on table "public"."citas" to "service_role";

grant insert on table "public"."citas" to "service_role";

grant references on table "public"."citas" to "service_role";

grant select on table "public"."citas" to "service_role";

grant trigger on table "public"."citas" to "service_role";

grant truncate on table "public"."citas" to "service_role";

grant update on table "public"."citas" to "service_role";

grant delete on table "public"."historial_medico" to "anon";

grant insert on table "public"."historial_medico" to "anon";

grant references on table "public"."historial_medico" to "anon";

grant select on table "public"."historial_medico" to "anon";

grant trigger on table "public"."historial_medico" to "anon";

grant truncate on table "public"."historial_medico" to "anon";

grant update on table "public"."historial_medico" to "anon";

grant delete on table "public"."historial_medico" to "authenticated";

grant insert on table "public"."historial_medico" to "authenticated";

grant references on table "public"."historial_medico" to "authenticated";

grant select on table "public"."historial_medico" to "authenticated";

grant trigger on table "public"."historial_medico" to "authenticated";

grant truncate on table "public"."historial_medico" to "authenticated";

grant update on table "public"."historial_medico" to "authenticated";

grant delete on table "public"."historial_medico" to "service_role";

grant insert on table "public"."historial_medico" to "service_role";

grant references on table "public"."historial_medico" to "service_role";

grant select on table "public"."historial_medico" to "service_role";

grant trigger on table "public"."historial_medico" to "service_role";

grant truncate on table "public"."historial_medico" to "service_role";

grant update on table "public"."historial_medico" to "service_role";

grant delete on table "public"."medicos" to "anon";

grant insert on table "public"."medicos" to "anon";

grant references on table "public"."medicos" to "anon";

grant select on table "public"."medicos" to "anon";

grant trigger on table "public"."medicos" to "anon";

grant truncate on table "public"."medicos" to "anon";

grant update on table "public"."medicos" to "anon";

grant delete on table "public"."medicos" to "authenticated";

grant insert on table "public"."medicos" to "authenticated";

grant references on table "public"."medicos" to "authenticated";

grant select on table "public"."medicos" to "authenticated";

grant trigger on table "public"."medicos" to "authenticated";

grant truncate on table "public"."medicos" to "authenticated";

grant update on table "public"."medicos" to "authenticated";

grant delete on table "public"."medicos" to "service_role";

grant insert on table "public"."medicos" to "service_role";

grant references on table "public"."medicos" to "service_role";

grant select on table "public"."medicos" to "service_role";

grant trigger on table "public"."medicos" to "service_role";

grant truncate on table "public"."medicos" to "service_role";

grant update on table "public"."medicos" to "service_role";

grant delete on table "public"."pacientes" to "anon";

grant insert on table "public"."pacientes" to "anon";

grant references on table "public"."pacientes" to "anon";

grant select on table "public"."pacientes" to "anon";

grant trigger on table "public"."pacientes" to "anon";

grant truncate on table "public"."pacientes" to "anon";

grant update on table "public"."pacientes" to "anon";

grant delete on table "public"."pacientes" to "authenticated";

grant insert on table "public"."pacientes" to "authenticated";

grant references on table "public"."pacientes" to "authenticated";

grant select on table "public"."pacientes" to "authenticated";

grant trigger on table "public"."pacientes" to "authenticated";

grant truncate on table "public"."pacientes" to "authenticated";

grant update on table "public"."pacientes" to "authenticated";

grant delete on table "public"."pacientes" to "service_role";

grant insert on table "public"."pacientes" to "service_role";

grant references on table "public"."pacientes" to "service_role";

grant select on table "public"."pacientes" to "service_role";

grant trigger on table "public"."pacientes" to "service_role";

grant truncate on table "public"."pacientes" to "service_role";

grant update on table "public"."pacientes" to "service_role";

grant delete on table "public"."recetas" to "anon";

grant insert on table "public"."recetas" to "anon";

grant references on table "public"."recetas" to "anon";

grant select on table "public"."recetas" to "anon";

grant trigger on table "public"."recetas" to "anon";

grant truncate on table "public"."recetas" to "anon";

grant update on table "public"."recetas" to "anon";

grant delete on table "public"."recetas" to "authenticated";

grant insert on table "public"."recetas" to "authenticated";

grant references on table "public"."recetas" to "authenticated";

grant select on table "public"."recetas" to "authenticated";

grant trigger on table "public"."recetas" to "authenticated";

grant truncate on table "public"."recetas" to "authenticated";

grant update on table "public"."recetas" to "authenticated";

grant delete on table "public"."recetas" to "service_role";

grant insert on table "public"."recetas" to "service_role";

grant references on table "public"."recetas" to "service_role";

grant select on table "public"."recetas" to "service_role";

grant trigger on table "public"."recetas" to "service_role";

grant truncate on table "public"."recetas" to "service_role";

grant update on table "public"."recetas" to "service_role";

grant delete on table "public"."usuarios" to "anon";

grant insert on table "public"."usuarios" to "anon";

grant references on table "public"."usuarios" to "anon";

grant select on table "public"."usuarios" to "anon";

grant trigger on table "public"."usuarios" to "anon";

grant truncate on table "public"."usuarios" to "anon";

grant update on table "public"."usuarios" to "anon";

grant delete on table "public"."usuarios" to "authenticated";

grant insert on table "public"."usuarios" to "authenticated";

grant references on table "public"."usuarios" to "authenticated";

grant select on table "public"."usuarios" to "authenticated";

grant trigger on table "public"."usuarios" to "authenticated";

grant truncate on table "public"."usuarios" to "authenticated";

grant update on table "public"."usuarios" to "authenticated";

grant delete on table "public"."usuarios" to "service_role";

grant insert on table "public"."usuarios" to "service_role";

grant references on table "public"."usuarios" to "service_role";

grant select on table "public"."usuarios" to "service_role";

grant trigger on table "public"."usuarios" to "service_role";

grant truncate on table "public"."usuarios" to "service_role";

grant update on table "public"."usuarios" to "service_role";


  create policy "Medico ve su propio perfil"
  on "public"."medicos"
  as permissive
  for select
  to public
using ((id_usuario = auth.uid()));



  create policy "Paciente ve su propio perfil"
  on "public"."pacientes"
  as permissive
  for select
  to public
using ((id_usuario = auth.uid()));



