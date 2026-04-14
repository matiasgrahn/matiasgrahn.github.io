# Käytetään kevyttä nginx-palvelinta, joka on standardi nettisivujen ajamiseen
FROM nginx:alpine

# Kopioidaan projektin tiedostot kontin sisälle (oletusasetus)
# Huom: Kun käytät "Volumea" käynnistäessäsi, tämä on lähinnä varmistus
COPY . /usr/share/nginx/html

# Kerrotaan, että kontti kuuntelee porttia 80
EXPOSE 80