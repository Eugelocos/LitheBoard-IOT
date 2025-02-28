#!/bin/bash
# Espera a que EMQX esté listo
sleep 15

# Añadir usuarios
/opt/emqx/bin/emqx_ctl users add usuario1 contrasena1
/opt/emqx/bin/emqx_ctl users add usuario2 contrasena2
