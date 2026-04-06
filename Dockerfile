# Käytetään valmista kevyttä web-palvelinta
FROM nginx:alpine

# Kopioidaan sun portfolion sisältö palvelimen hakemistoon
COPY . /usr/share/nginx/html