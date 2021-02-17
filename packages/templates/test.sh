#!/bin/bash

for file in */config.yml; do
    mailscript sync:import -p "$file"
    read -p "edit? "
    if [ "$REPLY" == "y" ]; then
        vim "$file"
    fi
done
